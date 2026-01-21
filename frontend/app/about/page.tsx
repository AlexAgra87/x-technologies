'use client'

import { motion } from 'framer-motion'
import { Shield, Truck, Users, Award, Target, Heart } from 'lucide-react'

const values = [
    {
        icon: Shield,
        title: 'Quality First',
        description: 'We only stock genuine products from authorized distributors, ensuring you get authentic components every time.',
    },
    {
        icon: Users,
        title: 'Customer Focus',
        description: 'Our knowledgeable team is passionate about helping you find the perfect components for your build.',
    },
    {
        icon: Truck,
        title: 'Fast Delivery',
        description: 'With warehouses in major cities, we deliver your components quickly and safely across South Africa.',
    },
    {
        icon: Award,
        title: 'Best Prices',
        description: 'We work directly with suppliers to bring you competitive prices on premium components.',
    },
]

const stats = [
    { value: '10,000+', label: 'Products' },
    { value: '50,000+', label: 'Happy Customers' },
    { value: '15+', label: 'Years Experience' },
    { value: '99%', label: 'Satisfaction Rate' },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-900/20 via-dark-800 to-accent/10 border-b border-gray-800">
                <div className="container mx-auto px-4 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            About <span className="text-gradient">X-Tech</span>
                        </h1>
                        <p className="text-lg text-gray-400">
                            We're passionate about technology and dedicated to providing South African PC enthusiasts
                            with the best computer components at competitive prices.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card p-6 text-center"
                        >
                            <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">
                                {stat.value}
                            </div>
                            <div className="text-gray-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Our Story */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
                        <div className="space-y-4 text-gray-400">
                            <p>
                                Founded by PC enthusiasts for PC enthusiasts, X-Tech started with a simple mission:
                                make premium computer components accessible to everyone in South Africa.
                            </p>
                            <p>
                                What began as a small operation has grown into one of the country's most trusted
                                sources for computer hardware. We've built relationships with leading manufacturers
                                and distributors to bring you the latest and greatest in PC technology.
                            </p>
                            <p>
                                Today, we offer over 10,000 products from brands like NVIDIA, AMD, Intel, Corsair,
                                ASUS, MSI, and many more. Whether you're building your first gaming PC or upgrading
                                your workstation, we're here to help.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass rounded-2xl p-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Our Mission</h3>
                                <p className="text-gray-400">Empowering builders everywhere</p>
                            </div>
                        </div>
                        <p className="text-gray-300">
                            To provide the best selection of computer components with exceptional service,
                            competitive pricing, and expert advice – helping every customer build their perfect system.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Values */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((value, index) => (
                        <motion.div
                            key={value.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card p-6 text-center"
                        >
                            <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                                <value.icon className="w-7 h-7 text-primary-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                            <p className="text-gray-400 text-sm">{value.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-2xl p-8 md:p-12 text-center"
                >
                    <Heart className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready to Build Your Dream PC?
                    </h2>
                    <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                        Browse our extensive catalog of components and start building today.
                    </p>
                    <a href="/products" className="btn-primary text-lg px-8 py-4">
                        Shop Now
                    </a>
                </motion.div>
            </div>
        </div>
    )
}
