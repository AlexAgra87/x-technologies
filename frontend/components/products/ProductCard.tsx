'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    ShoppingCartIcon,
    HeartIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Product } from '@/lib/types'
import { formatPrice, calculateDiscount, getStockStatus, cn } from '@/lib/utils'
import { ProductImage } from '@/components/ui/ProductImage'

interface ProductCardProps {
    product: Product
    variant?: 'default' | 'compact' | 'horizontal'
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false)

    const discount = product.originalPrice
        ? calculateDiscount(product.originalPrice, product.price)
        : 0

    // Handle both stock.quantity and stock.total (from API normalization)
    const stockQuantity = product.stock?.quantity ?? product.stock?.total ?? 0
    const stockInfo = getStockStatus(stockQuantity)

    const StockBadge = () => {
        const configs = {
            'in-stock': { icon: CheckCircleIcon, class: 'badge-success', text: 'In Stock' },
            'low-stock': { icon: ClockIcon, class: 'badge-warning', text: `Only ${stockQuantity} left` },
            'out-of-stock': { icon: XCircleIcon, class: 'badge-danger', text: 'Out of Stock' },
        }
        const config = configs[stockInfo.status]
        const Icon = config.icon

        return (
            <span className={cn('badge flex items-center gap-1', config.class)}>
                <Icon className="h-3 w-3" />
                {config.text}
            </span>
        )
    }

    if (variant === 'horizontal') {
        return (
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="card p-4 flex gap-4"
            >
                <Link href={`/products/${product.sku}`} className="shrink-0">
                    <div className="relative w-32 h-32 bg-white rounded-lg overflow-hidden">
                        <ProductImage
                            src={product.images?.[0]}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                        />
                    </div>
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-xs text-primary-400 font-medium mb-1">{product.brand}</p>
                            <Link href={`/products/${product.sku}`}>
                                <h3 className="font-semibold text-white hover:text-primary-400 transition-colors line-clamp-2">
                                    {product.name}
                                </h3>
                            </Link>
                            <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                        </div>
                        <button
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className="p-2 hover:bg-dark-700 rounded-lg transition-colors shrink-0"
                        >
                            {isWishlisted ? (
                                <HeartSolidIcon className="h-5 w-5 text-red-500" />
                            ) : (
                                <HeartIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <StockBadge />
                        <span className="badge badge-info">{product.supplier}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-primary-400">
                                {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                </span>
                            )}
                        </div>
                        <button
                            disabled={product.stock.status === 'out_of_stock'}
                            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="card group overflow-hidden"
        >
            {/* Image Section */}
            <Link href={`/products/${product.sku}`}>
                <div className="relative aspect-square bg-white overflow-hidden">
                    <ProductImage
                        src={product.images?.[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{discount}%
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                setIsWishlisted(!isWishlisted)
                            }}
                            className="p-2 bg-dark-900/80 backdrop-blur rounded-lg hover:bg-primary-500 transition-colors"
                        >
                            {isWishlisted ? (
                                <HeartSolidIcon className="h-5 w-5 text-red-500" />
                            ) : (
                                <HeartIcon className="h-5 w-5 text-white" />
                            )}
                        </button>
                        <button className="p-2 bg-dark-900/80 backdrop-blur rounded-lg hover:bg-primary-500 transition-colors">
                            <EyeIcon className="h-5 w-5 text-white" />
                        </button>
                    </div>
                </div>
            </Link>

            {/* Content Section */}
            <div className="p-4">
                <p className="text-xs text-primary-400 font-medium mb-1">{product.brand}</p>
                <Link href={`/products/${product.sku}`}>
                    <h3 className="font-medium text-white hover:text-primary-400 transition-colors line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-2 mb-3">
                    <StockBadge />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-primary-400">
                            {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                            <span className="text-xs text-gray-500 line-through ml-2">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    disabled={product.stock.status === 'out_of_stock'}
                    className="w-full mt-3 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingCartIcon className="h-4 w-4 mr-2" />
                    Add to Cart
                </button>
            </div>
        </motion.div>
    )
}
