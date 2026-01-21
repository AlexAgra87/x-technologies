'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

// Featured brands with their Simple Icons slugs (null means use inline SVG)
const featuredBrands = [
    { name: 'NVIDIA', slug: 'nvidia', description: 'Graphics Cards' },
    { name: 'AMD', slug: 'amd', description: 'CPUs & GPUs' },
    { name: 'Intel', slug: 'intel', description: 'Processors' },
    { name: 'ASUS', slug: 'asus', description: 'Motherboards' },
    { name: 'MSI', slug: 'msi', description: 'Gaming Hardware' },
    { name: 'Gigabyte', slug: null, description: 'PC Components' },
    { name: 'Corsair', slug: 'corsair', description: 'Peripherals' },
    { name: 'Samsung', slug: 'samsung', description: 'Storage & Displays' },
    { name: 'Logitech', slug: null, description: 'Peripherals' },
    { name: 'Razer', slug: 'razer', description: 'Gaming Gear' },
    { name: 'Seagate', slug: 'seagate', description: 'Storage' },
    { name: 'Cooler Master', slug: 'coolermaster', description: 'Cooling' },
]

// Inline SVG logos for brands not in Simple Icons
const inlineSvgLogos: Record<string, string> = {
    'Logitech': `<svg viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg"><text x="50" y="55" font-size="28" font-weight="bold" text-anchor="middle" font-family="Arial, sans-serif">logi</text><circle cx="50" cy="75" r="6" fill="#00B8FC"/></svg>`,
    'Gigabyte': `<svg viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg"><text x="50" y="60" font-size="14" font-weight="bold" text-anchor="middle" font-family="Arial, sans-serif">GIGABYTE</text></svg>`,
}

// Brand logo component that fetches from Simple Icons CDN or uses inline SVG
function BrandLogo({ slug, name, size = 40 }: { slug: string | null; name: string; size?: number }) {
    const [svgContent, setSvgContent] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check for inline SVG first
        if (inlineSvgLogos[name]) {
            setSvgContent(inlineSvgLogos[name])
            setIsLoading(false)
            return
        }

        // If no slug, show fallback
        if (!slug) {
            setIsLoading(false)
            return
        }

        fetch(`https://cdn.simpleicons.org/${slug}/ffffff`)
            .then(res => {
                if (!res.ok) throw new Error('Failed')
                return res.text()
            })
            .then(svg => {
                setSvgContent(svg)
                setIsLoading(false)
            })
            .catch(() => setIsLoading(false))
    }, [slug, name])

    if (isLoading) {
        return (
            <div
                className="bg-dark-700 rounded animate-pulse"
                style={{ width: size, height: size }}
            />
        )
    }

    if (!svgContent) {
        return (
            <div
                className="flex items-center justify-center bg-primary-500/20 rounded font-bold text-primary-400"
                style={{ width: size, height: size, fontSize: size * 0.4 }}
            >
                {name.charAt(0)}
            </div>
        )
    }

    return (
        <div
            className="flex items-center justify-center"
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    )
}

export function BrandsSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-800 to-dark-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.05),transparent_50%)]" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm mb-6">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Official Partners
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        <span className="text-white">Shop Top </span>
                        <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Brands</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Premium components from the world&apos;s leading manufacturers
                    </p>
                </motion.div>

                {/* Featured Brands Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {featuredBrands.map((brand, index) => (
                        <motion.div
                            key={brand.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Link
                                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                                className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 hover:border-teal-500/30 transition-all duration-500"
                            >
                                {/* Hover glow */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative mb-3 opacity-60 group-hover:opacity-100 transition-all group-hover:scale-110 duration-300">
                                    <BrandLogo slug={brand.slug} name={brand.name} size={48} />
                                </div>
                                <span className="relative font-semibold text-white text-sm group-hover:text-teal-300 transition-colors">
                                    {brand.name}
                                </span>
                                <span className="relative text-xs text-gray-500 mt-1">
                                    {brand.description}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
