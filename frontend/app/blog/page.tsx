'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, User, ArrowRight, Tag } from 'lucide-react'

const blogPosts = [
    {
        slug: 'nvidia-rtx-5090-launch',
        title: 'NVIDIA RTX 5090: What We Know So Far',
        excerpt: 'A comprehensive look at the upcoming RTX 5090 graphics card, including expected specs, pricing, and release date.',
        image: '🎮',
        category: 'Graphics Cards',
        author: 'Tech Team',
        date: 'January 15, 2024',
        readTime: '5 min read',
    },
    {
        slug: 'building-first-gaming-pc',
        title: 'Complete Guide to Building Your First Gaming PC in 2024',
        excerpt: 'Everything you need to know about building a gaming PC from scratch, including component selection and assembly tips.',
        image: '🖥️',
        category: 'Guides',
        author: 'Tech Team',
        date: 'January 10, 2024',
        readTime: '12 min read',
    },
    {
        slug: 'ddr5-vs-ddr4',
        title: 'DDR5 vs DDR4: Is It Worth Upgrading?',
        excerpt: 'We compare the latest DDR5 memory with DDR4 to help you decide if it\'s time to upgrade your system.',
        image: '💾',
        category: 'Memory',
        author: 'Tech Team',
        date: 'January 5, 2024',
        readTime: '7 min read',
    },
    {
        slug: 'best-cpu-coolers-2024',
        title: 'Top 10 CPU Coolers for 2024',
        excerpt: 'Our picks for the best air and liquid CPU coolers to keep your processor running cool and quiet.',
        image: '❄️',
        category: 'Cooling',
        author: 'Tech Team',
        date: 'December 28, 2023',
        readTime: '8 min read',
    },
    {
        slug: 'ssd-buying-guide',
        title: 'SSD Buying Guide: NVMe vs SATA',
        excerpt: 'Understanding the differences between NVMe and SATA SSDs to make the right choice for your needs.',
        image: '💿',
        category: 'Storage',
        author: 'Tech Team',
        date: 'December 20, 2023',
        readTime: '6 min read',
    },
    {
        slug: 'pc-cable-management',
        title: 'PC Cable Management: Tips and Tricks',
        excerpt: 'Learn how to achieve clean cable management in your PC build for better airflow and aesthetics.',
        image: '🔌',
        category: 'Guides',
        author: 'Tech Team',
        date: 'December 15, 2023',
        readTime: '5 min read',
    },
]

const categories = ['All', 'Graphics Cards', 'Guides', 'Memory', 'Cooling', 'Storage']

export default function BlogPage() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            X-Tech <span className="text-gradient">Blog</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Stay up to date with the latest tech news, product reviews, and buying guides.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === 'All'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Blog Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post, index) => (
                        <motion.article
                            key={post.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card overflow-hidden group hover:border-primary-500/30 transition-all"
                        >
                            <div className="h-48 bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center text-6xl">
                                {post.image}
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-medium">
                                        {post.category}
                                    </span>
                                    <span className="text-gray-500 text-xs">{post.readTime}</span>
                                </div>
                                <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                                    {post.title}
                                </h2>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        {post.date}
                                    </div>
                                    <span className="text-primary-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                        Read More <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* Newsletter */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-16"
                >
                    <div className="card p-8 md:p-12 text-center bg-gradient-to-r from-primary-900/20 via-dark-800 to-accent/10">
                        <h2 className="text-2xl font-bold text-white mb-2">Subscribe to Our Newsletter</h2>
                        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                            Get the latest tech news and exclusive deals delivered straight to your inbox.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="input flex-1"
                            />
                            <button type="submit" className="btn-primary whitespace-nowrap">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
