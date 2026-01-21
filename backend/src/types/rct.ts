// RCT Data Feed API types

export interface RCTProduct {
    productCode: string
    name: string
    description: string
    price: number
    rrp: number
    onHand: number
    productLine: string
    category: string
    brand: string
    images: RCTImage[]
    specifications: Record<string, string>
    modifiedDate: string
}

export interface RCTImage {
    imageUrl: string
    isPrimary: boolean
    sortOrder: number
}

export interface RCTProductsResponse {
    products: RCTProduct[]
    totalCount: number
}
