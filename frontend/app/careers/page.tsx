'use client'

import { motion } from 'framer-motion'
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react'

const openPositions = [
    {
        title: 'Senior Software Developer',
        department: 'Engineering',
        location: 'Johannesburg',
        type: 'Full-time',
        description: 'Build and maintain our e-commerce platform using modern technologies.',
    },
    {
        title: 'Customer Support Specialist',
        department: 'Support',
        location: 'Cape Town',
        type: 'Full-time',
        description: 'Help our customers with product inquiries and technical support.',
    },
    {
        title: 'Digital Marketing Manager',
        department: 'Marketing',
        location: 'Remote',
        type: 'Full-time',
        description: 'Lead our digital marketing efforts and grow our online presence.',
    },
    {
        title: 'Warehouse Associate',
        department: 'Operations',
        location: 'Johannesburg',
        type: 'Full-time',
        description: 'Manage inventory and fulfill customer orders efficiently.',
    },
]

const benefits = [
    'Competitive salary and performance bonuses',
    'Medical aid contribution',
    'Flexible working hours',
    'Remote work options',
    'Staff discounts on all products',
    'Professional development budget',
    'Team building events',
    'Modern office environment',
]

export default function CareersPage() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Join Our <span className="text-gradient">Team</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Build your career with South Africa's fastest-growing PC components retailer.
                            We're always looking for talented individuals who share our passion for technology.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Benefits */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Why Work at X-Tech?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="card p-4 text-center"
                            >
                                <p className="text-gray-300 text-sm">{benefit}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Open Positions */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Open Positions</h2>
                    <div className="space-y-4">
                        {openPositions.map((position, index) => (
                            <motion.div
                                key={position.title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card p-6 hover:border-primary-500/30 transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                                            {position.title}
                                        </h3>
                                        <p className="text-gray-400 mt-1">{position.description}</p>
                                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                                            <span className="flex items-center gap-1 text-gray-500">
                                                <Briefcase className="w-4 h-4" />
                                                {position.department}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-500">
                                                <MapPin className="w-4 h-4" />
                                                {position.location}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {position.type}
                                            </span>
                                        </div>
                                    </div>
                                    <a href="/contact" className="btn-outline flex-shrink-0">
                                        Apply Now
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* No matching position */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-12 text-center"
                >
                    <div className="card p-8 bg-primary-500/5 border-primary-500/20 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-white mb-2">Don't see a matching position?</h3>
                        <p className="text-gray-400 mb-4">
                            We're always interested in hearing from talented people. Send us your CV and we'll keep you in mind for future opportunities.
                        </p>
                        <a href="mailto:careers@x-tech.co.za" className="btn-primary">
                            Send Your CV
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
