'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, CartItem } from './types'

interface CartContextType {
    items: CartItem[]
    itemCount: number
    subtotal: number
    addItem: (product: Product, quantity?: number) => void
    removeItem: (sku: string) => void
    updateQuantity: (sku: string, quantity: number) => void
    clearCart: () => void
    isInCart: (sku: string) => boolean
    getItemQuantity: (sku: string) => number
    getItemMaxStock: (sku: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'xtech-cart'

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY)
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart)
                setItems(parsed)
            } catch (e) {
                console.error('Failed to parse cart from localStorage:', e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
        }
    }, [items, isLoaded])

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

    const addItem = (product: Product, quantity = 1) => {
        // Get available stock
        const stockQuantity = product.stock?.quantity ?? product.stock?.total ?? 999

        setItems(current => {
            const existingIndex = current.findIndex(item => item.product.sku === product.sku)

            if (existingIndex >= 0) {
                // Update quantity of existing item (limited by stock)
                const updated = [...current]
                const newQuantity = Math.min(
                    updated[existingIndex].quantity + quantity,
                    stockQuantity
                )
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: newQuantity
                }
                return updated
            }

            // Add new item (limited by stock)
            return [...current, { product, quantity: Math.min(quantity, stockQuantity) }]
        })
    }

    const removeItem = (sku: string) => {
        setItems(current => current.filter(item => item.product.sku !== sku))
    }

    const updateQuantity = (sku: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(sku)
            return
        }

        setItems(current =>
            current.map(item => {
                if (item.product.sku === sku) {
                    // Limit quantity by available stock
                    const stockQuantity = item.product.stock?.quantity ?? item.product.stock?.total ?? 999
                    return { ...item, quantity: Math.min(quantity, stockQuantity) }
                }
                return item
            })
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const isInCart = (sku: string) => {
        return items.some(item => item.product.sku === sku)
    }

    const getItemQuantity = (sku: string) => {
        const item = items.find(item => item.product.sku === sku)
        return item?.quantity || 0
    }

    const getItemMaxStock = (sku: string) => {
        const item = items.find(item => item.product.sku === sku)
        if (!item) return 0
        return item.product.stock?.quantity ?? item.product.stock?.total ?? 999
    }

    return (
        <CartContext.Provider value={{
            items,
            itemCount,
            subtotal,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            isInCart,
            getItemQuantity,
            getItemMaxStock
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
