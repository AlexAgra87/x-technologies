'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    Package,
    Clock,
    Check,
    Truck,
    X,
    Search,
    RefreshCw,
    AlertCircle,
    LogOut,
    ExternalLink,
    Copy,
    CheckCircle,
    Mail,
    Phone,
    MapPin,
    FileText,
    MessageCircle,
    ShoppingBag,
    TrendingUp,
    Users,
    CreditCard,
    LayoutDashboard,
    Settings,
    Bell,
    Download,
    Eye,
    History,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Building2,
    Save,
    Link2,
    Store,
    Plus,
    Trash2,
    Send
} from 'lucide-react'
import { siteSettings } from '@/lib/site-settings'
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '@/lib/types/user'
import { formatPrice } from '@/lib/utils'
import { downloadInvoice } from '@/lib/pdf-invoice'
import { useQuote, QuoteRequest } from '@/lib/quote-context'
import { ProductImage } from '@/components/ui/ProductImage'

const ORDERS_KEY = 'xtech-orders'
const ADMIN_KEY = 'xtech-admin-auth'
const BANKING_KEY = 'xtech-banking-settings'

type AdminTab = 'orders' | 'history' | 'quotes' | 'settings'

interface BankingSettings {
    bankName: string
    accountName: string
    accountNumber: string
    branchCode: string
    accountType: string
    swiftCode: string
}

const ADMIN_CREDENTIALS = {
    email: 'admin@x-tech.co.za',
    password: 'admin123'
}

