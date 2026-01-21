'use client'

import { motion } from 'framer-motion'
import { Shield, Clock, Wrench, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const warrantyTypes = [
    {
        title: 'Manufacturer Warranty',
        description: 'Most products come with a manufacturer warranty ranging from 1-5 years depending on the product and brand.',
        icon: Shield,
    },
    {
        title: 'Extended Warranty',
        description: 'Optional extended warranty available for purchase on select products, extending coverage up to 3 additional years.',
        icon: Clock,
    },
    {
        title: 'Repair Services',
        description: 'Our certified technicians can diagnose and repair issues covered under warranty at no additional cost.',
        icon: Wrench,
    },
]

const warrantyInfo = [
    { brand: 'NVIDIA', period: '3 Years', notes: 'Graphics cards' },
    { brand: 'AMD', period: '3 Years', notes: 'CPUs and GPUs' },
    { brand: 'Intel', period: '3 Years', notes: 'Processors' },
    { brand: 'Corsair', period: '2-5 Years', notes: 'Varies by product' },
    { brand: 'ASUS', period: '3 Years', notes: 'Motherboards and GPUs' },
    { brand: 'Samsung', period: '3-5 Years', notes: 'SSDs and monitors' },
    { brand: 'Kingston', period: 'Lifetime', notes: 'Memory modules' },
    { brand: 'Seagate', period: '2-5 Years', notes: 'Varies by product line' },
]

export default function WarrantyPage() {
    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            {/* Hero */}
            <div className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-gray-800">
                <div className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <Shield className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Warranty <span className="text-gradient">Information</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            All our products are backed by manufacturer warranties for your peace of mind
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Warranty Types */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {warrantyTypes.map((type, index) => (
                        <motion.div
                            key={type.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card p-6"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                                <type.icon className="w-6 h-6 text-primary-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{type.title}</h3>
                            <p className="text-gray-400">{type.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Brand Warranty Table */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Warranty by Brand</h2>
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-dark-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Brand</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Warranty Period</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warrantyInfo.map((item, index) => (
                                    <tr key={item.brand} className={index % 2 === 0 ? 'bg-dark-800' : 'bg-dark-800/50'}>
                                        <td className="p-4 text-white font-medium">{item.brand}</td>
                                        <td className="p-4 text-primary-400">{item.period}</td>
                                        <td className="p-4 text-gray-400">{item.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* How to Claim */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="card p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <h3 className="text-lg font-semibold text-white">What's Covered</h3>
                        </div>
                        <ul className="space-y-3 text-gray-400">
                            <li>• Manufacturing defects</li>
                            <li>• Component failures under normal use</li>
                            <li>• Dead pixels (above manufacturer threshold)</li>
                            <li>• DOA (Dead on Arrival) products</li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="card p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white">What's Not Covered</h3>
                        </div>
                        <ul className="space-y-3 text-gray-400">
                            <li>• Physical damage or misuse</li>
                            <li>• Water or liquid damage</li>
                            <li>• Damage from power surges</li>
                            <li>• Unauthorized modifications</li>
                        </ul>
                    </motion.div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <p className="text-gray-400 mb-4">Need to make a warranty claim?</p>
                    <Link href="/contact" className="btn-primary">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    )
}
