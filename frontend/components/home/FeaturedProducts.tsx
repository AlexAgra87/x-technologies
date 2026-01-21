'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Eye, Sparkles, ArrowRight, Package } from 'lucide-react'
import { formatPrice, calculateDiscount, getStockStatus } from '@/lib/utils'
import { useProducts } from '@/lib/api'
import { Product } from '@/lib/types'
import { ProductImage } from '@/components/ui/ProductImage'

function ProductCard({ product, index }: { product: Product; index: number }) {
    const discount = product.originalPrice
        ? calculateDiscount(product.originalPrice, product.price)
        : 0
    const stockQuantity = product.stock?.quantity ?? product.stock?.total ?? 0
    const stockInfo = getStockStatus(stockQuantity)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group"
        >
            <div className="card overflow-hidden">
                <div className="relative aspect-square bg-dark-300 overflow-hidden">
                    <ProductImage
                        src={product.images?.[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {discount > 0 && (
                            <span className="badge-error">-{discount}%</span>
                        )}
                        {stockInfo.status === 'in-stock' && (
                            <span className="badge bg-success/20 text-success text-xs">
                                In Stock
                            </span>
                        )}
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-9 h-9 rounded-lg bg-dark-500/80 backdrop-blur flex items-center justify-center text-text-secondary hover:text-error hover:bg-dark-400 transition-colors">
                            <Heart className="w-4 h-4" />
                        </button>
                        <button className="w-9 h-9 rounded-lg bg-dark-500/80 backdrop-blur flex items-center justify-center text-text-secondary hover:text-white hover:bg-dark-400 transition-colors">
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <button
                            className={`w-full btn text-sm py-2.5 ${stockInfo.status === 'out-of-stock'
                                ? 'bg-dark-300 text-text-muted cursor-not-allowed'
                                : 'btn-primary'
                                }`}
                            disabled={stockInfo.status === 'out-of-stock'}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {stockInfo.status === 'out-of-stock' ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-primary-400 font-medium truncate">
                            {product.categories?.[0] || 'Uncategorized'}
                        </span>
                        <span className="text-xs text-text-muted truncate ml-2">{product.brand}</span>
                    </div>

                    <Link href={`/products/${encodeURIComponent(product.sku)}`}>
                        <h3 className="font-medium text-white line-clamp-2 hover:text-primary-400 transition-colors cursor-pointer min-h-[2.5rem]">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex items-end justify-between pt-2 border-t border-white/5">
                        <div>
                            <p className="text-lg font-bold text-white">{formatPrice(product.price)}</p>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <p className="text-sm text-text-muted line-through">
                                    {formatPrice(product.originalPrice)}
                                </p>
                            )}
                        </div>
                        <span
                            className={`stock-indicator ${stockInfo.status === 'in-stock'
                                ? 'stock-in text-success'
                                : stockInfo.status === 'low-stock'
                                    ? 'stock-low text-warning'
                                    : 'stock-out text-error'
                                }`}
                        >
                            {stockInfo.label}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function ProductSkeleton() {
    return (
        <div className="card overflow-hidden animate-pulse">
            <div className="aspect-square bg-dark-300" />
            <div className="p-4 space-y-3">
                <div className="flex justify-between">
                    <div className="h-3 bg-dark-300 rounded w-20" />
                    <div className="h-3 bg-dark-300 rounded w-16" />
                </div>
                <div className="h-4 bg-dark-300 rounded w-full" />
                <div className="h-4 bg-dark-300 rounded w-3/4" />
                <div className="pt-2 border-t border-white/5">
                    <div className="h-5 bg-dark-300 rounded w-24" />
                </div>
            </div>
        </div>
    )
}

export function FeaturedProducts() {
    const { data, isLoading, error } = useProducts({ limit: 8, sortBy: 'newest' })
    const products = data?.items || []

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.05),transparent_50%)]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm mb-6"
                        >
                            <Sparkles className="w-4 h-4" />
                            Featured Collection
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold mb-4"
                        >
                            <span className="text-white">Latest </span>
                            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Products</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 text-lg"
                        >
                            Handpicked selection of our newest arrivals
                        </motion.p>
                    </div>
                    <Link
                        href="/products"
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-400 transition-all duration-300"
                    >
                        View All Products
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="product-grid">
                    {isLoading ? (
                        <>
                            {[...Array(8)].map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </>
                    ) : error ? (
                        <div className="col-span-full text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                                <Package className="w-8 h-8 text-red-400" />
                            </div>
                            <p className="text-gray-400">Unable to load products. Please try again later.</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-4">
                                <Package className="w-8 h-8 text-teal-400" />
                            </div>
                            <p className="text-gray-400">No products available yet.</p>
                        </div>
                    ) : (
                        products.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}
