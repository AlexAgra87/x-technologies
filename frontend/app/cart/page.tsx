'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    Package,
    ShoppingBag,
    ArrowLeft
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
    const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart, getItemMaxStock } = useCart()

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-dark-900 pt-24">
                <div className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 bg-dark-800 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-12 h-12 text-gray-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Looks like you haven't added any products yet. Start shopping to fill your cart!
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-black font-semibold rounded-lg hover:bg-teal-400 transition-colors"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Start Shopping
                        </Link>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
                        <p className="text-gray-400 mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
                                clearCart()
                            }
                        }}
                        className="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Cart
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.product.sku}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-dark-800 rounded-xl border border-gray-800 p-4 flex gap-4"
                            >
                                {/* Product Image */}
                                <Link
                                    href={`/products/${encodeURIComponent(item.product.sku)}`}
                                    className="flex-shrink-0"
                                >
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-lg overflow-hidden">
                                        {item.product.images?.[0] ? (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <Package className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <Link href={`/products/${encodeURIComponent(item.product.sku)}`}>
                                        <h3 className="font-medium text-white hover:text-teal-400 transition-colors line-clamp-2">
                                            {item.product.name}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 mt-1">SKU: {item.product.sku}</p>
                                    <p className="text-sm text-teal-400 mt-1">{item.product.brand}</p>

                                    {/* Mobile Price */}
                                    <p className="text-lg font-bold text-teal-400 mt-2 md:hidden">
                                        {formatPrice(item.product.price * item.quantity)}
                                    </p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-2 bg-dark-700 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.product.sku, item.quantity - 1)}
                                                className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center text-white font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.product.sku, item.quantity + 1)}
                                                disabled={item.quantity >= getItemMaxStock(item.product.sku)}
                                                className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Increase quantity"
                                                title={item.quantity >= getItemMaxStock(item.product.sku) ? 'Maximum stock reached' : 'Increase quantity'}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {item.quantity >= getItemMaxStock(item.product.sku) && getItemMaxStock(item.product.sku) < 999 && (
                                            <span className="text-xs text-yellow-500">Max stock</span>
                                        )}

                                        <button
                                            onClick={() => removeItem(item.product.sku)}
                                            className="text-sm text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Remove</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Price (Desktop) */}
                                <div className="hidden md:block text-right">
                                    <p className="text-xl font-bold text-teal-400">
                                        {formatPrice(item.product.price * item.quantity)}
                                    </p>
                                    {item.quantity > 1 && (
                                        <p className="text-sm text-gray-500">
                                            {formatPrice(item.product.price)} each
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Continue Shopping */}
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors mt-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-dark-800 rounded-xl border border-gray-800 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span className="text-white">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-white">Calculated at checkout</span>
                                </div>
                                <div className="border-t border-gray-700 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold text-white">Total</span>
                                        <span className="text-2xl font-bold text-teal-400">{formatPrice(subtotal)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">VAT included</p>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-500 text-black font-semibold rounded-lg hover:bg-teal-400 transition-colors"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </Link>

                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <h3 className="font-medium text-white mb-3">We Accept</h3>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <div className="px-3 py-2 bg-dark-700 rounded text-sm">EFT</div>
                                    <div className="px-3 py-2 bg-dark-700 rounded text-sm">Bank Transfer</div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    Secure payment via bank transfer. You will receive banking details after checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
