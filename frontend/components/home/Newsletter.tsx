'use client'

import { motion } from 'framer-motion'
import { Mail, ArrowRight, Bell } from 'lucide-react'
import { useState } from 'react'

export function Newsletter() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSubmitting(false)
        setIsSuccess(true)
        setEmail('')
    }

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-900 to-[#0a0d12]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.08),transparent_60%)]" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative max-w-3xl mx-auto"
                >
                    <div className="relative rounded-3xl p-10 md:p-14 text-center bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-teal-500/20 via-transparent to-cyan-500/20 rounded-3xl blur-2xl opacity-50" />

                        {/* Icon */}
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-teal-500/25">
                            <Bell className="w-8 h-8 text-black" />
                        </div>

                        {/* Content */}
                        <h2 className="relative text-3xl md:text-4xl font-bold mb-4">
                            <span className="text-white">Stay </span>
                            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Updated</span>
                        </h2>
                        <p className="relative text-gray-400 mb-10 max-w-md mx-auto text-lg">
                            Subscribe to our newsletter for the latest deals and new arrivals.
                        </p>

                        {/* Form */}
                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative bg-teal-500/10 border border-teal-500/20 rounded-xl p-6 max-w-md mx-auto"
                            >
                                <p className="text-teal-400 font-medium">
                                    ✓ You&apos;re subscribed! We&apos;ll keep you updated.
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <div className="flex-grow relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-white/[0.07] transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold rounded-xl hover:from-teal-400 hover:to-cyan-400 transition-all duration-300 shadow-lg shadow-teal-500/25 whitespace-nowrap"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            Subscribing...
                                        </span>
                                    ) : (
                                        <>
                                            Subscribe
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Privacy note */}
                        <p className="relative text-xs text-gray-500 mt-6">
                            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
