'use client'

import { motion } from 'framer-motion'
import { Newspaper, Calendar, Download, ArrowRight } from 'lucide-react'

const pressReleases = [
    {
        title: 'X-Tech Expands Product Catalog to Over 10,000 Items',
        date: 'January 2024',
        excerpt: 'X-Tech announces major expansion of product offerings, now featuring over 10,000 computer components from leading brands.',
    },
    {
        title: 'X-Tech Partners with RCT for Enhanced Product Selection',
        date: 'December 2023',
        excerpt: 'New partnership brings expanded inventory of power solutions and IT accessories to South African customers.',
    },
    {
        title: 'X-Tech Launches Redesigned E-Commerce Platform',
        date: 'November 2023',
        excerpt: 'New website offers improved user experience, faster checkout, and enhanced product discovery features.',
    },
    {
        title: 'X-Tech Reports Record Growth in 2023',
        date: 'October 2023',
        excerpt: 'Company announces 150% year-over-year growth driven by increased demand for gaming and workstation components.',
    },
]

const mediaKit = [
    { name: 'Brand Guidelines', type: 'PDF', size: '2.4 MB' },
    { name: 'Logo Package', type: 'ZIP', size: '5.1 MB' },
    { name: 'Product Images', type: 'ZIP', size: '45 MB' },
    { name: 'Company Fact Sheet', type: 'PDF', size: '1.2 MB' },
]

export default function PressPage() {
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
                        <Newspaper className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Press & <span className="text-gradient">Media</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Latest news, press releases, and media resources from X-Tech.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Press Releases */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-6">Press Releases</h2>
                        <div className="space-y-4">
                            {pressReleases.map((release, index) => (
                                <motion.article
                                    key={release.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card p-6 hover:border-primary-500/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                                        <Calendar className="w-4 h-4" />
                                        {release.date}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors mb-2">
                                        {release.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-3">{release.excerpt}</p>
                                    <span className="text-primary-400 text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Read More <ArrowRight className="w-4 h-4" />
                                    </span>
                                </motion.article>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Media Kit */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="card p-6"
                        >
                            <h3 className="text-xl font-semibold text-white mb-4">Media Kit</h3>
                            <div className="space-y-3">
                                {mediaKit.map((item) => (
                                    <a
                                        key={item.name}
                                        href="#"
                                        className="flex items-center justify-between p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors group"
                                    >
                                        <div>
                                            <p className="text-white font-medium">{item.name}</p>
                                            <p className="text-gray-500 text-sm">{item.type} • {item.size}</p>
                                        </div>
                                        <Download className="w-5 h-5 text-gray-400 group-hover:text-primary-400" />
                                    </a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Media Contact */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card p-6 bg-primary-500/5 border-primary-500/20"
                        >
                            <h3 className="text-xl font-semibold text-white mb-4">Media Contact</h3>
                            <p className="text-gray-400 mb-4">
                                For press inquiries, interviews, or additional information, please contact our PR team.
                            </p>
                            <a
                                href="mailto:press@x-tech.co.za"
                                className="text-primary-400 font-medium hover:underline"
                            >
                                press@x-tech.co.za
                            </a>
                        </motion.div>

                        {/* Company Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="card p-6"
                        >
                            <h3 className="text-xl font-semibold text-white mb-4">About X-Tech</h3>
                            <p className="text-gray-400 text-sm">
                                X-Tech is South Africa's premier destination for computer components and PC hardware.
                                Founded with a passion for technology, we offer over 10,000 products from leading
                                brands at competitive prices.
                            </p>
                            <a href="/about" className="text-primary-400 text-sm mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all">
                                Learn More <ArrowRight className="w-4 h-4" />
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
