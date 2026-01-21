// Product types matching supplier data structures

export interface Product {
    id: string
    sku: string
    name: string
    description: string
    shortDescription?: string
    price: number
    rrp: number
    recommendedMargin?: number
    supplier: 'syntech' | 'rct' | 'frontosa'

    // Stock levels
    stock: StockInfo

    // Media
    featuredImage: string
    images: string[]

    // Categorization
    categories: string[]
    categoryTree: string
    brand: string

    // Attributes
    attributes: Record<string, string>
    warranty?: string

    // Metadata
    url?: string
    lastModified: Date
    createdAt: Date

    // Computed
    discount: number
    inStock: boolean
}

export interface StockInfo {
    total: number
    locations: {
        cpt?: number  // Cape Town
        jhb?: number  // Johannesburg
        dbn?: number  // Durban
    }
    nextShipmentEta?: string
}

export interface ProductFilters {
    search?: string
    category?: string
    brand?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    supplier?: 'syntech' | 'rct' | 'frontosa' | 'all'
    sortBy?: 'price-asc' | 'price-desc' | 'price_asc' | 'price_desc' | 'name' | 'name-asc' | 'name-desc' | 'name_asc' | 'name_desc' | 'newest' | 'popular'
    page?: number
    limit?: number
    // Dynamic attribute filters (e.g., gpuSeries=RTX 5090, memorySize=16GB)
    [key: string]: string | number | boolean | undefined
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
    facets?: Facets
}

// Faceted filtering - contextual filter options based on current selection
export interface Facets {
    categories: FacetItem[]
    brands: FacetItem[]
    priceRange: {
        min: number
        max: number
    }
    suppliers: FacetItem[]
    // Dynamic category-specific attributes (e.g., GPU Series, Memory Size for Graphics cards)
    attributes: CategoryAttribute[]
}

export interface CategoryAttribute {
    name: string       // Display name (e.g., "GPU Series", "Memory Size")
    key: string        // Filter key (e.g., "gpuSeries", "memorySize")
    values: FacetItem[] // Available values with counts
}

export interface FacetItem {
    name: string
    slug: string
    count: number
}

export interface Category {
    id: string
    name: string
    slug: string
    parent?: string
    productCount: number
    children?: Category[]
}

export interface Brand {
    id: string
    name: string
    slug: string
    count: number
    productCount?: number  // Alias for backward compatibility
}

// API Response types
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: {
        code: string
        message: string
    }
    meta?: {
        timestamp: string
        requestId: string
    }
}
