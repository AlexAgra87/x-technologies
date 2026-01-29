'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Product } from '@/lib/types'

const WISHLIST_KEY = 'xtech-wishlist'

interface WishlistContextType {
    items: Product[]
    isLoading: boolean
    addItem: (product: Product) => void
    removeItem: (sku: string) => void
    isInWishlist: (sku: string) => boolean
    toggleItem: (product: Product) => void
    clearWishlist: () => void
    itemCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const loadWishlist = () => {
            try {
                const stored = localStorage.getItem(WISHLIST_KEY)
                if (stored) {
                    setItems(JSON.parse(stored))
                }
            } catch (e) {
                console.error('Error loading wishlist:', e)
            }
            setIsLoading(false)
        }

        loadWishlist()

        // Listen for storage changes (sync across tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === WISHLIST_KEY) {
                loadWishlist()
            }
        }

        // Listen for custom wishlist events (same tab updates)
        const handleWishlistUpdate = () => {
            loadWishlist()
        }

        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('wishlist-updated', handleWishlistUpdate)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('wishlist-updated', handleWishlistUpdate)
        }
    }, [])

    // Save to localStorage and dispatch event whenever items change
    const saveWishlist = useCallback((newItems: Product[]) => {
        setItems(newItems)
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(newItems))
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('wishlist-updated'))
    }, [])

    const addItem = useCallback((product: Product) => {
        setItems(prev => {
            if (prev.some(item => item.sku === product.sku)) {
                return prev // Already in wishlist
            }
            const newItems = [...prev, product]
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(newItems))
            window.dispatchEvent(new CustomEvent('wishlist-updated'))
            return newItems
        })
    }, [])

    const removeItem = useCallback((sku: string) => {
        setItems(prev => {
            const newItems = prev.filter(item => item.sku !== sku)
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(newItems))
            window.dispatchEvent(new CustomEvent('wishlist-updated'))
            return newItems
        })
    }, [])

    const isInWishlist = useCallback((sku: string) => {
        return items.some(item => item.sku === sku)
    }, [items])

    const toggleItem = useCallback((product: Product) => {
        setItems(prev => {
            const exists = prev.some(item => item.sku === product.sku)
            const newItems = exists
                ? prev.filter(item => item.sku !== product.sku)
                : [...prev, product]
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(newItems))
            window.dispatchEvent(new CustomEvent('wishlist-updated'))
            return newItems
        })
    }, [])

    const clearWishlist = useCallback(() => {
        setItems([])
        localStorage.removeItem(WISHLIST_KEY)
        window.dispatchEvent(new CustomEvent('wishlist-updated'))
    }, [])

    return (
        <WishlistContext.Provider
            value={{
                items,
                isLoading,
                addItem,
                removeItem,
                isInWishlist,
                toggleItem,
                clearWishlist,
                itemCount: items.length,
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}
