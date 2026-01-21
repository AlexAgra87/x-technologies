/**
 * User & Order Types for X-Tech
 */

// User types
export interface UserAddress {
    id: string
    label: string // 'Home', 'Work', etc.
    firstName: string
    lastName: string
    phone: string
    address: string
    city: string
    province: string
    postalCode: string
    isDefault: boolean
}

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string
    addresses: UserAddress[]
    createdAt: string
    isAdmin?: boolean
}

// Order status flow
export type OrderStatus =
    | 'pending_payment'    // Waiting for customer payment
    | 'payment_received'   // Payment confirmed
    | 'processing'         // X-Tech ordering from supplier
    | 'ordered'           // Ordered from supplier
    | 'shipped'           // Supplier shipped to customer
    | 'delivered'         // Customer received
    | 'cancelled'         // Order cancelled

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    pending_payment: 'Pending Payment',
    payment_received: 'Payment Received',
    processing: 'Processing',
    ordered: 'Ordered from Supplier',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
    pending_payment: 'text-yellow-400 bg-yellow-500/10',
    payment_received: 'text-blue-400 bg-blue-500/10',
    processing: 'text-purple-400 bg-purple-500/10',
    ordered: 'text-cyan-400 bg-cyan-500/10',
    shipped: 'text-teal-400 bg-teal-500/10',
    delivered: 'text-green-400 bg-green-500/10',
    cancelled: 'text-red-400 bg-red-500/10',
}

// Order item (product in order)
export interface OrderItem {
    productId: string
    sku: string
    name: string
    brand: string
    price: number
    quantity: number
    image?: string
}

// Full order
export interface Order {
    id: string
    orderRef: string
    userId: string
    userEmail: string
    items: OrderItem[]
    subtotal: number
    shippingCost: number
    total: number
    status: OrderStatus
    shippingAddress: {
        firstName: string
        lastName: string
        email: string
        phone: string
        address: string
        city: string
        province: string
        postalCode: string
    }
    notes?: string
    // Tracking info
    supplierOrderRef?: string  // Reference from Syntech/RCT
    trackingNumber?: string
    trackingUrl?: string
    // Timestamps
    createdAt: string
    paidAt?: string
    orderedAt?: string
    shippedAt?: string
    deliveredAt?: string
    updatedAt: string
}

// For creating a new order
export interface CreateOrderData {
    items: OrderItem[]
    subtotal: number
    shippingCost: number
    total: number
    shippingAddress: Order['shippingAddress']
}

// Admin order update
export interface UpdateOrderData {
    status?: OrderStatus
    notes?: string
    supplierOrderRef?: string
    trackingNumber?: string
    trackingUrl?: string
}
