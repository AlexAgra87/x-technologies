// Frontosa API types

export interface FrontosaStockResponse {
    modified: string
    generated: string
    notice?: string
    items: FrontosaStockItem[]
}

export interface FrontosaStockItem {
    code: string           // Stock code (SKU)
    desc: string           // Short description
    status: 'C' | 'N' | 'R' | 'A'  // C=coming, N=new, R=request item, A=added
    war: number            // Warranty period in months
    bid: number            // Brand ID
    pid: number            // Product category ID
    price: number          // Selling price ex VAT
    // Stock quantities per branch (dynamic keys)
    qty_jhb?: number
    qty_cpt?: number
    qty_dbn?: number
    qty_pta?: number
    qty_pe?: number
    more_jhb?: 0 | 1
    more_cpt?: 0 | 1
    more_dbn?: 0 | 1
    more_pta?: 0 | 1
    more_pe?: 0 | 1
    [key: string]: string | number | undefined  // For dynamic branch fields
}

export interface FrontosaInfoResponse {
    version: number
    brands: FrontosaBrand[]
    categories: FrontosaCategory[]
    items: FrontosaInfoItem[]
    notice?: string
}

export interface FrontosaBrand {
    id: number
    name: string
}

export interface FrontosaCategory {
    id: number
    name: string
}

export interface FrontosaInfoItem {
    code: string
    desc: string
    created: string        // Date item was added
    status: 'A' | 'C' | 'N' | 'R'
    war: number
    bid: number
    pid: number
}

export interface FrontosaLink {
    code: string
    checked: string        // Date last checked
    url: string            // Product page URL
}

export interface FrontosaLinksResponse {
    items: FrontosaLink[]
}

// Order types for future use
export interface FrontosaOrderRequest {
    token: string
    reference: string      // Purchase order number (max 12 chars)
    method: 1 | 2 | 3 | 4  // 1=Collect, 2=Courier, 3=Delivery (paid), 4=Delivery (free >2000)
    build: 0 | 1 | 2 | 3   // 0=None, 1=BIOS Update, 2=Standard Assembly, 3=Assembly with OS
    notes?: string
    email: string
    items: FrontosaOrderItem[]
}

export interface FrontosaOrderItem {
    code: string
    qty: number
}

export interface FrontosaOrderResponse {
    status: number
    message: string
    items?: {
        code: string
        qty: number
        price: number
        status: 'in stock' | 'backorder' | string
    }[]
}

export interface FrontosaTransaction {
    date: string
    invoice: string
    type: 'in' | 'cn'      // Invoice or Credit Note
    debit: number
    credit: number
    order_no: string
}

export interface FrontosaTransactionsResponse {
    transactions: FrontosaTransaction[]
}
