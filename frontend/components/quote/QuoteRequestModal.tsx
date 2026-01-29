'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Send, CheckCircle, AlertCircle, Cpu } from 'lucide-react'
import { useQuote } from '@/lib/quote-context'

export function QuoteRequestModal() {
    const { showModal, setShowModal, submitQuoteRequest } = useQuote()

    const [customerName, setCustomerName] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [componentDescription, setComponentDescription] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
            setError('Please fill in all required fields')
            return
        }

        if (!componentDescription.trim()) {
            setError('Please describe what components you need a quote for')
            return
        }

        setIsSubmitting(true)

        const success = await submitQuoteRequest({
            componentDescription: componentDescription.trim(),
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            customerPhone: customerPhone.trim(),
            message: message.trim() || undefined
        })

        if (success) {
            setSubmitted(true)
            // Reset form after delay
            setTimeout(() => {
                setShowModal(false)
                setSubmitted(false)
                setCustomerName('')
                setCustomerEmail('')
                setCustomerPhone('')
                setComponentDescription('')
                setMessage('')
            }, 3000)
        } else {
            setError('Failed to submit quote request. Please try again.')
        }

        setIsSubmitting(false)
    }

    const handleClose = () => {
        setShowModal(false)
        setError('')
        if (submitted) {
            setSubmitted(false)
            setCustomerName('')
            setCustomerEmail('')
            setCustomerPhone('')
            setComponentDescription('')
            setMessage('')
        }
    }

    return (
        <AnimatePresence>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-dark-800 rounded-2xl border border-gray-700 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-dark-800 border-b border-gray-700 p-6 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-teal-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Request a Quote</h2>
                                    <p className="text-sm text-gray-400">Tell us what you need</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {submitted ? (
                            /* Success State */
                            <div className="p-12 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-2">Quote Request Submitted!</h3>
                                <p className="text-gray-400">
                                    We'll review your request and get back to you within 24 hours.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {/* Form Content */}
                                <div className="p-6 space-y-4">
                                    {/* Component Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-teal-400" />
                                            What do you need a quote for? <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            value={componentDescription}
                                            onChange={e => setComponentDescription(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none"
                                            placeholder="E.g., RTX 4090 graphics card, Intel i9-14900K processor, 64GB DDR5 RAM, custom gaming PC build..."
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            List the components, products, or describe your build requirements
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-700 pt-4">
                                        <h3 className="text-sm font-medium text-gray-400 mb-3">Your Details</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Full Name <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customerName}
                                                    onChange={e => setCustomerName(e.target.value)}
                                                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                                        Email <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={customerEmail}
                                                        onChange={e => setCustomerEmail(e.target.value)}
                                                        className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                                                        placeholder="john@example.com"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                                        Phone <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={customerPhone}
                                                        onChange={e => setCustomerPhone(e.target.value)}
                                                        className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                                                        placeholder="082 123 4567"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Additional Notes
                                                </label>
                                                <textarea
                                                    value={message}
                                                    onChange={e => setMessage(e.target.value)}
                                                    rows={2}
                                                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none"
                                                    placeholder="Budget range, timeline, special requirements..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-dark-800 border-t border-gray-700 p-6 rounded-b-2xl">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-teal-500 text-black font-bold rounded-xl hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Submit Quote Request
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-gray-500 text-xs mt-3">
                                        We'll respond within 24 hours with a custom quote
                                    </p>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
