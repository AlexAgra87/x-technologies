'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight, Shield, Zap, Headphones, Star, Sparkles, Package, BadgePercent } from 'lucide-react'
import { useQuote } from '@/lib/quote-context'

// Banner slides data - Premium tech imagery with compelling copy
const bannerSlides = [
    {
        id: 1,
        tag: 'Next-Gen Gaming',
        title: 'DOMINATE',
        subtitle: 'EVERY BATTLE',
        description: 'Experience unrivaled performance with the latest RTX 50 Series GPUs, DDR5 memory, and lightning-fast NVMe storage.',
        cta: { text: 'SHOP GAMING', href: '/products?category=Gaming' },
        ctaSecondary: { text: 'View Deals', href: '/deals' },
        bgImage: 'https://images.unsplash.com/photo-1623820919239-0d0ff10797a1?auto=format&fit=crop&w=1920&q=80',
        gradient: 'from-purple-600/40 via-blue-600/30 to-transparent',
        accentColor: 'purple',
    },
    {
        id: 2,
        tag: 'Professional Grade',
        title: 'CREATE',
        subtitle: 'WITHOUT LIMITS',
        description: 'Workstation hardware built for creators, developers, and professionals who demand the absolute best.',
        cta: { text: 'EXPLORE', href: '/products?category=Workstation' },
        ctaSecondary: { text: 'Learn More', href: '/products' },
        bgImage: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1920&q=80',
        gradient: 'from-teal-600/40 via-cyan-600/30 to-transparent',
        accentColor: 'teal',
    },
    {
        id: 3,
        tag: 'Custom Builds',
        title: 'BUILD',
        subtitle: 'YOUR DREAM',
        description: 'From entry-level to extreme. Every component hand-picked, expertly assembled, and thoroughly tested.',
        cta: { text: 'START BUILD', href: '/products' },
        ctaSecondary: { text: 'Get Quote', href: '/contact' },
        bgImage: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=1920&q=80',
        gradient: 'from-orange-600/40 via-red-600/30 to-transparent',
        accentColor: 'orange',
    },
    {
        id: 4,
        tag: 'Unbeatable Value',
        title: 'SAVE',
        subtitle: 'UP TO 40%',
        description: 'Premium tech at prices that make sense. Limited time deals on the components you need.',
        cta: { text: 'VIEW DEALS', href: '/deals' },
        ctaSecondary: { text: 'All Products', href: '/products' },
        bgImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1920&q=80',
        gradient: 'from-green-600/40 via-emerald-600/30 to-transparent',
        accentColor: 'green',
    },
]

// Trust badges data
const trustBadges = [
    { icon: Package, label: 'Huge Selection', desc: '50,000+ Products' },
    { icon: BadgePercent, label: 'Best Prices', desc: 'Unbeatable Deals' },
    { icon: Zap, label: 'Fast Quotes', desc: 'Quick Response' },
    { icon: Headphones, label: 'Expert Support', desc: 'Tech Specialists' },
]

export function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const { setShowModal } = useQuote()

    // Auto-advance slides
    useEffect(() => {
        if (!isAutoPlaying) return
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % bannerSlides.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [isAutoPlaying])

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(index)
        setIsAutoPlaying(false)
        setTimeout(() => setIsAutoPlaying(true), 10000)
    }, [])

    const prevSlide = () => goToSlide((currentSlide - 1 + bannerSlides.length) % bannerSlides.length)
    const nextSlide = () => goToSlide((currentSlide + 1) % bannerSlides.length)

    const currentBanner = bannerSlides[currentSlide]

    return (
        <section className="relative bg-dark-900 overflow-hidden">
            {/* Main Hero Carousel - Full Width */}
            <div className="relative h-[400px] sm:h-[450px] lg:h-[500px] xl:h-[550px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        {/* Background Image with Ken Burns effect */}
                        <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: 1.05 }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={currentBanner.bgImage}
                                alt={currentBanner.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="100vw"
                            />
                        </motion.div>

                        {/* Multi-layer Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.gradient}`} />
                        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/80 to-dark-900/20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/30" />

                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>

                        {/* Content Container */}
                        <div className="container mx-auto px-4 h-full relative z-10">
                            <div className="flex flex-col justify-center h-full max-w-3xl">
                                {/* Tag */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="mb-4"
                                >
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white">
                                        <Sparkles className="w-4 h-4 text-teal-400" />
                                        {currentBanner.tag}
                                    </span>
                                </motion.div>

                                {/* Main Title */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="mb-2"
                                >
                                    <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-none">
                                        {currentBanner.title}
                                    </h1>
                                </motion.div>

                                {/* Subtitle with gradient */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    className="mb-6"
                                >
                                    <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent tracking-tight leading-none">
                                        {currentBanner.subtitle}
                                    </h2>
                                </motion.div>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-xl mb-8 leading-relaxed"
                                >
                                    {currentBanner.description}
                                </motion.p>

                                {/* CTA Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="flex flex-wrap gap-4"
                                >
                                    <Link
                                        href={currentBanner.cta.href}
                                        className="group inline-flex items-center gap-2 px-8 py-4 bg-teal-500 text-black font-bold text-lg rounded-xl hover:bg-teal-400 transition-all hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5"
                                    >
                                        {currentBanner.cta.text}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    {currentBanner.ctaSecondary.text === 'Get Quote' ? (
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-0.5"
                                        >
                                            {currentBanner.ctaSecondary.text}
                                        </button>
                                    ) : (
                                        <Link
                                            href={currentBanner.ctaSecondary.href}
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-0.5"
                                        >
                                            {currentBanner.ctaSecondary.text}
                                        </Link>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-20 border border-white/10"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-20 border border-white/10"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slide Progress Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {bannerSlides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goToSlide(i)}
                            className="group relative h-1 w-12 bg-white/20 rounded-full overflow-hidden"
                            aria-label={`Go to slide ${i + 1}`}
                        >
                            {i === currentSlide && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 6, ease: 'linear' }}
                                    className="absolute inset-0 bg-teal-400 rounded-full"
                                />
                            )}
                            {i !== currentSlide && (
                                <div className="absolute inset-0 bg-white/40 rounded-full group-hover:bg-white/60 transition-colors" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trust Badges Bar */}
            <div className="relative z-10 bg-dark-800/80 backdrop-blur-sm border-y border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-700/50">
                        {trustBadges.map((badge, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                                className="flex items-center gap-3 py-4 px-4 lg:px-6 justify-center"
                            >
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                                    <badge.icon className="w-5 h-5 text-teal-400" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-white font-semibold text-sm">{badge.label}</p>
                                    <p className="text-gray-400 text-xs">{badge.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
