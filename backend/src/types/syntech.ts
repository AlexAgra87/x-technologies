// Syntech API types based on XML feed structure

export interface SyntechProduct {
    sku: string
    name: string
    price: string
    rrp_incl: string
    recommended_margin: string
    promo_price?: string
    promo_starts?: string
    promo_ends?: string
    cptstock: string
    jhbstock: string
    dbnstock: string
    nextshipmenteta?: string
    url: string
    description: string
    shortdesc?: string
    weight: string
    length: string
    width: string
    height: string
    featured_image: string
    additional_images?: {
        additional_image: string | string[]
    }
    all_images: string
    categories: string
    categoriesalt: string
    categorytree: string
    categorytreealt: string
    attributes: {
        brand?: { '#text': string } | string
        warranty?: { '#text': string } | string
        ean?: { '#text': string } | string
        colour?: { '#text': string } | string
        [key: string]: any
    }
    last_modified: string
}

export interface SyntechFeed {
    syntechstock: {
        stock: {
            product: SyntechProduct[]
        }
    }
}
