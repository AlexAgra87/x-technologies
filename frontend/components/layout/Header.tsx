'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    ChevronDown,
    Cpu,
    HardDrive,
    Monitor,
    Keyboard,
    Headphones,
    Gamepad2,
    Router,
    Battery,
    Tag,
    Phone,
    Heart,
    MemoryStick,
    CircuitBoard,
    Box,
    Fan,
    Database,
    Server,
    Mouse,
    Wifi,
    Tv,
    Package,
    Layers,
    Zap,
    LucideIcon
} from 'lucide-react'
import { Loader2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { Product } from '@/lib/types'
import { ProductImage } from '@/components/ui/ProductImage'
import { formatPrice } from '@/lib/utils'

// API URL for fetching categories
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Proper PC component categories with their API category names
// These use the ACTUAL category names from the suppliers
const megaMenuCategories = [
    {
        title: 'Components',
        items: [
            { name: 'Graphics Cards', category: 'Graphics cards', icon: Gamepad2 },
            { name: 'Processors / CPUs', category: 'CPU', icon: Cpu },
            { name: 'Memory / RAM', category: 'Memory', icon: MemoryStick },
            { name: 'Motherboards', category: 'Motherboards', icon: CircuitBoard },
            { name: 'Power Supplies', category: 'Power supplies', icon: Battery },
            { name: 'PC Cases', category: 'Chassis', icon: Box },
            { name: 'Cooling', category: 'Cooling', icon: Fan },
        ]
    },
    {
        title: 'Storage',
        items: [
            { name: 'SSDs', category: 'Solid state drives', icon: HardDrive },
            { name: 'Hard Drives', category: 'Hard disk drives', icon: Database },
            { name: 'External Storage', category: 'External SSDs', icon: HardDrive },
            { name: 'Flash Drives', category: 'Flash drives', icon: Database },
            { name: 'NAS Devices', category: 'Synology', icon: Server },
        ]
    },
    {
        title: 'Peripherals',
        items: [
            { name: 'Monitors', category: 'Monitors', icon: Monitor },
            { name: 'Keyboards', category: 'Keyboards', icon: Keyboard },
            { name: 'Mice', category: 'Mice', icon: Mouse },
            { name: 'Headsets', category: 'Headsets', icon: Headphones },
            { name: 'Gaming Peripherals', category: 'Gaming keyboards', icon: Gamepad2 },
        ]
    },
    {
        title: 'Networking & More',
        items: [
            { name: 'Networking', category: 'Networking & security', icon: Router },
            { name: 'Cables', category: 'Cables', icon: Wifi },
            { name: 'TV & Audio', category: 'TV & audio', icon: Tv },
            { name: 'Portable Power', category: 'Portable Power', icon: Zap },
            { name: 'Accessories', category: 'Accessories', icon: Package },
        ]
    }
]

// Quick links for navigation bar - using actual category names
const quickLinks = [
    { name: 'Graphics Cards', category: 'Graphics cards' },
    { name: 'CPUs', category: 'CPU' },
    { name: 'Memory', category: 'Memory' },
    { name: 'Monitors', category: 'Monitors' },
    { name: 'Storage', category: 'Solid state drives' },
]

interface CategoryCount {
    name: string
    count: number
}

export function Header() {
    const router = useRouter()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showMegaMenu, setShowMegaMenu] = useState(false)
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
    const { itemCount } = useCart()

    // Search suggestions state
    const [searchResults, setSearchResults] = useState<Product[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showSearchDropdown, setShowSearchDropdown] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        if (searchQuery.trim().length < 2) {
            setSearchResults([])
            setShowSearchDropdown(false)
            return
        }

        setIsSearching(true)
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(searchQuery)}&limit=6`)
                const data = await response.json()
                if (data.success && data.data) {
                    setSearchResults(data.data)
                    setShowSearchDropdown(true)
                }
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchQuery])

    // Fetch category counts from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products/categories`)
                const data = await response.json()
                if (data.success && data.data) {
                    const counts: Record<string, number> = {}
                    data.data.forEach((cat: CategoryCount) => {
                        counts[cat.name.toLowerCase()] = cat.count
                    })
                    setCategoryCounts(counts)
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error)
            }
        }

        fetchCategories()
        // Refresh every 5 minutes
        const interval = setInterval(fetchCategories, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
            setShowSearchDropdown(false)
            setIsMobileMenuOpen(false)
        }
    }

    const handleSearchResultClick = (product: Product) => {
        router.push(`/products/${encodeURIComponent(product.sku)}`)
        setSearchQuery('')
        setShowSearchDropdown(false)
    }

    // Get count for a category (case-insensitive lookup)
    const getCount = (category: string): number => {
        return categoryCounts[category.toLowerCase()] || 0
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Top Bar - Contact/Info */}
            <div className="bg-dark-900 border-b border-gray-800 hidden md:block">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-8 text-xs">
                        <div className="flex items-center gap-4 text-gray-400">
                            <span>Premium Computer Components</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/contact" className="text-gray-400 hover:text-teal-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                Contact Us
                            </Link>
                            <Link href="/deals" className="text-teal-400 hover:text-teal-300 flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                Deals
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className={cn(
                "transition-all duration-300",
                isScrolled
                    ? "bg-dark-800/95 backdrop-blur-xl border-b border-gray-800"
                    : "bg-dark-800 border-b border-gray-800"
            )}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                            <div className="relative w-9 h-9 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg rotate-45 group-hover:rotate-[55deg] transition-transform duration-300" />
                                <span className="relative font-bold text-lg text-white">X</span>
                            </div>
                            <span className="font-bold text-xl">
                                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">X-Tech</span>
                            </span>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-8 relative">
                            <form onSubmit={handleSearch} className="w-full">
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                                        placeholder="Search for products..."
                                        className="w-full pl-4 pr-12 py-2.5 bg-dark-700 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-1 top-1 bottom-1 px-3 bg-teal-500 text-black rounded-md hover:bg-teal-400 transition-colors"
                                    >
                                        {isSearching ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Search className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Search Suggestions Dropdown */}
                            {showSearchDropdown && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                                    <div className="p-2 border-b border-gray-700">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            Suggestions for "{searchQuery}"
                                        </span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {searchResults.map((product) => (
                                            <button
                                                key={product.sku}
                                                onClick={() => handleSearchResultClick(product)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-dark-700 transition-colors text-left"
                                            >
                                                <div className="w-12 h-12 bg-white rounded flex-shrink-0 relative overflow-hidden">
                                                    <ProductImage
                                                        src={product.images?.[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white truncate">{product.name}</p>
                                                    <p className="text-xs text-gray-400">{product.brand}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-bold text-teal-400">{formatPrice(product.price)}</p>
                                                    {product.originalPrice && product.originalPrice > product.price && (
                                                        <p className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleSearch as any}
                                        className="w-full p-3 bg-dark-700 text-teal-400 text-sm font-medium hover:bg-dark-600 transition-colors border-t border-gray-700"
                                    >
                                        View all results for "{searchQuery}"
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1">
                            {/* Wishlist */}
                            <Link href="/wishlist" className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors">
                                <Heart className="w-5 h-5" />
                                <span className="text-sm hidden lg:inline">Wishlist</span>
                            </Link>

                            {/* Account */}
                            <Link href="/account" className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors">
                                <User className="w-5 h-5" />
                                <span className="text-sm hidden lg:inline">Account</span>
                            </Link>

                            {/* Cart */}
                            <Link href="/cart" className="flex items-center gap-2 px-3 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400 hover:bg-teal-500/20 transition-colors">
                                <ShoppingCart className="w-5 h-5" />
                                <span className="text-sm font-medium">Cart</span>
                                {itemCount > 0 && (
                                    <span className="w-5 h-5 bg-teal-500 text-black rounded-full text-xs flex items-center justify-center font-bold">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden ml-2 p-2 text-gray-400 hover:text-white"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="hidden lg:block bg-dark-900 border-b border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-1 h-12">
                        {/* All Products Mega Menu */}
                        <div
                            className="relative"
                            onMouseEnter={() => setShowMegaMenu(true)}
                            onMouseLeave={() => setShowMegaMenu(false)}
                        >
                            <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-black font-medium rounded-lg hover:bg-teal-400 transition-colors">
                                <Menu className="w-4 h-4" />
                                All Products
                                <ChevronDown className={cn(
                                    "w-4 h-4 transition-transform",
                                    showMegaMenu ? "rotate-180" : ""
                                )} />
                            </button>

                            {/* Mega Menu */}
                            {showMegaMenu && (
                                <div className="absolute top-full left-0 pt-2 z-50">
                                    <div className="bg-dark-800 border border-gray-700 rounded-xl shadow-2xl p-6 w-[750px]">
                                        <div className="grid grid-cols-4 gap-6">
                                            {megaMenuCategories.map((group) => (
                                                <div key={group.title}>
                                                    <h3 className="font-semibold text-teal-400 mb-3 text-sm">
                                                        {group.title}
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {group.items.map((item) => {
                                                            const Icon = item.icon
                                                            const count = getCount(item.category)
                                                            return (
                                                                <li key={item.name}>
                                                                    <Link
                                                                        href={`/products?category=${encodeURIComponent(item.category)}`}
                                                                        onClick={() => setShowMegaMenu(false)}
                                                                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                                                                    >
                                                                        <Icon className="w-4 h-4 text-gray-500 group-hover:text-teal-400 transition-colors" />
                                                                        <span>{item.name}</span>
                                                                        {count > 0 && (
                                                                            <span className="text-xs text-gray-600">({count})</span>
                                                                        )}
                                                                    </Link>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                                            <Link
                                                href="/products"
                                                onClick={() => setShowMegaMenu(false)}
                                                className="inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
                                            >
                                                <Layers className="w-4 h-4" />
                                                View All Products →
                                            </Link>
                                            <span className="text-xs text-gray-500">
                                                Updated with live stock
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        {quickLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={`/products?category=${encodeURIComponent(link.category)}`}
                                className="px-4 py-2 text-sm text-gray-300 hover:text-teal-400 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        <Link href="/deals" className="px-4 py-2 text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium">
                            Hot Deals 🔥
                        </Link>
                        <Link href="/about" className="px-4 py-2 text-sm text-gray-300 hover:text-teal-400 transition-colors">
                            About
                        </Link>
                        <Link href="/contact" className="px-4 py-2 text-sm text-gray-300 hover:text-teal-400 transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-dark-800 border-b border-gray-800 max-h-[70vh] overflow-y-auto">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full pl-4 pr-12 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </form>

                        {/* Mobile Navigation */}
                        <nav className="space-y-1">
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 text-white hover:bg-dark-700 rounded-lg"
                            >
                                Home
                            </Link>
                            <Link
                                href="/products"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 text-white hover:bg-dark-700 rounded-lg"
                            >
                                All Products
                            </Link>

                            {/* Mobile Categories */}
                            {megaMenuCategories.map((group) => (
                                <div key={group.title}>
                                    <p className="px-4 py-2 text-xs text-teal-400 font-medium uppercase tracking-wide">
                                        {group.title}
                                    </p>
                                    {group.items.slice(0, 4).map((item) => (
                                        <Link
                                            key={item.name}
                                            href={`/products?category=${encodeURIComponent(item.category)}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg text-sm"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            ))}

                            <Link
                                href="/deals"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 text-orange-400 hover:bg-dark-700 rounded-lg font-medium"
                            >
                                Hot Deals 🔥
                            </Link>
                            <Link
                                href="/contact"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 text-white hover:bg-dark-700 rounded-lg"
                            >
                                Contact
                            </Link>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    )
}
