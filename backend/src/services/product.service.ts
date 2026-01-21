import { syntechService } from './syntech.service'
import { rctService } from './rct.service'
import { frontosaService } from './frontosa.service'
import { Product, ProductFilters, PaginatedResponse, Category, Brand, Facets, FacetItem, CategoryAttribute } from '../types'

// Category-specific attribute extractors
interface AttributeExtractor {
    name: string
    key: string
    extract: (product: Product) => string | null
}

// Define which attributes to extract for each category
const CATEGORY_ATTRIBUTES: Record<string, AttributeExtractor[]> = {
    'Graphics cards': [
        {
            name: 'GPU Series',
            key: 'gpuSeries',
            extract: (p: Product) => {
                const name = p.name.toUpperCase()
                // Match RTX/GTX/RX series
                const patterns = [
                    /\b(RTX\s*\d{4}(?:\s*(?:TI|SUPER))?)\b/i,
                    /\b(GTX\s*\d{4}(?:\s*(?:TI|SUPER))?)\b/i,
                    /\b(RX\s*\d{4}(?:\s*(?:XT|XTX))?)\b/i,
                    /\b(ARC\s*[AB]\d+)\b/i,
                ]
                for (const pattern of patterns) {
                    const match = name.match(pattern)
                    if (match) return match[1].replace(/\s+/g, ' ').trim()
                }
                return null
            }
        },
        {
            name: 'Memory Size',
            key: 'gpuMemory',
            extract: (p: Product) => {
                const match = p.name.match(/(\d+)\s*GB/i)
                return match ? `${match[1]}GB` : null
            }
        }
    ],
    'Memory': [
        {
            name: 'Memory Type',
            key: 'memoryType',
            extract: (p: Product) => {
                const name = p.name.toUpperCase()
                if (name.includes('DDR5')) return 'DDR5'
                if (name.includes('DDR4')) return 'DDR4'
                if (name.includes('DDR3')) return 'DDR3'
                return null
            }
        },
        {
            name: 'Capacity',
            key: 'memoryCapacity',
            extract: (p: Product) => {
                // Match total capacity like 32GB, 16GB, etc.
                const match = p.name.match(/(\d+)\s*GB/i)
                return match ? `${match[1]}GB` : null
            }
        },
        {
            name: 'Speed',
            key: 'memorySpeed',
            extract: (p: Product) => {
                // Match speeds like 3200MHz, 6000MHz
                const match = p.name.match(/(\d{4,5})\s*MHz/i)
                return match ? `${match[1]}MHz` : null
            }
        }
    ],
    'CPU': [
        {
            name: 'CPU Series',
            key: 'cpuSeries',
            extract: (p: Product) => {
                const name = p.name.toUpperCase()
                // Intel patterns
                if (name.includes('CORE I9') || name.includes('I9-')) return 'Intel Core i9'
                if (name.includes('CORE I7') || name.includes('I7-')) return 'Intel Core i7'
                if (name.includes('CORE I5') || name.includes('I5-')) return 'Intel Core i5'
                if (name.includes('CORE I3') || name.includes('I3-')) return 'Intel Core i3'
                // AMD patterns
                if (name.includes('RYZEN 9')) return 'AMD Ryzen 9'
                if (name.includes('RYZEN 7')) return 'AMD Ryzen 7'
                if (name.includes('RYZEN 5')) return 'AMD Ryzen 5'
                if (name.includes('RYZEN 3')) return 'AMD Ryzen 3'
                if (name.includes('THREADRIPPER')) return 'AMD Threadripper'
                return null
            }
        },
        {
            name: 'Socket',
            key: 'cpuSocket',
            extract: (p: Product) => {
                const name = p.name.toUpperCase()
                const desc = (p.description || '').toUpperCase()
                const text = name + ' ' + desc
                if (text.includes('LGA1700') || text.includes('LGA 1700')) return 'LGA 1700'
                if (text.includes('LGA1851') || text.includes('LGA 1851')) return 'LGA 1851'
                if (text.includes('AM5')) return 'AM5'
                if (text.includes('AM4')) return 'AM4'
                if (text.includes('TR5') || text.includes('sTR5')) return 'sTR5'
                return null
            }
        }
    ],
    'Solid state drives': [
        {
            name: 'Capacity',
            key: 'storageCapacity',
            extract: (p: Product) => {
                const name = p.name.toUpperCase()
                // Match TB first
                const tbMatch = name.match(/(\d+)\s*TB/i)
                if (tbMatch) return `${tbMatch[1]}TB`
                // Then GB
                const gbMatch = name.match(/(\d+)\s*GB/i)
                if (gbMatch) return `${gbMatch[1]}GB`
                return null
            }
        },
        {
            name: 'Interface',
            key: 'storageInterface',
            extract: (p: Product) => {
                const name = p.name.toUpperCase()
                if (name.includes('NVME') || name.includes('M.2')) return 'NVMe M.2'
                if (name.includes('SATA')) return 'SATA'
                return null
            }
        }
    ],
    'Monitors': [
        {
            name: 'Screen Size',
            key: 'screenSize',
            extract: (p: Product) => {
                const match = p.name.match(/(\d{2}(?:\.\d)?)["\s]*(?:INCH|"|'')?/i)
                return match ? `${match[1]}"` : null
            }
        },
        {
            name: 'Resolution',
            key: 'resolution',
            extract: (p: Product) => {
                const name = p.name.toUpperCase()
                if (name.includes('4K') || name.includes('3840X2160') || name.includes('2160P')) return '4K UHD'
                if (name.includes('1440P') || name.includes('QHD') || name.includes('2560X1440')) return 'QHD 1440p'
                if (name.includes('1080P') || name.includes('FHD') || name.includes('1920X1080')) return 'FHD 1080p'
                return null
            }
        },
        {
            name: 'Refresh Rate',
            key: 'refreshRate',
            extract: (p: Product) => {
                const match = p.name.match(/(\d{2,3})\s*Hz/i)
                return match ? `${match[1]}Hz` : null
            }
        }
    ],
    'Motherboards': [
        {
            name: 'Socket',
            key: 'mbSocket',
            extract: (p: Product) => {
                const text = (p.name + ' ' + (p.description || '')).toUpperCase()
                if (text.includes('LGA1700') || text.includes('LGA 1700')) return 'LGA 1700'
                if (text.includes('LGA1851') || text.includes('LGA 1851')) return 'LGA 1851'
                if (text.includes('AM5')) return 'AM5'
                if (text.includes('AM4')) return 'AM4'
                return null
            }
        },
        {
            name: 'Chipset',
            key: 'mbChipset',
            extract: (p: Product) => {
                const name = p.name.toUpperCase()
                // Intel chipsets
                const intelMatch = name.match(/\b(Z[789]\d{2}|B[678]\d{2}|H[678]\d{2})\b/)
                if (intelMatch) return intelMatch[1]
                // AMD chipsets
                const amdMatch = name.match(/\b(X[678]\d{2}|B[56]\d{2}|A[56]\d{2})\b/)
                if (amdMatch) return amdMatch[1]
                return null
            }
        },
        {
            name: 'Form Factor',
            key: 'mbFormFactor',
            extract: (p: Product) => {
                const name = p.name.toUpperCase()
                if (name.includes('E-ATX') || name.includes('EATX')) return 'E-ATX'
                if (name.includes('MINI-ITX') || name.includes('ITX')) return 'Mini-ITX'
                if (name.includes('MICRO-ATX') || name.includes('MATX') || name.includes('M-ATX')) return 'Micro-ATX'
                if (name.includes('ATX')) return 'ATX'
                return null
            }
        }
    ],
}

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

        const allProductsUnfiltered = [...syntechProducts, ...rctProducts, ...frontosaProducts]

        // Apply filters
        let allProducts = this.applyFilters(allProductsUnfiltered, filters)

        // Calculate facets AFTER filtering (for contextual options)
        // But we need to calculate facets based on partial filtering for proper faceted search
        const facets = this.calculateFacets(allProductsUnfiltered, allProducts, filters)

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
            facets,
        }
    }

    /**
     * Calculate contextual facets based on current filters
     * - If category is selected, brands only show brands in that category
     * - If brand is selected, categories only show categories for that brand
     */
    private calculateFacets(allProducts: Product[], filteredProducts: Product[], filters: ProductFilters): Facets {
        // For categories: filter by brand (if selected) but NOT by category
        const productsForCategoryFacet = this.applyFilters(allProducts, {
            ...filters,
            category: undefined, // Don't filter by category when calculating category facets
        })

        // For brands: filter by category (if selected) but NOT by brand
        const productsForBrandFacet = this.applyFilters(allProducts, {
            ...filters,
            brand: undefined, // Don't filter by brand when calculating brand facets
        })

        // Calculate category counts
        const categoryMap = new Map<string, number>()
        productsForCategoryFacet.forEach(product => {
            product.categories.forEach(category => {
                if (category && category.trim()) {
                    const count = categoryMap.get(category) || 0
                    categoryMap.set(category, count + 1)
                }
            })
        })

        // Calculate brand counts
        const brandMap = new Map<string, number>()
        productsForBrandFacet.forEach(product => {
            if (product.brand && product.brand.trim()) {
                const count = brandMap.get(product.brand) || 0
                brandMap.set(product.brand, count + 1)
            }
        })

        // Calculate supplier counts (based on fully filtered products)
        const supplierMap = new Map<string, number>()
        filteredProducts.forEach(product => {
            const count = supplierMap.get(product.supplier) || 0
            supplierMap.set(product.supplier, count + 1)
        })

        // Calculate price range from filtered products
        const prices = filteredProducts.map(p => p.price).filter(p => p > 0)
        const priceRange = {
            min: prices.length > 0 ? Math.min(...prices) : 0,
            max: prices.length > 0 ? Math.max(...prices) : 0,
        }

        // Convert maps to sorted arrays
        const categories: FacetItem[] = Array.from(categoryMap.entries())
            .map(([name, count]) => ({
                name,
                slug: this.slugify(name),
                count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 50) // Limit to top 50 categories

        const brands: FacetItem[] = Array.from(brandMap.entries())
            .filter(([name]) => name && name !== 'Unknown')
            .map(([name, count]) => ({
                name,
                slug: this.slugify(name),
                count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 50) // Limit to top 50 brands

        const suppliers: FacetItem[] = Array.from(supplierMap.entries())
            .map(([name, count]) => ({
                name,
                slug: name,
                count,
            }))
            .sort((a, b) => b.count - a.count)

        return {
            categories,
            brands,
            priceRange,
            suppliers,
            attributes: this.extractCategoryAttributes(filteredProducts, filters.category),
        }
    }

    /**
     * Extract category-specific attributes from filtered products
     */
    private extractCategoryAttributes(products: Product[], category?: string): CategoryAttribute[] {
        if (!category) return []

        const extractors = CATEGORY_ATTRIBUTES[category]
        if (!extractors) return []

        const attributes: CategoryAttribute[] = []

        for (const extractor of extractors) {
            const valueMap = new Map<string, number>()

            for (const product of products) {
                const value = extractor.extract(product)
                if (value) {
                    valueMap.set(value, (valueMap.get(value) || 0) + 1)
                }
            }

            if (valueMap.size > 0) {
                const values: FacetItem[] = Array.from(valueMap.entries())
                    .map(([name, count]) => ({
                        name,
                        slug: this.slugify(name),
                        count,
                    }))
                    .sort((a, b) => {
                        // Sort numerically for sizes, alphabetically otherwise
                        const numA = parseInt(a.name)
                        const numB = parseInt(b.name)
                        if (!isNaN(numA) && !isNaN(numB)) return numA - numB
                        return a.name.localeCompare(b.name)
                    })

                attributes.push({
                    name: extractor.name,
                    key: extractor.key,
                    values,
                })
            }
        }

        return attributes
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
        // Extract dynamic attribute filters (any filter key not in the standard set)
        const standardKeys = ['search', 'category', 'brand', 'minPrice', 'maxPrice', 'inStock', 'supplier', 'sortBy', 'page', 'limit']
        const attributeFilters: Record<string, string> = {}
        for (const [key, value] of Object.entries(filters)) {
            if (!standardKeys.includes(key) && typeof value === 'string' && value.trim()) {
                attributeFilters[key] = value
            }
        }

        // Get extractors for the current category (if any)
        const categoryExtractors = filters.category ? CATEGORY_ATTRIBUTES[filters.category] || [] : []

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

            // Dynamic attribute filters (e.g., gpuSeries, gpuMemory, memoryType)
            for (const [attrKey, attrValue] of Object.entries(attributeFilters)) {
                const extractor = categoryExtractors.find(e => e.key === attrKey)
                if (extractor) {
                    const productValue = extractor.extract(product)
                    if (!productValue || productValue.toUpperCase() !== attrValue.toUpperCase()) {
                        return false
                    }
                }
            }

            return true
        })
    }

    private applySort(products: Product[], sortBy?: string): Product[] {
        switch (sortBy) {
            case 'price-asc':
            case 'price_asc':
                return products.sort((a, b) => a.price - b.price)
            case 'price-desc':
            case 'price_desc':
                return products.sort((a, b) => b.price - a.price)
            case 'name':
            case 'name-asc':
            case 'name_asc':
                return products.sort((a, b) => a.name.localeCompare(b.name))
            case 'name-desc':
            case 'name_desc':
                return products.sort((a, b) => b.name.localeCompare(a.name))
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
