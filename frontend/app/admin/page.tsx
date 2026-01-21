'use client'

import { useState, useEffect } from 'react'
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
    Eye
} from 'lucide-react'
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '@/lib/types/user'
import { formatPrice } from '@/lib/utils'
import { downloadInvoice } from '@/lib/pdf-invoice'

const ORDERS_KEY = 'xtech-orders'
const ADMIN_KEY = 'xtech-admin-auth'

const ADMIN_CREDENTIALS = {
    email: 'admin@x-tech.co.za',
    password: 'admin123'
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

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [copiedRef, setCopiedRef] = useState<string | null>(null)
    const [showNotifications, setShowNotifications] = useState(false)
    const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([])

    // Login state
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginError, setLoginError] = useState('')

    useEffect(() => {
        const isAdmin = localStorage.getItem(ADMIN_KEY) === 'true'
        setIsAuthenticated(isAdmin)
        if (isAdmin) loadData()
        // Load dismissed notifications from localStorage
        const dismissed = localStorage.getItem('xtech-dismissed-notifications')
        if (dismissed) setDismissedNotifications(JSON.parse(dismissed))
        setIsLoading(false)
    }, [])

    const dismissNotification = (key: string) => {
        if (!dismissedNotifications.includes(key)) {
            const newDismissed = [...dismissedNotifications, key]
            setDismissedNotifications(newDismissed)
            localStorage.setItem('xtech-dismissed-notifications', JSON.stringify(newDismissed))
        }
    }

    const clearAllDismissed = () => {
        setDismissedNotifications([])
        localStorage.removeItem('xtech-dismissed-notifications')
    }

    const loadData = async () => {
        setIsRefreshing(true)
        let loadedOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]
        if (loadedOrders.length === 0) {
            loadedOrders = generateTestOrders()
            localStorage.setItem(ORDERS_KEY, JSON.stringify(loadedOrders))
        }
        try {
            const response = await fetch('/api/admin/orders')
            if (response.ok) {
                const data = await response.json()
                if (data.orders?.length > 0) {
                    const existingRefs = new Set(loadedOrders.map(o => o.orderRef))
                    const newOrders = data.orders.filter((o: Order) => !existingRefs.has(o.orderRef))
                    loadedOrders = [...loadedOrders, ...newOrders]
                }
            }
        } catch (e) { }
        setOrders(loadedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        setIsRefreshing(false)
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

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        const updatedOrders = orders.map(o => {
            if (o.id === orderId) {
                const updated: Order = { ...o, status: newStatus, updatedAt: new Date().toISOString() }
                if (newStatus === 'payment_received') updated.paidAt = updated.paidAt || new Date().toISOString()
                if (newStatus === 'ordered') updated.orderedAt = updated.orderedAt || new Date().toISOString()
                if (newStatus === 'shipped') updated.shippedAt = updated.shippedAt || new Date().toISOString()
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId, userId: order.userId, status: newStatus }),
                })
            } catch (e) { }
        }
    }

    const copyToClipboard = (text: string, ref: string) => {
        navigator.clipboard.writeText(text)
        setCopiedRef(ref)
        setTimeout(() => setCopiedRef(null), 2000)
    }

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus
        const matchesSearch = searchQuery === '' ||
            order.orderRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending_payment').length,
        toProcess: orders.filter(o => o.status === 'payment_received').length,
        active: orders.filter(o => ['processing', 'ordered', 'shipped'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'delivered').length,
        revenue: orders.filter(o => !['cancelled', 'pending_payment'].includes(o.status)).reduce((s, o) => s + o.total, 0),
    }

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
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{loginError}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="admin@x-tech.co.za"
                                    required
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
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
            <header className="h-16 bg-[#0f0f15]/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
                <div className="h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">X-Tech Admin</h1>
                            <p className="text-xs text-gray-500">Order Management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors"
                            >
                                <Bell className="w-5 h-5 text-gray-400" />
                                {(() => {
                                    const count =
                                        (stats.pending > 0 && !dismissedNotifications.includes('pending') ? stats.pending : 0) +
                                        (stats.toProcess > 0 && !dismissedNotifications.includes('toProcess') ? stats.toProcess : 0);
                                    return count > 0 ? (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium animate-pulse">
                                            {count}
                                        </span>
                                    ) : null;
                                })()}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                                        <h3 className="font-semibold text-white">Notifications</h3>
                                        {dismissedNotifications.length > 0 && (
                                            <button onClick={clearAllDismissed} className="text-xs text-teal-400 hover:text-teal-300">Show all</button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {stats.pending > 0 && !dismissedNotifications.includes('pending') && (
                                            <div className="relative group">
                                                <button
                                                    onClick={() => { setFilterStatus('pending_payment'); setShowNotifications(false); }}
                                                    className="w-full p-3 flex items-start gap-3 hover:bg-gray-800/50 transition-colors text-left border-b border-gray-800/50 pr-10"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-4 h-4 text-yellow-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium">{stats.pending} Awaiting Payment</p>
                                                        <p className="text-gray-500 text-xs">Orders waiting for customer payment</p>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); dismissNotification('pending'); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Dismiss"
                                                >
                                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                                </button>
                                            </div>
                                        )}
                                        {stats.toProcess > 0 && !dismissedNotifications.includes('toProcess') && (
                                            <div className="relative group">
                                                <button
                                                    onClick={() => { setFilterStatus('payment_received'); setShowNotifications(false); }}
                                                    className="w-full p-3 flex items-start gap-3 hover:bg-gray-800/50 transition-colors text-left border-b border-gray-800/50 pr-10"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                                        <CreditCard className="w-4 h-4 text-red-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium">{stats.toProcess} Ready to Process</p>
                                                        <p className="text-gray-500 text-xs">Paid orders needing your attention</p>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); dismissNotification('toProcess'); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Dismiss"
                                                >
                                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                                </button>
                                            </div>
                                        )}
                                        {orders.filter(o => o.status === 'shipped').length > 0 && !dismissedNotifications.includes('shipped') && (
                                            <div className="relative group">
                                                <button
                                                    onClick={() => { setFilterStatus('shipped'); setShowNotifications(false); }}
                                                    className="w-full p-3 flex items-start gap-3 hover:bg-gray-800/50 transition-colors text-left border-b border-gray-800/50 pr-10"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                        <Truck className="w-4 h-4 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium">{orders.filter(o => o.status === 'shipped').length} In Transit</p>
                                                        <p className="text-gray-500 text-xs">Orders shipped, awaiting delivery</p>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); dismissNotification('shipped'); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Dismiss"
                                                >
                                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                                </button>
                                            </div>
                                        )}
                                        {((stats.pending === 0 || dismissedNotifications.includes('pending')) &&
                                            (stats.toProcess === 0 || dismissedNotifications.includes('toProcess')) &&
                                            (orders.filter(o => o.status === 'shipped').length === 0 || dismissedNotifications.includes('shipped'))) && (
                                                <div className="p-6 text-center text-gray-500">
                                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">All caught up!</p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <a href="/" target="_blank" className="p-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                        </a>
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
            </header>

            <div className="flex h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <aside className="w-[450px] bg-[#0f0f15]/50 border-r border-gray-800/50 flex flex-col">
                    {/* Stats Cards */}
                    <div className="p-4 grid grid-cols-2 gap-3">
                        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={stats.pending} color="yellow" />
                        <StatCard icon={<CreditCard className="w-5 h-5" />} label="To Process" value={stats.toProcess} color="red" alert />
                        <StatCard icon={<Truck className="w-5 h-5" />} label="Active" value={stats.active} color="blue" />
                        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Revenue" value={formatPrice(stats.revenue)} color="teal" isRevenue />
                    </div>

                    {/* Search */}
                    <div className="px-4 pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search orders..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/30 border border-gray-800/50 rounded-xl text-sm focus:outline-none focus:border-teal-500/50 placeholder-gray-600 transition-all"
                            />
                        </div>
                    </div>

                    {/* Status Filters */}
                    <div className="px-4 pb-3 grid grid-cols-4 gap-1.5">
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setFilterStatus(opt.value)}
                                className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${filterStatus === opt.value
                                    ? 'bg-teal-500 text-black'
                                    : 'bg-gray-800/30 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                                    }`}
                                title={opt.label}
                            >
                                {opt.icon}
                                <span className="truncate">{opt.label}</span>
                            </button>
                        ))}
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
                                    <span className="font-mono text-teal-400 text-sm font-medium">{order.orderRef}</span>
                                    <StatusBadge status={order.status} />
                                </div>
                                <p className="text-white font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">
                                        {order.items.length} item{order.items.length > 1 ? 's' : ''} • {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                                    </span>
                                    <span className="text-teal-400 font-semibold">{formatPrice(order.total)}</span>
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
                                    onClick={() => {
                                        localStorage.removeItem(ORDERS_KEY)
                                        loadData()
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition-all"
                                >
                                    Reset Demo
                                </button>
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
                                        href={`https://wa.me/${selectedOrder.shippingAddress.phone.replace(/^0/, '27')}?text=Hi ${selectedOrder.shippingAddress.firstName}, regarding your X-Tech order ${selectedOrder.orderRef}...`}
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
                                                Order Items ({selectedOrder.items.length})
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-800/30">
                                            {selectedOrder.items.map((item, i) => (
                                                <div key={i} className="p-4 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-600">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium">{item.name}</p>
                                                        <p className="text-xs text-gray-500">SKU: {item.sku} • Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="text-teal-400 font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-5 bg-gray-900/50 space-y-2">
                                            <div className="flex justify-between text-sm text-gray-400">
                                                <span>Subtotal</span>
                                                <span>{formatPrice(selectedOrder.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-400">
                                                <span>Shipping</span>
                                                <span>{selectedOrder.shippingCost === 0 ? <span className="text-green-400">FREE</span> : formatPrice(selectedOrder.shippingCost)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-gray-800/50">
                                                <span>Total</span>
                                                <span className="text-teal-400">{formatPrice(selectedOrder.total)}</span>
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
                                                <p className="text-white font-medium text-lg">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                                                <div className="mt-3 space-y-2">
                                                    <a href={`mailto:${selectedOrder.userEmail}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                                                        <Mail className="w-4 h-4" /> {selectedOrder.userEmail}
                                                    </a>
                                                    <a href={`tel:${selectedOrder.shippingAddress.phone}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                                                        <Phone className="w-4 h-4" /> {selectedOrder.shippingAddress.phone}
                                                    </a>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Shipping Address</p>
                                                <div className="flex items-start gap-2 text-gray-300">
                                                    <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p>{selectedOrder.shippingAddress.address}</p>
                                                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}</p>
                                                        <p>{selectedOrder.shippingAddress.postalCode}</p>
                                                    </div>
                                                </div>
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
                                                        onClick={() => updateOrderStatus(selectedOrder.id, 'ordered')}
                                                        icon={<ShoppingBag className="w-4 h-4" />}
                                                        label="Mark as Ordered"
                                                        color="cyan"
                                                    />
                                                )}
                                                {selectedOrder.status === 'ordered' && (
                                                    <ActionButton
                                                        onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
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
                                            <TimelineItem label="Ordered from Supplier" date={selectedOrder.orderedAt} active={!!selectedOrder.orderedAt} />
                                            <TimelineItem
                                                label="Shipped"
                                                date={selectedOrder.shippedAt}
                                                active={!!selectedOrder.shippedAt}
                                                extra={selectedOrder.trackingNumber ? `Tracking: ${selectedOrder.trackingNumber}` : undefined}
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
        </div>
    )
}

// Components
function StatCard({ icon, label, value, color, isRevenue, alert }: {
    icon: React.ReactNode; label: string; value: string | number; color: string; isRevenue?: boolean; alert?: boolean
}) {
    const colorClasses: Record<string, string> = {
        yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400',
        red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
        teal: 'from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400',
    }
    return (
        <div className={`relative p-3 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
            {alert && Number(value) > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
            <div className="flex items-center gap-2 mb-1 opacity-70">{icon}</div>
            <p className={`text-lg font-bold ${isRevenue ? 'text-sm' : ''}`}>{value}</p>
            <p className="text-xs opacity-60">{label}</p>
        </div>
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

function generateTestOrders(): Order[] {
    return [
        // Pending Payment Orders
        {
            id: "test-1", orderRef: "XT-2401-A1B2", userId: "guest", userEmail: "john@example.com",
            items: [
                { productId: "1", sku: "AMD-7950X", name: "AMD Ryzen 9 7950X Processor", brand: "AMD", price: 12999, quantity: 1 },
                { productId: "2", sku: "ASUS-X670E", name: "ASUS ROG Crosshair X670E Hero", brand: "ASUS", price: 9499, quantity: 1 }
            ],
            subtotal: 22498, shippingCost: 0, total: 22498, status: "pending_payment",
            shippingAddress: { firstName: "John", lastName: "Smith", email: "john@example.com", phone: "0821234567", address: "123 Main Road, Sandton", city: "Johannesburg", province: "Gauteng", postalCode: "2000" },
            createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: "test-11", orderRef: "XT-2401-K1L2", userId: "guest", userEmail: "peter@example.com",
            items: [
                { productId: "20", sku: "ASUS-TUF-4070", name: "ASUS TUF Gaming RTX 4070 Ti", brand: "ASUS", price: 18999, quantity: 1 }
            ],
            subtotal: 18999, shippingCost: 0, total: 18999, status: "pending_payment",
            shippingAddress: { firstName: "Peter", lastName: "Van Der Berg", email: "peter@example.com", phone: "0823456789", address: "88 Vineyard Road, Stellenbosch", city: "Stellenbosch", province: "Western Cape", postalCode: "7600" },
            createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString()
        },
        // Payment Received Orders
        {
            id: "test-2", orderRef: "XT-2401-C3D4", userId: "guest", userEmail: "sarah@example.com",
            items: [{ productId: "3", sku: "RTX-4090", name: "NVIDIA GeForce RTX 4090", brand: "NVIDIA", price: 42999, quantity: 1 }],
            subtotal: 42999, shippingCost: 0, total: 42999, status: "payment_received",
            shippingAddress: { firstName: "Sarah", lastName: "Johnson", email: "sarah@example.com", phone: "0839876543", address: "456 Beach Road, Sea Point", city: "Cape Town", province: "Western Cape", postalCode: "8001" },
            createdAt: new Date(Date.now() - 86400000).toISOString(), paidAt: new Date(Date.now() - 82800000).toISOString(), updatedAt: new Date(Date.now() - 82800000).toISOString()
        },
        {
            id: "test-12", orderRef: "XT-2401-M3N4", userId: "user_123", userEmail: "thabo@example.com",
            items: [
                { productId: "21", sku: "LG-27GR95QE", name: "LG 27GR95QE 27\" OLED Gaming Monitor", brand: "LG", price: 24999, quantity: 1 },
                { productId: "22", sku: "RODE-NT-USB", name: "Rode NT-USB+ Microphone", brand: "Rode", price: 4299, quantity: 1 }
            ],
            subtotal: 29298, shippingCost: 0, total: 29298, status: "payment_received",
            shippingAddress: { firstName: "Thabo", lastName: "Molefe", email: "thabo@example.com", phone: "0845556677", address: "42 Nelson Mandela Drive", city: "Bloemfontein", province: "Free State", postalCode: "9301" },
            createdAt: new Date(Date.now() - 64800000).toISOString(), paidAt: new Date(Date.now() - 61200000).toISOString(), updatedAt: new Date(Date.now() - 61200000).toISOString()
        },
        // Processing Orders
        {
            id: "test-5", orderRef: "XT-2401-I9J0", userId: "guest", userEmail: "david@example.com",
            items: [
                { productId: "7", sku: "INTEL-14900K", name: "Intel Core i9-14900K", brand: "Intel", price: 11999, quantity: 1 },
                { productId: "8", sku: "NZXT-H7", name: "NZXT H7 Flow RGB Case", brand: "NZXT", price: 2499, quantity: 1 },
                { productId: "9", sku: "CORSAIR-850W", name: "Corsair RM850x PSU", brand: "Corsair", price: 2899, quantity: 1 }
            ],
            subtotal: 17397, shippingCost: 0, total: 17397, status: "processing",
            shippingAddress: { firstName: "David", lastName: "Miller", email: "david@example.com", phone: "0831239876", address: "55 Tech Park, Century City", city: "Cape Town", province: "Western Cape", postalCode: "7441" },
            createdAt: new Date(Date.now() - 43200000).toISOString(), paidAt: new Date(Date.now() - 39600000).toISOString(), updatedAt: new Date(Date.now() - 36000000).toISOString()
        },
        {
            id: "test-13", orderRef: "XT-2401-O5P6", userId: "guest", userEmail: "nomsa@example.com",
            items: [
                { productId: "23", sku: "APPLE-MACMINI-M2", name: "Apple Mac Mini M2 Pro", brand: "Apple", price: 31999, quantity: 1 },
                { productId: "24", sku: "APPLE-STUDIO-DISPLAY", name: "Apple Studio Display 27\"", brand: "Apple", price: 37999, quantity: 1 }
            ],
            subtotal: 69998, shippingCost: 0, total: 69998, status: "processing",
            shippingAddress: { firstName: "Nomsa", lastName: "Dlamini", email: "nomsa@example.com", phone: "0867778899", address: "15 Umhlanga Rocks Drive", city: "Durban", province: "KwaZulu-Natal", postalCode: "4320" },
            createdAt: new Date(Date.now() - 54000000).toISOString(), paidAt: new Date(Date.now() - 50400000).toISOString(), updatedAt: new Date(Date.now() - 46800000).toISOString()
        },
        // Ordered from Supplier
        {
            id: "test-14", orderRef: "XT-2401-Q7R8", userId: "user_456", userEmail: "james@example.com",
            items: [
                { productId: "25", sku: "ALIENWARE-AW3423DWF", name: "Alienware AW3423DWF 34\" QD-OLED", brand: "Alienware", price: 21999, quantity: 1 }
            ],
            subtotal: 21999, shippingCost: 0, total: 21999, status: "ordered", orderedAt: new Date(Date.now() - 108000000).toISOString(),
            shippingAddress: { firstName: "James", lastName: "Kruger", email: "james@example.com", phone: "0829990001", address: "100 Main Street, Brooklyn", city: "Pretoria", province: "Gauteng", postalCode: "0181" },
            createdAt: new Date(Date.now() - 172800000).toISOString(), paidAt: new Date(Date.now() - 169200000).toISOString(), updatedAt: new Date(Date.now() - 108000000).toISOString()
        },
        {
            id: "test-15", orderRef: "XT-2401-S9T0", userId: "guest", userEmail: "fatima@example.com",
            items: [
                { productId: "26", sku: "STEELSERIES-ARCTIS", name: "SteelSeries Arctis Nova Pro Wireless", brand: "SteelSeries", price: 6999, quantity: 1 },
                { productId: "27", sku: "RAZER-VIPER-V3", name: "Razer Viper V3 Pro Wireless Mouse", brand: "Razer", price: 3299, quantity: 1 },
                { productId: "28", sku: "RAZER-HUNTSMAN-V3", name: "Razer Huntsman V3 Pro Keyboard", brand: "Razer", price: 4999, quantity: 1 }
            ],
            subtotal: 15297, shippingCost: 0, total: 15297, status: "ordered", orderedAt: new Date(Date.now() - 129600000).toISOString(),
            shippingAddress: { firstName: "Fatima", lastName: "Khan", email: "fatima@example.com", phone: "0731112233", address: "25 Mosque Street, Bo-Kaap", city: "Cape Town", province: "Western Cape", postalCode: "8001" },
            createdAt: new Date(Date.now() - 216000000).toISOString(), paidAt: new Date(Date.now() - 212400000).toISOString(), updatedAt: new Date(Date.now() - 129600000).toISOString()
        },
        // Shipped Orders
        {
            id: "test-3", orderRef: "XT-2401-E5F6", userId: "guest", userEmail: "mike@example.com",
            items: [
                { productId: "4", sku: "CORSAIR-32GB", name: "Corsair Vengeance DDR5 32GB", brand: "Corsair", price: 3299, quantity: 2 },
                { productId: "5", sku: "SAMSUNG-990PRO", name: "Samsung 990 Pro 2TB NVMe", brand: "Samsung", price: 4599, quantity: 1 }
            ],
            subtotal: 11197, shippingCost: 150, total: 11347, status: "shipped", trackingNumber: "TCG123456789",
            shippingAddress: { firstName: "Mike", lastName: "Williams", email: "mike@example.com", phone: "0761112223", address: "789 Hill Street, Berea", city: "Durban", province: "KwaZulu-Natal", postalCode: "4001" },
            createdAt: new Date(Date.now() - 172800000).toISOString(), paidAt: new Date(Date.now() - 169200000).toISOString(), shippedAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: "test-16", orderRef: "XT-2401-U1V2", userId: "user_789", userEmail: "sipho@example.com",
            items: [
                { productId: "29", sku: "ASUS-ROG-STRIX-4080", name: "ASUS ROG Strix RTX 4080 Super OC", brand: "ASUS", price: 28999, quantity: 1 },
                { productId: "30", sku: "CORSAIR-H170i", name: "Corsair H170i Elite LCD AIO", brand: "Corsair", price: 5499, quantity: 1 }
            ],
            subtotal: 34498, shippingCost: 0, total: 34498, status: "shipped", trackingNumber: "RAM987654321",
            shippingAddress: { firstName: "Sipho", lastName: "Ndlovu", email: "sipho@example.com", phone: "0823334455", address: "67 Church Street", city: "Pietermaritzburg", province: "KwaZulu-Natal", postalCode: "3201" },
            createdAt: new Date(Date.now() - 259200000).toISOString(), paidAt: new Date(Date.now() - 255600000).toISOString(), orderedAt: new Date(Date.now() - 172800000).toISOString(), shippedAt: new Date(Date.now() - 43200000).toISOString(), updatedAt: new Date(Date.now() - 43200000).toISOString()
        },
        {
            id: "test-17", orderRef: "XT-2401-W3X4", userId: "guest", userEmail: "amanda@example.com",
            items: [
                { productId: "31", sku: "SECRETLAB-TITAN", name: "Secretlab Titan Evo 2024", brand: "Secretlab", price: 9999, quantity: 1 }
            ],
            subtotal: 9999, shippingCost: 350, total: 10349, status: "shipped", trackingNumber: "CPT456789123",
            shippingAddress: { firstName: "Amanda", lastName: "Pretorius", email: "amanda@example.com", phone: "0795556677", address: "12 Wine Route, Paarl", city: "Paarl", province: "Western Cape", postalCode: "7646" },
            createdAt: new Date(Date.now() - 345600000).toISOString(), paidAt: new Date(Date.now() - 342000000).toISOString(), orderedAt: new Date(Date.now() - 259200000).toISOString(), shippedAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        // Delivered Orders
        {
            id: "test-4", orderRef: "XT-2401-G7H8", userId: "guest", userEmail: "lisa@example.com",
            items: [{ productId: "6", sku: "LOGI-G502X", name: "Logitech G502 X Plus Wireless", brand: "Logitech", price: 2799, quantity: 1 }],
            subtotal: 2799, shippingCost: 150, total: 2949, status: "delivered",
            shippingAddress: { firstName: "Lisa", lastName: "Brown", email: "lisa@example.com", phone: "0724445556", address: "321 Oak Avenue, Menlyn", city: "Pretoria", province: "Gauteng", postalCode: "0181" },
            createdAt: new Date(Date.now() - 604800000).toISOString(), paidAt: new Date(Date.now() - 600000000).toISOString(), shippedAt: new Date(Date.now() - 432000000).toISOString(), deliveredAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
            id: "test-18", orderRef: "XT-2401-Y5Z6", userId: "user_abc", userEmail: "johann@example.com",
            items: [
                { productId: "32", sku: "AMD-RX7900XTX", name: "AMD Radeon RX 7900 XTX", brand: "AMD", price: 22999, quantity: 1 },
                { productId: "33", sku: "AMD-5800X3D", name: "AMD Ryzen 7 5800X3D", brand: "AMD", price: 6999, quantity: 1 },
                { productId: "34", sku: "MSI-B550-TOMAHAWK", name: "MSI MAG B550 Tomahawk", brand: "MSI", price: 3499, quantity: 1 }
            ],
            subtotal: 33497, shippingCost: 0, total: 33497, status: "delivered", trackingNumber: "JHB111222333",
            shippingAddress: { firstName: "Johann", lastName: "Botha", email: "johann@example.com", phone: "0827778899", address: "45 Voortrekker Road", city: "Johannesburg", province: "Gauteng", postalCode: "2001" },
            createdAt: new Date(Date.now() - 864000000).toISOString(), paidAt: new Date(Date.now() - 860400000).toISOString(), orderedAt: new Date(Date.now() - 691200000).toISOString(), shippedAt: new Date(Date.now() - 518400000).toISOString(), deliveredAt: new Date(Date.now() - 345600000).toISOString(), updatedAt: new Date(Date.now() - 345600000).toISOString()
        },
        {
            id: "test-19", orderRef: "XT-2401-A7B8", userId: "guest", userEmail: "priya@example.com",
            items: [
                { productId: "35", sku: "SAMSUNG-49G95T", name: "Samsung Odyssey G9 49\" Curved", brand: "Samsung", price: 32999, quantity: 1 },
                { productId: "36", sku: "ERGOTRON-LX", name: "Ergotron LX Monitor Arm", brand: "Ergotron", price: 3299, quantity: 1 }
            ],
            subtotal: 36298, shippingCost: 0, total: 36298, status: "delivered", trackingNumber: "DBN444555666",
            shippingAddress: { firstName: "Priya", lastName: "Naidoo", email: "priya@example.com", phone: "0834445566", address: "88 Florida Road, Morningside", city: "Durban", province: "KwaZulu-Natal", postalCode: "4001" },
            createdAt: new Date(Date.now() - 1036800000).toISOString(), paidAt: new Date(Date.now() - 1033200000).toISOString(), orderedAt: new Date(Date.now() - 864000000).toISOString(), shippedAt: new Date(Date.now() - 691200000).toISOString(), deliveredAt: new Date(Date.now() - 518400000).toISOString(), updatedAt: new Date(Date.now() - 518400000).toISOString()
        },
        {
            id: "test-20", orderRef: "XT-2401-C9D0", userId: "user_xyz", userEmail: "willem@example.com",
            items: [
                { productId: "37", sku: "SONY-WH1000XM5", name: "Sony WH-1000XM5 Headphones", brand: "Sony", price: 7499, quantity: 1 },
                { productId: "38", sku: "SONY-A7M4", name: "Sony Alpha 7 IV Camera", brand: "Sony", price: 54999, quantity: 1 }
            ],
            subtotal: 62498, shippingCost: 0, total: 62498, status: "delivered", trackingNumber: "CPT777888999",
            shippingAddress: { firstName: "Willem", lastName: "De Villiers", email: "willem@example.com", phone: "0769998877", address: "200 Long Street", city: "Cape Town", province: "Western Cape", postalCode: "8001" },
            createdAt: new Date(Date.now() - 1209600000).toISOString(), paidAt: new Date(Date.now() - 1206000000).toISOString(), orderedAt: new Date(Date.now() - 1036800000).toISOString(), shippedAt: new Date(Date.now() - 864000000).toISOString(), deliveredAt: new Date(Date.now() - 691200000).toISOString(), updatedAt: new Date(Date.now() - 691200000).toISOString()
        },
        // Cancelled Orders
        {
            id: "test-21", orderRef: "XT-2401-E1F2", userId: "guest", userEmail: "cancelled@example.com",
            items: [
                { productId: "39", sku: "PS5-CONSOLE", name: "Sony PlayStation 5 Console", brand: "Sony", price: 12999, quantity: 1 },
                { productId: "40", sku: "PS5-CONTROLLER", name: "Sony DualSense Controller", brand: "Sony", price: 1699, quantity: 2 }
            ],
            subtotal: 16397, shippingCost: 150, total: 16547, status: "cancelled",
            shippingAddress: { firstName: "Test", lastName: "Customer", email: "cancelled@example.com", phone: "0800000000", address: "999 Cancelled Street", city: "Johannesburg", province: "Gauteng", postalCode: "2000" },
            createdAt: new Date(Date.now() - 432000000).toISOString(), updatedAt: new Date(Date.now() - 345600000).toISOString()
        },
        // High Value Order (Processing)
        {
            id: "test-22", orderRef: "XT-2401-G3H4", userId: "user_vip", userEmail: "vip@techcorp.co.za",
            items: [
                { productId: "41", sku: "NVIDIA-RTX4090", name: "NVIDIA GeForce RTX 4090 Founders Edition", brand: "NVIDIA", price: 44999, quantity: 2 },
                { productId: "42", sku: "AMD-EPYC-9654", name: "AMD EPYC 9654 Server CPU", brand: "AMD", price: 125000, quantity: 1 },
                { productId: "43", sku: "SAMSUNG-EVO-8TB", name: "Samsung 990 EVO 8TB NVMe", brand: "Samsung", price: 18999, quantity: 4 },
                { productId: "44", sku: "CORSAIR-AX1600i", name: "Corsair AX1600i Power Supply", brand: "Corsair", price: 9999, quantity: 2 }
            ],
            subtotal: 310990, shippingCost: 0, total: 310990, status: "processing",
            shippingAddress: { firstName: "Corporate", lastName: "IT Department", email: "vip@techcorp.co.za", phone: "0112223344", address: "1 Tech Park Tower, Sandton City", city: "Johannesburg", province: "Gauteng", postalCode: "2196" },
            createdAt: new Date(Date.now() - 28800000).toISOString(), paidAt: new Date(Date.now() - 25200000).toISOString(), updatedAt: new Date(Date.now() - 21600000).toISOString()
        }
    ]
}
