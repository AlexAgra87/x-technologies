'use client'

import { motion } from 'framer-motion'
import { Handshake, CheckCircle, ArrowRight, Mail } from 'lucide-react'

const partnerTypes = [
    {
        title: 'Authorized Distributors',
        description: 'We partner with official distributors to ensure all products are genuine and backed by manufacturer warranties.',
        icon: '📦',
    },
    {
        title: 'Brand Partners',
        description: 'Direct partnerships with leading technology brands to bring you the latest products and exclusive deals.',
        icon: '🏷️',
    },
    {
        title: 'Logistics Partners',
        description: 'Reliable courier and logistics partners ensuring fast and safe delivery across South Africa.',
        icon: '🚚',
    },
    {
        title: 'Payment Partners',
        description: 'Secure payment processing through trusted South African payment gateways.',
        icon: '💳',
    },
]

const benefits = [
    'Access to South Africa\'s growing PC enthusiast market',
    'Professional marketing and promotion',
    'Dedicated partner support team',
    'Competitive commission structures',
    'Regular performance reporting',
    'Co-marketing opportunities',
]

export default function PartnersPage() {
    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            {/* Hero */}
            <div className="bg-gradient-to-r from-primary-900/20 via-dark-800 to-accent/10 border-b border-gray-800">
                <div className="container mx-auto px-4 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <Handshake className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Partner With <span className="text-gradient">X-Tech</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Join our network of trusted partners and grow your business with South Africa's
                            leading PC components retailer.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Partner Types */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Our Partner Network</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {partnerTypes.map((type, index) => (
                            <motion.div
                                key={type.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card p-6 text-center"
                            >
                                <div className="text-4xl mb-4">{type.icon}</div>
                                <h3 className="text-lg font-semibold text-white mb-2">{type.title}</h3>
                                <p className="text-gray-400 text-sm">{type.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Benefits */}
                <div className="max-w-4xl mx-auto mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Why Partner With Us?</h2>
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-300">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="card p-8 bg-gradient-to-br from-primary-500/10 to-accent/10"
                        >
                            <h3 className="text-xl font-semibold text-white mb-4">Become a Partner</h3>
                            <p className="text-gray-400 mb-6">
                                Interested in partnering with X-Tech? We'd love to hear from you.
                                Fill out our partner inquiry form or contact our partnerships team directly.
                            </p>
                            <a href="/contact" className="btn-primary w-full justify-center">
                                Get in Touch
                                <ArrowRight className="w-5 h-5" />
                            </a>
                        </motion.div>
                    </div>
                </div>

                {/* Current Partners */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-8">Our Trusted Partners</h2>
                    <div className="flex flex-wrap justify-center gap-8 opacity-60">
                        {['NVIDIA', 'AMD', 'Intel', 'Corsair', 'ASUS', 'MSI', 'Gigabyte', 'Kingston'].map((brand) => (
                            <div key={brand} className="text-xl font-bold text-gray-400">
                                {brand}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
