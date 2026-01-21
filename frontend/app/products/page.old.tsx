'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Squares2X2Icon,
    ListBulletIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline'
import { ProductCard, ProductFilters } from '@/components/products'
import { useProducts, useCategories, useBrands } from '@/lib/api'
import { ProductFilters as FilterType } from '@/lib/types'
import { cn } from '@/lib/utils'

function ProductsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filters, setFilters] = useState<FilterType>({
        search: searchParams.get('q') || undefined,
        category: searchParams.get('category') || undefined,
        brand: searchParams.get('brand') || undefined,
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        inStock: searchParams.get('inStock') === 'true',
        supplier: (searchParams.get('supplier') as FilterType['supplier']) || undefined,
        sortBy: (searchParams.get('sortBy') as FilterType['sortBy']) || undefined,
        page: Number(searchParams.get('page')) || 1,
        limit: 20,
    })

    // Fetch data
    const { data: productsData, isLoading, error } = useProducts(filters)
    const { data: categories = [] } = useCategories()
    const { data: brands = [] } = useBrands()

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== false) {
                params.set(key, String(value))
            }
        })
        router.push(`/products?${params.toString()}`, { scroll: false })
    }, [filters, router])

    const handleFilterChange = (newFilters: FilterType) => {
        setFilters(newFilters)
    }

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const sortOptions = [
        { value: '', label: 'Default' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'name_asc', label: 'Name: A-Z' },
        { value: 'name_desc', label: 'Name: Z-A' },
        { value: 'newest', label: 'Newest First' },
    ]

    return (
        <div className="min-h-screen bg-dark-900 pt-20">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
                    <p className="text-gray-400">
                        {filters.search
                            ? `Search results for "${filters.search}"`
                            : 'Browse our complete range of computer components'}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    <ProductFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        categories={categories}
                        brands={brands}
                        isLoading={isLoading}
                    />

                    {/* Products Section */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                {/* Mobile Filter Button is rendered inside ProductFilters */}
                                <p className="text-gray-400 text-sm">
                                    {productsData ? (
                                        <>
                                            Showing {((productsData.page - 1) * productsData.limit) + 1}-
                                            {Math.min(productsData.page * productsData.limit, productsData.total)} of{' '}
                                            {productsData.total.toLocaleString()} products
                                        </>
                                    ) : (
                                        'Loading...'
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Sort */}
                                <select
                                    value={filters.sortBy || ''}
                                    onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value as FilterType['sortBy'] })}
                                    className="px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white text-sm
                             focus:outline-none focus:border-primary-500"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {/* View Toggle */}
                                <div className="hidden sm:flex items-center border border-gray-700 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={cn(
                                            'p-2 transition-colors',
                                            viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-dark-800 text-gray-400 hover:text-white'
                                        )}
                                    >
                                        <Squares2X2Icon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={cn(
                                            'p-2 transition-colors',
                                            viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-dark-800 text-gray-400 hover:text-white'
                                        )}
                                    >
                                        <ListBulletIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="card animate-pulse">
                                        <div className="aspect-square bg-dark-700 rounded-lg" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-dark-700 rounded w-1/4" />
                                            <div className="h-4 bg-dark-700 rounded w-3/4" />
                                            <div className="h-4 bg-dark-700 rounded w-1/2" />
                                            <div className="h-10 bg-dark-700 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <p className="text-red-400 mb-4">Failed to load products</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn-primary"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : productsData?.items.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 text-lg mb-4">No products found</p>
                                <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                                <button
                                    onClick={() => handleFilterChange({ page: 1, limit: 20 })}
                                    className="btn-primary"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={cn(
                                    viewMode === 'grid'
                                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                        : 'space-y-4'
                                )}
                            >
                                {productsData?.items.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        variant={viewMode === 'list' ? 'horizontal' : 'default'}
                                    />
                                ))}
                            </motion.div>
                        )}

                        {/* Pagination */}
                        {productsData && productsData.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => handlePageChange(productsData.page - 1)}
                                    disabled={!productsData.hasPrev}
                                    className="p-2 bg-dark-800 border border-gray-700 rounded-lg text-white
                             disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700"
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>

                                {[...Array(Math.min(5, productsData.totalPages))].map((_, i) => {
                                    let pageNum: number
                                    if (productsData.totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (productsData.page <= 3) {
                                        pageNum = i + 1
                                    } else if (productsData.page >= productsData.totalPages - 2) {
                                        pageNum = productsData.totalPages - 4 + i
                                    } else {
                                        pageNum = productsData.page - 2 + i
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={cn(
                                                'w-10 h-10 rounded-lg font-medium transition-colors',
                                                pageNum === productsData.page
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-dark-800 border border-gray-700 text-white hover:bg-dark-700'
                                            )}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}

                                <button
                                    onClick={() => handlePageChange(productsData.page + 1)}
                                    disabled={!productsData.hasNext}
                                    className="p-2 bg-dark-800 border border-gray-700 rounded-lg text-white
                             disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    )
}
