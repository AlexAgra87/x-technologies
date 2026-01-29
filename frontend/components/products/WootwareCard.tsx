'use client'

import { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import {
    ShoppingCart,
    Heart,
    Package,
    Check,
    Clock,
    X,
    Eye
} from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice, calculateDiscount, getStockStatus, cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { ProductImage } from '@/components/ui/ProductImage'

interface WootwareCardProps {
    product: Product
    variant?: 'grid' | 'list'
}

function WootwareCardComponent({ product, variant = 'grid' }: WootwareCardProps) {
    const [addedToCart, setAddedToCart] = useState(false)
    const { addItem, isInCart } = useCart()
    const { isInWishlist, toggleItem } = useWishlist()

    const isWishlisted = isInWishlist(product.sku)

    const handleToggleWishlist = useCallback(() => {
        toggleItem(product)
    }, [toggleItem, product])

    const handleAddToCart = useCallback(() => {
        addItem(product)
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
    }, [addItem, product])

    const inCart = isInCart(product.sku)

    const discount = product.originalPrice && product.originalPrice > product.price
        ? calculateDiscount(product.originalPrice, product.price)
        : 0

    const savings = product.originalPrice && product.originalPrice > product.price
        ? product.originalPrice - product.price
        : 0

    const stockQuantity = product.stock?.quantity ?? product.stock?.total ?? 0
    const stockInfo = getStockStatus(stockQuantity)

    const primaryImage = product.images?.[0] || null

    const getStockText = () => {
        if (stockInfo.status === 'in-stock') return 'In Stock'
        if (stockInfo.status === 'low-stock') return 'Limited Stock'
        return 'Out of stock'
    }

    const getStockColor = () => {
        if (stockInfo.status === 'in-stock') return 'text-green-400'
        if (stockInfo.status === 'low-stock') return 'text-yellow-400'
        return 'text-red-400'
    }

    const StockIcon = () => {
        if (stockInfo.status === 'in-stock') return <Check className="w-3.5 h-3.5" />
        if (stockInfo.status === 'low-stock') return <Clock className="w-3.5 h-3.5" />
        return <X className="w-3.5 h-3.5" />
    }

    // List variant
    if (variant === 'list') {
        return (
            <div className="group bg-dark-800 rounded-xl border border-gray-800 hover:border-teal-500/30 transition-all duration-300 overflow-hidden">
                <div className="flex gap-4 p-4">
                    {/* Image */}
                    <Link href={`/products/${encodeURIComponent(product.sku)}`} className="flex-shrink-0">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-lg overflow-hidden">
                            <ProductImage
                                src={primaryImage}
                                alt={product.name}
                                fill
                                className="object-contain p-2"
                            />
                            {discount > 0 && (
                                <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                                    -{discount}%
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                {/* Brand & Category */}
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                    <span className="text-teal-400">{product.brand}</span>
                                    {product.categories?.[0] && (
                                        <>
                                            <span>•</span>
                                            <span>{product.categories[0]}</span>
                                        </>
                                    )}
                                </div>

                                {/* Product Name */}
                                <Link href={`/products/${encodeURIComponent(product.sku)}`}>
                                    <h3 className="font-medium text-white hover:text-teal-400 transition-colors line-clamp-2 mb-2">
                                        {product.name}
                                    </h3>
                                </Link>

                                {/* SKU */}
                                <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>

                                {/* Stock Status */}
                                <p className={`text-xs ${getStockColor()} flex items-center gap-1`}>
                                    <StockIcon />
                                    {getStockText()}
                                </p>
                            </div>

                            {/* Wishlist */}
                            <button
                                onClick={handleToggleWishlist}
                                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                            >
                                <Heart className={cn(
                                    "w-5 h-5 transition-colors",
                                    isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500 hover:text-red-400"
                                )} />
                            </button>
                        </div>

                        <div className="flex-1" />

                        {/* Footer */}
                        <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-700/50">
                            <div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <p className="text-sm text-gray-500 line-through">
                                        {formatPrice(product.originalPrice)}
                                    </p>
                                )}
                                <p className="text-xl font-bold text-teal-400">
                                    {formatPrice(product.price)}
                                </p>
                                {savings > 0 && (
                                    <p className="text-xs text-green-400 font-medium">
                                        Save: {formatPrice(savings)}!
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={stockInfo.status === 'out-of-stock'}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                                    stockInfo.status === 'out-of-stock'
                                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                        : addedToCart || inCart
                                            ? "bg-green-500 text-white"
                                            : "bg-teal-500 text-black hover:bg-teal-400"
                                )}
                            >
                                {addedToCart ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Added!
                                    </>
                                ) : inCart ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        In Cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Grid variant
    return (
        <div className="group bg-dark-800 rounded-xl border border-gray-800 hover:border-teal-500/30 transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Image */}
            <Link href={`/products/${encodeURIComponent(product.sku)}`} className="block">
                <div className="relative aspect-square bg-white overflow-hidden">
                    <ProductImage
                        src={primaryImage}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                            -{discount}%
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                handleToggleWishlist()
                            }}
                            className="w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-teal-50 transition-colors"
                        >
                            <Heart className={cn(
                                "w-4 h-4 transition-colors",
                                isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600 hover:text-red-500"
                            )} />
                        </button>
                        <Link
                            href={`/products/${encodeURIComponent(product.sku)}`}
                            className="w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-teal-50 transition-colors"
                        >
                            <Eye className="w-4 h-4 text-gray-600" />
                        </Link>
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Brand */}
                <p className="text-xs text-teal-400 font-medium mb-1">{product.brand}</p>

                {/* Product Name */}
                <Link href={`/products/${encodeURIComponent(product.sku)}`}>
                    <h3 className="text-sm font-medium text-white hover:text-teal-400 transition-colors line-clamp-2 min-h-[2.5rem] mb-2">
                        {product.name}
                    </h3>
                </Link>

                {/* Stock Status */}
                <p className={`text-xs ${getStockColor()} flex items-center gap-1 mb-3`}>
                    <StockIcon />
                    {getStockText()}
                </p>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Pricing */}
                <div className="space-y-1 mb-3">
                    {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                        </p>
                    )}
                    <p className="text-xl font-bold text-teal-400">
                        {formatPrice(product.price)}
                    </p>
                    {savings > 0 && (
                        <p className="text-xs text-green-400 font-medium">
                            Save: {formatPrice(savings)}!
                        </p>
                    )}
                </div>

                {/* Shop Category Link */}
                {product.categories?.[0] && (
                    <Link
                        href={`/products?category=${encodeURIComponent(product.categories[0])}`}
                        className="text-xs text-teal-400 hover:text-teal-300 hover:underline mb-3"
                    >
                        Shop {product.categories[0]}
                    </Link>
                )}

                {/* Add to Cart */}
                <button
                    onClick={handleAddToCart}
                    disabled={stockInfo.status === 'out-of-stock'}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all",
                        stockInfo.status === 'out-of-stock'
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : addedToCart || inCart
                                ? "bg-green-500 text-white"
                                : "bg-teal-500 text-black hover:bg-teal-400"
                    )}
                >
                    {addedToCart ? (
                        <>
                            <Check className="w-4 h-4" />
                            Added!
                        </>
                    ) : inCart ? (
                        <>
                            <Check className="w-4 h-4" />
                            In Cart
                        </>
                    ) : stockInfo.status === 'out-of-stock' ? (
                        <>
                            <X className="w-4 h-4" />
                            Out of Stock
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

// Memoize the component to prevent unnecessary re-renders
export const WootwareCard = memo(WootwareCardComponent, (prevProps, nextProps) => {
    // Custom comparison: only re-render if product SKU or variant changes
    return prevProps.product.sku === nextProps.product.sku &&
        prevProps.variant === nextProps.variant &&
        prevProps.product.price === nextProps.product.price &&
        prevProps.product.stock?.quantity === nextProps.product.stock?.quantity
})
