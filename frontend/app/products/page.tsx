'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Grid3X3,
    List,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    X,
    ChevronDown,
    Check
} from 'lucide-react'
import { WootwareCard } from '@/components/products/WootwareCard'
import { useProducts, useCategories, useBrands } from '@/lib/api'
import { ProductFilters as FilterType } from '@/lib/types'
import { cn } from '@/lib/utils'

function ProductsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [filters, setFilters] = useState<FilterType>({
        search: searchParams.get('search') || searchParams.get('q') || undefined,
        category: searchParams.get('category') || undefined,
        brand: searchParams.get('brand') || undefined,
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        inStock: searchParams.get('inStock') === 'true',
        supplier: (searchParams.get('supplier') as FilterType['supplier']) || undefined,
        sortBy: (searchParams.get('sortBy') as FilterType['sortBy']) || undefined,
        page: Number(searchParams.get('page')) || 1,
        limit: 24,
    })

    // Fetch data
    const { data: productsData, isLoading, error } = useProducts(filters)
    const { data: categories = [] } = useCategories()
    const { data: brands = [] } = useBrands()

    // Sync filters with URL when URL changes (e.g., clicking header nav links)
    useEffect(() => {
        const urlCategory = searchParams.get('category') || undefined
        const urlSearch = searchParams.get('search') || searchParams.get('q') || undefined
        const urlBrand = searchParams.get('brand') || undefined
        const urlMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
        const urlMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
        const urlInStock = searchParams.get('inStock') === 'true'
        const urlSupplier = searchParams.get('supplier') as FilterType['supplier'] || undefined
        const urlSortBy = searchParams.get('sortBy') as FilterType['sortBy'] || undefined
        const urlPage = Number(searchParams.get('page')) || 1

        // Only update if URL params are different from current filters
        if (
            urlCategory !== filters.category ||
            urlSearch !== filters.search ||
            urlBrand !== filters.brand ||
            urlMinPrice !== filters.minPrice ||
            urlMaxPrice !== filters.maxPrice ||
            urlInStock !== filters.inStock ||
            urlSupplier !== filters.supplier ||
            urlSortBy !== filters.sortBy
        ) {
            setFilters({
                search: urlSearch,
                category: urlCategory,
                brand: urlBrand,
                minPrice: urlMinPrice,
                maxPrice: urlMaxPrice,
                inStock: urlInStock,
                supplier: urlSupplier,
                sortBy: urlSortBy,
                page: urlPage,
                limit: 24,
            })
        }
    }, [searchParams])

    // Update URL when filters change (user interaction)
    useEffect(() => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== false) {
                params.set(key, String(value))
            }
        })
        const newUrl = `/products?${params.toString()}`
        const currentUrl = `/products?${searchParams.toString()}`
        // Only push if URL actually needs to change
        if (newUrl !== currentUrl) {
            router.push(newUrl, { scroll: false })
        }
    }, [filters, router, searchParams])

    const handleFilterChange = (key: keyof FilterType, value: any) => {
        setFilters({ ...filters, [key]: value, page: 1 })
    }

    const clearFilters = () => {
        setFilters({ page: 1, limit: 24 })
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

    const hasActiveFilters = !!(
        filters.search ||
        filters.category ||
        filters.brand ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.inStock ||
        filters.supplier
    )

    // Filter sidebar component
    const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className={cn(
            "space-y-6",
            isMobile ? "" : "sticky top-24"
        )}>
            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Active Filters</span>
                        <button
                            onClick={clearFilters}
                            className="text-xs text-teal-400 hover:text-teal-300"
                        >
                            Clear all
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {filters.search && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded">
                                Search: "{filters.search}"
                                <button onClick={() => handleFilterChange('search', undefined)}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded">
                                {filters.category}
                                <button onClick={() => handleFilterChange('category', undefined)}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.brand && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded">
                                {filters.brand}
                                <button onClick={() => handleFilterChange('brand', undefined)}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.inStock && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded">
                                In Stock
                                <button onClick={() => handleFilterChange('inStock', undefined)}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Categories */}
            <FilterSection title="Categories">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                    {categories.map((category) => (
                        <button
                            key={category.slug}
                            onClick={() => {
                                handleFilterChange('category',
                                    filters.category === category.name ? undefined : category.name
                                )
                                setMobileFiltersOpen(false)
                            }}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                filters.category === category.name
                                    ? "bg-teal-500/20 text-teal-400"
                                    : "text-gray-400 hover:text-white hover:bg-dark-700"
                            )}
                        >
                            <span>{category.name}</span>
                            <span className="text-xs text-gray-500">
                                ({category.count ?? category.productCount ?? 0})
                            </span>
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* Brands */}
            <FilterSection title="Brands">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                    {brands.slice(0, 20).map((brand) => (
                        <button
                            key={brand.slug}
                            onClick={() => {
                                handleFilterChange('brand',
                                    filters.brand === brand.name ? undefined : brand.name
                                )
                                setMobileFiltersOpen(false)
                            }}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                filters.brand === brand.name
                                    ? "bg-teal-500/20 text-teal-400"
                                    : "text-gray-400 hover:text-white hover:bg-dark-700"
                            )}
                        >
                            <span>{brand.name}</span>
                            <span className="text-xs text-gray-500">
                                ({brand.count ?? brand.productCount ?? 0})
                            </span>
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range">
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleFilterChange('minPrice',
                            e.target.value ? Number(e.target.value) : undefined
                        )}
                        className="w-full px-3 py-2 bg-dark-700 border border-gray-700 rounded-lg text-sm text-white focus:border-teal-500 focus:outline-none"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleFilterChange('maxPrice',
                            e.target.value ? Number(e.target.value) : undefined
                        )}
                        className="w-full px-3 py-2 bg-dark-700 border border-gray-700 rounded-lg text-sm text-white focus:border-teal-500 focus:outline-none"
                    />
                </div>
            </FilterSection>

            {/* Availability */}
            <FilterSection title="Availability">
                <label className="flex items-center gap-3 cursor-pointer">
                    <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                        filters.inStock
                            ? "bg-teal-500 border-teal-500"
                            : "border-gray-600"
                    )}>
                        {filters.inStock && <Check className="w-3 h-3 text-black" />}
                    </div>
                    <input
                        type="checkbox"
                        checked={filters.inStock || false}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked || undefined)}
                        className="sr-only"
                    />
                    <span className="text-sm text-gray-300">In Stock Only</span>
                </label>
            </FilterSection>
        </div>
    )

    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            {/* Page Header */}
            <div className="bg-dark-800 border-b border-gray-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">Products</span>
                        {filters.category && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-teal-400">{filters.category}</span>
                            </>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        {filters.category || filters.brand || 'All Products'}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {filters.search
                            ? `Search results for "${filters.search}"`
                            : productsData
                                ? `${productsData.total.toLocaleString()} products found`
                                : 'Browse our complete range'
                        }
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-dark-800 rounded-xl border border-gray-800 p-4">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5 text-teal-400" />
                                Filters
                            </h2>
                            <FilterSidebar />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                {/* Mobile Filter Button */}
                                <button
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white text-sm"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="w-2 h-2 bg-teal-500 rounded-full" />
                                    )}
                                </button>

                                {/* Results count */}
                                <p className="text-sm text-gray-400">
                                    {productsData ? (
                                        <>
                                            Showing{' '}
                                            <span className="text-white">
                                                {((productsData.page - 1) * productsData.limit) + 1}-
                                                {Math.min(productsData.page * productsData.limit, productsData.total)}
                                            </span>
                                            {' '}of{' '}
                                            <span className="text-white">{productsData.total.toLocaleString()}</span>
                                        </>
                                    ) : (
                                        'Loading...'
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Sort */}
                                <select
                                    value={filters.sortBy || ''}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value || undefined)}
                                    className="px-4 py-2 pr-8 bg-dark-800 border border-gray-700 rounded-lg text-white text-sm focus:border-teal-500 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat cursor-pointer"
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
                                            "p-2 transition-colors",
                                            viewMode === 'grid'
                                                ? "bg-teal-500 text-black"
                                                : "bg-dark-800 text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <Grid3X3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={cn(
                                            "p-2 transition-colors",
                                            viewMode === 'list'
                                                ? "bg-teal-500 text-black"
                                                : "bg-dark-800 text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        {isLoading ? (
                            <div className={cn(
                                viewMode === 'grid'
                                    ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                                    : "space-y-4"
                            )}>
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden animate-pulse">
                                        <div className="aspect-square bg-dark-700" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-3 bg-dark-700 rounded w-1/4" />
                                            <div className="h-4 bg-dark-700 rounded w-full" />
                                            <div className="h-4 bg-dark-700 rounded w-3/4" />
                                            <div className="h-6 bg-dark-700 rounded w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <p className="text-red-400 mb-4">Failed to load products</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 bg-teal-500 text-black rounded-lg font-medium hover:bg-teal-400"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : productsData?.items.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-gray-400 text-lg mb-4">No products found</p>
                                <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2 bg-teal-500 text-black rounded-lg font-medium hover:bg-teal-400"
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
                                        ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                                        : "space-y-4"
                                )}
                            >
                                {productsData?.items.map((product) => (
                                    <WootwareCard
                                        key={product.id}
                                        product={product}
                                        variant={viewMode}
                                    />
                                ))}
                            </motion.div>
                        )}

                        {/* Pagination */}
                        {productsData && productsData.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1 sm:gap-2 mt-10">
                                <button
                                    onClick={() => handlePageChange(productsData.page - 1)}
                                    disabled={!productsData.hasPrev}
                                    className="p-2 sm:p-2.5 bg-dark-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {/* Page Numbers - show fewer on mobile */}
                                <div className="hidden sm:flex items-center gap-2">{[...Array(Math.min(5, productsData.totalPages))].map((_, i) => {
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
                                                "w-10 h-10 rounded-lg font-medium text-sm transition-colors",
                                                pageNum === productsData.page
                                                    ? "bg-teal-500 text-black"
                                                    : "bg-dark-800 border border-gray-700 text-white hover:bg-dark-700"
                                            )}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}</div>

                                {/* Mobile: Just show current page */}
                                <div className="flex sm:hidden items-center px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg">
                                    <span className="text-white text-sm font-medium">
                                        {productsData.page} / {productsData.totalPages}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handlePageChange(productsData.page + 1)}
                                    disabled={!productsData.hasNext}
                                    className="p-2 sm:p-2.5 bg-dark-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileFiltersOpen(false)}
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="fixed left-0 top-0 bottom-0 w-80 max-w-full bg-dark-900 z-50 overflow-y-auto lg:hidden"
                    >
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-semibold text-white flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-teal-400" />
                                    Filters
                                </h2>
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="p-2 hover:bg-dark-800 rounded-lg"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                            <FilterSidebar isMobile />
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    )
}

// Filter Section Component
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="border-b border-gray-700/50 pb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-sm font-medium text-white mb-3"
            >
                {title}
                <ChevronDown className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    isOpen ? "rotate-180" : ""
                )} />
            </button>
            {isOpen && children}
        </div>
    )
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    )
}
