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
