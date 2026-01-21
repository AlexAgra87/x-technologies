// API Response types
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

// Category type
export interface Category {
    name: string
    slug: string
    count: number
    parentCategory?: string
}

// Brand type
export interface Brand {
    id: string
    name: string
    slug: string
    count: number
    logo?: string
}

export * from './product'
export * from './syntech'
export * from './rct'
export * from './frontosa'
