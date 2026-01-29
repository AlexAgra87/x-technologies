'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import DOMPurify from 'dompurify'
import {
    ShoppingCartIcon,
    HeartIcon,
    ShareIcon,
    TruckIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    MinusIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    MapPinIcon,
    CheckIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useProduct, useProducts } from '@/lib/api'
import { formatPrice, getStockStatus, cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { ProductImage } from '@/components/ui/ProductImage'
import { Product } from '@/lib/types'

// Simple clean Product Description - just paragraphs, no lists/specs
function ProductDescription({ description }: { description?: string }) {
    if (!description) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">No description available for this product.</p>
            </div>
        )
    }

    // Extract just the paragraph text, skip lists and specs
    const extractParagraphs = (html: string): string[] => {
        if (typeof document === 'undefined') {
            // Server-side: strip HTML tags and return
            return [html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()]
        }

        // Sanitize HTML to prevent XSS attacks
        const cleanHtml = DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'em', 'strong', 'b', 'i', 'br'],
            ALLOWED_ATTR: []
        })

        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = cleanHtml

        const paragraphs: string[] = []

        // Get all text content from paragraphs, skip lists and spec sections
        tempDiv.querySelectorAll('p, h2 > em, h3 > em').forEach((el) => {
            const text = el.textContent?.trim()
            // Skip if it's inside a features/specs section or too short
            if (text && text.length > 50) {
                // Skip if it mentions specs/features/what's in the box
                const lowerText = text.toLowerCase()
                if (!lowerText.includes('specifications') &&
                    !lowerText.includes('features:') &&
                    !lowerText.includes("what's in the box")) {
                    paragraphs.push(text)
                }
            }
        })

        // Get intro text (usually in h2 em or first meaningful paragraph)
        if (paragraphs.length === 0) {
            // Fallback: get all p tags
            tempDiv.querySelectorAll('p').forEach((p) => {
                const text = p.textContent?.trim()
                if (text && text.length > 30) {
                    paragraphs.push(text)
                }
            })
        }

        // Limit to first 4 paragraphs for clean look
        return paragraphs.slice(0, 4)
    }

    const paragraphs = extractParagraphs(description)

    if (paragraphs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">No description available for this product.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {paragraphs.map((text, idx) => (
                <p
                    key={idx}
                    className={cn(
                        "text-gray-300 leading-relaxed",
                        idx === 0 ? "text-lg" : "text-base"
                    )}
                >
                    {text}
                </p>
            ))}
        </div>
    )
}

