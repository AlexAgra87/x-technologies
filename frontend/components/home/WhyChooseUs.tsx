'use client'

import { motion } from 'framer-motion'
import { Truck, Shield, Clock, Award, Headphones, RefreshCw } from 'lucide-react'

const features = [
    {
        icon: Truck,
        title: 'Nationwide Delivery',
        description: 'Fast and reliable shipping across South Africa.',
    },
    {
        icon: Shield,
        title: 'Genuine Products',
        description: 'Authentic products from authorized distributors.',
    },
    {
        icon: Clock,
        title: 'Real-time Stock',
        description: 'Live inventory from multiple suppliers.',
    },
    {
        icon: Award,
        title: 'Full Warranty',
        description: 'All products include manufacturer warranty.',
    },
    {
        icon: Headphones,
        title: 'Expert Support',
        description: 'Technical help from PC enthusiasts.',
    },
    {
        icon: RefreshCw,
        title: 'Easy Returns',
        description: 'Hassle-free return policy.',
    },
]

export function WhyChooseUs() {
    return (
        <section className="py-24 bg-dark-900 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(20,184,166,0.05),transparent_60%)]" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm mb-6"
                    >
                        <Shield className="w-4 h-4" />
                        Why X-Tech
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        <span className="text-white">Built for </span>
                        <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Builders</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        A platform created by PC enthusiasts, for PC enthusiasts
                    </motion.p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                        >
                            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 hover:border-teal-500/30 transition-all duration-500 h-full overflow-hidden">
                                {/* Hover gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Icon */}
                                <div className="relative w-14 h-14 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all duration-300">
                                    <feature.icon className="w-7 h-7 text-teal-400" />
                                </div>

                                {/* Content */}
                                <h3 className="relative font-semibold text-xl text-white mb-3 group-hover:text-teal-300 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="relative text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
