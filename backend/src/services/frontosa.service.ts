import axios from 'axios'
import NodeCache from 'node-cache'
import * as fs from 'fs'
import * as path from 'path'
import { Product } from '../types/product'
import {
    FrontosaStockResponse,
    FrontosaStockItem,
    FrontosaInfoResponse,
    FrontosaBrand,
    FrontosaCategory,
    FrontosaLinksResponse,
    FrontosaLink,
    FrontosaOrderRequest,
    FrontosaOrderResponse
} from '../types/frontosa'

const FRONTOSA_API_URL = process.env.FRONTOSA_API_URL || 'http://live.frontosa.co.za'
const FRONTOSA_TOKEN = process.env.FRONTOSA_TOKEN || '9d8ff75205aa73e'

// Cache for 15 minutes (stock updates hourly)
const cache = new NodeCache({ stdTTL: 900 })
const STOCK_CACHE_KEY = 'frontosa_stock'
const INFO_CACHE_KEY = 'frontosa_info'
const LINKS_CACHE_KEY = 'frontosa_links'

// Pricing: X-Tech markup and VAT
const MARKUP_RATE = 1.10  // 10% markup
const VAT_RATE = 1.15     // 15% VAT (South Africa)

// Image map: SKU -> array of image paths
type ImageMap = Record<string, string[]>

export class FrontosaService {
    private apiUrl: string
    private token: string
    private brands: Map<number, string> = new Map()
    private categories: Map<number, string> = new Map()
    private productLinks: Map<string, string> = new Map()
    private imageMap: ImageMap = {}

    constructor() {
        this.apiUrl = FRONTOSA_API_URL
        this.token = FRONTOSA_TOKEN
        this.loadImageMap()
    }

    /**
     * Load the local image map (SKU -> image paths)
     */
    private loadImageMap(): void {
        try {
            // Try multiple possible paths for the image map
            const possiblePaths = [
                path.join(__dirname, '../../public/images/frontosa/image-map.json'),
                path.join(process.cwd(), '../frontend/public/images/frontosa/image-map.json'),
                '/root/x-technologies/frontend/public/images/frontosa/image-map.json'
            ]

            for (const mapPath of possiblePaths) {
                if (fs.existsSync(mapPath)) {
                    const data = fs.readFileSync(mapPath, 'utf-8')
                    this.imageMap = JSON.parse(data)
                    console.log(`Loaded Frontosa image map with ${Object.keys(this.imageMap).length} SKUs from ${mapPath}`)
                    return
                }
            }
            console.warn('Frontosa image map not found')
        } catch (error) {
            console.error('Error loading Frontosa image map:', error)
        }
    }

    /**
     * Fetch all products from Frontosa
     */
    async fetchProducts(): Promise<Product[]> {
        // Check cache first
        const cached = cache.get<Product[]>(STOCK_CACHE_KEY)
        if (cached) {
            console.log('Returning cached Frontosa products')
            return cached
        }

        try {
            // First, ensure we have brand/category mappings and links
            await Promise.all([
                this.fetchBrandsAndCategories(),
                this.fetchProductLinks()
            ])

            console.log('Fetching fresh Frontosa stock...')
            const response = await axios.get<FrontosaStockResponse>(
                `${this.apiUrl}/json/stock.asp`,
                {
                    params: { token: this.token },
                    timeout: 30000,
                }
            )

            const items = response.data.items || []

            if (items.length === 0 && response.data.notice) {
                console.warn('Frontosa API notice:', response.data.notice)
                return []
            }

            const products = items.map(item => this.transformProduct(item))

            // Cache the results
            cache.set(STOCK_CACHE_KEY, products)
            console.log(`Cached ${products.length} Frontosa products`)

            return products
        } catch (error) {
            console.error('Error fetching Frontosa products:', error)
            // Return empty array instead of throwing - allows other suppliers to work
            return []
        }
    }

    /**
     * Fetch a single product by code
     */
    async fetchProductByCode(code: string): Promise<Product | null> {
        const products = await this.fetchProducts()
        return products.find(p => p.sku === code) || null
    }

    /**
     * Fetch brand and category mappings
     */
    private async fetchBrandsAndCategories(): Promise<void> {
        // Check cache
        const cached = cache.get<FrontosaInfoResponse>(INFO_CACHE_KEY)
        if (cached) {
            this.processBrandsAndCategories(cached)
            return
        }

        try {
            console.log('Fetching Frontosa brands and categories...')
            const response = await axios.get<FrontosaInfoResponse>(
                `${this.apiUrl}/json/stock_info.asp`,
                {
                    params: { token: this.token },
                    timeout: 15000,
                }
            )

            cache.set(INFO_CACHE_KEY, response.data, 86400) // Cache for 24 hours
            this.processBrandsAndCategories(response.data)
        } catch (error) {
            console.error('Error fetching Frontosa brands/categories:', error)
        }
    }

    private processBrandsAndCategories(data: FrontosaInfoResponse): void {
        this.brands.clear()
        this.categories.clear()

        data.brands?.forEach(brand => {
            this.brands.set(brand.id, brand.name)
        })

        data.categories?.forEach(category => {
            this.categories.set(category.id, category.name)
        })

        console.log(`Loaded ${this.brands.size} Frontosa brands, ${this.categories.size} categories`)
    }

