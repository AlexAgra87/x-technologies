'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FunnelIcon,
    XMarkIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline'
import { ProductFilters as FilterType, Category, Brand } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductFiltersProps {
    filters: FilterType
    onFilterChange: (filters: FilterType) => void
    categories: Category[]
    brands: Brand[]
    isLoading?: boolean
}

export function ProductFilters({
    filters,
    onFilterChange,
    categories,
    brands,
    isLoading,
}: ProductFiltersProps) {
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        brands: true,
        price: true,
        stock: true,
        supplier: true,
    })
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
    }

    const updateFilter = (key: keyof FilterType, value: any) => {
        onFilterChange({ ...filters, [key]: value, page: 1 })
    }

    const clearFilters = () => {
        onFilterChange({ page: 1, limit: filters.limit })
    }

    const hasActiveFilters = !!(
        filters.category ||
        filters.brand ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.inStock ||
        filters.supplier
    )

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="w-full text-sm text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2"
                >
                    <XMarkIcon className="h-4 w-4" />
                    Clear all filters
                </button>
            )}

            {/* Categories */}
            <FilterSection
                title="Categories"
                isExpanded={expandedSections.categories}
                onToggle={() => toggleSection('categories')}
            >
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-5 bg-dark-700 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : categories.length === 0 ? (
                        <p className="text-sm text-gray-500">No categories available</p>
                    ) : (
                        categories.map((category) => (
                            <label
                                key={category.slug}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="radio"
                                    name="category"
                                    checked={filters.category === category.name}
                                    onChange={() => updateFilter('category', category.name)}
                                    className="w-4 h-4 text-primary-500 bg-dark-700 border-gray-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-300 group-hover:text-white flex-1">
                                    {category.name}
                                </span>
                                <span className="text-xs text-gray-500">({category.count ?? category.productCount ?? 0})</span>
                            </label>
                        ))
                    )}
                </div>
                {filters.category && (
                    <button
                        onClick={() => updateFilter('category', undefined)}
                        className="mt-2 text-xs text-primary-400 hover:text-primary-300"
                    >
                        Clear category
                    </button>
                )}
            </FilterSection>

            {/* Brands */}
            <FilterSection
                title="Brands"
                isExpanded={expandedSections.brands}
                onToggle={() => toggleSection('brands')}
            >
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-5 bg-dark-700 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : brands.length === 0 ? (
                        <p className="text-sm text-gray-500">No brands available</p>
                    ) : (
                        brands.slice(0, 20).map((brand) => (
                            <label
                                key={brand.slug}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="radio"
                                    name="brand"
                                    checked={filters.brand === brand.name}
                                    onChange={() => updateFilter('brand', brand.name)}
                                    className="w-4 h-4 text-primary-500 bg-dark-700 border-gray-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-300 group-hover:text-white flex-1">
                                    {brand.name}
                                </span>
                                <span className="text-xs text-gray-500">({brand.count ?? brand.productCount ?? 0})</span>
                            </label>
                        ))
                    )}
                </div>
                {filters.brand && (
                    <button
                        onClick={() => updateFilter('brand', undefined)}
                        className="mt-2 text-xs text-primary-400 hover:text-primary-300"
                    >
                        Clear brand
                    </button>
                )}
            </FilterSection>

            {/* Price Range */}
            <FilterSection
                title="Price Range"
                isExpanded={expandedSections.price}
                onToggle={() => toggleSection('price')}
            >
                <div className="flex gap-2">
                    <div className="flex-1">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice || ''}
                            onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded text-sm text-white
                         focus:outline-none focus:border-primary-500"
                        />
                    </div>
                    <span className="text-gray-500 self-center">-</span>
                    <div className="flex-1">
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice || ''}
                            onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded text-sm text-white
                         focus:outline-none focus:border-primary-500"
                        />
                    </div>
                </div>
            </FilterSection>

            {/* Stock Status */}
            <FilterSection
                title="Availability"
                isExpanded={expandedSections.stock}
                onToggle={() => toggleSection('stock')}
            >
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.inStock || false}
                        onChange={(e) => updateFilter('inStock', e.target.checked || undefined)}
                        className="w-4 h-4 text-primary-500 bg-dark-700 border-gray-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">In Stock Only</span>
                </label>
            </FilterSection>

            {/* Supplier */}
            <FilterSection
                title="Supplier"
                isExpanded={expandedSections.supplier}
                onToggle={() => toggleSection('supplier')}
            >
                <div className="space-y-2">
                    {['all', 'syntech', 'rct'].map((supplier) => (
                        <label
                            key={supplier}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <input
                                type="radio"
                                name="supplier"
                                checked={(filters.supplier || 'all') === supplier}
                                onChange={() => updateFilter('supplier', supplier as any)}
                                className="w-4 h-4 text-primary-500 bg-dark-700 border-gray-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-300 group-hover:text-white capitalize">
                                {supplier === 'all' ? 'All Suppliers' : supplier}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </div>
    )

    return (
        <>
            {/* Mobile Filter Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white"
            >
                <FunnelIcon className="h-5 w-5" />
                Filters
                {hasActiveFilters && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full" />
                )}
            </button>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24 glass p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5" />
                        Filters
                    </h2>
                    <FilterContent />
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-full bg-dark-900 z-50 overflow-y-auto"
                        >
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <FunnelIcon className="h-5 w-5" />
                                        Filters
                                    </h2>
                                    <button
                                        onClick={() => setIsMobileOpen(false)}
                                        className="p-2 hover:bg-dark-800 rounded-lg"
                                    >
                                        <XMarkIcon className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                                <FilterContent />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

interface FilterSectionProps {
    title: string
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
    return (
        <div className="border-b border-gray-700 pb-4">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between text-white font-medium mb-3"
            >
                {title}
                {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4" />
                ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                )}
            </button>
            <motion.div
                initial={false}
                animate={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
            >
                {children}
            </motion.div>
        </div>
    )
}
