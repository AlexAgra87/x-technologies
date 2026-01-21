'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
    Cpu,
    HardDrive,
    Monitor,
    Keyboard,
    Headphones,
    Gamepad2,
    Router,
    Battery,
    ArrowRight
} from 'lucide-react'
import { useProducts, useCategories } from '@/lib/api'
import { ProductCarousel } from './ProductCarousel'
import { HeroSection } from './HeroSection'

const quickCategories = [
    { name: 'Graphics Cards', icon: Gamepad2, href: '/products?category=Graphics%20cards' },
    { name: 'Processors', icon: Cpu, href: '/products?category=CPU' },
    { name: 'Storage', icon: HardDrive, href: '/products?category=Solid%20state%20drives' },
    { name: 'Monitors', icon: Monitor, href: '/products?category=Monitors' },
    { name: 'Peripherals', icon: Keyboard, href: '/products?category=Computer%20peripherals' },
    { name: 'Audio', icon: Headphones, href: '/products?category=Headsets' },
    { name: 'Networking', icon: Router, href: '/products?category=Networking%20%26%20security' },
    { name: 'Power Supplies', icon: Battery, href: '/products?category=Power%20supplies' },
]

// Helper to check if product has valid image - defined outside component to avoid re-creation
const hasValidImage = (p: any) =>
    p.images &&
    Array.isArray(p.images) &&
    p.images.length > 0 &&
    p.images[0] &&
    typeof p.images[0] === 'string' &&
    p.images[0].length > 0 &&
    !p.images[0].includes('&#')

export function HomeContent() {
    // Fetch products for different sections - prefer Syntech as they have better images
    const { data: hotDealsData, isLoading: hotDealsLoading } = useProducts({
        limit: 50,
        sortBy: 'price_asc',
        supplier: 'syntech'
    })

    const { data: newArrivalsData, isLoading: newArrivalsLoading } = useProducts({
        limit: 50,
        sortBy: 'newest',
        supplier: 'syntech'
    })

    const { data: popularData, isLoading: popularLoading } = useProducts({
        limit: 50,
        sortBy: 'stock',
        supplier: 'syntech'
    })

    const { data: gpuData, isLoading: gpuLoading } = useProducts({
        limit: 30,
        category: 'Graphics cards',
        supplier: 'syntech'
    })

    const { data: categories = [] } = useCategories()

    // Filter products that have discounts AND images for "Hot Deals"
    const hotDeals = useMemo(() => {
        if (!hotDealsData?.items) return []
        // First try to get products with discounts and images
        const dealsWithImages = hotDealsData.items.filter(p =>
            p.originalPrice && p.originalPrice > p.price && hasValidImage(p)
        )
        if (dealsWithImages.length >= 4) return dealsWithImages.slice(0, 12)

        // Fallback: any products with images
        const productsWithImages = hotDealsData.items.filter(p => hasValidImage(p))
        return productsWithImages.slice(0, 12)
    }, [hotDealsData])

    // Filter to prefer products with images
    const newArrivals = useMemo(() => {
        if (!newArrivalsData?.items) return []
        const withImages = newArrivalsData.items.filter(p => hasValidImage(p))
        return withImages.length >= 4 ? withImages.slice(0, 12) : newArrivalsData.items.slice(0, 12)
    }, [newArrivalsData])

    // Popular/Most Viewed - prefer products with images
    const popular = useMemo(() => {
        if (!popularData?.items) return []
        const withImages = popularData.items.filter(p => hasValidImage(p))
        return withImages.length >= 4 ? withImages.slice(0, 12) : popularData.items.slice(0, 12)
    }, [popularData])

    // GPUs - prefer products with images
    const gpus = useMemo(() => {
        if (!gpuData?.items) return []
        const withImages = gpuData.items.filter(p => hasValidImage(p))
        return withImages.length >= 4 ? withImages : gpuData.items
    }, [gpuData])

    return (
        <div className="min-h-screen bg-dark-900 pt-20">
            <div className="container mx-auto px-4 py-6">

                {/* Quick Category Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                    {quickCategories.map((cat) => (
                        <Link
                            key={cat.name}
                            href={cat.href}
                            className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 border border-gray-800 rounded-lg text-sm text-gray-300 hover:text-teal-400 hover:border-teal-500/30 hover:bg-dark-700 transition-all whitespace-nowrap flex-shrink-0"
                        >
                            <cat.icon className="w-4 h-4 text-teal-500" />
                            {cat.name}
                        </Link>
                    ))}
                    <Link
                        href="/products"
                        className="flex items-center gap-2 px-4 py-2.5 bg-teal-500/10 border border-teal-500/30 rounded-lg text-sm text-teal-400 hover:bg-teal-500/20 transition-all whitespace-nowrap flex-shrink-0"
                    >
                        All Products
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>

            {/* Hero Section with Banner Carousel and Featured Deal */}
            <HeroSection />

            <div className="container mx-auto px-4">

                {/* Products on Sale Section */}
                <div className="mt-10">
                    <ProductCarousel
                        title="Products on Sale"
                        subtitle="Best prices right now"
                        products={hotDeals.length > 0 ? hotDeals : (hotDealsData?.items || []).slice(0, 8)}
                        viewAllLink="/deals"
                        isLoading={hotDealsLoading}
                        accentColor="orange"
                    />
                </div>

                {/* New Arrivals */}
                <ProductCarousel
                    title="New Arrivals"
                    subtitle="Fresh stock just landed"
                    products={newArrivals}
                    viewAllLink="/products?sortBy=newest"
                    isLoading={newArrivalsLoading}
                    accentColor="teal"
                />

                {/* Graphics Cards Section */}
                <ProductCarousel
                    title="Graphics Cards"
                    subtitle="RTX & RX Series"
                    products={gpus}
                    viewAllLink="/products?category=Graphics%20cards"
                    isLoading={gpuLoading}
                    accentColor="purple"
                />

                {/* Shop by Category - Grid */}
                <section className="py-10">
                    <h2 className="text-2xl font-bold text-white mb-6">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {quickCategories.map((cat) => (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                className="group flex flex-col items-center gap-3 p-4 bg-dark-800 border border-gray-800 rounded-xl hover:border-teal-500/30 hover:bg-dark-700 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                                    <cat.icon className="w-6 h-6 text-teal-400" />
                                </div>
                                <span className="text-xs text-gray-400 group-hover:text-white text-center transition-colors">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Most Popular Items */}
                <ProductCarousel
                    title="Most Popular Items"
                    subtitle="Top selling products"
                    products={popular}
                    viewAllLink="/products"
                    isLoading={popularLoading}
                    accentColor="blue"
                />

                {/* Info Banners */}
                <section className="py-10">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-dark-800 border border-gray-800 rounded-xl p-6 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Fast Delivery</h3>
                                <p className="text-sm text-gray-400">Nationwide shipping with tracking</p>
                            </div>
                        </div>
                        <div className="bg-dark-800 border border-gray-800 rounded-xl p-6 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Warranty Covered</h3>
                                <p className="text-sm text-gray-400">All products include manufacturer warranty</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="py-10">
                    <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 rounded-2xl p-8 md:p-12">
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                Stay Updated
                            </h2>
                            <p className="text-white/80 mb-6">
                                Get notified about new products, stock updates, and exclusive deals.
                            </p>
                            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}