// Generate auth header for API calls
const getAdminAuthHeader = () => {
    const authString = `${ADMIN_CREDENTIALS.email}:${ADMIN_CREDENTIALS.password}`
    return Buffer.from(authString).toString('base64')
}

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { value: 'pending_payment', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" /> },
    { value: 'payment_received', label: 'Paid', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { value: 'processing', label: 'Processing', icon: <Package className="w-3.5 h-3.5" /> },
    { value: 'ordered', label: 'Ordered', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { value: 'shipped', label: 'Shipped', icon: <Truck className="w-3.5 h-3.5" /> },
    { value: 'delivered', label: 'Delivered', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    { value: 'cancelled', label: 'Cancelled', icon: <X className="w-3.5 h-3.5" /> },
]

// Supplier options with portal URLs
const SUPPLIERS = [
    { value: 'Syntech', label: 'Syntech', portalUrl: 'https://www.syntech.co.za' },
    { value: 'RCT', label: 'RCT', portalUrl: 'https://www.rfrct.co.za' },
    { value: 'Frontosa', label: 'Frontosa', portalUrl: 'https://www.frontosa.co.za' },
    { value: 'Rectron', label: 'Rectron', portalUrl: 'https://www.rectron.co.za' },
    { value: 'Pinnacle', label: 'Pinnacle', portalUrl: 'https://www.pinnacle.co.za' },
    { value: 'Other', label: 'Other', portalUrl: '' },
]

// Courier options with tracking URL templates
const COURIERS = [
    { value: 'The Courier Guy', label: 'The Courier Guy', trackingUrl: 'https://www.thecourierguy.co.za/track?reference=' },
    { value: 'RAM', label: 'RAM Hand-to-Hand', trackingUrl: 'https://www.ram.co.za/track/?waybill=' },
    { value: 'Aramex', label: 'Aramex', trackingUrl: 'https://www.aramex.co.za/track/?shipment=' },
    { value: 'DPD Laser', label: 'DPD Laser', trackingUrl: 'https://www.dpd.co.za/tracking/' },
    { value: 'Fastway', label: 'Fastway', trackingUrl: 'https://www.fastway.co.za/track/?label=' },
    { value: 'PostNet', label: 'PostNet', trackingUrl: 'https://www.postnet.co.za/track/' },
    { value: 'Pudo', label: 'Pudo', trackingUrl: 'https://www.pudo.co.za/track/' },
    { value: 'Supplier Direct', label: 'Supplier Direct Delivery', trackingUrl: '' },
    { value: 'Other', label: 'Other', trackingUrl: '' },
]

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all' | 'active'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [copiedRef, setCopiedRef] = useState<string | null>(null)
    const [showNotifications, setShowNotifications] = useState(false)
    const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([])

    // Login state
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginError, setLoginError] = useState('')

    // New features state
    const [activeTab, setActiveTab] = useState<AdminTab>('orders')
    const [historyMonth, setHistoryMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })
    const [bankingSettings, setBankingSettings] = useState<BankingSettings>({
        bankName: siteSettings.banking.bankName,
        accountName: siteSettings.banking.accountName,
        accountNumber: siteSettings.banking.accountNumber,
        branchCode: siteSettings.banking.branchCode,
        accountType: siteSettings.banking.accountType,
        swiftCode: siteSettings.banking.swiftCode
    })
    const [bankingSaved, setBankingSaved] = useState(false)

    // Modal state for supplier/shipping info
    const [showSupplierModal, setShowSupplierModal] = useState(false)
    const [showShippingModal, setShowShippingModal] = useState(false)
    const [supplierFormData, setSupplierFormData] = useState({ supplierName: 'Syntech', supplierOrderRef: '' })
    const [shippingFormData, setShippingFormData] = useState({ courierName: 'The Courier Guy', trackingNumber: '' })

    // Quote management
    const { requests: quoteRequests, pendingCount: pendingQuotesCount, updateQuoteStatus, deleteQuoteRequest } = useQuote()
    const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null)
    const [quoteFormData, setQuoteFormData] = useState({ adminNotes: '' })
    const [quotedItems, setQuotedItems] = useState<{ description: string; price: string }[]>([{ description: '', price: '' }])
    const [isSendingQuote, setIsSendingQuote] = useState(false)
    const [quoteStatusFilter, setQuoteStatusFilter] = useState<'all' | 'pending' | 'quoted' | 'accepted' | 'rejected'>('all')
    const [showDeleteQuoteModal, setShowDeleteQuoteModal] = useState(false)
    const [quoteToDelete, setQuoteToDelete] = useState<QuoteRequest | null>(null)

    useEffect(() => {
        const isAdmin = localStorage.getItem(ADMIN_KEY) === 'true'
        setIsAuthenticated(isAdmin)
        if (isAdmin) loadData()
        // Load dismissed notifications from localStorage
        const dismissed = localStorage.getItem('xtech-dismissed-notifications')
        if (dismissed) setDismissedNotifications(JSON.parse(dismissed))
        setIsLoading(false)
    }, [])

    // Auto-refresh orders every 30 seconds when authenticated
    useEffect(() => {
        if (!isAuthenticated) return

        const interval = setInterval(() => {
            loadData(true) // silent refresh
        }, 30000) // 30 seconds

        return () => clearInterval(interval)
    }, [isAuthenticated])

    const dismissNotification = (key: string) => {
        if (!dismissedNotifications.includes(key)) {
            const newDismissed = [...dismissedNotifications, key]
            setDismissedNotifications(newDismissed)
            localStorage.setItem('xtech-dismissed-notifications', JSON.stringify(newDismissed))
        }
    }

    const dismissAllNotifications = () => {
        const allKeys = ['pending', 'toProcess', 'shipped']
        setDismissedNotifications(allKeys)
        localStorage.setItem('xtech-dismissed-notifications', JSON.stringify(allKeys))
    }

    const clearAllDismissed = () => {
        setDismissedNotifications([])
        localStorage.removeItem('xtech-dismissed-notifications')
    }

    const loadData = async (silent = false) => {
        if (!silent) setIsRefreshing(true)
        let loadedOrders: Order[] = []

        try {
            const response = await fetch('/api/admin/orders', {
                headers: {
                    'x-admin-auth': getAdminAuthHeader()
                }
            })
            if (response.ok) {
                const data = await response.json()
                if (data.orders?.length > 0) {
                    // API orders are the source of truth
                    loadedOrders = data.orders
                }
            }
        } catch (e) {
            // Fallback to localStorage if API fails
            loadedOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]
        }

        // Also check localStorage for any orders not in API (e.g., created offline)
        const localOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]
        const apiRefs = new Set(loadedOrders.map(o => o.orderRef))
        const localOnlyOrders = localOrders.filter(o => o.orderRef && !apiRefs.has(o.orderRef))
        loadedOrders = [...loadedOrders, ...localOnlyOrders]

        setOrders(loadedOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()))
        if (!silent) setIsRefreshing(false)
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (loginEmail === ADMIN_CREDENTIALS.email && loginPassword === ADMIN_CREDENTIALS.password) {
            localStorage.setItem(ADMIN_KEY, 'true')
            setIsAuthenticated(true)
            loadData()
        } else {
            setLoginError('Invalid credentials')
        }
    }

    const updateOrderStatus = async (
        orderId: string,
        newStatus: OrderStatus,
        extraData?: {
            supplierName?: string;
            supplierOrderRef?: string;
            courierName?: string;
            trackingNumber?: string;
            trackingUrl?: string;
        }
    ) => {
        const updatedOrders = orders.map(o => {
            if (o.id === orderId) {
                const updated: Order = { ...o, status: newStatus, updatedAt: new Date().toISOString() }
                if (newStatus === 'payment_received') updated.paidAt = updated.paidAt || new Date().toISOString()
                if (newStatus === 'ordered') {
                    updated.orderedAt = updated.orderedAt || new Date().toISOString()
                    if (extraData?.supplierName) updated.supplierName = extraData.supplierName
                    if (extraData?.supplierOrderRef) updated.supplierOrderRef = extraData.supplierOrderRef
                }
                if (newStatus === 'shipped') {
                    updated.shippedAt = updated.shippedAt || new Date().toISOString()
                    if (extraData?.courierName) updated.courierName = extraData.courierName
                    if (extraData?.trackingNumber) updated.trackingNumber = extraData.trackingNumber
                    if (extraData?.trackingUrl) updated.trackingUrl = extraData.trackingUrl
                }
                if (newStatus === 'delivered') updated.deliveredAt = updated.deliveredAt || new Date().toISOString()
                return updated
            }
            return o
        })
        setOrders(updatedOrders)
        localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders))
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(updatedOrders.find(o => o.id === orderId) || null)
        }
        const order = orders.find(o => o.id === orderId)
        if (order) {
            try {
                await fetch('/api/orders', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-auth': getAdminAuthHeader()
                    },
                    body: JSON.stringify({
                        orderId,
                        userId: order.userId,
                        status: newStatus,
                        ...extraData
                    }),
                })

                // Send email notifications for status changes
                const emailOrderData = {
                    orderId: order.orderRef,
                    items: order.items.map(item => ({
                        name: item.name,
                        sku: item.sku,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    subtotal: order.subtotal,
                    shipping: order.shippingCost,
                    vat: order.subtotal * 0.15,
                    total: order.total,
                    customer: {
                        name: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Customer',
                        email: order.shippingAddress?.email || '',
                        phone: order.shippingAddress?.phone || '',
                    },
                    shippingAddress: {
                        street: order.shippingAddress?.address || '',
                        city: order.shippingAddress?.city || '',
                        province: order.shippingAddress?.province || '',
                        postalCode: order.shippingAddress?.postalCode || '',
                    },
                    paymentMethod: 'eft' as const,
                }

                // Only send email if customer email exists
                if (order.shippingAddress?.email) {
                    if (newStatus === 'payment_received') {
                        await fetch('/api/orders/email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ order: emailOrderData, type: 'payment' }),
                        })
                    } else if (newStatus === 'shipped') {
                        await fetch('/api/orders/email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                order: emailOrderData,
                                type: 'shipping',
                                trackingNumber: extraData?.trackingNumber || '',
                                courier: extraData?.courierName || 'Courier',
                            }),
                        })
                    } else if (newStatus === 'delivered') {
                        await fetch('/api/orders/email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ order: emailOrderData, type: 'delivered' }),
                        })
                    }
                }
            } catch (e) { }
        }
    }

    // Handle marking as ordered with supplier info
    const handleMarkAsOrdered = () => {
        if (!selectedOrder) return
        const courier = COURIERS.find(c => c.value === shippingFormData.courierName)
        const trackingUrl = courier?.trackingUrl && shippingFormData.trackingNumber
            ? courier.trackingUrl + shippingFormData.trackingNumber
            : ''
        updateOrderStatus(selectedOrder.id, 'ordered', {
            supplierName: supplierFormData.supplierName,
            supplierOrderRef: supplierFormData.supplierOrderRef
        })
        setShowSupplierModal(false)
        setSupplierFormData({ supplierName: 'Syntech', supplierOrderRef: '' })
    }

    // Handle marking as shipped with tracking info
    const handleMarkAsShipped = () => {
        if (!selectedOrder) return
        const courier = COURIERS.find(c => c.value === shippingFormData.courierName)
        const trackingUrl = courier?.trackingUrl && shippingFormData.trackingNumber
            ? courier.trackingUrl + shippingFormData.trackingNumber
            : ''
        updateOrderStatus(selectedOrder.id, 'shipped', {
            courierName: shippingFormData.courierName,
            trackingNumber: shippingFormData.trackingNumber,
            trackingUrl
        })
        setShowShippingModal(false)
        setShippingFormData({ courierName: 'The Courier Guy', trackingNumber: '' })
    }

    const copyToClipboard = useCallback((text: string, ref: string) => {
        navigator.clipboard.writeText(text)
        setCopiedRef(ref)
        setTimeout(() => setCopiedRef(null), 2000)
    }, [])

    // Memoize filtered orders for performance
    const filteredOrders = useMemo(() => orders.filter(order => {
        let matchesStatus = false
        if (filterStatus === 'all') {
            matchesStatus = true
        } else if (filterStatus === 'active') {
            matchesStatus = ['processing', 'ordered', 'shipped'].includes(order.status)
        } else {
            matchesStatus = order.status === filterStatus
        }
        const matchesSearch = searchQuery === '' ||
            order.orderRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    }), [orders, filterStatus, searchQuery])

    // Memoize stats calculation for performance
    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending_payment').length,
        toProcess: orders.filter(o => o.status === 'payment_received').length,
        active: orders.filter(o => ['processing', 'ordered', 'shipped'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'delivered').length,
        revenue: orders.filter(o => !['cancelled', 'pending_payment'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0),
    }), [orders])

    // Memoize shipped count for notifications
    const shippedCount = useMemo(() => orders.filter(o => o.status === 'shipped').length, [orders])

    // Memoize unread notification count
    const unreadNotificationCount = useMemo(() =>
        (stats.pending > 0 && !dismissedNotifications.includes('pending') ? 1 : 0) +
        (stats.toProcess > 0 && !dismissedNotifications.includes('toProcess') ? 1 : 0) +
        (shippedCount > 0 && !dismissedNotifications.includes('shipped') ? 1 : 0)
        , [stats.pending, stats.toProcess, shippedCount, dismissedNotifications])

    // History helpers
    const getHistoryOrders = useCallback(() => {
        const [year, month] = historyMonth.split('-').map(Number)
        return orders.filter(order => {
            const orderDate = new Date(order.createdAt)
            return orderDate.getFullYear() === year && orderDate.getMonth() + 1 === month
        })
    }, [orders, historyMonth])

    const historyOrders = getHistoryOrders()

    const monthlyStats = {
        total: historyOrders.length,
        completed: historyOrders.filter(o => o.status === 'delivered').length,
        cancelled: historyOrders.filter(o => o.status === 'cancelled').length,
        revenue: historyOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
    }

    const getPrevMonth = () => {
        const [year, month] = historyMonth.split('-').map(Number)
        if (month === 1) return `${year - 1}-12`
        return `${year}-${String(month - 1).padStart(2, '0')}`
    }

    const getNextMonth = () => {
        const [year, month] = historyMonth.split('-').map(Number)
        if (month === 12) return `${year + 1}-01`
        return `${year}-${String(month + 1).padStart(2, '0')}`
    }

    const formatMonthDisplay = (monthStr: string) => {
        const [year, month] = monthStr.split('-').map(Number)
        const date = new Date(year, month - 1)
        return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' })
    }

    // Banking helpers
    const loadBankingSettings = () => {
        const saved = localStorage.getItem(BANKING_KEY)
        if (saved) {
            try {
                setBankingSettings(JSON.parse(saved))
            } catch (e) { }
        }
    }

    const saveBankingSettings = () => {
        localStorage.setItem(BANKING_KEY, JSON.stringify(bankingSettings))
        setBankingSaved(true)
        setTimeout(() => setBankingSaved(false), 3000)
    }

    // Load banking settings on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadBankingSettings()
        }
    }, [isAuthenticated])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-gray-800 border-t-teal-500 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-gradient-to-b from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
                                <LayoutDashboard className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">X-Tech Admin</h1>
                            <p className="text-gray-500 text-sm mt-1">Sign in to manage your orders</p>
                        </div>

                        {loginError && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3" role="alert">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                <span>{loginError}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4" aria-label="Admin login form">
                            <div>
                                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                <input
                                    id="admin-email"
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="admin@x-tech.co.za"
                                    required
                                    autoComplete="email"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <input
                                    id="admin-password"
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-400 hover:to-teal-500 transition-all shadow-lg shadow-teal-500/25 mt-2"
                            >
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Top Navigation */}
            <header className="h-16 bg-[#0f0f15]/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50" role="banner">
                <div className="h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20" aria-hidden="true">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">X-Tech Admin</h1>
                            <p className="text-xs text-gray-500">Order Management</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 bg-gray-800/30 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders'
                                ? 'bg-teal-500 text-black'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history'
                                ? 'bg-teal-500 text-black'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            History
                        </button>
                        <button
                            onClick={() => setActiveTab('quotes')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${activeTab === 'quotes'
                                ? 'bg-teal-500 text-black'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Quotes
                            {pendingQuotesCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {pendingQuotesCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings'
                                ? 'bg-teal-500 text-black'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors"
                                aria-label={`Notifications${unreadNotificationCount > 0 ? ` (${unreadNotificationCount} unread)` : ''}`}
                                aria-expanded={showNotifications}
                                aria-haspopup="true"
                            >
                                <Bell className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                {unreadNotificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium animate-pulse" aria-hidden="true">
                                        {unreadNotificationCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden" role="menu" aria-label="Notifications menu">
                                    <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                                        <h3 className="font-semibold text-white" id="notifications-heading">Notifications</h3>
                                        {(stats.pending > 0 || stats.toProcess > 0 || shippedCount > 0) && (
                                            <button
                                                onClick={() => {
                                                    dismissAllNotifications();
                                                    setShowNotifications(false);
                                                }}
                                                className="text-xs text-teal-400 hover:text-teal-300"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {stats.pending > 0 && !dismissedNotifications.includes('pending') && (
                                            <button
                                                onClick={() => { setFilterStatus('pending_payment'); setShowNotifications(false); }}
                                                className="w-full p-3 flex items-start gap-3 hover:bg-gray-800/50 transition-colors text-left border-b border-gray-800/50"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                                    <Clock className="w-4 h-4 text-yellow-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{stats.pending} Awaiting Payment</p>
                                                    <p className="text-gray-500 text-xs">Orders waiting for customer payment</p>
                                                </div>
                                            </button>
                                        )}
                                        {stats.toProcess > 0 && !dismissedNotifications.includes('toProcess') && (
                                            <button
                                                onClick={() => { setFilterStatus('payment_received'); setShowNotifications(false); }}
                                                className="w-full p-3 flex items-start gap-3 hover:bg-gray-800/50 transition-colors text-left border-b border-gray-800/50"
                                                role="menuitem"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                                    <CreditCard className="w-4 h-4 text-red-400" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{stats.toProcess} Ready to Process</p>
                                                    <p className="text-gray-500 text-xs">Paid orders needing your attention</p>
                                                </div>
                                            </button>
                                        )}
                                        {shippedCount > 0 && !dismissedNotifications.includes('shipped') && (
                                            <button
                                                onClick={() => { setFilterStatus('shipped'); setShowNotifications(false); }}
                                                className="w-full p-3 flex items-start gap-3 hover:bg-gray-800/50 transition-colors text-left border-b border-gray-800/50"
                                                role="menuitem"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                    <Truck className="w-4 h-4 text-purple-400" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{shippedCount} In Transit</p>
                                                    <p className="text-gray-500 text-xs">Orders shipped, awaiting delivery</p>
                                                </div>
                                            </button>
                                        )}
                                        {(dismissedNotifications.includes('pending') || stats.pending === 0) &&
                                            (dismissedNotifications.includes('toProcess') || stats.toProcess === 0) &&
                                            (dismissedNotifications.includes('shipped') || shippedCount === 0) && (
                                                <div className="p-6 text-center text-gray-500">
                                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                                                    <p className="text-sm">All caught up!</p>
                                                    {dismissedNotifications.length > 0 && (
                                                        <button
                                                            onClick={clearAllDismissed}
                                                            className="mt-2 text-xs text-teal-400 hover:text-teal-300"
                                                        >
                                                            Show dismissed
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-8 w-px bg-gray-800 mx-1" />
                        <button
                            onClick={() => { localStorage.removeItem(ADMIN_KEY); setIsAuthenticated(false) }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-red-500/10 hover:text-red-400 transition-all text-gray-400"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </header >

            {/* Orders Tab */}
            {
                activeTab === 'orders' && (
                    <div className="flex h-[calc(100vh-64px)]">
                        {/* Sidebar */}
                        <aside className="w-[450px] bg-[#0f0f15]/50 border-r border-gray-800/50 flex flex-col">
                            {/* Quick Stats Row */}
                            <div className="p-4 pb-2">
                                <div className="flex items-center justify-between bg-gradient-to-r from-teal-500/10 to-transparent rounded-xl p-3 border border-teal-500/20">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-teal-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Total Revenue</p>
                                            <p className="text-lg font-bold text-teal-400">{formatPrice(stats.revenue)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Orders</p>
                                        <p className="text-lg font-bold text-white">{stats.total}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Workflow Filters */}
                            <div className="px-4 pb-3">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Filter by Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setFilterStatus(filterStatus === 'all' ? 'all' : 'all')}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${filterStatus === 'all'
                                            ? 'bg-gray-700 border border-gray-600 text-white'
                                            : 'bg-gray-800/30 border border-transparent text-gray-400 hover:bg-gray-800/50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span className="text-sm font-medium">All Orders</span>
                                        </div>
                                        <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full">{stats.total}</span>
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus(filterStatus === 'pending_payment' ? 'all' : 'pending_payment')}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${filterStatus === 'pending_payment'
                                            ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                                            : 'bg-gray-800/30 border border-transparent text-gray-400 hover:bg-gray-800/50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm font-medium">Pending</span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${stats.pending > 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-gray-600'}`}>{stats.pending}</span>
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus(filterStatus === 'payment_received' ? 'all' : 'payment_received')}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${filterStatus === 'payment_received'
                                            ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                                            : stats.toProcess > 0
                                                ? 'bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse'
                                                : 'bg-gray-800/30 border border-transparent text-gray-400 hover:bg-gray-800/50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Needs Action</span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${stats.toProcess > 0 ? 'bg-red-500/30 text-red-400' : 'bg-gray-600'}`}>{stats.toProcess}</span>
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus(filterStatus === 'active' ? 'all' : 'active')}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${filterStatus === 'active'
                                            ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                                            : 'bg-gray-800/30 border border-transparent text-gray-400 hover:bg-gray-800/50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4" />
                                            <span className="text-sm font-medium">In Progress</span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${stats.active > 0 ? 'bg-blue-500/30 text-blue-400' : 'bg-gray-600'}`}>{stats.active}</span>
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus(filterStatus === 'delivered' ? 'all' : 'delivered')}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${filterStatus === 'delivered'
                                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                            : 'bg-gray-800/30 border border-transparent text-gray-400 hover:bg-gray-800/50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Completed</span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${stats.completed > 0 ? 'bg-green-500/30 text-green-400' : 'bg-gray-600'}`}>{stats.completed}</span>
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus(filterStatus === 'cancelled' ? 'all' : 'cancelled')}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${filterStatus === 'cancelled'
                                            ? 'bg-gray-500/20 border border-gray-500/50 text-gray-300'
                                            : 'bg-gray-800/30 border border-transparent text-gray-400 hover:bg-gray-800/50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-medium">Cancelled</span>
                                        </div>
                                        <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'cancelled').length}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="px-4 pb-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by order ref, email, or name..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800/30 border border-gray-800/50 rounded-xl text-sm focus:outline-none focus:border-teal-500/50 placeholder-gray-600 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Order List */}
                            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                    <div
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all ${selectedOrder?.id === order.id
                                            ? 'bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/30'
                                            : 'bg-gray-800/20 border border-transparent hover:bg-gray-800/40 hover:border-gray-700/50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="font-mono text-teal-400 text-sm font-medium">{order.orderRef || 'N/A'}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-white font-medium">{order.shippingAddress?.firstName || 'Unknown'} {order.shippingAddress?.lastName || ''}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">
                                                {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''} • {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' }) : 'N/A'}
                                            </span>
                                            <span className="text-teal-400 font-semibold">{formatPrice(order.total || 0)}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                                        <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                                        <p className="text-sm">No orders found</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-800/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{filteredOrders.length} of {orders.length} orders</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => loadData()}
                                            disabled={isRefreshing}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-all disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 overflow-y-auto">
                            {selectedOrder ? (
                                <div className="p-6 max-w-5xl mx-auto">
                                    {/* Order Header */}
                                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur rounded-2xl border border-gray-800/50 p-6 mb-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h1 className="text-2xl font-bold text-white">{selectedOrder.orderRef}</h1>
                                                    <button
                                                        onClick={() => copyToClipboard(selectedOrder.orderRef, selectedOrder.id)}
                                                        className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                                                    >
                                                        {copiedRef === selectedOrder.id
                                                            ? <CheckCircle className="w-4 h-4 text-green-400" />
                                                            : <Copy className="w-4 h-4 text-gray-500" />
                                                        }
                                                    </button>
                                                </div>
                                                <p className="text-gray-500">
                                                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-ZA', {
                                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <StatusBadge status={selectedOrder.status} large />
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-800/50">
                                            <button
                                                onClick={() => downloadInvoice(selectedOrder)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-xl hover:from-teal-400 hover:to-teal-500 transition-all shadow-lg shadow-teal-500/20"
                                            >
                                                <Download className="w-4 h-4" /> Download Invoice
                                            </button>
                                            <a
                                                href={`https://wa.me/${(selectedOrder.shippingAddress?.phone || '').replace(/^0/, '27')}?text=Hi ${selectedOrder.shippingAddress?.firstName || ''}, regarding your X-Tech order ${selectedOrder.orderRef || ''}...`}
                                                target="_blank"
                                                className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#20BD5A] transition-all"
                                            >
                                                <MessageCircle className="w-4 h-4" /> WhatsApp
                                            </a>
                                            <a
                                                href={`mailto:${selectedOrder.userEmail}?subject=Your X-Tech Order ${selectedOrder.orderRef}`}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/50 text-gray-300 font-medium rounded-xl hover:bg-gray-800 transition-all"
                                            >
                                                <Mail className="w-4 h-4" /> Email
                                            </a>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        {/* Left Column - 2 cols */}
                                        <div className="col-span-2 space-y-6">
                                            {/* Items */}
                                            <div className="bg-gray-900/40 backdrop-blur rounded-2xl border border-gray-800/50 overflow-hidden">
                                                <div className="p-5 border-b border-gray-800/50">
                                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                                        <ShoppingBag className="w-5 h-5 text-teal-400" />
                                                        Order Items ({selectedOrder.items?.length || 0})
                                                    </h3>
                                                </div>
                                                <div className="divide-y divide-gray-800/30">
                                                    {(selectedOrder.items || []).map((item, i) => (
                                                        <div key={i} className="p-4 flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-600">
                                                                <Package className="w-6 h-6" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-white font-medium">{item.name}</p>
                                                                <p className="text-xs text-gray-500">SKU: {item.sku || 'N/A'} • Qty: {item.quantity}</p>
                                                            </div>
                                                            <p className="text-teal-400 font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                                        </div>
                                                    ))}
                                                    {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                                                        <div className="p-4 text-center text-gray-500">No items data available</div>
                                                    )}
                                                </div>
                                                <div className="p-5 bg-gray-900/50 space-y-2">
                                                    <div className="flex justify-between text-sm text-gray-400">
                                                        <span>Subtotal</span>
                                                        <span>{formatPrice(selectedOrder.subtotal || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm text-gray-400">
                                                        <span>Shipping</span>
                                                        <span>{(selectedOrder.shippingCost || 0) === 0 ? <span className="text-green-400">FREE</span> : formatPrice(selectedOrder.shippingCost || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-gray-800/50">
                                                        <span>Total</span>
                                                        <span className="text-teal-400">{formatPrice(selectedOrder.total || 0)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Customer Details */}
                                            <div className="bg-gray-900/40 backdrop-blur rounded-2xl border border-gray-800/50 p-5">
                                                <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                                                    <Users className="w-5 h-5 text-teal-400" />
                                                    Customer Details
                                                </h3>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contact</p>
                                                        <p className="text-white font-medium text-lg">{selectedOrder.shippingAddress?.firstName || 'Unknown'} {selectedOrder.shippingAddress?.lastName || ''}</p>
                                                        <div className="mt-3 space-y-2">
                                                            <a href={`mailto:${selectedOrder.userEmail || ''}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                                                                <Mail className="w-4 h-4" /> {selectedOrder.userEmail || 'N/A'}
                                                            </a>
                                                            {selectedOrder.shippingAddress?.phone && (
                                                                <a href={`tel:${selectedOrder.shippingAddress.phone}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                                                                    <Phone className="w-4 h-4" /> {selectedOrder.shippingAddress.phone}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Shipping Address</p>
                                                        {selectedOrder.shippingAddress ? (
                                                            <div className="flex items-start gap-2 text-gray-300">
                                                                <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                                                <div>
                                                                    <p>{selectedOrder.shippingAddress.address || 'N/A'}</p>
                                                                    <p>{selectedOrder.shippingAddress.city || ''}, {selectedOrder.shippingAddress.province || ''}</p>
                                                                    <p>{selectedOrder.shippingAddress.postalCode || ''}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500">No address available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-6">
                                            {/* Status Update */}
                                            <div className="bg-gray-900/40 backdrop-blur rounded-2xl border border-gray-800/50 p-5">
                                                <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                                                    <Settings className="w-5 h-5 text-teal-400" />
                                                    Update Status
                                                </h3>

                                                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' ? (
                                                    <div className="space-y-2">
                                                        {selectedOrder.status === 'pending_payment' && (
                                                            <ActionButton
                                                                onClick={() => updateOrderStatus(selectedOrder.id, 'payment_received')}
                                                                icon={<Check className="w-4 h-4" />}
                                                                label="Mark Payment Received"
                                                                color="green"
                                                            />
                                                        )}
                                                        {selectedOrder.status === 'payment_received' && (
                                                            <ActionButton
                                                                onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                                                                icon={<Package className="w-4 h-4" />}
                                                                label="Start Processing"
                                                                color="blue"
                                                            />
                                                        )}
                                                        {selectedOrder.status === 'processing' && (
                                                            <ActionButton
                                                                onClick={() => setShowSupplierModal(true)}
                                                                icon={<ShoppingBag className="w-4 h-4" />}
                                                                label="Mark as Ordered"
                                                                color="cyan"
                                                            />
                                                        )}
                                                        {selectedOrder.status === 'ordered' && (
                                                            <ActionButton
                                                                onClick={() => setShowShippingModal(true)}
                                                                icon={<Truck className="w-4 h-4" />}
                                                                label="Mark as Shipped"
                                                                color="purple"
                                                            />
                                                        )}
                                                        {selectedOrder.status === 'shipped' && (
                                                            <ActionButton
                                                                onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                                                                icon={<CheckCircle className="w-4 h-4" />}
                                                                label="Mark as Delivered"
                                                                color="green"
                                                            />
                                                        )}
                                                        <div className="pt-2 mt-2 border-t border-gray-800/50">
                                                            <ActionButton
                                                                onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                                                                icon={<X className="w-4 h-4" />}
                                                                label="Cancel Order"
                                                                color="red"
                                                                variant="outline"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={`p-4 rounded-xl text-center ${selectedOrder.status === 'delivered'
                                                        ? 'bg-green-500/10 text-green-400'
                                                        : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {selectedOrder.status === 'delivered'
                                                            ? '✓ Order Completed'
                                                            : '✗ Order Cancelled'
                                                        }
                                                    </div>
                                                )}
                                            </div>

                                            {/* Supplier & Shipping Info */}
                                            {(selectedOrder.supplierName || selectedOrder.trackingNumber) && (
                                                <div className="bg-gray-900/40 backdrop-blur rounded-2xl border border-gray-800/50 p-5">
                                                    <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                                                        <Store className="w-5 h-5 text-teal-400" />
                                                        Supplier & Shipping
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {selectedOrder.supplierName && (
                                                            <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                                                                <div>
                                                                    <p className="text-xs text-cyan-400">Ordered From</p>
                                                                    <p className="text-white font-medium">{selectedOrder.supplierName}</p>
                                                                </div>
                                                                {selectedOrder.supplierOrderRef && (
                                                                    <div className="text-right">
                                                                        <p className="text-xs text-cyan-400">Supplier Ref</p>
                                                                        <p className="text-white font-mono text-sm">{selectedOrder.supplierOrderRef}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {selectedOrder.courierName && (
                                                            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div>
                                                                        <p className="text-xs text-purple-400">Courier</p>
                                                                        <p className="text-white font-medium">{selectedOrder.courierName}</p>
                                                                    </div>
                                                                    {selectedOrder.trackingNumber && (
                                                                        <div className="text-right">
                                                                            <p className="text-xs text-purple-400">Tracking #</p>
                                                                            <p className="text-white font-mono text-sm">{selectedOrder.trackingNumber}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {selectedOrder.trackingUrl && (
                                                                    <a
                                                                        href={selectedOrder.trackingUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                                                    >
                                                                        <Link2 className="w-4 h-4" />
                                                                        Track Shipment
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timeline */}
                                            <div className="bg-gray-900/40 backdrop-blur rounded-2xl border border-gray-800/50 p-5">
                                                <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                                                    <Clock className="w-5 h-5 text-teal-400" />
                                                    Timeline
                                                </h3>
                                                <div className="relative pl-6 space-y-4">
                                                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-800" />
                                                    <TimelineItem label="Order Placed" date={selectedOrder.createdAt} active />
                                                    <TimelineItem label="Payment Received" date={selectedOrder.paidAt} active={!!selectedOrder.paidAt} />
                                                    <TimelineItem
                                                        label="Ordered from Supplier"
                                                        date={selectedOrder.orderedAt}
                                                        active={!!selectedOrder.orderedAt}
                                                        extra={selectedOrder.supplierName ? `via ${selectedOrder.supplierName}${selectedOrder.supplierOrderRef ? ` (${selectedOrder.supplierOrderRef})` : ''}` : undefined}
                                                    />
                                                    <TimelineItem
                                                        label="Shipped"
                                                        date={selectedOrder.shippedAt}
                                                        active={!!selectedOrder.shippedAt}
                                                        extra={selectedOrder.courierName ? `${selectedOrder.courierName}${selectedOrder.trackingNumber ? ` - ${selectedOrder.trackingNumber}` : ''}` : undefined}
                                                    />
                                                    <TimelineItem label="Delivered" date={selectedOrder.deliveredAt} active={!!selectedOrder.deliveredAt} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-24 h-24 rounded-3xl bg-gray-900/50 flex items-center justify-center mx-auto mb-4">
                                            <Eye className="w-10 h-10 text-gray-700" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Order Selected</h3>
                                        <p className="text-gray-600 text-sm">Select an order from the list to view details</p>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                )
            }

            {/* Supplier Order Modal */}
            {
                showSupplierModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-[#0f0f15] border border-gray-800 rounded-2xl w-full max-w-md p-6 m-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Store className="w-5 h-5 text-cyan-400" />
                                    Order from Supplier
                                </h2>
                                <button onClick={() => setShowSupplierModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Order Summary */}
                                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <p className="text-xs text-gray-500">Order Reference</p>
                                    <p className="text-white font-medium">{selectedOrder.orderRef || 'N/A'}</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {selectedOrder.items?.length || 0} item(s) • {formatPrice(selectedOrder.total || 0)}
                                    </p>
                                </div>

                                {/* Supplier Selection */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Supplier</label>
                                    <div className="relative">
                                        <select
                                            value={supplierFormData.supplierName}
                                            onChange={(e) => setSupplierFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                                            className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
                                            style={{ colorScheme: 'dark' }}
                                        >
                                            {SUPPLIERS.map(s => (
                                                <option key={s.value} value={s.value} className="bg-[#1a1a24] text-white py-2">{s.label}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Supplier Order Reference */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Supplier Order Reference</label>
                                    <input
                                        type="text"
                                        value={supplierFormData.supplierOrderRef}
                                        onChange={(e) => setSupplierFormData(prev => ({ ...prev, supplierOrderRef: e.target.value }))}
                                        placeholder="e.g. SYN-123456"
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                    />
                                </div>

                                {/* Quick Links */}
                                <div className="pt-2 border-t border-gray-800">
                                    <p className="text-xs text-gray-500 mb-2">Quick Links</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SUPPLIERS.filter(s => s.portalUrl).map(s => (
                                            <a
                                                key={s.value}
                                                href={s.portalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 text-xs bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                {s.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowSupplierModal(false)}
                                        className="flex-1 px-4 py-3 text-gray-400 hover:text-white border border-gray-700 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleMarkAsOrdered}
                                        className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Confirm Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Shipping Modal */}
            {
                showShippingModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-[#0f0f15] border border-gray-800 rounded-2xl w-full max-w-md p-6 m-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-purple-400" />
                                    Add Shipping Details
                                </h2>
                                <button onClick={() => setShowShippingModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Order & Supplier Info */}
                                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Order Reference</p>
                                            <p className="text-white font-medium">{selectedOrder.orderRef}</p>
                                        </div>
                                        {selectedOrder.supplierName && (
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Supplier</p>
                                                <p className="text-cyan-400 font-medium">{selectedOrder.supplierName}</p>
                                                {selectedOrder.supplierOrderRef && (
                                                    <p className="text-xs text-gray-400">{selectedOrder.supplierOrderRef}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Courier Selection */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Courier</label>
                                    <div className="relative">
                                        <select
                                            value={shippingFormData.courierName}
                                            onChange={(e) => setShippingFormData(prev => ({ ...prev, courierName: e.target.value }))}
                                            className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                                            style={{ colorScheme: 'dark' }}
                                        >
                                            {COURIERS.map(c => (
                                                <option key={c.value} value={c.value} className="bg-[#1a1a24] text-white py-2">{c.label}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Tracking Number */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Tracking Number / Waybill</label>
                                    <input
                                        type="text"
                                        value={shippingFormData.trackingNumber}
                                        onChange={(e) => setShippingFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                                        placeholder="e.g. TCG123456789"
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>

                                {/* Tracking URL Preview */}
                                {shippingFormData.trackingNumber && (
                                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                                        <p className="text-xs text-purple-400 mb-1 flex items-center gap-1">
                                            <Link2 className="w-3 h-3" />
                                            Tracking Link Preview
                                        </p>
                                        <p className="text-sm text-gray-300 break-all">
                                            {COURIERS.find(c => c.value === shippingFormData.courierName)?.trackingUrl
                                                ? COURIERS.find(c => c.value === shippingFormData.courierName)?.trackingUrl + shippingFormData.trackingNumber
                                                : 'No tracking URL available for this courier'
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* Destination */}
                                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        Shipping To
                                    </p>
                                    <p className="text-white">{selectedOrder.shippingAddress?.firstName || 'Unknown'} {selectedOrder.shippingAddress?.lastName || ''}</p>
                                    <p className="text-sm text-gray-400">
                                        {selectedOrder.shippingAddress?.address || 'N/A'}, {selectedOrder.shippingAddress?.city || ''}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {selectedOrder.shippingAddress?.province || ''}, {selectedOrder.shippingAddress?.postalCode || ''}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowShippingModal(false)}
                                        className="flex-1 px-4 py-3 text-gray-400 hover:text-white border border-gray-700 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleMarkAsShipped}
                                        className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Truck className="w-4 h-4" />
                                        Confirm Shipped
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Quote Confirmation Modal */}
            {
                showDeleteQuoteModal && quoteToDelete && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-[#0f0f15] border border-gray-800 rounded-2xl w-full max-w-md p-6 m-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Trash2 className="w-5 h-5 text-red-400" />
                                    Delete Quote Request
                                </h2>
                                <button onClick={() => setShowDeleteQuoteModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                    <p className="text-red-400 text-sm">
                                        Are you sure you want to delete this quote request? This action cannot be undone.
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <p className="text-xs text-gray-500">Quote from</p>
                                    <p className="text-white font-medium">{quoteToDelete.customerName}</p>
                                    <p className="text-sm text-gray-400 mt-1">{quoteToDelete.customerEmail}</p>
                                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                        {quoteToDelete.componentDescription?.substring(0, 100) || 'No description'}...
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowDeleteQuoteModal(false)}
                                        className="flex-1 px-4 py-3 text-gray-400 hover:text-white border border-gray-700 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            deleteQuoteRequest(quoteToDelete.id)
                                            if (selectedQuote?.id === quoteToDelete.id) {
                                                setSelectedQuote(null)
                                            }
                                            setShowDeleteQuoteModal(false)
                                            setQuoteToDelete(null)
                                        }}
                                        className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Quote
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* History Tab */}
            {
                activeTab === 'history' && (
                    <div className="h-[calc(100vh-64px)] overflow-y-auto p-6">
                        <div className="max-w-6xl mx-auto">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => setHistoryMonth(getPrevMonth())}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors text-gray-300"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-teal-400" />
                                    <h2 className="text-2xl font-bold text-white">{formatMonthDisplay(historyMonth)}</h2>
                                </div>
                                <button
                                    onClick={() => setHistoryMonth(getNextMonth())}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors text-gray-300"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Monthly Stats */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800/50 rounded-2xl p-5">
                                    <div className="text-3xl font-bold text-white mb-1">{monthlyStats.total}</div>
                                    <div className="text-sm text-gray-500">Total Orders</div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-teal-500/20 rounded-2xl p-5">
                                    <div className="text-3xl font-bold text-teal-400 mb-1">{monthlyStats.completed}</div>
                                    <div className="text-sm text-gray-500">Completed</div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800/50 rounded-2xl p-5">
                                    <div className="text-3xl font-bold text-red-400 mb-1">{monthlyStats.cancelled}</div>
                                    <div className="text-sm text-gray-500">Cancelled</div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-teal-500/20 rounded-2xl p-5">
                                    <div className="text-3xl font-bold text-teal-400 mb-1">{formatPrice(monthlyStats.revenue)}</div>
                                    <div className="text-sm text-gray-500">Revenue</div>
                                </div>
                            </div>

                            {/* Orders Table */}
                            <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800/50 rounded-2xl overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-800/50">
                                        <tr>
                                            <th className="text-left p-4 text-sm font-medium text-gray-400">Order ID</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-400">Customer</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-400">Items</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                                            <th className="text-right p-4 text-sm font-medium text-gray-400">Total</th>
                                            <th className="text-center p-4 text-sm font-medium text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {historyOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                    <p>No orders found for {formatMonthDisplay(historyMonth)}</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            historyOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-gray-800/30">
                                                    <td className="p-4 text-sm text-teal-400 font-mono">{order.orderRef}</td>
                                                    <td className="p-4">
                                                        <div className="text-sm text-white">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                                                        <div className="text-xs text-gray-500">{order.userEmail}</div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-400">
                                                        {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-400">{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                                                    <td className="p-4">
                                                        <StatusBadge status={order.status} />
                                                    </td>
                                                    <td className="p-4 text-right text-sm text-teal-400 font-semibold">{formatPrice(order.total)}</td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order)
                                                                setActiveTab('orders')
                                                            }}
                                                            className="px-3 py-1.5 bg-teal-500/10 text-teal-400 rounded-lg text-xs hover:bg-teal-500/20 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Quotes Tab */}
            {
                activeTab === 'quotes' && (
                    <div className="h-[calc(100vh-64px)] overflow-y-auto p-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Quote Requests</h2>
                                        <p className="text-sm text-gray-500">{quoteRequests.length} total request{quoteRequests.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                {/* Stats */}
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-yellow-400">{quoteRequests.filter(q => q.status === 'pending').length}</p>
                                        <p className="text-xs text-gray-500">Pending</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-400">{quoteRequests.filter(q => q.status === 'quoted').length}</p>
                                        <p className="text-xs text-gray-500">Quoted</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-400">{quoteRequests.filter(q => q.status === 'accepted').length}</p>
                                        <p className="text-xs text-gray-500">Accepted</p>
                                    </div>
                                </div>
                            </div>

                            {quoteRequests.length === 0 ? (
                                <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800/50 rounded-2xl p-12 text-center">
                                    <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No Quote Requests</h3>
                                    <p className="text-gray-500">Quote requests from customers will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid lg:grid-cols-3 gap-6">
                                    {/* Quote List */}
                                    <div className="lg:col-span-1">
                                        {/* Status Filter Tabs */}
                                        <div className="flex gap-1 mb-4 p-1 bg-gray-800/30 rounded-lg">
                                            {['all', 'pending', 'quoted', 'accepted'].map(status => {
                                                const count = status === 'all'
                                                    ? quoteRequests.length
                                                    : quoteRequests.filter(q => q.status === status).length
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => setQuoteStatusFilter(status as any)}
                                                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${quoteStatusFilter === status
                                                            ? 'bg-teal-500 text-black'
                                                            : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Quote Cards */}
                                        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
                                            {quoteRequests
                                                .filter(q => quoteStatusFilter === 'all' || q.status === quoteStatusFilter)
                                                .map(quote => (
                                                    <button
                                                        key={quote.id}
                                                        onClick={() => {
                                                            setSelectedQuote(quote)
                                                            setQuoteFormData({
                                                                adminNotes: quote.adminNotes || ''
                                                            })
                                                            setQuotedItems([{ description: '', price: '' }])
                                                        }}
                                                        className={`w-full text-left p-4 rounded-xl border transition-all ${selectedQuote?.id === quote.id
                                                            ? 'bg-teal-500/10 border-teal-500/30'
                                                            : 'bg-gray-900/50 border-gray-800/50 hover:border-gray-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <p className="font-medium text-white truncate">{quote.customerName}</p>
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${quote.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                quote.status === 'quoted' ? 'bg-blue-500/20 text-blue-400' :
                                                                    quote.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                                                        'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                {quote.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-400 truncate">{quote.customerEmail}</p>
                                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                                            {quote.componentDescription || 'No description'}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/50">
                                                            <p className="text-xs text-gray-600">
                                                                {new Date(quote.createdAt).toLocaleDateString()}
                                                            </p>
                                                            {quote.quotedPrice && (
                                                                <p className="text-xs font-medium text-teal-400">
                                                                    {formatPrice(quote.quotedPrice)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            {quoteRequests.filter(q => quoteStatusFilter === 'all' || q.status === quoteStatusFilter).length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No {quoteStatusFilter} quotes</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quote Detail */}
                                    <div className="lg:col-span-2">
                                        {selectedQuote ? (
                                            <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800/50 rounded-2xl overflow-hidden">
                                                {/* Header */}
                                                <div className="p-6 border-b border-gray-800/50">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-xl font-bold text-white">{selectedQuote.customerName}</h3>
                                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${selectedQuote.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    selectedQuote.status === 'quoted' ? 'bg-blue-500/20 text-blue-400' :
                                                                        selectedQuote.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                                                            'bg-red-500/20 text-red-400'
                                                                    }`}>
                                                                    {selectedQuote.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">Quote ID: {selectedQuote.id}</p>
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                                                <a href={`mailto:${selectedQuote.customerEmail}`} className="flex items-center gap-1.5 hover:text-teal-400 transition-colors">
                                                                    <Mail className="w-4 h-4" />
                                                                    {selectedQuote.customerEmail}
                                                                </a>
                                                                <a href={`tel:${selectedQuote.customerPhone}`} className="flex items-center gap-1.5 hover:text-teal-400 transition-colors">
                                                                    <Phone className="w-4 h-4" />
                                                                    {selectedQuote.customerPhone}
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setQuoteToDelete(selectedQuote)
                                                                setShowDeleteQuoteModal(true)
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Component Request */}
                                                <div className="p-6 border-b border-gray-800/50">
                                                    <h4 className="text-sm font-medium text-gray-400 mb-3">What They Need a Quote For</h4>
                                                    <div className="p-4 bg-gray-800/30 rounded-lg">
                                                        <p className="text-white whitespace-pre-wrap">{selectedQuote.componentDescription || 'No description provided'}</p>
                                                    </div>

                                                    {selectedQuote.message && (
                                                        <div className="mt-4">
                                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Additional Notes from Customer</h4>
                                                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                                <p className="text-sm text-blue-200">{selectedQuote.message}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quote Form */}
                                                <div className="p-6">
                                                    <h4 className="text-sm font-medium text-gray-400 mb-3">Build Your Quote</h4>
                                                    <div className="space-y-4">
                                                        {/* Quoted Items */}
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-2">Quoted Items</label>
                                                            <div className="space-y-2">
                                                                {quotedItems.map((item, index) => (
                                                                    <div key={index} className="flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            value={item.description}
                                                                            onChange={(e) => {
                                                                                const updated = [...quotedItems]
                                                                                updated[index].description = e.target.value
                                                                                setQuotedItems(updated)
                                                                            }}
                                                                            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                                                            placeholder="E.g., LG 27' 4K Monitor Model XYZ"
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            value={item.price}
                                                                            onChange={(e) => {
                                                                                const updated = [...quotedItems]
                                                                                updated[index].price = e.target.value
                                                                                setQuotedItems(updated)
                                                                            }}
                                                                            className="w-32 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                                                            placeholder="Price"
                                                                        />
                                                                        {quotedItems.length > 1 && (
                                                                            <button
                                                                                onClick={() => setQuotedItems(quotedItems.filter((_, i) => i !== index))}
                                                                                className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                                                            >
                                                                                <Trash2 className="w-5 h-5" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button
                                                                onClick={() => setQuotedItems([...quotedItems, { description: '', price: '' }])}
                                                                className="mt-2 flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Add another item
                                                            </button>
                                                        </div>

                                                        {/* Total */}
                                                        {quotedItems.some(item => item.price) && (
                                                            <div className="flex justify-between items-center p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                                                                <span className="text-gray-400">Total Quote:</span>
                                                                <span className="text-2xl font-bold text-teal-400">
                                                                    {formatPrice(quotedItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0))}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-2">Notes for Customer</label>
                                                            <textarea
                                                                value={quoteFormData.adminNotes}
                                                                onChange={(e) => setQuoteFormData({ ...quoteFormData, adminNotes: e.target.value })}
                                                                rows={3}
                                                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                                                                placeholder="Add any notes about availability, delivery, warranty..."
                                                            />
                                                        </div>

                                                        <div className="flex gap-3">
                                                            {selectedQuote.status === 'pending' && (
                                                                <button
                                                                    onClick={async () => {
                                                                        const validItems = quotedItems.filter(item => item.description.trim() && parseFloat(item.price) > 0)
                                                                        if (validItems.length === 0) {
                                                                            alert('Please add at least one item with a description and price')
                                                                            return
                                                                        }

                                                                        const totalPrice = validItems.reduce((sum, item) => sum + parseFloat(item.price), 0)

                                                                        setIsSendingQuote(true)

                                                                        try {
                                                                            // Send quote email via API
                                                                            const response = await fetch('/api/quotes', {
                                                                                method: 'PUT',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({
                                                                                    quoteId: selectedQuote.id,
                                                                                    customerName: selectedQuote.customerName,
                                                                                    customerEmail: selectedQuote.customerEmail,
                                                                                    componentDescription: selectedQuote.componentDescription,
                                                                                    quotedItems: validItems.map(item => ({
                                                                                        description: item.description,
                                                                                        price: parseFloat(item.price)
                                                                                    })),
                                                                                    totalPrice,
                                                                                    adminNotes: quoteFormData.adminNotes
                                                                                })
                                                                            })

                                                                            if (response.ok) {
                                                                                updateQuoteStatus(selectedQuote.id, 'quoted', totalPrice, quoteFormData.adminNotes)
                                                                                setSelectedQuote({ ...selectedQuote, status: 'quoted', quotedPrice: totalPrice, adminNotes: quoteFormData.adminNotes })
                                                                                alert('Quote sent successfully!')
                                                                            } else {
                                                                                alert('Failed to send quote email. Please try again.')
                                                                            }
                                                                        } catch (error) {
                                                                            console.error('Error sending quote:', error)
                                                                            alert('Failed to send quote. Please try again.')
                                                                        }

                                                                        setIsSendingQuote(false)
                                                                    }}
                                                                    disabled={isSendingQuote}
                                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 text-black font-medium rounded-xl hover:bg-teal-400 disabled:opacity-50 transition-colors"
                                                                >
                                                                    {isSendingQuote ? (
                                                                        <>
                                                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                                            Sending...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Send className="w-4 h-4" />
                                                                            Send Quote to Customer
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                            {selectedQuote.status === 'quoted' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            updateQuoteStatus(selectedQuote.id, 'accepted')
                                                                            setSelectedQuote({ ...selectedQuote, status: 'accepted' })
                                                                        }}
                                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-black font-medium rounded-xl hover:bg-green-400 transition-colors"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        Mark Accepted
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            updateQuoteStatus(selectedQuote.id, 'rejected')
                                                                            setSelectedQuote({ ...selectedQuote, status: 'rejected' })
                                                                        }}
                                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400 transition-colors"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                        Mark Rejected
                                                                    </button>
                                                                </>
                                                            )}
                                                            {(selectedQuote.status === 'accepted' || selectedQuote.status === 'rejected') && (
                                                                <div className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${selectedQuote.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                                    }`}>
                                                                    {selectedQuote.status === 'accepted' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                                    Quote {selectedQuote.status}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800/50 rounded-2xl p-12 text-center">
                                                <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                                <p className="text-gray-500">Select a quote request to view details</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Settings Tab */}
            {
                activeTab === 'settings' && (
                    <div className="h-[calc(100vh-64px)] overflow-y-auto p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Settings</h2>
                                    <p className="text-sm text-gray-500">Manage your banking details for invoices</p>
                                </div>
                            </div>

                            {/* Banking Details */}
                            <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800/50 rounded-2xl p-6 mb-6">
                                <h3 className="text-lg font-bold text-white mb-2">Banking Details</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    These details will appear on customer invoices for payment reference.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Bank Name</label>
                                        <input
                                            type="text"
                                            value={bankingSettings.bankName}
                                            onChange={(e) => setBankingSettings({ ...bankingSettings, bankName: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Account Name</label>
                                        <input
                                            type="text"
                                            value={bankingSettings.accountName}
                                            onChange={(e) => setBankingSettings({ ...bankingSettings, accountName: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Account Number</label>
                                        <input
                                            type="text"
                                            value={bankingSettings.accountNumber}
                                            onChange={(e) => setBankingSettings({ ...bankingSettings, accountNumber: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Branch Code</label>
                                        <input
                                            type="text"
                                            value={bankingSettings.branchCode}
                                            onChange={(e) => setBankingSettings({ ...bankingSettings, branchCode: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Account Type</label>
                                        <input
                                            type="text"
                                            value={bankingSettings.accountType}
                                            onChange={(e) => setBankingSettings({ ...bankingSettings, accountType: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">SWIFT Code</label>
                                        <input
                                            type="text"
                                            value={bankingSettings.swiftCode}
                                            onChange={(e) => setBankingSettings({ ...bankingSettings, swiftCode: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-4">
                                    <button
                                        onClick={saveBankingSettings}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-400 hover:to-teal-500 transition-all shadow-lg shadow-teal-500/25"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Banking Details
                                    </button>
                                    {bankingSaved && (
                                        <span className="flex items-center gap-2 text-teal-400 text-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            Saved successfully!
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Invoice Preview */}
                            <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-teal-500/20 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2">Invoice Preview</h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    This is how your banking details will appear on invoices:
                                </p>

                                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 font-mono text-sm">
                                    <div className="grid grid-cols-2 gap-2 text-gray-400">
                                        <div>Bank:</div>
                                        <div className="text-teal-400">{bankingSettings.bankName}</div>
                                        <div>Account Name:</div>
                                        <div className="text-teal-400">{bankingSettings.accountName}</div>
                                        <div>Account Number:</div>
                                        <div className="text-teal-400">{bankingSettings.accountNumber}</div>
                                        <div>Branch Code:</div>
                                        <div className="text-teal-400">{bankingSettings.branchCode}</div>
                                        <div>Account Type:</div>
                                        <div className="text-teal-400">{bankingSettings.accountType}</div>
                                        <div>SWIFT Code:</div>
                                        <div className="text-teal-400">{bankingSettings.swiftCode}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

// Components
function StatCard({ icon, label, value, color, isRevenue, alert, active, onClick }: {
    icon: React.ReactNode; label: string; value: string | number; color: string; isRevenue?: boolean; alert?: boolean; active?: boolean; onClick?: () => void
}) {
    const colorClasses: Record<string, { base: string; active: string }> = {
        yellow: {
            base: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400 hover:from-yellow-500/30 hover:border-yellow-500/40',
            active: 'from-yellow-500/40 to-yellow-500/20 border-yellow-500/50 text-yellow-300 ring-2 ring-yellow-500/30'
        },
        red: {
            base: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400 hover:from-red-500/30 hover:border-red-500/40',
            active: 'from-red-500/40 to-red-500/20 border-red-500/50 text-red-300 ring-2 ring-red-500/30'
        },
        blue: {
            base: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400 hover:from-blue-500/30 hover:border-blue-500/40',
            active: 'from-blue-500/40 to-blue-500/20 border-blue-500/50 text-blue-300 ring-2 ring-blue-500/30'
        },
        teal: {
            base: 'from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400 hover:from-teal-500/30 hover:border-teal-500/40',
            active: 'from-teal-500/40 to-teal-500/20 border-teal-500/50 text-teal-300 ring-2 ring-teal-500/30'
        },
    }
    return (
        <button
            onClick={onClick}
            className={`relative p-3 rounded-xl bg-gradient-to-br border transition-all duration-200 text-left cursor-pointer group ${active ? colorClasses[color].active : colorClasses[color].base
                }`}
        >
            {alert && Number(value) > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">{icon}</div>
                {active && <Check className="w-4 h-4 opacity-70" />}
            </div>
            <p className={`text-xl font-bold ${isRevenue ? 'text-base' : ''}`}>{value}</p>
            <p className="text-xs opacity-60 group-hover:opacity-80 transition-opacity">{label}</p>
        </button>
    )
}

function StatusBadge({ status, large }: { status: OrderStatus; large?: boolean }) {
    const colors: Record<OrderStatus, string> = {
        pending_payment: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        payment_received: 'bg-green-500/20 text-green-400 border-green-500/30',
        processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        ordered: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    }
    return (
        <span className={`inline-flex items-center gap-1.5 ${large ? 'px-4 py-2 text-sm' : 'px-2 py-1 text-xs'} rounded-lg border font-medium ${colors[status]}`}>
            {status === 'pending_payment' && <Clock className={large ? 'w-4 h-4' : 'w-3 h-3'} />}
            {status === 'payment_received' && <CreditCard className={large ? 'w-4 h-4' : 'w-3 h-3'} />}
            {status === 'processing' && <Package className={large ? 'w-4 h-4' : 'w-3 h-3'} />}
            {status === 'ordered' && <ShoppingBag className={large ? 'w-4 h-4' : 'w-3 h-3'} />}
            {status === 'shipped' && <Truck className={large ? 'w-4 h-4' : 'w-3 h-3'} />}
            {status === 'delivered' && <CheckCircle className={large ? 'w-4 h-4' : 'w-3 h-3'} />}
            {status === 'cancelled' && <X className={large ? 'w-4 h-4' : 'w-3 h-3'} />}
            {ORDER_STATUS_LABELS[status]}
        </span>
    )
}

function ActionButton({ onClick, icon, label, color, variant = 'solid' }: {
    onClick: () => void; icon: React.ReactNode; label: string; color: string; variant?: 'solid' | 'outline'
}) {
    const colorClasses: Record<string, { solid: string; outline: string }> = {
        green: {
            solid: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
            outline: 'border border-green-500/30 text-green-400 hover:bg-green-500/10'
        },
        blue: {
            solid: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
            outline: 'border border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
        },
        cyan: {
            solid: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30',
            outline: 'border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
        },
        purple: {
            solid: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
            outline: 'border border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
        },
        red: {
            solid: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
            outline: 'border border-red-500/30 text-red-400 hover:bg-red-500/10'
        },
    }
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${colorClasses[color][variant]}`}
        >
            {icon} {label}
        </button>
    )
}

function TimelineItem({ label, date, active, extra }: { label: string; date?: string; active: boolean; extra?: string }) {
    return (
        <div className="relative flex items-start gap-3">
            <div className={`absolute -left-6 w-4 h-4 rounded-full border-2 ${active
                ? 'bg-teal-500 border-teal-500'
                : 'bg-gray-900 border-gray-700'
                }`} />
            <div className="flex-1 pb-1">
                <p className={active ? 'text-white font-medium' : 'text-gray-600'}>{label}</p>
                {date && (
                    <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
                {extra && <p className="text-xs text-teal-400 mt-0.5">{extra}</p>}
            </div>
        </div>
    )
}
