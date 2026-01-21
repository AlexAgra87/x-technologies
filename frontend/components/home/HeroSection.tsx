'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight, Flame, Zap, Package } from 'lucide-react'
import { useProducts } from '@/lib/api'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { Product } from '@/lib/types'
import { ProductImage } from '@/components/ui/ProductImage'

// Banner slides data - Using high-quality modern PC/gaming images
const bannerSlides = [
    {
        id: 1,
        tag: 'Gaming Powerhouse',
        title: 'UNLEASH YOUR\nPOTENTIAL',
        description: 'High-performance gaming PCs and components. Built for victory, designed for champions.',
        features: ['RTX 40 Series', 'DDR5 Memory', 'PCIe 5.0'],
        cta: { text: 'SHOP NOW', href: '/products?category=Gaming' },
        bgImage: 'https://images.unsplash.com/photo-1623820919239-0d0ff10797a1?auto=format&fit=crop&w=1920&q=80',
        accent: 'from-purple-600/30 to-blue-600/20',
    },
    {
        id: 2,
        tag: 'Workstation Ready',
        title: 'POWER YOUR\nCREATIVITY',
        description: 'Professional-grade hardware for content creators, designers, and developers.',
        features: ['Multi-GPU Ready', 'ECC Memory', 'Thunderbolt 4'],
        cta: { text: 'EXPLORE', href: '/products?category=Workstation' },
        bgImage: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1920&q=80',
        accent: 'from-teal-600/30 to-cyan-600/20',
    },
    {
        id: 3,
        tag: 'Build Your Dream',
        title: 'CUSTOM PC\nBUILDS',
        description: 'From entry-level to extreme builds. Every component hand-picked for performance.',
        features: ['Expert Assembly', 'Cable Management', 'Quality Tested'],
        cta: { text: 'START BUILD', href: '/products' },
        bgImage: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=1920&q=80',
        accent: 'from-orange-600/30 to-red-600/20',
    },
    {
        id: 4,
        tag: 'Unbeatable Deals',
        title: 'MASSIVE\nSAVINGS',
        description: 'Premium tech at unbeatable prices. Limited stock, unlimited performance.',
        features: ['Best Prices', 'Fast Shipping', 'Expert Support'],
        cta: { text: 'VIEW DEALS', href: '/products?sortBy=price_asc' },
        bgImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1920&q=80',
        accent: 'from-green-600/30 to-emerald-600/20',
    },
]

// PC Build images for bottom banner - Modern RGB builds
const pcBuilds = [
    'https://images.unsplash.com/photo-1623820919239-0d0ff10797a1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80',
]

// Featured Deal Card Component - Compact version
function FeaturedDealCard({ product }: { product: Product }) {
    const { addItem, isInCart } = useCart()
    const [added, setAdded] = useState(false)

    const discount = product.rrp && product.rrp > product.price
        ? calculateDiscount(product.rrp, product.price)
        : 0

    const primaryImage = product.images?.[0] || null
    const inCart = isInCart(product.sku)

    const handleAddToCart = () => {
        addItem(product)
        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
    }

    return (
        <div className="bg-dark-800 rounded-lg border border-gray-800 overflow-hidden h-full flex flex-col">
            {/* While Stocks Last Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 py-1 px-2 text-center">
                <span className="text-white font-bold text-xs tracking-wide flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3" />
                    WHILE STOCKS LAST
                </span>
            </div>

            {/* Product Image */}
            <Link href={`/products/${encodeURIComponent(product.sku)}`} className="block relative">
                <div className="relative aspect-[4/3] bg-white p-2">
                    <ProductImage
                        src={primaryImage}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                        <div className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold z-10">
                            {discount}%
                        </div>
                    )}
                </div>
            </Link>

            {/* Product Info */}
            <div className="p-2 flex-1 flex flex-col">
                <Link href={`/products/${encodeURIComponent(product.sku)}`}>
                    <h3 className="text-white font-medium text-xs line-clamp-2 hover:text-teal-400 transition-colors mb-1">
                        {product.name}
                    </h3>
                </Link>

                {/* Price */}
                <div className="mt-auto">
                    {product.rrp && product.rrp > product.price && (
                        <p className="text-gray-500 text-xs line-through">
                            {formatPrice(product.rrp)}
                        </p>
                    )}
                    <p className="text-teal-400 text-base font-bold">
                        {formatPrice(product.price)}
                    </p>
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={inCart || added}
                    className={`mt-2 w-full py-1.5 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1
                        ${added || inCart
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-teal-500 text-black hover:bg-teal-400'
                        }`}
                >
                    {added ? 'Added!' : inCart ? 'In Cart' : 'ADD TO CART'}
                </button>
            </div>
        </div>
    )
}

