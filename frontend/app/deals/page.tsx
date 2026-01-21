'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Tag, ArrowRight, Percent, Flame, Filter, X } from 'lucide-react'
import { useDeals } from '@/lib/api'
import { WootwareCard } from '@/components/products/WootwareCard'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

const dealCategories = [
    { value: '', label: 'All Deals' },
    { value: 'graphics', label: 'Graphics Cards' },
    { value: 'processor', label: 'Processors' },
    { value: 'memory', label: 'Memory' },
    { value: 'storage', label: 'Storage' },
    { value: 'power', label: 'Power & Chargers' },
    { value: 'peripherals', label: 'Peripherals' },
]

export default function DealsPage() {
    const [selectedCategory, setSelectedCategory] = useState('')
    const { data: deals = [], isLoading, error } = useDeals(60, selectedCategory || undefined)

    // Get top deal (highest discount %)
    const topDeal = deals[0]

    return (
        <div className="min-h-screen bg-dark-900 pt-28">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-600/20 via-dark-800 to-orange-600/20 border-b border-gray-800">
                <div className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                            <Flame className="w-5 h-5 text-red-400" />
                            <span className="text-red-300 font-medium">Hot Deals</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Special <span className="text-gradient">Offers</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto mb-6">
                            Save big on premium computer components. Products sorted by biggest discounts first!
                        </p>
                        {!isLoading && deals.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                                <div className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 rounded-lg">
                                    <Tag className="w-4 h-4 text-teal-400" />
                                    <span className="text-gray-300">{deals.length} Deals Available</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-lg">
                                    <Percent className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400">Up to {topDeal?.discount || 0}% OFF</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Top Deal Banner */}
                {topDeal && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden border border-red-500/20"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">-{topDeal.discount}%</span>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="text-red-400 text-sm font-medium mb-1">🔥 Best Deal Today</div>
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                                    {topDeal.name}
                                </h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className="text-2xl font-bold text-teal-400">{formatPrice(topDeal.price)}</span>
                                    {topDeal.originalPrice && (
                                        <span className="text-lg text-gray-500 line-through">{formatPrice(topDeal.originalPrice)}</span>
                                    )}
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded font-medium">
                                        Save {formatPrice(topDeal.originalPrice! - topDeal.price)}
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={`/products/${encodeURIComponent(topDeal.sku)}`}
                                className="btn-primary whitespace-nowrap"
                            >
                                View Deal
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* Category Filter */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-teal-400" />
                        <span className="text-white font-medium">Filter by Category</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {dealCategories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    selectedCategory === cat.value
                                        ? "bg-teal-500 text-black"
                                        : "bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700 border border-gray-700"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory('')}
                                className="px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Deals Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Percent className="w-6 h-6 text-red-400" />
                        {selectedCategory ? `${dealCategories.find(c => c.value === selectedCategory)?.label} Deals` : 'All Deals'}
                    </h2>
                    <span className="text-gray-400 text-sm">
                        Sorted by biggest discount
                    </span>
                </div>

                {/* Deals Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="card animate-pulse">
                                <div className="aspect-square bg-dark-700 rounded-lg" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-dark-700 rounded w-3/4" />
                                    <div className="h-4 bg-dark-700 rounded w-1/2" />
                                    <div className="h-6 bg-dark-700 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-400 mb-4">Failed to load deals</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                ) : deals.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {deals.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <WootwareCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                            <Tag className="w-10 h-10 text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-lg mb-2">No deals found</p>
                        <p className="text-gray-500 mb-6">
                            {selectedCategory
                                ? 'Try selecting a different category'
                                : 'Check back later for new deals!'
                            }
                        </p>
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory('')}
                                className="btn-primary"
                            >
                                View All Deals
                            </button>
                        )}
                    </div>
                )}

                {/* Browse All CTA */}
                {deals.length > 0 && (
                    <div className="mt-12 text-center">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium"
                        >
                            Browse All Products
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
