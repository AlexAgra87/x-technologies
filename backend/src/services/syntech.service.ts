import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'
import NodeCache from 'node-cache'
import { SyntechFeed, SyntechProduct, Product } from '../types'

const SYNTECH_API_URL = process.env.SYNTECH_API_URL || 'https://www.syntech.co.za/feeds/feedhandler.php'
const SYNTECH_API_KEY = process.env.SYNTECH_API_KEY || ''

// Cache for 15 minutes
const cache = new NodeCache({ stdTTL: 900 })
const CACHE_KEY = 'syntech_products'

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    isArray: (name) => name === 'product' || name === 'additional_image',
})

export class SyntechService {
    private apiUrl: string
    private apiKey: string

    constructor() {
        this.apiUrl = SYNTECH_API_URL
        this.apiKey = SYNTECH_API_KEY
    }

    async fetchProducts(): Promise<Product[]> {
        // Check cache first
        const cached = cache.get<Product[]>(CACHE_KEY)
        if (cached) {
            console.log('Returning cached Syntech products')
            return cached
        }

        try {
            console.log('Fetching fresh Syntech products...')
            const response = await axios.get(`${this.apiUrl}?key=${this.apiKey}&feed=syntech-xml-full`, {
                timeout: 30000,
                headers: {
                    'Accept': 'application/xml',
                },
            })

            const parsed: SyntechFeed = xmlParser.parse(response.data)
            const rawProducts = parsed.syntechstock?.stock?.product || []

            const products = rawProducts.map((p) => this.transformProduct(p))

            // Cache the results
            cache.set(CACHE_KEY, products)
            console.log(`Cached ${products.length} Syntech products`)

            return products
        } catch (error) {
            console.error('Error fetching Syntech products:', error)
            throw new Error('Failed to fetch products from Syntech')
        }
    }

    private transformProduct(raw: SyntechProduct): Product {
        const price = parseFloat(raw.price) || 0
        const rrp = parseFloat(raw.rrp_incl) || price
        const cptStock = parseInt(raw.cptstock) || 0
        const jhbStock = parseInt(raw.jhbstock) || 0
        const dbnStock = parseInt(raw.dbnstock) || 0
        const totalStock = cptStock + jhbStock + dbnStock

        // Parse images
        const images: string[] = []
        if (raw.featured_image) {
            images.push(raw.featured_image)
        }
        if (raw.additional_images?.additional_image) {
            const additionalImages = Array.isArray(raw.additional_images.additional_image)
                ? raw.additional_images.additional_image
                : [raw.additional_images.additional_image]
            images.push(...additionalImages)
        }

        // Parse attributes
        const attributes: Record<string, string> = {}
        if (raw.attributes) {
            for (const [key, value] of Object.entries(raw.attributes)) {
                if (value) {
                    attributes[key] = typeof value === 'object' && '#text' in value
                        ? value['#text']
                        : String(value)
                }
            }
        }

        // Calculate discount percentage
        const discount = rrp > price ? Math.round(((rrp - price) / rrp) * 100) : 0

        return {
            id: `syntech_${raw.sku}`,
            sku: raw.sku,
            name: raw.name,
            description: raw.description || '',
            shortDescription: raw.shortdesc || '',
            price,
            rrp,
            recommendedMargin: parseFloat(raw.recommended_margin) || undefined,
            supplier: 'syntech',
            stock: {
                total: totalStock,
                locations: {
                    cpt: cptStock,
                    jhb: jhbStock,
                    dbn: dbnStock,
                },
                nextShipmentEta: raw.nextshipmenteta || undefined,
            },
            featuredImage: raw.featured_image || '',
            images,
            categories: raw.categories?.split(',').map(c => c.trim()) || [],
            categoryTree: raw.categorytree || '',
            brand: attributes.brand || 'Unknown',
            attributes,
            warranty: attributes.warranty,
            url: raw.url,
            lastModified: new Date(raw.last_modified),
            createdAt: new Date(raw.last_modified),
            discount,
            inStock: totalStock > 0,
        }
    }

    clearCache(): void {
        cache.del(CACHE_KEY)
    }
}

export const syntechService = new SyntechService()
