'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Cpu, Monitor, Gamepad2, HardDrive, Zap } from 'lucide-react'

interface Banner {
    id: number
    title: string
    subtitle: string
    cta: string
    link: string
    gradient: string
    icon: React.ElementType
    image: string
}

const banners: Banner[] = [
    {
        id: 1,
        title: 'Graphics Cards',
        subtitle: 'Latest RTX & RX Series in Stock',
        cta: 'Shop Now',
        link: '/products?category=Graphics%20Cards',
        gradient: 'from-teal-600 via-cyan-600 to-teal-700',
        icon: Gamepad2,
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80'
    },
    {
        id: 2,
        title: 'Processors',
        subtitle: 'AMD Ryzen & Intel Core Available',
        cta: 'View CPUs',
        link: '/products?category=Processors',
        gradient: 'from-orange-600 via-red-600 to-orange-700',
        icon: Cpu,
        image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&q=80'
    },
    {
        id: 3,
        title: 'Gaming Monitors',
        subtitle: 'High Refresh Rate Displays',
        cta: 'Shop Monitors',
        link: '/products?category=Monitors',
        gradient: 'from-purple-600 via-violet-600 to-purple-700',
        icon: Monitor,
        image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80'
    },
    {
        id: 4,
        title: 'Storage Solutions',
        subtitle: 'NVMe SSDs & Hard Drives',
        cta: 'Shop Storage',
        link: '/products?category=Storage',
        gradient: 'from-blue-600 via-indigo-600 to-blue-700',
        icon: HardDrive,
        image: 'https://images.unsplash.com/photo-1601737487795-dab272f52420?w=800&q=80'
    }
]

export function PromoBanners() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    const next = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, [])

    const prev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    }, [])

    useEffect(() => {
        if (!isAutoPlaying) return
        const timer = setInterval(next, 5000)
        return () => clearInterval(timer)
    }, [isAutoPlaying, next])

    return (
        <div
            className="relative overflow-hidden rounded-2xl"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Banner Container */}
            <div className="relative h-[220px] md:h-[320px]">
                <AnimatePresence mode="wait">
                    {banners.map((banner, index) => (
                        index === currentIndex && (
                            <motion.div
                                key={banner.id}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.4 }}
                                className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} overflow-hidden`}
                            >
                                {/* Background Image with Ken Burns effect */}
                                <motion.div
                                    className="absolute inset-0"
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 8, ease: "linear" }}
                                >
                                    <Image
                                        src={banner.image}
                                        alt={banner.title}
                                        fill
                                        className="object-cover opacity-30"
                                        priority
                                    />
                                </motion.div>

                                {/* Gradient Overlay for readability */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                                {/* Content */}
                                <div className="relative z-10 h-full flex items-center p-8 md:p-12">
                                    <div className="flex-1 max-w-xl">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                                                {banner.title}
                                            </h2>
                                            <p className="text-lg md:text-xl text-white/90 mb-6 drop-shadow">
                                                {banner.subtitle}
                                            </p>
                                            <Link
                                                href={banner.link}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                                            >
                                                {banner.cta}
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white hover:bg-black/50 transition-colors cursor-pointer"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white hover:bg-black/50 transition-colors cursor-pointer"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex
                            ? 'bg-white w-8'
                            : 'bg-white/40 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