export default function ProductPage() {
    const params = useParams()
    const sku = params.sku as string

    const { data: product, isLoading, error } = useProduct(sku)
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description')
    const [addedToCart, setAddedToCart] = useState(false)
    const { addItem, isInCart } = useCart()
    const { isInWishlist, toggleItem } = useWishlist()

    const isWishlisted = product ? isInWishlist(product.sku) : false

    const handleToggleWishlist = () => {
        if (!product) return
        toggleItem(product)
    }

    // Fetch related products
    const { data: relatedData } = useProducts({
        category: product?.categories?.[0],
        limit: 5  // Request 5 since we'll filter out current product
    })
    const relatedProducts = (relatedData as any)?.products?.filter((p: any) => p.sku !== sku)?.slice(0, 4) || []

    const handleAddToCart = () => {
        if (product) {
            addItem(product, quantity)
            setAddedToCart(true)
            setTimeout(() => setAddedToCart(false), 2000)
        }
    }

    const inCart = product ? isInCart(product.sku) : false

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-900 pt-24">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse grid lg:grid-cols-2 gap-8">
                        <div className="aspect-square bg-dark-800 rounded-lg" />
                        <div className="space-y-4">
                            <div className="h-4 bg-dark-800 rounded w-1/4" />
                            <div className="h-8 bg-dark-800 rounded w-3/4" />
                            <div className="h-4 bg-dark-800 rounded w-1/2" />
                            <div className="h-12 bg-dark-800 rounded w-1/3" />
                            <div className="h-32 bg-dark-800 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-24 h-24 rounded-full bg-dark-800 border-2 border-gray-700 flex items-center justify-center mx-auto mb-6">
                        <XCircleIcon className="w-12 h-12 text-gray-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">Product Not Found</h1>
                    <p className="text-gray-400 mb-8">
                        The product you're looking for doesn't exist or may have been removed from our catalog.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/products" className="btn-primary">
                            Browse Products
                        </Link>
                        <Link
                            href="/deals"
                            className="px-6 py-2.5 bg-dark-800 border border-gray-700 text-white font-medium rounded-lg hover:bg-dark-700 transition-colors text-center"
                        >
                            View Deals
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
    }

    const stockQuantity = product.stock?.quantity ?? product.stock?.total ?? 0
    const stockInfo = getStockStatus(stockQuantity)
    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0

    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            {/* Breadcrumb */}
            <div className="bg-dark-800 border-b border-gray-800">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-gray-400 hover:text-white">Home</Link>
                        <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                        <Link href="/products" className="text-gray-400 hover:text-white">Products</Link>
                        {product.categories[0] && (
                            <>
                                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                                <Link
                                    href={`/products?category=${encodeURIComponent(product.categories[0])}`}
                                    className="text-gray-400 hover:text-white"
                                >
                                    {product.categories[0]}
                                </Link>
                            </>
                        )}
                        <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-primary-400 truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <motion.div
                            className="relative aspect-square bg-white rounded-lg overflow-hidden"
                            layoutId={`product-image-${product.id}`}
                        >
                            <ProductImage
                                src={product.images?.[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-contain p-8"
                                priority
                            />
                            {discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                                    -{discount}% OFF
                                </div>
                            )}
                        </motion.div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {product.images.map((image, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={cn(
                                            'shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden border-2 transition-colors relative',
                                            selectedImage === i ? 'border-primary-500' : 'border-transparent hover:border-gray-600'
                                        )}
                                    >
                                        <ProductImage
                                            src={image}
                                            alt={`${product.name} - Image ${i + 1}`}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Brand & Title */}
                        <div>
                            <Link
                                href={`/products?brand=${encodeURIComponent(product.brand)}`}
                                className="text-primary-400 font-medium hover:underline"
                            >
                                {product.brand}
                            </Link>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1">
                                {product.name}
                            </h1>
                            <p className="text-gray-500 mt-1">SKU: {product.sku}</p>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-3">
                            {stockInfo.status === 'in-stock' && (
                                <span className="badge badge-success flex items-center gap-1">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    In Stock
                                </span>
                            )}
                            {stockInfo.status === 'low-stock' && (
                                <span className="badge badge-warning flex items-center gap-1">
                                    <ClockIcon className="h-4 w-4" />
                                    Limited Stock
                                </span>
                            )}
                            {stockInfo.status === 'out-of-stock' && (
                                <span className="badge badge-danger flex items-center gap-1">
                                    <XCircleIcon className="h-4 w-4" />
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-4">
                            <span className="text-3xl lg:text-4xl font-bold text-primary-400">
                                {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                                <span className="text-xl text-gray-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                </span>
                            )}
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center border border-gray-700 rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 hover:bg-dark-700 transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <MinusIcon className="h-5 w-5 text-white" />
                                </button>
                                <span className="w-12 text-center text-white font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                                    className="p-3 hover:bg-dark-700 transition-colors"
                                    disabled={quantity >= stockQuantity}
                                >
                                    <PlusIcon className="h-5 w-5 text-white" />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={stockInfo.status === 'out-of-stock'}
                                className={cn(
                                    "flex-1 btn text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                                    addedToCart || inCart ? "btn-success" : "btn-primary"
                                )}
                            >
                                {addedToCart ? (
                                    <>
                                        <CheckIcon className="h-5 w-5" />
                                        Added to Cart!
                                    </>
                                ) : inCart ? (
                                    <>
                                        <CheckCircleIcon className="h-5 w-5" />
                                        In Cart - Add More
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCartIcon className="h-5 w-5" />
                                        Add to Cart
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleToggleWishlist}
                                className="p-3 border border-gray-700 rounded-lg hover:bg-dark-700 transition-colors"
                            >
                                {isWishlisted ? (
                                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                                ) : (
                                    <HeartIcon className="h-6 w-6 text-white" />
                                )}
                            </button>

                            <button
                                onClick={async () => {
                                    const shareData = {
                                        title: product.name,
                                        text: `Check out ${product.name} at X-Tech!`,
                                        url: window.location.href
                                    }
                                    if (navigator.share) {
                                        try {
                                            await navigator.share(shareData)
                                        } catch (err) {
                                            // User cancelled or error
                                        }
                                    } else {
                                        // Fallback: copy link to clipboard
                                        navigator.clipboard.writeText(window.location.href)
                                        alert('Link copied to clipboard!')
                                    }
                                }}
                                className="p-3 border border-gray-700 rounded-lg hover:bg-dark-700 transition-colors"
                                aria-label="Share this product"
                            >
                                <ShareIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                            <div className="flex items-center gap-3 text-gray-400">
                                <TruckIcon className="h-6 w-6 text-primary-400" />
                                <span className="text-sm">Free Shipping over R1000</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <ShieldCheckIcon className="h-6 w-6 text-primary-400" />
                                <span className="text-sm">1 Year Warranty</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <ArrowPathIcon className="h-6 w-6 text-primary-400" />
                                <span className="text-sm">Easy Returns</span>
                            </div>
                        </div>

                        {/* Categories */}
                        {product.categories.length > 0 && (
                            <div className="pt-4 border-t border-gray-800">
                                <p className="text-sm text-gray-500 mb-2">Categories:</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.categories.map((cat) => (
                                        <Link
                                            key={cat}
                                            href={`/products?category=${encodeURIComponent(cat)}`}
                                            className="px-3 py-1 bg-dark-700 text-gray-300 text-sm rounded-full hover:bg-primary-500 hover:text-white transition-colors"
                                        >
                                            {cat}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-12">
                    <div className="border-b border-gray-800">
                        <div className="flex gap-8">
                            {(['description', 'specs'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        'pb-4 text-lg font-medium transition-colors relative',
                                        activeTab === tab ? 'text-primary-400' : 'text-gray-400 hover:text-white'
                                    )}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="tab-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="py-8">
                        {activeTab === 'description' && (
                            <ProductDescription description={product.description} />
                        )}

                        {activeTab === 'specs' && (
                            <div className="space-y-8">
                                {/* Product Attributes */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {product.attributes && Object.entries(product.attributes).length > 0 ? (
                                            Object.entries(product.attributes).map(([key, value]) => (
                                                <div key={key} className="flex justify-between py-3 border-b border-gray-800">
                                                    <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span className="text-white font-medium">{String(value)}</span>
                                                </div>
                                            ))
                                        ) : product.specifications ? (
                                            Object.entries(product.specifications).map(([key, value]) => (
                                                <div key={key} className="flex justify-between py-3 border-b border-gray-800">
                                                    <span className="text-gray-400">{key}</span>
                                                    <span className="text-white font-medium">{value}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400">No specifications available.</p>
                                        )}
                                        {product.warranty && (
                                            <div className="flex justify-between py-3 border-b border-gray-800">
                                                <span className="text-gray-400">Warranty</span>
                                                <span className="text-white font-medium">{product.warranty}</span>
                                            </div>
                                        )}
                                        {product.weight && (
                                            <div className="flex justify-between py-3 border-b border-gray-800">
                                                <span className="text-gray-400">Weight</span>
                                                <span className="text-white font-medium">{product.weight} kg</span>
                                            </div>
                                        )}
                                        {product.barcode && (
                                            <div className="flex justify-between py-3 border-b border-gray-800">
                                                <span className="text-gray-400">Barcode</span>
                                                <span className="text-white font-medium">{product.barcode}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 pb-12">
                        <h2 className="text-2xl font-bold text-white mb-8">Related Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedProducts.map((relatedProduct: any) => (
                                <Link
                                    key={relatedProduct.sku}
                                    href={`/products/${encodeURIComponent(relatedProduct.sku)}`}
                                    className="group bg-dark-800 rounded-lg border border-gray-800 hover:border-teal-500/30 transition-all overflow-hidden"
                                >
                                    <div className="relative aspect-square bg-white overflow-hidden">
                                        <ProductImage
                                            src={relatedProduct.images?.[0]}
                                            alt={relatedProduct.name}
                                            fill
                                            className="object-contain p-4 group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-teal-400 mb-1">{relatedProduct.brand}</p>
                                        <h3 className="text-sm text-white font-medium line-clamp-2 group-hover:text-teal-400 transition-colors">
                                            {relatedProduct.name}
                                        </h3>
                                        <p className="text-lg font-bold text-teal-400 mt-2">
                                            {formatPrice(relatedProduct.price)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
