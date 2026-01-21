'use client'

import { motion } from 'framer-motion'
import { Truck, Clock, MapPin, Package, CheckCircle } from 'lucide-react'

const shippingOptions = [
    {
        name: 'Standard Shipping',
        price: 'R99',
        freeOver: 'Free over R1,500',
        time: '3-5 business days',
        icon: Truck,
    },
    {
        name: 'Express Shipping',
        price: 'R199',
        freeOver: 'Free over R3,000',
        time: '1-2 business days',
        icon: Clock,
    },
    {
        name: 'Collect in Store',
        price: 'Free',
        freeOver: 'Always free',
        time: 'Same day',
        icon: MapPin,
    },
]

const deliveryAreas = [
    { area: 'Gauteng', standard: '2-3 days', express: '1 day' },
    { area: 'Western Cape', standard: '3-4 days', express: '1-2 days' },
    { area: 'KwaZulu-Natal', standard: '3-4 days', express: '1-2 days' },
    { area: 'Eastern Cape', standard: '4-5 days', express: '2 days' },
    { area: 'Other Provinces', standard: '4-5 days', express: '2-3 days' },
]

export default function ShippingPage() {
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
                        <Truck className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Shipping <span className="text-gradient">Information</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Fast and reliable delivery across South Africa
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Shipping Options */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Shipping Options</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {shippingOptions.map((option, index) => (
                            <motion.div
                                key={option.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card p-6"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                                    <option.icon className="w-6 h-6 text-primary-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{option.name}</h3>
                                <div className="text-2xl font-bold text-primary-400 mb-1">{option.price}</div>
                                <p className="text-sm text-green-400 mb-2">{option.freeOver}</p>
                                <p className="text-gray-400">{option.time}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Delivery Times */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Delivery Times by Region</h2>
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-dark-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Region</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Standard</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Express</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryAreas.map((area, index) => (
                                    <tr key={area.area} className={index % 2 === 0 ? 'bg-dark-800' : 'bg-dark-800/50'}>
                                        <td className="p-4 text-white">{area.area}</td>
                                        <td className="p-4 text-gray-400">{area.standard}</td>
                                        <td className="p-4 text-gray-400">{area.express}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Shipping Info */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="w-6 h-6 text-primary-400" />
                            <h3 className="text-lg font-semibold text-white">Packaging</h3>
                        </div>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>All items are securely packaged with protective materials</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Fragile items receive extra cushioning</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>All packages are insured during transit</span>
                            </li>
                        </ul>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-6 h-6 text-primary-400" />
                            <h3 className="text-lg font-semibold text-white">Tracking</h3>
                        </div>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Tracking number provided via email once shipped</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Real-time tracking available on our website</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>SMS notifications for delivery updates</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
