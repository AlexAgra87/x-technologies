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
    sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest' | 'popular'
    page?: number
    limit?: number
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
