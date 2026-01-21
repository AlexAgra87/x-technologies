// Product types
export interface Product {
    id: string
    sku: string
    name: string
    description?: string
    brand: string
    categories: string[]
    price: number
    originalPrice?: number
    rrp?: number
    currency: string
    stock: StockInfo
    images: string[]
    featuredImage?: string
    specifications?: Record<string, string>
    attributes?: Record<string, string | number | boolean>
    warranty?: string
    supplier: 'syntech' | 'rct'
    url?: string
    weight?: number
    barcode?: string
    createdAt?: string
    updatedAt?: string
    lastModified?: string
    inStock?: boolean
    discount?: number
}

export interface StockInfo {
    quantity: number
    total?: number
    status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order'
    warehouse?: string
    locations?: Record<string, number>
    eta?: string
}

export interface Category {
    id?: string
    name: string
    slug: string
    count?: number
    productCount?: number
    parentCategory?: string
}

export interface Brand {
    name: string
    slug: string
    count?: number
    productCount?: number
    logo?: string
}

// Filter types
export interface ProductFilters {
    search?: string
    category?: string
    brand?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    supplier?: 'syntech' | 'rct' | 'all'
    sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'stock'
    page?: number
    limit?: number
    // Dynamic attribute filters (e.g., gpuSeries, gpuMemory)
    [key: string]: string | number | boolean | undefined
}

// Pagination
export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
    facets?: Facets
}

// Faceted filtering - contextual filter options
export interface Facets {
    categories: FacetItem[]
    brands: FacetItem[]
    priceRange: {
        min: number
        max: number
    }
    suppliers: FacetItem[]
    // Dynamic category-specific attributes (e.g., GPU Series, Memory Size)
    attributes: CategoryAttribute[]
}

export interface CategoryAttribute {
    name: string       // Display name (e.g., "GPU Series")
    key: string        // Filter key (e.g., "gpuSeries")
    values: FacetItem[] // Available values with counts
}

export interface FacetItem {
    name: string
    slug: string
    count: number
}

// API Response
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: {
        code: string
        message: string
        details?: any
    }
    meta?: {
        timestamp: string
        requestId: string
        cached?: boolean
    }
}

// Cart types (for future use)
export interface CartItem {
    product: Product
    quantity: number
}

export interface Cart {
    items: CartItem[]
    subtotal: number
    tax: number
    total: number
    currency: string
}