    /**
     * Fetch product links (for product page URLs)
     */
    private async fetchProductLinks(): Promise<void> {
        // Check cache
        const cached = cache.get<Map<string, string>>(LINKS_CACHE_KEY)
        if (cached) {
            this.productLinks = cached
            return
        }

        try {
            console.log('Fetching Frontosa product links...')
            const response = await axios.get<FrontosaLinksResponse>(
                'https://www.frontosa.co.za/link/links.json',
                { timeout: 15000 }
            )

            this.productLinks.clear()
            response.data.items?.forEach(item => {
                this.productLinks.set(item.code, item.url)
            })

            cache.set(LINKS_CACHE_KEY, this.productLinks, 86400) // Cache for 24 hours
            console.log(`Loaded ${this.productLinks.size} Frontosa product links`)
        } catch (error) {
            console.error('Error fetching Frontosa product links:', error)
        }
    }

    /**
     * Transform Frontosa stock item to unified Product format
     */
    private transformProduct(item: FrontosaStockItem): Product {
        // Frontosa prices are ex-VAT dealer cost
        const costExVat = Number(item.price) || 0
        // Apply 10% markup then add 15% VAT
        const price = Math.round(costExVat * MARKUP_RATE * VAT_RATE)

        // Extract stock levels from dynamic branch fields
        const jhbStock = this.extractBranchStock(item, 'jhb')
        const cptStock = this.extractBranchStock(item, 'cpt')
        const dbnStock = this.extractBranchStock(item, 'dbn')
        const ptaStock = this.extractBranchStock(item, 'pta')
        const peStock = this.extractBranchStock(item, 'pe')
        const totalStock = jhbStock + cptStock + dbnStock + ptaStock + peStock

        // Get brand and category names
        const brandName = this.brands.get(item.bid) || 'Unknown'
        const categoryName = this.categories.get(item.pid) || 'Uncategorized'

        // Get product URL if available
        const productUrl = this.productLinks.get(item.code) || undefined

        // Map status codes
        const statusMap: Record<string, string> = {
            'C': 'Coming Soon',
            'N': 'New',
            'R': 'Request Item',
            'A': 'Available'
        }
        const statusText = statusMap[item.status] || 'Available'

        // No RRP from Frontosa, use selling price
        const rrp = price
        const discount = 0 // Frontosa doesn't provide RRP so no discount calculation

        return {
            id: `frontosa_${item.code}`,
            sku: item.code,
            name: item.desc,
            description: `${item.desc}${statusText !== 'Available' ? ` (${statusText})` : ''}`,
            shortDescription: item.desc,
            price,
            rrp,
            supplier: 'frontosa' as any, // Will need to update Product type
            stock: {
                total: totalStock,
                locations: {
                    jhb: jhbStock,
                    cpt: cptStock,
                    dbn: dbnStock,
                },
                // Additional locations for Frontosa
            },
            featuredImage: this.imageMap[item.code]?.[0] || '',
            images: this.imageMap[item.code] || [],
            categories: [categoryName],
            categoryTree: categoryName,
            brand: brandName,
            attributes: {
                status: statusText,
                warranty: `${item.war} Months`,
                brand: brandName,
                supplier_code: item.code,
            },
            warranty: `${item.war} Months`,
            url: productUrl,
            lastModified: new Date(),
            createdAt: new Date(),
            discount,
            inStock: totalStock > 0,
        }
    }

    /**
     * Extract stock quantity for a branch
     */
    private extractBranchStock(item: FrontosaStockItem, branch: string): number {
        const qty = Number(item[`qty_${branch}`]) || 0
        const hasMore = item[`more_${branch}`] === 1
        // If hasMore is true, actual stock is higher than reported
        return hasMore ? qty + 10 : qty
    }

    /**
     * Place an order with Frontosa
     */
    async placeOrder(order: Omit<FrontosaOrderRequest, 'token'>): Promise<FrontosaOrderResponse> {
        try {
            const response = await axios.post<FrontosaOrderResponse>(
                `${this.apiUrl}/json/order.asp`,
                {
                    ...order,
                    token: this.token,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                }
            )

            return response.data
        } catch (error) {
            console.error('Error placing Frontosa order:', error)
            throw new Error('Failed to place order with Frontosa')
        }
    }

    /**
     * Get invoice PDF URL
     */
    getInvoiceUrl(invoiceNumber: string, type: 'in' | 'cn' = 'in'): string {
        return `${this.apiUrl}/invoice.asp?token=${this.token}&tt=${type}&inv_no=${invoiceNumber}`
    }

    /**
     * Fetch account transactions
     */
    async fetchTransactions(): Promise<any[]> {
        try {
            const response = await axios.get(
                `${this.apiUrl}/json/transactions.asp`,
                {
                    params: { token: this.token },
                    timeout: 15000,
                }
            )
            return response.data.transactions || []
        } catch (error) {
            console.error('Error fetching Frontosa transactions:', error)
            return []
        }
    }

    /**
     * Clear all caches
     */
    clearCache(): void {
        cache.del(STOCK_CACHE_KEY)
        cache.del(INFO_CACHE_KEY)
        cache.del(LINKS_CACHE_KEY)
        console.log('Frontosa cache cleared')
    }
}

export const frontosaService = new FrontosaService()
