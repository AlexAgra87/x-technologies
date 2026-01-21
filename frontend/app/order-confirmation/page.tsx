'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
    CheckCircle,
    Copy,
    Mail,
    Phone,
    Package,
    ArrowRight,
    Download,
    MessageCircle,
    Clock,
    CreditCard,
    AlertCircle,
    FileText
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { siteSettings, getWhatsAppLink, getEmailLink } from '@/lib/site-settings'
import { downloadInvoice } from '@/lib/pdf-invoice'
import { Order, OrderItem } from '@/lib/types/user'

interface OrderData {
    orderRef: string
    items: any[]
    subtotal: number
    shippingCost: number
    total: number
    shipping: {
        firstName: string
        lastName: string
        email: string
        phone: string
        address: string
        city: string
        province: string
        postalCode: string
    }
    createdAt: string
}

// Use centralized bank details
const bankDetails = siteSettings.banking

export default function OrderConfirmationPage() {
    const [order, setOrder] = useState<OrderData | null>(null)
    const [copied, setCopied] = useState<string | null>(null)

    useEffect(() => {
        const savedOrder = sessionStorage.getItem('xtech-order')
        if (savedOrder) {
            setOrder(JSON.parse(savedOrder))
        }
    }, [])

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopied(field)
        setTimeout(() => setCopied(null), 2000)
    }

    const handleDownloadInvoice = () => {
        if (!order) return

        // Convert order data to Order type for PDF generation
        const orderForPdf: Order = {
            id: order.orderRef,
            orderRef: order.orderRef,
            userId: 'guest',
            userEmail: order.shipping.email,
            items: order.items.map((item: any) => ({
                productId: item.product.id || item.product.sku,
                sku: item.product.sku,
                name: item.product.name,
                brand: item.product.brand || '',
                price: item.product.price,
                quantity: item.quantity,
                image: item.product.images?.[0],
            })),
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            total: order.total,
            status: 'pending_payment',
            shippingAddress: {
                firstName: order.shipping.firstName,
                lastName: order.shipping.lastName,
                email: order.shipping.email,
                phone: order.shipping.phone,
                address: order.shipping.address,
                city: order.shipping.city,
                province: order.shipping.province,
                postalCode: order.shipping.postalCode,
            },
            createdAt: order.createdAt,
            updatedAt: order.createdAt,
        }

        downloadInvoice(orderForPdf)
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-dark-900 pt-24">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">No order found</h1>
                    <p className="text-gray-400 mb-6">It seems you haven't placed an order yet.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-black font-semibold rounded-lg hover:bg-teal-400 transition-colors"
                    >
                        Start Shopping
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        )
    }

    const whatsappMessage = `Hi! I've just placed an order on X-Technologies.\n\nOrder Reference: ${order.orderRef}\nTotal: ${formatPrice(order.total)}\n\nI would like to confirm my order and send proof of payment.`

    const whatsappLink = getWhatsAppLink(whatsappMessage)
    const emailLink = getEmailLink(
        `Proof of Payment - ${order.orderRef}`,
        `Order Reference: ${order.orderRef}\n\nPlease find attached my proof of payment.`
    )

    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            <div className="container mx-auto px-4 py-8">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Order Placed Successfully!</h1>
                    <p className="text-gray-400">Thank you for your order, {order.shipping.firstName}!</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg">
                        <span className="text-gray-400">Order Reference:</span>
                        <span className="text-teal-400 font-mono font-bold text-lg">{order.orderRef}</span>
                        <button
                            onClick={() => copyToClipboard(order.orderRef, 'orderRef')}
                            className="p-1 hover:bg-dark-700 rounded transition-colors"
                        >
                            {copied === 'orderRef' ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                            )}
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Banking Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-dark-800 rounded-xl border border-gray-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Banking Details</h2>
                                <p className="text-sm text-gray-400">Make payment via EFT/Bank Transfer</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-700">
                                <span className="text-gray-400">Bank</span>
                                <span className="text-white font-medium">{bankDetails.bankName}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-700">
                                <span className="text-gray-400">Account Name</span>
                                <span className="text-white font-medium">{bankDetails.accountName}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-700">
                                <span className="text-gray-400">Account Number</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-mono font-medium">{bankDetails.accountNumber}</span>
                                    <button
                                        onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                                        className="p-1 hover:bg-dark-700 rounded transition-colors"
                                    >
                                        {copied === 'account' ? (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-700">
                                <span className="text-gray-400">Branch Code</span>
                                <span className="text-white font-mono font-medium">{bankDetails.branchCode}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-700">
                                <span className="text-gray-400">Account Type</span>
                                <span className="text-white font-medium">{bankDetails.accountType}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 bg-teal-500/10 rounded-lg px-4 -mx-4">
                                <span className="text-teal-400 font-medium">Reference (IMPORTANT)</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-teal-400 font-mono font-bold">{order.orderRef}</span>
                                    <button
                                        onClick={() => copyToClipboard(order.orderRef, 'reference')}
                                        className="p-1 hover:bg-teal-500/20 rounded transition-colors"
                                    >
                                        {copied === 'reference' ? (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-teal-400" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-3 border-t border-gray-700 mt-4">
                                <span className="text-lg font-semibold text-white">Amount to Pay</span>
                                <span className="text-2xl font-bold text-teal-400">{formatPrice(order.total)}</span>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-yellow-500 font-medium text-sm">Important</p>
                                    <p className="text-yellow-200/70 text-sm mt-1">
                                        Please use your order reference <strong>{order.orderRef}</strong> as payment reference.
                                        Your order will be processed once payment is confirmed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order Summary & Next Steps */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-dark-800 rounded-xl border border-gray-800 p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>

                            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                                {order.items.map((item: any) => (
                                    <div key={item.product.sku} className="flex gap-3">
                                        <div className="relative w-12 h-12 bg-white rounded overflow-hidden flex-shrink-0">
                                            {item.product.images?.[0] ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <Package className="w-4 h-4 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white line-clamp-1">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm text-teal-400 font-medium">
                                            {formatPrice(item.product.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-700 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Shipping</span>
                                    <span>{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-gray-700">
                                    <span>Total</span>
                                    <span className="text-teal-400">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Next Steps */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-dark-800 rounded-xl border border-gray-800 p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">What's Next?</h2>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-teal-400 font-bold text-sm">1</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Make Payment</p>
                                        <p className="text-sm text-gray-400">Transfer the amount using the banking details above</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-teal-400 font-bold text-sm">2</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Send Proof of Payment</p>
                                        <p className="text-sm text-gray-400">WhatsApp or email your POP with order reference</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-teal-400 font-bold text-sm">3</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Order Processing</p>
                                        <p className="text-sm text-gray-400">We'll confirm and process your order within 24 hours</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-teal-400 font-bold text-sm">4</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Delivery</p>
                                        <p className="text-sm text-gray-400">Track your order and receive your products</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#20BD5A] transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Send POP via WhatsApp
                                </a>
                                <a
                                    href={emailLink}
                                    className="flex items-center justify-center gap-2 py-3 bg-dark-700 text-white font-semibold rounded-lg hover:bg-dark-600 transition-colors border border-gray-700"
                                >
                                    <Mail className="w-5 h-5" />
                                    Email POP
                                </a>
                            </div>

                            {/* Download Invoice Button */}
                            <button
                                onClick={() => handleDownloadInvoice()}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold rounded-lg hover:from-teal-400 hover:to-cyan-400 transition-all"
                            >
                                <FileText className="w-5 h-5" />
                                Download Invoice PDF
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Continue Shopping */}
                <div className="text-center mt-12">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
                    >
                        Continue Shopping
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