export function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const [featuredIndex, setFeaturedIndex] = useState(0)

    // Fetch products on sale (with discount) for featured deal
    const { data: productsData, isLoading } = useProducts({ limit: 50, sortBy: 'price_desc' })

    // Get products with discounts (on sale)
    const saleProducts = productsData?.items.filter((p: Product) =>
        p.rrp && p.rrp > p.price && p.images?.length > 0
    ) || []

    // Rotate featured product every 10 seconds
    useEffect(() => {
        if (saleProducts.length === 0) return
        const timer = setInterval(() => {
            setFeaturedIndex(prev => (prev + 1) % Math.min(10, saleProducts.length))
        }, 10000) // Rotate every 10 seconds
        return () => clearInterval(timer)
    }, [saleProducts.length])

    // Get current featured product
    const featuredProduct = saleProducts.length > 0 ? saleProducts[featuredIndex % saleProducts.length] : null

    // Auto-advance slides
    useEffect(() => {
        if (!isAutoPlaying) return
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % bannerSlides.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [isAutoPlaying])

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(index)
        setIsAutoPlaying(false)
        setTimeout(() => setIsAutoPlaying(true), 10000)
    }, [])

    const prevSlide = () => goToSlide((currentSlide - 1 + bannerSlides.length) % bannerSlides.length)
    const nextSlide = () => goToSlide((currentSlide + 1) % bannerSlides.length)

    const currentBanner = bannerSlides[currentSlide]

    return (
        <section className="pt-20 bg-dark-900">
            {/* Main Hero Area */}
            <div className="container mx-auto px-4 py-3">
                <div className="grid lg:grid-cols-4 gap-3">
                    {/* Main Banner Carousel - Takes 3 columns */}
                    <div className="lg:col-span-3 relative rounded-xl overflow-hidden bg-dark-800 min-h-[160px] lg:min-h-[180px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0"
                            >
                                {/* Background Image */}
                                <Image
                                    src={currentBanner.bgImage}
                                    alt={currentBanner.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.accent}`} />
                                <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-900/60 to-transparent" />

                                {/* Content - Added left padding to avoid arrow overlap */}
                                <div className="relative z-10 h-full flex flex-col justify-center pl-12 pr-4 py-4 lg:pl-14 lg:pr-6 lg:py-6">
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="inline-flex items-center gap-1 text-teal-400 text-xs font-medium mb-1"
                                    >
                                        <Zap className="w-3 h-3" />
                                        {currentBanner.tag}
                                    </motion.span>

                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="text-xl lg:text-2xl xl:text-3xl font-black text-white leading-tight whitespace-pre-line mb-2"
                                    >
                                        {currentBanner.title}
                                    </motion.h2>

                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-gray-300 text-xs max-w-sm mb-3 hidden lg:block"
                                    >
                                        {currentBanner.description}
                                    </motion.p>

                                    {/* Features - hidden on compact view */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.25 }}
                                        className="flex flex-wrap gap-1.5 mb-3 hidden xl:flex"
                                    >
                                        {currentBanner.features.map((feature, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-xs text-white"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Link
                                            href={currentBanner.cta.href}
                                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-500 text-black text-xs font-bold rounded-lg hover:bg-teal-400 transition-colors"
                                        >
                                            {currentBanner.cta.text}
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-20"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-20"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Slide Indicators */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                            {bannerSlides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToSlide(i)}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? 'bg-teal-400' : 'bg-white/40 hover:bg-white/60'
                                        }`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Featured Deal Sidebar - Takes 1 column */}
                    <div className="lg:col-span-1">
                        {isLoading ? (
                            <div className="bg-dark-800 rounded-xl border border-gray-800 h-full animate-pulse">
                                <div className="bg-orange-500/50 py-2 px-4" />
                                <div className="aspect-square bg-gray-700 m-4 rounded-lg" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                                    <div className="h-6 bg-gray-700 rounded w-1/2" />
                                </div>
                            </div>
                        ) : featuredProduct ? (
                            <FeaturedDealCard product={featuredProduct} />
                        ) : (
                            <div className="bg-dark-800 rounded-xl border border-gray-800 h-full flex items-center justify-center p-6">
                                <div className="text-center text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Loading deals...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom PC Builds Banner */}
            {/* Custom PC Builds Banner - Compact */}
            <div className="container mx-auto px-4 pb-4">
                <div className="relative rounded-lg overflow-hidden bg-dark-800 border border-gray-800">
                    <div className="flex items-center">
                        {/* Left Text */}
                        <div className="p-4 lg:p-5 flex-shrink-0">
                            <h3 className="text-base lg:text-lg font-black text-white leading-tight">
                                CUSTOM BUILT <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">PERFORMANCE</span>
                            </h3>
                        </div>

                        {/* PC Build Images - Hidden on mobile */}
                        <div className="flex-1 hidden md:flex gap-0.5 overflow-hidden h-20">
                            {pcBuilds.map((img, i) => (
                                <div key={i} className="relative flex-1">
                                    <Image
                                        src={img}
                                        alt={`Custom PC Build ${i + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400" />
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="p-4 lg:p-5 flex-shrink-0">
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded hover:bg-orange-400 transition-colors"
                            >
                                BUILD IT
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
