'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Package,
    User,
    Mail,
    Phone,
    MapPin,
    Building,
    FileText,
    Check,
    Loader2
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { siteSettings } from '@/lib/site-settings'
import { useAuth } from '@/lib/auth-context'
import { formatPrice } from '@/lib/utils'
import { OrderItem } from '@/lib/types/user'

interface ShippingDetails {
    firstName: string
    lastName: string
    email: string
    phone: string
    company: string
    address: string
    apartment: string
    city: string
    province: string
    postalCode: string
    notes: string
}

const provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
]

export default function CheckoutPage() {
    const router = useRouter()
    const { items, itemCount, subtotal, clearCart } = useCart()
    const { user, isAuthenticated, createOrder } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Partial<ShippingDetails>>({})

    const [formData, setFormData] = useState<ShippingDetails>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        apartment: '',
        city: '',
        province: '',
        postalCode: '',
        notes: ''
    })

    // Pre-fill form with user's default address if logged in
    useEffect(() => {
        if (user) {
            const defaultAddress = user.addresses?.find(a => a.isDefault)
            setFormData(prev => ({
                ...prev,
                firstName: defaultAddress?.firstName || user.firstName || prev.firstName,
                lastName: defaultAddress?.lastName || user.lastName || prev.lastName,
                email: user.email || prev.email,
                phone: defaultAddress?.phone || user.phone || prev.phone,
                address: defaultAddress?.address || prev.address,
                city: defaultAddress?.city || prev.city,
                province: defaultAddress?.province || prev.province,
                postalCode: defaultAddress?.postalCode || prev.postalCode,
            }))
        }
    }, [user])

    // Shipping cost calculation - using site settings
    const shippingCost = subtotal >= siteSettings.shipping.freeShippingThreshold ? 0 : siteSettings.shipping.standardRate
    const total = subtotal + shippingCost

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (errors[name as keyof ShippingDetails]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<ShippingDetails> = {}

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
        if (!formData.address.trim()) newErrors.address = 'Address is required'
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.province) newErrors.province = 'Province is required'
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // Convert cart items to order items
            const orderItems: OrderItem[] = items.map(item => ({
                productId: item.product.id,
                sku: item.product.sku,
                name: item.product.name,
                brand: item.product.brand,
                price: item.product.price,
                quantity: item.quantity,
                image: item.product.images?.[0],
            }))

            // Create order using auth context (saves to localStorage)
            const order = await createOrder({
                items: orderItems,
                subtotal,
                shippingCost,
                total,
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.apartment
                        ? `${formData.address}, ${formData.apartment}`
                        : formData.address,
                    city: formData.city,
                    province: formData.province,
                    postalCode: formData.postalCode,
                }
            })

            // Store order data in sessionStorage for the confirmation page
            const orderData = {
                orderRef: order.orderRef,
                items,
                subtotal,
                shippingCost,
                total,
                shipping: formData,
                createdAt: order.createdAt
            }

            sessionStorage.setItem('xtech-order', JSON.stringify(orderData))

            // Send order confirmation email
            try {
                const emailOrderData = {
                    orderId: order.orderRef,
                    items: orderItems.map(item => ({
                        name: item.name,
                        sku: item.sku,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    subtotal,
                    shipping: shippingCost,
                    vat: subtotal * 0.15,
                    total,
                    customer: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        email: formData.email,
                        phone: formData.phone,
                    },
                    shippingAddress: {
                        street: formData.apartment
                            ? `${formData.address}, ${formData.apartment}`
                            : formData.address,
                        city: formData.city,
                        province: formData.province,
                        postalCode: formData.postalCode,
                    },
                    paymentMethod: 'eft' as const,
                }

                await fetch('/api/orders/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        order: emailOrderData,
                        type: 'confirmation',
                    }),
                })
            } catch (emailError) {
                // Don't block order completion if email fails
                console.error('Failed to send order confirmation email:', emailError)
            }

            // Clear cart and redirect to confirmation
            clearCart()
            router.push('/order-confirmation')
        } catch (error) {
            console.error('Error creating order:', error)
            setSubmitError('Failed to create order. Please try again or contact support if the problem persists.')
            setIsSubmitting(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-dark-900 pt-24">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Your cart is empty</h1>
                    <Link href="/products" className="text-teal-400 hover:text-teal-300">
                        Continue shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Cart
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Checkout</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Shipping Details Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-dark-800 rounded-xl border border-gray-800 p-6"
                            >
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-teal-400" />
                                    Contact Information
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-dark-700 border ${errors.firstName ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors`}
                                            placeholder="John"
                                        />
                                        {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-dark-700 border ${errors.lastName ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors`}
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            <Mail className="w-4 h-4 inline mr-1" />
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-dark-700 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors`}
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            <Phone className="w-4 h-4 inline mr-1" />
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-dark-700 border ${errors.phone ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors`}
                                            placeholder="072 123 4567"
                                        />
                                        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            <Building className="w-4 h-4 inline mr-1" />
                                            Company (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                                            placeholder="Company name"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Shipping Address */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-dark-800 rounded-xl border border-gray-800 p-6"
                            >
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-teal-400" />
                                    Shipping Address
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-dark-700 border ${errors.address ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors`}
                                            placeholder="123 Main Street"
                                        />
                                        {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Apartment, Suite, etc. (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="apartment"
                                            value={formData.apartment}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                                            placeholder="Apt 4B"
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-dark-700 border ${errors.city ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors`}
                                                placeholder="Johannesburg"
                                            />
                                            {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Province *
                                            </label>
                                            <select
                                                name="province"
                                                value={formData.province}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-dark-700 border ${errors.province ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors`}
                                            >
                                                <option value="">Select province</option>
                                                {provinces.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                            {errors.province && <p className="text-red-400 text-sm mt-1">{errors.province}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Postal Code *
                                            </label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-dark-700 border ${errors.postalCode ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors`}
                                                placeholder="2000"
                                            />
                                            {errors.postalCode && <p className="text-red-400 text-sm mt-1">{errors.postalCode}</p>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Order Notes */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-dark-800 rounded-xl border border-gray-800 p-6"
                            >
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-teal-400" />
                                    Order Notes (Optional)
                                </h2>

                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors resize-none"
                                    placeholder="Any special instructions for your order..."
                                />
                            </motion.div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-dark-800 rounded-xl border border-gray-800 p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                                {/* Items */}
                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                    {items.map(item => (
                                        <div key={item.product.sku} className="flex gap-3">
                                            <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                                {item.product.images?.[0] ? (
                                                    <Image
                                                        src={item.product.images[0]}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <Package className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white line-clamp-2">{item.product.name}</p>
                                                <p className="text-sm text-teal-400 font-medium">
                                                    {formatPrice(item.product.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-700 pt-4 space-y-3">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="text-white">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Shipping</span>
                                        <span className="text-white">
                                            {shippingCost === 0 ? (
                                                <span className="text-green-400">FREE</span>
                                            ) : (
                                                formatPrice(shippingCost)
                                            )}
                                        </span>
                                    </div>
                                    {subtotal < 2000 && (
                                        <p className="text-xs text-gray-500">
                                            Spend {formatPrice(2000 - subtotal)} more for free shipping!
                                        </p>
                                    )}
                                    <div className="border-t border-gray-700 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-semibold text-white">Total</span>
                                            <span className="text-2xl font-bold text-teal-400">{formatPrice(total)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">VAT included</p>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {submitError && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                        <p className="text-sm text-red-400 flex items-center gap-2">
                                            <span className="text-red-500">⚠</span>
                                            {submitError}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-teal-500 text-black font-semibold rounded-lg hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Place Order
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    By placing your order, you will receive an email with banking details for EFT payment.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
