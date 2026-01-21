'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { ProductImage } from '@/components/ui/ProductImage'

const WISHLIST_KEY = 'xtech-wishlist'

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { addItem, isInCart } = useCart()
    const [addedToCart, setAddedToCart] = useState<string | null>(null)

    useEffect(() => {
        // Load wishlist from localStorage
        const stored = localStorage.getItem(WISHLIST_KEY)
        if (stored) {
            try {
                const items = JSON.parse(stored)
                setWishlistItems(items)
            } catch (e) {
                console.error('Error loading wishlist:', e)
            }
        }
        setIsLoading(false)
    }, [])

    const removeFromWishlist = (sku: string) => {
        const updated = wishlistItems.filter(item => item.sku !== sku)
        setWishlistItems(updated)
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
    }

    const handleAddToCart = (product: Product) => {
        addItem(product)
        setAddedToCart(product.sku)
        setTimeout(() => setAddedToCart(null), 2000)
    }

    const clearWishlist = () => {
        setWishlistItems([])
        localStorage.removeItem(WISHLIST_KEY)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-500/10 via-dark-800 to-pink-500/10 border-b border-gray-800">
                <div className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                            <span className="text-red-300 font-medium">My Wishlist</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Your <span className="text-gradient">Wishlist</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            {wishlistItems.length > 0
                                ? `You have ${wishlistItems.length} item${wishlistItems.length > 1 ? 's' : ''} saved for later`
                                : 'Save products you love and come back to them anytime'
                            }
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {wishlistItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-24 h-24 rounded-full bg-dark-800 border-2 border-gray-700 flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-12 h-12 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Your wishlist is empty</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Browse our products and click the heart icon to save items you're interested in.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold rounded-lg hover:from-teal-400 hover:to-cyan-400 transition-all"
                        >
                            Browse Products
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* Actions Bar */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-400">
                                {wishlistItems.length} item{wishlistItems.length > 1 ? 's' : ''} in your wishlist
                            </p>
                            <button
                                onClick={clearWishlist}
                                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                        </div>

                        {/* Wishlist Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {wishlistItems.map((product, index) => (
                                <motion.div
                                    key={product.sku}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden group"
                                >
                                    {/* Image */}
                                    <Link href={`/products/${encodeURIComponent(product.sku)}`}>
                                        <div className="relative aspect-square bg-white overflow-hidden">
                                            <ProductImage
                                                src={product.images?.[0] || null}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="p-4">
                                        {/* Brand */}
                                        <p className="text-xs text-teal-400 font-medium mb-1">{product.brand}</p>

                                        {/* Name */}
                                        <Link href={`/products/${encodeURIComponent(product.sku)}`}>
                                            <h3 className="text-sm font-medium text-white hover:text-teal-400 transition-colors line-clamp-2 min-h-[2.5rem] mb-3">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        {/* Price */}
                                        <div className="mb-4">
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <p className="text-sm text-gray-500 line-through">
                                                    {formatPrice(product.originalPrice)}
                                                </p>
                                            )}
                                            <p className="text-xl font-bold text-teal-400">
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${addedToCart === product.sku || isInCart(product.sku)
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-teal-500 text-black hover:bg-teal-400'
                                                    }`}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                {addedToCart === product.sku ? 'Added!' : isInCart(product.sku) ? 'In Cart' : 'Add to Cart'}
                                            </button>
                                            <button
                                                onClick={() => removeFromWishlist(product.sku)}
                                                className="p-2.5 rounded-lg bg-dark-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all"
                                                title="Remove from wishlist"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Continue Shopping */}
                        <div className="text-center mt-12">
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
                            >
                                Continue Shopping
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
