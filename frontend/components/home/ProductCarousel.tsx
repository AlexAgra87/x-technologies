'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Heart,
    Check,
    Clock,
    X,
    Package
} from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice, calculateDiscount, getStockStatus } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { ProductImage } from '@/components/ui/ProductImage'

interface ProductCarouselProps {
    title: string
    subtitle?: string
    products: Product[]
    viewAllLink?: string
    isLoading?: boolean
    accentColor?: 'teal' | 'orange' | 'purple' | 'blue'
}

function WootwareProductCard({ product }: { product: Product }) {
    const [addedToCart, setAddedToCart] = useState(false)
    const { addItem, isInCart } = useCart()

    const discount = product.originalPrice && product.originalPrice > product.price
        ? calculateDiscount(product.originalPrice, product.price)
        : 0

    const savings = product.originalPrice && product.originalPrice > product.price
        ? product.originalPrice - product.price
        : 0

    const stockQuantity = product.stock?.quantity ?? product.stock?.total ?? 0
    const stockInfo = getStockStatus(stockQuantity)

    const handleAddToCart = () => {
        addItem(product)
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
    }

    const inCart = isInCart(product.sku)

    // Stock status text like Wootware
    const getStockText = () => {
        if (stockInfo.status === 'in-stock') return 'In stock with X-Tech'
        if (stockInfo.status === 'low-stock') return `Only ${stockQuantity} left`
        return 'Out of stock'
    }

    const getStockColor = () => {
        if (stockInfo.status === 'in-stock') return 'text-green-400'
        if (stockInfo.status === 'low-stock') return 'text-yellow-400'
        return 'text-red-400'
    }

    return (
        <div className="group bg-dark-800 rounded-xl border border-gray-800 hover:border-teal-500/30 transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Image */}
            <Link href={`/products/${encodeURIComponent(product.sku)}`} className="block">
                <div className="relative aspect-square bg-white overflow-hidden">
                    <ProductImage
                        src={product.images?.[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{discount}%
                        </div>
                    )}

                    {/* Wishlist */}
                    <button
                        onClick={(e) => e.preventDefault()}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-teal-50"
                    >
                        <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Product Name */}
                <Link href={`/products/${encodeURIComponent(product.sku)}`}>
                    <h3 className="text-sm text-white font-medium line-clamp-2 hover:text-teal-400 transition-colors min-h-[2.5rem] mb-2">
                        {product.name}
                    </h3>
                </Link>

                {/* Stock Status */}
                <p className={`text-xs ${getStockColor()} flex items-center gap-1 mb-3`}>
                    {stockInfo.status === 'in-stock' && <Check className="w-3 h-3" />}
                    {stockInfo.status === 'low-stock' && <Clock className="w-3 h-3" />}
                    {stockInfo.status === 'out-of-stock' && <X className="w-3 h-3" />}
                    {getStockText()}
                </p>

                {/* Spacer to push price to bottom */}
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

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={stockInfo.status === 'out-of-stock'}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${stockInfo.status === 'out-of-stock'
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : addedToCart || inCart
                            ? "bg-green-500 text-white"
                            : "bg-teal-500 text-black hover:bg-teal-400"
                        }`}
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

function ProductSkeleton() {
    return (
        <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden animate-pulse">
            <div className="aspect-square bg-dark-700" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-dark-700 rounded w-full" />
                <div className="h-4 bg-dark-700 rounded w-3/4" />
                <div className="h-3 bg-dark-700 rounded w-1/2" />
                <div className="h-6 bg-dark-700 rounded w-24 mt-4" />
            </div>
        </div>
    )
}

export function ProductCarousel({
    title,
    subtitle,
    products,
    viewAllLink,
    isLoading = false,
    accentColor = 'teal'
}: ProductCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const accentColors = {
        teal: 'from-teal-400 to-cyan-400',
        orange: 'from-orange-400 to-amber-400',
        purple: 'from-purple-400 to-pink-400',
        blue: 'from-blue-400 to-indigo-400',
    }

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 320
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
            setTimeout(checkScroll, 300)
        }
    }

    return (
        <section className="py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className={`text-2xl font-bold bg-gradient-to-r ${accentColors[accentColor]} bg-clip-text text-transparent`}>
                        {title}
                    </h2>
                    {subtitle && (
                        <span className="text-sm text-gray-400 hidden sm:inline">
                            {subtitle}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Scroll buttons */}
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className="w-9 h-9 rounded-lg bg-dark-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-teal-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className="w-9 h-9 rounded-lg bg-dark-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-teal-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className="hidden sm:inline-flex items-center gap-1 px-4 py-2 text-sm text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition-colors ml-2"
                        >
                            View All
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Products Carousel */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {isLoading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-[240px]">
                            <ProductSkeleton />
                        </div>
                    ))
                ) : products.length === 0 ? (
                    <div className="w-full py-12 text-center">
                        <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500">No products available</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="flex-shrink-0 w-[240px]">
                            <WootwareProductCard product={product} />
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}
