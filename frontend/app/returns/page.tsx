'use client'

import { motion } from 'framer-motion'
import { RotateCcw, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const returnSteps = [
    {
        step: 1,
        title: 'Request Return',
        description: 'Contact us within 14 days of receiving your order',
    },
    {
        step: 2,
        title: 'Get Authorization',
        description: 'We\'ll provide a return authorization number',
    },
    {
        step: 3,
        title: 'Ship Item Back',
        description: 'Pack the item securely and ship to our warehouse',
    },
    {
        step: 4,
        title: 'Receive Refund',
        description: 'Refund processed within 5-7 business days',
    },
]

export default function ReturnsPage() {
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
                        <RotateCcw className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Returns & <span className="text-gradient">Refunds</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Hassle-free returns within 14 days of purchase
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Return Process */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Return Process</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {returnSteps.map((step, index) => (
                            <motion.div
                                key={step.step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card p-6 text-center relative"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-4 text-white font-bold">
                                    {step.step}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                                <p className="text-gray-400 text-sm">{step.description}</p>
                                {index < returnSteps.length - 1 && (
                                    <div className="hidden md:block absolute top-10 right-0 translate-x-1/2 text-gray-600">
                                        →
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Returnable Items */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="card p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <h3 className="text-lg font-semibold text-white">Eligible for Returns</h3>
                        </div>
                        <ul className="space-y-3 text-gray-400">
                            <li>• Unopened products in original packaging</li>
                            <li>• Defective products (with proof)</li>
                            <li>• Wrong item received</li>
                            <li>• Products within 14-day return window</li>
                            <li>• Items with all accessories included</li>
                        </ul>
                    </motion.div>

                    {/* Non-Returnable Items */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="card p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                            <h3 className="text-lg font-semibold text-white">Not Eligible for Returns</h3>
                        </div>
                        <ul className="space-y-3 text-gray-400">
                            <li>• Opened software or digital products</li>
                            <li>• Items damaged by customer</li>
                            <li>• Products without original packaging</li>
                            <li>• Items past the 14-day return window</li>
                            <li>• Clearance or final sale items</li>
                        </ul>
                    </motion.div>
                </div>

                {/* Important Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto mt-12"
                >
                    <div className="card p-6 bg-primary-500/5 border-primary-500/20">
                        <h3 className="text-lg font-semibold text-white mb-4">Important Information</h3>
                        <div className="grid md:grid-cols-2 gap-6 text-gray-400">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-medium text-white">Refund Timeline</p>
                                    <p className="text-sm">Refunds are processed within 5-7 business days after we receive and inspect the returned item.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Package className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-medium text-white">Shipping Costs</p>
                                    <p className="text-sm">Original shipping costs are non-refundable. Return shipping is the customer's responsibility unless the item is defective.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <p className="text-gray-400 mb-4">Need to return an item?</p>
                    <Link href="/contact" className="btn-primary">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    )
}
