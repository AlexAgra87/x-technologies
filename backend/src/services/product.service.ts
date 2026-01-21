import { syntechService } from './syntech.service'
import { rctService } from './rct.service'
import { frontosaService } from './frontosa.service'
import { Product, ProductFilters, PaginatedResponse, Category, Brand } from '../types'

export class ProductService {
    async getAllProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
        // Fetch from all suppliers in parallel
        const supplier = filters.supplier || 'all'

        const [syntechProducts, rctProducts, frontosaProducts] = await Promise.all([
            supplier === 'all' || supplier === 'syntech'
                ? syntechService.fetchProducts()
                : Promise.resolve([]),
            supplier === 'all' || supplier === 'rct'
                ? rctService.fetchProducts()
                : Promise.resolve([]),
            supplier === 'all' || supplier === 'frontosa'
                ? frontosaService.fetchProducts()
                : Promise.resolve([]),
        ])

        let allProducts = [...syntechProducts, ...rctProducts, ...frontosaProducts]

        // Apply filters
        allProducts = this.applyFilters(allProducts, filters)

        // Apply sorting
        allProducts = this.applySort(allProducts, filters.sortBy)

        // Paginate
        const page = filters.page || 1
        const limit = filters.limit || 20
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit

        const paginatedProducts = allProducts.slice(startIndex, endIndex)

        return {
            data: paginatedProducts,
            pagination: {
                total: allProducts.length,
                page,
                limit,
                totalPages: Math.ceil(allProducts.length / limit),
                hasNext: endIndex < allProducts.length,
                hasPrev: page > 1,
            },
        }
    }

    async getProductBySku(sku: string): Promise<Product | null> {
        // Try Syntech first
        const syntechProducts = await syntechService.fetchProducts()
        const syntechProduct = syntechProducts.find(p => p.sku === sku)
        if (syntechProduct) {
            return syntechProduct
        }

        // Try RCT
        const rctProduct = await rctService.fetchProductByCode(sku)
        if (rctProduct) {
            return rctProduct
        }

        // Try Frontosa
        return frontosaService.fetchProductByCode(sku)
    }

    async getCategories(): Promise<Category[]> {
        const products = await this.getAllProducts({ limit: 10000 })
        const categoryMap = new Map<string, number>()

        products.data.forEach(product => {
            product.categories.forEach(category => {
                const count = categoryMap.get(category) || 0
                categoryMap.set(category, count + 1)
            })
        })

        return Array.from(categoryMap.entries())
            .map(([name, count]) => ({
                id: this.slugify(name),
                name,
                slug: this.slugify(name),
                count,
            }))
            .sort((a, b) => b.count - a.count)
    }

    async getBrands(): Promise<Brand[]> {
        const products = await this.getAllProducts({ limit: 10000 })
        const brandMap = new Map<string, number>()

        products.data.forEach(product => {
            const count = brandMap.get(product.brand) || 0
            brandMap.set(product.brand, count + 1)
        })

        return Array.from(brandMap.entries())
            .map(([name, count]) => ({
                id: this.slugify(name),
                name,
                slug: this.slugify(name),
                count,
            }))
            .sort((a, b) => b.count - a.count)
    }

    async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
        try {
            // Fetch products from all suppliers
            const [syntechProducts, rctProducts, frontosaProducts] = await Promise.all([
                syntechService.fetchProducts(),
                rctService.fetchProducts(),
                frontosaService.fetchProducts(),
            ])

            const allProducts = [...syntechProducts, ...rctProducts, ...frontosaProducts]
            const searchLower = query.toLowerCase()

            return allProducts
                .filter(product => {
                    const name = (product.name || '').toLowerCase()
                    const sku = (product.sku || '').toString().toLowerCase()
                    const brand = (product.brand || '').toLowerCase()
                    const categories = product.categories || []

                    return name.includes(searchLower) ||
                        sku.includes(searchLower) ||
                        brand.includes(searchLower) ||
                        categories.some(c => (c || '').toLowerCase().includes(searchLower))
                })
                // Prioritize products with images
                .sort((a, b) => {
                    const aHasImages = a.images && a.images.length > 0
                    const bHasImages = b.images && b.images.length > 0
                    if (aHasImages && !bHasImages) return -1
                    if (!aHasImages && bHasImages) return 1
                    return 0
                })
                .slice(0, limit)
        } catch (error) {
            console.error('Search error in service:', error)
            throw error
        }
    }

    private applyFilters(products: Product[], filters: ProductFilters): Product[] {
        return products.filter(product => {
            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                const matchesSearch =
                    (product.name || '').toLowerCase().includes(searchLower) ||
                    (product.sku || '').toString().toLowerCase().includes(searchLower) ||
                    (product.brand || '').toLowerCase().includes(searchLower)
                if (!matchesSearch) return false
            }

            // Category filter
            if (filters.category) {
                const categoryLower = filters.category.toLowerCase()
                const matchesCategory = (product.categories || []).some(c =>
                    (c || '').toLowerCase().includes(categoryLower)
                )
                if (!matchesCategory) return false
            }

            // Brand filter
            if (filters.brand) {
                if ((product.brand || '').toLowerCase() !== filters.brand.toLowerCase()) {
                    return false
                }
            }

            // Price range filter
            if (filters.minPrice !== undefined && product.price < filters.minPrice) {
                return false
            }
            if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
                return false
            }

            // Stock filter
            if (filters.inStock && !product.inStock) {
                return false
            }

            return true
        })
    }

    private applySort(products: Product[], sortBy?: string): Product[] {
        switch (sortBy) {
            case 'price-asc':
                return products.sort((a, b) => a.price - b.price)
            case 'price-desc':
                return products.sort((a, b) => b.price - a.price)
            case 'name':
                return products.sort((a, b) => a.name.localeCompare(b.name))
            case 'newest':
                return products.sort((a, b) =>
                    new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
                )
            default:
                // Default: prioritize products with images (Syntech) first, then by stock status
                return products.sort((a, b) => {
                    // Products with images come first
                    const aHasImages = a.images && a.images.length > 0
                    const bHasImages = b.images && b.images.length > 0
                    if (aHasImages && !bHasImages) return -1
                    if (!aHasImages && bHasImages) return 1

                    // Then by stock status
                    if (a.inStock && !b.inStock) return -1
                    if (!a.inStock && b.inStock) return 1

                    return a.name.localeCompare(b.name)
                })
        }
    }

    private slugify(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    clearAllCaches(): void {
        syntechService.clearCache()
        rctService.clearCache()
    }
}

export const productService = new ProductService()
