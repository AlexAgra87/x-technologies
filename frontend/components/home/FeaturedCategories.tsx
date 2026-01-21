'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Cpu,
    MemoryStick,
    HardDrive,
    Monitor,
    Keyboard,
    Headphones,
    Zap,
    Fan,
    ArrowRight
} from 'lucide-react'

const categories = [
    {
        name: 'Graphics Cards',
        description: 'NVIDIA & AMD GPUs',
        icon: Zap,
        href: '/products?category=Graphics%20Cards',
        gradient: 'from-teal-500 to-cyan-500',
        iconBg: 'bg-teal-500/20',
        iconColor: 'text-teal-400',
    },
    {
        name: 'Processors',
        description: 'Intel & AMD CPUs',
        icon: Cpu,
        href: '/products?category=Processors',
        gradient: 'from-cyan-500 to-blue-500',
        iconBg: 'bg-cyan-500/20',
        iconColor: 'text-cyan-400',
    },
    {
        name: 'Memory',
        description: 'DDR4 & DDR5 RAM',
        icon: MemoryStick,
        href: '/products?category=Memory',
        gradient: 'from-teal-400 to-emerald-500',
        iconBg: 'bg-teal-400/20',
        iconColor: 'text-teal-300',
    },
    {
        name: 'Storage',
        description: 'SSDs & HDDs',
        icon: HardDrive,
        href: '/products?category=Storage',
        gradient: 'from-cyan-400 to-teal-500',
        iconBg: 'bg-cyan-400/20',
        iconColor: 'text-cyan-300',
    },
    {
        name: 'Cooling',
        description: 'AIO & Air Coolers',
        icon: Fan,
        href: '/products?category=Cooling',
        gradient: 'from-teal-500 to-cyan-400',
        iconBg: 'bg-teal-500/20',
        iconColor: 'text-teal-400',
    },
    {
        name: 'Monitors',
        description: 'Gaming & Professional',
        icon: Monitor,
        href: '/products?category=Monitors',
        gradient: 'from-cyan-500 to-teal-400',
        iconBg: 'bg-cyan-500/20',
        iconColor: 'text-cyan-400',
    },
    {
        name: 'Peripherals',
        description: 'Keyboards & Mice',
        icon: Keyboard,
        href: '/products?category=Peripherals',
        gradient: 'from-teal-400 to-cyan-500',
        iconBg: 'bg-teal-400/20',
        iconColor: 'text-teal-300',
    },
    {
        name: 'Audio',
        description: 'Headsets & Speakers',
        icon: Headphones,
        href: '/products?category=Audio',
        gradient: 'from-cyan-400 to-teal-400',
        iconBg: 'bg-cyan-400/20',
        iconColor: 'text-cyan-300',
    },
]

export function FeaturedCategories() {
    return (
        <section className="py-24 bg-dark-900 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.05),transparent_70%)]" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm mb-6"
                    >
                        <Zap className="w-4 h-4" />
                        Browse Categories
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        <span className="text-white">Find What You </span>
                        <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Need</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        Explore our extensive collection of premium computer components
                    </motion.p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={category.href}
                                className="group block relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 hover:border-teal-500/30 transition-all duration-500 overflow-hidden h-full"
                            >
                                {/* Hover gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />

                                {/* Icon */}
                                <div className={`relative w-14 h-14 rounded-xl ${category.iconBg} border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-teal-500/30 transition-all duration-300`}>
                                    <category.icon className={`w-7 h-7 ${category.iconColor}`} />
                                </div>

                                {/* Content */}
                                <h3 className="relative font-semibold text-lg text-white mb-2 group-hover:text-teal-300 transition-colors">
                                    {category.name}
                                </h3>
                                <p className="relative text-sm text-gray-500 mb-4">
                                    {category.description}
                                </p>

                                {/* Arrow */}
                                <div className="relative flex items-center gap-2 text-sm text-teal-400 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <span>Explore</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
