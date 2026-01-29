'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Search,
    Package,
    Truck,
    Clock,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    ArrowLeft,
    Mail,
    Hash,
    CreditCard,
    ShoppingBag
} from 'lucide-react'
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types/user'
import { formatPrice } from '@/lib/utils'

export default function TrackOrderPage() {
    const [orderRef, setOrderRef] = useState('')
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [order, setOrder] = useState<Order | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await fetch(`/api/orders/track?orderRef=${encodeURIComponent(orderRef)}&email=${encodeURIComponent(email)}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Order not found')
            }

            setOrder(data.order)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to find order')
            setOrder(null)
        } finally {
            setIsLoading(false)
        }
    }

    const resetSearch = () => {
        setOrder(null)
        setOrderRef('')
        setEmail('')
        setError('')
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Store
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
                    <p className="text-gray-400">Enter your order reference and email to view your order status</p>
                </div>

                {!order ? (
                    /* Search Form */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0f0f15] border border-gray-800 rounded-2xl p-6"
                    >
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                                    <Hash className="w-4 h-4" />
                                    Order Reference
                                </label>
                                <input
                                    type="text"
                                    value={orderRef}
                                    onChange={(e) => setOrderRef(e.target.value.toUpperCase())}
                                    placeholder="e.g. XT-ABC123-XYZ"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="The email used when placing the order"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 text-black font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Track Order
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                            <p className="text-gray-500 text-sm">
                                Have an account?{' '}
                                <Link href="/account" className="text-teal-400 hover:text-teal-300">
                                    Sign in to view all orders
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    /* Order Details */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Order Header */}
                        <div className="bg-[#0f0f15] border border-gray-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Order Reference</p>
                                    <h2 className="text-xl font-bold text-white">{order.orderRef}</h2>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                                    {ORDER_STATUS_LABELS[order.status]}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        {/* Tracking Info */}
                        {(order.courierName || order.trackingNumber) && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-purple-400" />
                                    Shipping Information
                                </h3>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-purple-400 text-xs">Courier</p>
                                        <p className="text-white font-medium">{order.courierName}</p>
                                    </div>
                                    {order.trackingNumber && (
                                        <div className="text-right">
                                            <p className="text-purple-400 text-xs">Tracking Number</p>
                                            <p className="text-white font-mono">{order.trackingNumber}</p>
                                        </div>
                                    )}
                                </div>
                                {order.trackingUrl && (
                                    <a
                                        href={order.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors font-medium"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Track My Parcel
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-[#0f0f15] border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-teal-400" />
                                Order Timeline
                            </h3>
                            <div className="relative pl-8 space-y-6">
                                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-700" />

                                {/* Order Placed */}
                                <div className="relative flex items-start gap-4">
                                    <div className="absolute -left-8 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                                        <Package className="w-3 h-3 text-black" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Order Placed</p>
                                        <p className="text-gray-500 text-sm">
                                            {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="relative flex items-start gap-4">
                                    <div className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center ${order.paidAt ? 'bg-teal-500' : 'bg-gray-600'}`}>
                                        <CreditCard className={`w-3 h-3 ${order.paidAt ? 'text-black' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${order.paidAt ? 'text-white' : 'text-gray-500'}`}>Payment Received</p>
                                        {order.paidAt ? (
                                            <p className="text-gray-500 text-sm">
                                                {new Date(order.paidAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        ) : (
                                            <p className="text-gray-600 text-sm">Awaiting payment confirmation</p>
                                        )}
                                    </div>
                                </div>

                                {/* Ordered from Supplier */}
                                <div className="relative flex items-start gap-4">
                                    <div className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center ${order.orderedAt ? 'bg-teal-500' : 'bg-gray-600'}`}>
                                        <ShoppingBag className={`w-3 h-3 ${order.orderedAt ? 'text-black' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${order.orderedAt ? 'text-white' : 'text-gray-500'}`}>Order Dispatched</p>
                                        {order.orderedAt ? (
                                            <p className="text-gray-500 text-sm">
                                                {new Date(order.orderedAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        ) : (
                                            <p className="text-gray-600 text-sm">Pending</p>
                                        )}
                                    </div>
                                </div>

                                {/* Shipped */}
                                <div className="relative flex items-start gap-4">
                                    <div className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center ${order.shippedAt ? 'bg-teal-500' : 'bg-gray-600'}`}>
                                        <Truck className={`w-3 h-3 ${order.shippedAt ? 'text-black' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${order.shippedAt ? 'text-white' : 'text-gray-500'}`}>Shipped</p>
                                        {order.shippedAt ? (
                                            <p className="text-gray-500 text-sm">
                                                {new Date(order.shippedAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                {order.courierName && <span className="text-purple-400"> via {order.courierName}</span>}
                                            </p>
                                        ) : (
                                            <p className="text-gray-600 text-sm">Pending</p>
                                        )}
                                    </div>
                                </div>

                                {/* Delivered */}
                                <div className="relative flex items-start gap-4">
                                    <div className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center ${order.deliveredAt ? 'bg-green-500' : 'bg-gray-600'}`}>
                                        <CheckCircle className={`w-3 h-3 ${order.deliveredAt ? 'text-black' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${order.deliveredAt ? 'text-white' : 'text-gray-500'}`}>Delivered</p>
                                        {order.deliveredAt ? (
                                            <p className="text-gray-500 text-sm">
                                                {new Date(order.deliveredAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        ) : (
                                            <p className="text-gray-600 text-sm">Pending</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-[#0f0f15] border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-teal-400" />
                                Order Items
                            </h3>
                            <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
                                        <div>
                                            <p className="text-white">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-white font-medium">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-800">
                                    <span>Total</span>
                                    <span className="text-teal-400">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={resetSearch}
                            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
                        >
                            Track Another Order
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
