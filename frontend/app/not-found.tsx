'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft, ShoppingBag, Tag } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                {/* 404 Animation */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-8"
                >
                    <div className="text-[150px] md:text-[200px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-teal-400 via-cyan-400 to-teal-600 select-none">
                        404
                    </div>
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="w-20 h-20 rounded-full bg-dark-800 border-2 border-teal-500/30 flex items-center justify-center">
                            <Search className="w-10 h-10 text-teal-400" />
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-3xl font-bold text-white mb-3">
                        Page Not Found
                    </h1>
                    <p className="text-gray-400 mb-8">
                        Oops! The page you're looking for seems to have wandered off.
                        Don't worry, let's get you back on track.
                    </p>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 text-black font-medium rounded-lg hover:bg-teal-400 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            Go Home
                        </Link>
                        <Link
                            href="/products"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-800 border border-gray-700 text-white font-medium rounded-lg hover:bg-dark-700 transition-colors"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Products
                        </Link>
                    </div>

                    {/* Additional Links */}
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link
                            href="/deals"
                            className="text-teal-400 hover:text-teal-300 flex items-center gap-1"
                        >
                            <Tag className="w-4 h-4" />
                            Hot Deals
                        </Link>
                        <Link
                            href="/about"
                            className="text-gray-400 hover:text-white"
                        >
                            About Us
                        </Link>
                        <Link
                            href="/contact"
                            className="text-gray-400 hover:text-white"
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Go Back */}
                    <button
                        onClick={() => window.history.back()}
                        className="mt-8 text-gray-500 hover:text-white flex items-center gap-2 mx-auto text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back to previous page
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
