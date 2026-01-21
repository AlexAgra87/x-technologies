import axios from 'axios'
import NodeCache from 'node-cache'
import { Product } from '../types'

const RCT_API_BASE = process.env.RCT_API_BASE || 'https://rctdatafeed.azurewebsites.net'
const RCT_USER_ID = process.env.RCT_USER_ID || '52dfb972-c9b7-4adf-a3db-ef5b1484ee42'

// RCT API Response types (based on actual API)
interface RCTApiProduct {
    href: string
    code: string
    title: string
    description: string
    sellingPrice: number
    onHand: number
    productLine: string
    vendorCode: string
    upcBarcode: string
    eta: string
    status: string
    dateCreated: string
    dateModified: string
}

interface RCTApiResponse {
    href: string
    rel: string[]
    value: RCTApiProduct[]
}

// Cache for 15 minutes
const cache = new NodeCache({ stdTTL: 900 })
const CACHE_KEY = 'rct_products'
const CACHE_KEY_INSTOCK = 'rct_products_instock'

export class RCTService {
    private apiBase: string
    private userId: string

    constructor() {
        this.apiBase = RCT_API_BASE
        this.userId = RCT_USER_ID
    }

    // Fetch all products
    async fetchProducts(): Promise<Product[]> {
        // Check cache first
        const cached = cache.get<Product[]>(CACHE_KEY)
        if (cached) {
            console.log('Returning cached RCT products')
            return cached
        }

        if (!this.userId) {
            console.warn('RCT_USER_ID not configured, skipping RCT products')
            return []
        }

        try {
            console.log('Fetching fresh RCT products...')
            const response = await axios.get<RCTApiResponse>(
                `${this.apiBase}/api/${this.userId}/v1/Products`,
                {
                    timeout: 30000,
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            )

            // Extract products from the 'value' array
            const rawProducts = response.data.value || []
            const products = rawProducts.map((p) => this.transformProduct(p))

            // Cache the results
            cache.set(CACHE_KEY, products)
            console.log(`Cached ${products.length} RCT products`)

            return products
        } catch (error) {
            console.error('Error fetching RCT products:', error)
            // Don't throw - return empty array if RCT fails
            return []
        }
    }

    // Fetch only products with stock > 0 (more efficient for product listings)
    async fetchInStockProducts(): Promise<Product[]> {
        const cached = cache.get<Product[]>(CACHE_KEY_INSTOCK)
        if (cached) {
            console.log('Returning cached RCT in-stock products')
            return cached
        }

        if (!this.userId) {
            return []
        }

        try {
            console.log('Fetching RCT in-stock products...')
            const response = await axios.get<RCTApiResponse>(
                `${this.apiBase}/api/${this.userId}/v1/Products/onhand`,
                {
                    timeout: 30000,
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            )

            const rawProducts = response.data.value || []
            const products = rawProducts.map((p) => this.transformProduct(p))

            cache.set(CACHE_KEY_INSTOCK, products)
            console.log(`Cached ${products.length} RCT in-stock products`)

            return products
        } catch (error) {
            console.error('Error fetching RCT in-stock products:', error)
            return []
        }
    }

    // Fetch products by product line (category)
    async fetchProductsByProductLine(productLine: string): Promise<Product[]> {
        if (!this.userId) {
            return []
        }

        try {
            const response = await axios.get<RCTApiResponse>(
                `${this.apiBase}/api/${this.userId}/v1/Products/productline/${encodeURIComponent(productLine)}`,
                {
                    timeout: 15000,
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            )

            const rawProducts = response.data.value || []
            return rawProducts.map((p) => this.transformProduct(p))
        } catch (error) {
            console.error(`Error fetching RCT products for line ${productLine}:`, error)
            return []
        }
    }

    // Fetch single product by code
    async fetchProductByCode(code: string): Promise<Product | null> {
        if (!this.userId) {
            return null
        }

        try {
            const response = await axios.get<RCTApiProduct>(
                `${this.apiBase}/api/${this.userId}/v1/Products/${encodeURIComponent(code)}`,
                {
                    timeout: 10000,
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            )

            return this.transformProduct(response.data)
        } catch (error) {
            console.error(`Error fetching RCT product ${code}:`, error)
            return null
        }
    }

    private transformProduct(raw: RCTApiProduct): Product {
        const price = raw.sellingPrice || 0

        // Calculate discount percentage (no RRP in this API, so no discount)
        const discount = 0

        return {
            id: `rct_${raw.code}`,
            sku: raw.code,
            name: raw.title,
            description: raw.description || '',
            price,
            rrp: price,
            supplier: 'rct',
            stock: {
                total: raw.onHand || 0,
                locations: {},
            },
            featuredImage: '',
            images: [],
            categories: [raw.productLine].filter(Boolean),
            categoryTree: raw.productLine || '',
            brand: raw.productLine || 'RCT',
            attributes: {
                vendorCode: raw.vendorCode,
                barcode: raw.upcBarcode,
                status: raw.status,
                eta: raw.eta,
            },
            lastModified: new Date(raw.dateModified),
            createdAt: new Date(raw.dateCreated),
            discount,
            inStock: (raw.onHand || 0) > 0,
        }
    }

    // Fetch images for a specific product
    async fetchProductImages(code: string): Promise<string[]> {
        if (!this.userId) {
            return []
        }

        try {
            const response = await axios.get<{ value: Array<{ imageUrl: string }> }>(
                `${this.apiBase}/api/${this.userId}/v1/Products/images/${encodeURIComponent(code)}`,
                {
                    timeout: 10000,
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            )

            return response.data.value?.map(img => img.imageUrl).filter(Boolean) || []
        } catch (error) {
            console.error(`Error fetching images for RCT product ${code}:`, error)
            return []
        }
    }

    // Fetch products modified this week (for syncing/updates)
    async fetchModifiedThisWeek(): Promise<Product[]> {
        if (!this.userId) {
            return []
        }

        try {
            // Note: This endpoint uses a different user ID in the docs
            const response = await axios.get<RCTApiResponse>(
                `${this.apiBase}/api/${this.userId}/v1/Products/modifiedthisweek`,
                {
                    timeout: 30000,
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            )

            const rawProducts = response.data.value || []
            return rawProducts.map((p) => this.transformProduct(p))
        } catch (error) {
            console.error('Error fetching RCT modified products:', error)
            return []
        }
    }

    // Fetch products modified this month
    async fetchModifiedThisMonth(): Promise<Product[]> {
        if (!this.userId) {
            return []
        }

        try {
            const response = await axios.get<RCTApiResponse>(
                `${this.apiBase}/api/${this.userId}/v1/Products/modifiedthismonth`,
                {
                    timeout: 30000,
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            )

            const rawProducts = response.data.value || []
            return rawProducts.map((p) => this.transformProduct(p))
        } catch (error) {
            console.error('Error fetching RCT monthly modified products:', error)
            return []
        }
    }

    clearCache(): void {
        cache.del(CACHE_KEY)
        cache.del(CACHE_KEY_INSTOCK)
    }
}

export const rctService = new RCTService()
