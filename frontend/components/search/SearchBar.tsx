'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useProductSearch } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

export function SearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [isOpen, setIsOpen] = useState(false)
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    // Fetch search results
    const { data: results, isLoading } = useProductSearch(debouncedQuery, isOpen)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle keyboard navigation
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Escape') {
            setIsOpen(false)
            inputRef.current?.blur()
        }
        if (e.key === 'Enter' && query) {
            setIsOpen(false)
            router.push(`/products?q=${encodeURIComponent(query)}`)
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (query) {
            setIsOpen(false)
            router.push(`/products?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <div ref={containerRef} className="relative w-full max-w-lg">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-10 py-2.5 bg-dark-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:border-primary-500
                       focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('')
                                inputRef.current?.focus()
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-dark-700 rounded"
                        >
                            <XMarkIcon className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                </div>
            </form>

            {/* Search Results Dropdown */}
            <AnimatePresence>
                {isOpen && debouncedQuery.length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-gray-700 
                       rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
                    >
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
                                <p className="mt-2">Searching...</p>
                            </div>
                        ) : results && results.length > 0 ? (
                            <div className="divide-y divide-gray-700">
                                {results.slice(0, 5).map((product) => (
                                    <a
                                        key={product.id}
                                        href={`/products/${product.sku}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-4 p-3 hover:bg-dark-700 transition-colors"
                                    >
                                        {product.images[0] && (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-12 h-12 object-contain bg-white rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{product.name}</p>
                                            <p className="text-xs text-gray-400">{product.brand}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-primary-400">
                                            {formatPrice(product.price)}
                                        </p>
                                    </a>
                                ))}
                                {results.length > 5 && (
                                    <button
                                        onClick={() => {
                                            setIsOpen(false)
                                            router.push(`/products?q=${encodeURIComponent(query)}`)
                                        }}
                                        className="w-full p-3 text-center text-sm text-primary-400 hover:bg-dark-700 transition-colors"
                                    >
                                        View all {results.length} results
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-400">
                                <p>No products found for "{debouncedQuery}"</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
