'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    User,
    Mail,
    Lock,
    Phone,
    Package,
    MapPin,
    LogOut,
    ChevronRight,
    ChevronDown,
    Eye,
    EyeOff,
    Plus,
    Edit2,
    Trash2,
    Check,
    Clock,
    Truck,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Heart,
    History
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useWishlist } from '@/lib/wishlist-context'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, Order, UserAddress } from '@/lib/types/user'

type Tab = 'profile' | 'orders' | 'history' | 'wishlist'
type AuthMode = 'login' | 'register' | 'verify' | 'forgot' | 'reset'

export default function AccountPage() {
    const router = useRouter()
    const {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        orders,
        confirmEmail,
        resendConfirmation,
        forgotPassword,
        confirmForgotPassword,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress
    } = useAuth()
    const { items: wishlistItems, removeItem: removeFromWishlist, isLoading: wishlistLoading } = useWishlist()

    const [activeTab, setActiveTab] = useState<Tab>('profile')

    // Auth form state
    const [authMode, setAuthMode] = useState<AuthMode>('login')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pendingEmail, setPendingEmail] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        verificationCode: '',
        newPassword: '',
    })

    // Address modal state
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
    const [addressFormData, setAddressFormData] = useState({
        label: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        isDefault: false,
    })

    // Order detail modal
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    // Profile edit state
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    })

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone || '',
            })
        }
    }, [user])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setFormError('')
        setFormSuccess('')
    }

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setFormError('')
        setFormSuccess('')

        try {
            switch (authMode) {
                case 'login':
                    const loginResult = await login(formData.email, formData.password)
                    if (!loginResult.success) {
                        if (loginResult.error?.includes('verify')) {
                            setPendingEmail(formData.email)
                            setAuthMode('verify')
                            setFormError('')
                        } else {
                            setFormError(loginResult.error || 'Login failed')
                        }
                    }
                    break

                case 'register':
                    if (!formData.firstName || !formData.lastName) {
                        setFormError('Please enter your full name')
                        setIsSubmitting(false)
                        return
                    }
                    if (formData.password !== formData.confirmPassword) {
                        setFormError('Passwords do not match')
                        setIsSubmitting(false)
                        return
                    }
                    const registerResult = await register({
                        email: formData.email,
                        password: formData.password,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        phone: formData.phone,
                    })
                    if (registerResult.success) {
                        if (registerResult.needsVerification) {
                            setPendingEmail(formData.email)
                            setAuthMode('verify')
                            setFormSuccess('Account created! Please check your email for a verification code.')
                        }
                    } else {
                        setFormError(registerResult.error || 'Registration failed')
                    }
                    break

                case 'verify':
                    const email = pendingEmail || formData.email
                    const verifyResult = await confirmEmail(email, formData.verificationCode)
                    if (verifyResult.success) {
                        setFormSuccess('Email verified! You can now log in.')
                        setAuthMode('login')
                        setFormData(prev => ({ ...prev, email: email, verificationCode: '' }))
                    } else {
                        setFormError(verifyResult.error || 'Verification failed')
                    }
                    break

                case 'forgot':
                    const forgotResult = await forgotPassword(formData.email)
                    if (forgotResult.success) {
                        setPendingEmail(formData.email)
                        setAuthMode('reset')
                        setFormSuccess('Check your email for a password reset code.')
                    } else {
                        setFormError(forgotResult.error || 'Failed to send reset code')
                    }
                    break

                case 'reset':
                    const resetResult = await confirmForgotPassword(
                        pendingEmail || formData.email,
                        formData.verificationCode,
                        formData.newPassword
                    )
                    if (resetResult.success) {
                        setFormSuccess('Password reset successfully! You can now log in.')
                        setAuthMode('login')
                        setFormData(prev => ({ ...prev, password: '', verificationCode: '', newPassword: '' }))
                    } else {
                        setFormError(resetResult.error || 'Password reset failed')
                    }
                    break
            }
        } catch (error) {
            setFormError('An error occurred. Please try again.')
        }

        setIsSubmitting(false)
    }

    const handleResendCode = async () => {
        setIsSubmitting(true)
        setFormError('')
        const result = await resendConfirmation(pendingEmail || formData.email)
        if (result.success) {
            setFormSuccess('A new verification code has been sent to your email.')
        } else {
            setFormError(result.error || 'Failed to resend code')
        }
        setIsSubmitting(false)
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const result = await updateProfile(profileData)
        if (result.success) {
            setIsEditingProfile(false)
        } else {
            setFormError(result.error || 'Failed to update profile')
        }
        setIsSubmitting(false)
    }

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (editingAddress) {
                await updateAddress(editingAddress.id, addressFormData)
            } else {
                await addAddress(addressFormData)
            }
            setShowAddressModal(false)
            resetAddressForm()
        } catch (error) {
            console.error('Error saving address:', error)
        }

        setIsSubmitting(false)
    }

    const handleDeleteAddress = async (id: string) => {
        if (confirm('Are you sure you want to delete this address?')) {
            await deleteAddress(id)
        }
    }

    const openEditAddress = (address: UserAddress) => {
        setEditingAddress(address)
        setAddressFormData({
            label: address.label,
            firstName: address.firstName,
            lastName: address.lastName,
            phone: address.phone,
            address: address.address,
            city: address.city,
            province: address.province,
            postalCode: address.postalCode,
            isDefault: address.isDefault,
        })
        setShowAddressModal(true)
    }

    const resetAddressForm = () => {
        setEditingAddress(null)
        setAddressFormData({
            label: '',
            firstName: '',
            lastName: '',
            phone: '',
            address: '',
            city: '',
            province: '',
            postalCode: '',
            isDefault: false,
        })
    }

    // If loading, show spinner
    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-dark-700 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    // If not authenticated, show login/register form
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center">
                <div className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="bg-dark-800 rounded-xl border border-gray-800 p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                                    {authMode === 'verify' ? <Mail className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
                                </div>
                                <h1 className="text-2xl font-bold text-white">
                                    {authMode === 'login' && 'Welcome Back'}
                                    {authMode === 'register' && 'Create Account'}
                                    {authMode === 'verify' && 'Verify Email'}
                                    {authMode === 'forgot' && 'Forgot Password'}
                                    {authMode === 'reset' && 'Reset Password'}
                                </h1>
                                <p className="text-gray-400 mt-2">
                                    {authMode === 'login' && 'Sign in to your X-Tech account'}
                                    {authMode === 'register' && 'Join X-Tech today'}
                                    {authMode === 'verify' && `Enter the code sent to ${pendingEmail || formData.email}`}
                                    {authMode === 'forgot' && 'Enter your email to receive a reset code'}
                                    {authMode === 'reset' && 'Enter the code and your new password'}
                                </p>
                            </div>

                            {/* Success Message */}
                            {formSuccess && (
                                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <p className="text-green-400 text-sm">{formSuccess}</p>
                                </div>
                            )}

                            {/* Error Message */}
                            {formError && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <p className="text-red-400 text-sm">{formError}</p>
                                </div>
                            )}

                            <form onSubmit={handleAuthSubmit} className="space-y-4">
                                {/* Name fields (register only) */}
                                {authMode === 'register' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Email (login, register, forgot) */}
                                {(authMode === 'login' || authMode === 'register' || authMode === 'forgot') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Phone (register only) */}
                                {authMode === 'register' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                                                placeholder="082 123 4567"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Password (login, register) */}
                                {(authMode === 'login' || authMode === 'register') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                                minLength={8}
                                                className="w-full pl-10 pr-12 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {authMode === 'register' && (
                                            <p className="text-xs text-gray-500 mt-1">Min 8 characters with uppercase, lowercase, and numbers</p>
                                        )}
                                    </div>
                                )}

                                {/* Confirm Password (register only) */}
                                {authMode === 'register' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                required
                                                minLength={8}
                                                className="w-full pl-10 pr-12 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Passwords do not match
                                            </p>
                                        )}
                                        {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                                            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Passwords match
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Verification Code */}
                                {(authMode === 'verify' || authMode === 'reset') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Verification Code</label>
                                        <input
                                            type="text"
                                            name="verificationCode"
                                            value={formData.verificationCode}
                                            onChange={handleInputChange}
                                            required
                                            maxLength={6}
                                            className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors text-center text-2xl tracking-widest"
                                            placeholder="000000"
                                        />
                                    </div>
                                )}

                                {/* New Password (reset) */}
                                {authMode === 'reset' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                required
                                                minLength={8}
                                                className="w-full pl-10 pr-12 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Forgot Password Link */}
                                {authMode === 'login' && (
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode('forgot')}
                                            className="text-sm text-teal-400 hover:text-teal-300"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-teal-500 text-black font-semibold rounded-lg hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {authMode === 'login' && 'Sign In'}
                                            {authMode === 'register' && 'Create Account'}
                                            {authMode === 'verify' && 'Verify Email'}
                                            {authMode === 'forgot' && 'Send Reset Code'}
                                            {authMode === 'reset' && 'Reset Password'}
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                {/* Resend Code */}
                                {authMode === 'verify' && (
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={isSubmitting}
                                        className="w-full py-2 text-gray-400 hover:text-teal-400 flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Resend verification code
                                    </button>
                                )}
                            </form>

                            {/* Toggle Auth Mode */}
                            <div className="mt-6 text-center space-y-2">
                                {(authMode === 'login' || authMode === 'register') && (
                                    <p className="text-gray-400">
                                        {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                                        <button
                                            onClick={() => {
                                                setAuthMode(authMode === 'login' ? 'register' : 'login')
                                                setFormError('')
                                                setFormSuccess('')
                                            }}
                                            className="ml-2 text-teal-400 hover:text-teal-300 font-medium"
                                        >
                                            {authMode === 'login' ? 'Create one' : 'Sign in'}
                                        </button>
                                    </p>
                                )}
                                {(authMode === 'verify' || authMode === 'forgot' || authMode === 'reset') && (
                                    <button
                                        onClick={() => {
                                            setAuthMode('login')
                                            setFormError('')
                                            setFormSuccess('')
                                        }}
                                        className="text-gray-400 hover:text-teal-400"
                                    >
                                        ← Back to login
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Guest Checkout */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-500 text-sm">
                                Or continue as{' '}
                                <Link href="/checkout" className="text-teal-400 hover:text-teal-300">
                                    guest
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    // Authenticated user view
    return (
        <div className="min-h-screen bg-dark-900 pt-32">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white">My Account</h1>
                            <p className="text-gray-400 mt-1">Welcome back, {user?.firstName}!</p>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-gray-800 pb-4 overflow-x-auto">
                        {[
                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'orders', label: 'Orders', icon: Package },
                            { id: 'history', label: 'History', icon: History },
                            { id: 'wishlist', label: 'Wishlist', icon: Heart },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-teal-500/20 text-teal-400'
                                    : 'text-gray-400 hover:text-white hover:bg-dark-800'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                                {tab.id === 'orders' && orders.length > 0 && (
                                    <span className="ml-1 px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                                        {orders.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-dark-800 rounded-xl border border-gray-800 p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                                    <button
                                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        {isEditingProfile ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>

                                {isEditingProfile ? (
                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.firstName}
                                                    onChange={(e) => setProfileData(p => ({ ...p, firstName: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.lastName}
                                                    onChange={(e) => setProfileData(p => ({ ...p, lastName: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))}
                                                className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingProfile(false)}
                                                className="px-4 py-2 text-gray-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-4 py-2 bg-teal-500 text-black font-medium rounded-lg hover:bg-teal-400 disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">First Name</p>
                                                <p className="text-white">{user?.firstName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Last Name</p>
                                                <p className="text-white">{user?.lastName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="text-white">{user?.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="text-white">{user?.phone || 'Not set'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Saved Addresses */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-dark-800 rounded-xl border border-gray-800 p-6 mt-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-teal-400" />
                                        <h2 className="text-xl font-semibold text-white">Saved Addresses</h2>
                                    </div>
                                    <button
                                        onClick={() => {
                                            resetAddressForm()
                                            setShowAddressModal(true)
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add New
                                    </button>
                                </div>

                                {(!user?.addresses || user.addresses.length === 0) ? (
                                    <div className="text-center py-8">
                                        <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-400">No addresses saved yet</p>
                                        <p className="text-sm text-gray-500">Add an address for faster checkout</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {user.addresses.map(address => (
                                            <div
                                                key={address.id}
                                                className={`bg-dark-700 rounded-lg border p-4 relative ${address.isDefault ? 'border-teal-500/50' : 'border-gray-700'}`}
                                            >
                                                {address.isDefault && (
                                                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        Default
                                                    </span>
                                                )}
                                                <h4 className="font-medium text-white mb-1">{address.label}</h4>
                                                <p className="text-gray-400 text-sm">
                                                    {address.firstName} {address.lastName}<br />
                                                    {address.address}<br />
                                                    {address.city}, {address.province} {address.postalCode}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-1">{address.phone}</p>

                                                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-600">
                                                    <button
                                                        onClick={() => openEditAddress(address)}
                                                        className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    {!address.isDefault && (
                                                        <button
                                                            onClick={() => setDefaultAddress(address.id)}
                                                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            Set Default
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteAddress(address.id)}
                                                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {orders.length === 0 ? (
                                <div className="bg-dark-800 rounded-xl border border-gray-800 p-12 text-center">
                                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-white mb-2">No orders yet</h3>
                                    <p className="text-gray-400 mb-6">When you place orders, they'll appear here.</p>
                                    <Link
                                        href="/products"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-black font-medium rounded-lg hover:bg-teal-400"
                                    >
                                        Start Shopping
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="bg-dark-800 rounded-xl border border-gray-800 p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-white">Order {order.orderRef}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                                                        {ORDER_STATUS_LABELS[order.status]}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-teal-400">{formatPrice(order.total)}</p>
                                                <p className="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div className="border-t border-gray-700 pt-4">
                                            <div className="flex flex-wrap gap-2">
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 bg-dark-700 rounded-lg px-3 py-2">
                                                        <span className="text-sm text-gray-300">{item.name}</span>
                                                        <span className="text-xs text-gray-500">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="flex items-center gap-2 bg-dark-700 rounded-lg px-3 py-2">
                                                        <span className="text-sm text-gray-400">+{order.items.length - 3} more</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="mt-4 text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1"
                                        >
                                            View Details
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').length === 0 ? (
                                <div className="bg-dark-800 rounded-xl border border-gray-800 p-12 text-center">
                                    <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-white mb-2">No order history</h3>
                                    <p className="text-gray-400 mb-6">Your completed and cancelled orders will appear here.</p>
                                </div>
                            ) : (
                                orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').map(order => (
                                    <div key={order.id} className="bg-dark-800 rounded-xl border border-gray-800 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm text-gray-400">Order #{order.orderRef}</p>
                                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                                                {ORDER_STATUS_LABELS[order.status]}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-medium">{formatPrice(order.total)}</p>
                                            <p className="text-gray-400 text-sm">{order.items.length} item(s)</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="mt-4 text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1"
                                        >
                                            View Details
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Wishlist Tab */}
                    {activeTab === 'wishlist' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {wishlistLoading ? (
                                <div className="bg-dark-800 rounded-xl border border-gray-800 p-12 text-center">
                                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                                    <p className="text-gray-400">Loading wishlist...</p>
                                </div>
                            ) : wishlistItems.length === 0 ? (
                                <div className="bg-dark-800 rounded-xl border border-gray-800 p-12 text-center">
                                    <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-white mb-2">Your wishlist is empty</h3>
                                    <p className="text-gray-400 mb-6">Save items you love by clicking the heart icon.</p>
                                    <Link
                                        href="/products"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-black font-medium rounded-lg hover:bg-teal-400"
                                    >
                                        Browse Products
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {wishlistItems.map(item => (
                                        <div key={item.sku} className="bg-dark-800 rounded-xl border border-gray-800 p-4">
                                            <Link href={`/products/${item.sku}`} className="block">
                                                <div className="aspect-square bg-dark-700 rounded-lg mb-3 overflow-hidden">
                                                    {item.images?.[0] ? (
                                                        <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-12 h-12 text-gray-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">{item.name}</h3>
                                                <p className="text-teal-400 font-semibold">{formatPrice(item.price)}</p>
                                            </Link>
                                            <button
                                                onClick={() => removeFromWishlist(item.sku)}
                                                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-800 rounded-xl border border-gray-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Order {selectedOrder.orderRef}</h3>
                                <p className="text-gray-500 text-sm">
                                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-ZA', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[selectedOrder.status]}`}>
                                {ORDER_STATUS_LABELS[selectedOrder.status]}
                            </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-3 mb-6">
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-700">
                                    <div>
                                        <p className="text-white">{item.name}</p>
                                        <p className="text-sm text-gray-500">SKU: {item.sku} · Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-white">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 border-t border-gray-700 pt-4">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal</span>
                                <span>{formatPrice(selectedOrder.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Shipping</span>
                                <span>{selectedOrder.shippingCost === 0 ? 'Free' : formatPrice(selectedOrder.shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-gray-700">
                                <span>Total</span>
                                <span className="text-teal-400">{formatPrice(selectedOrder.total)}</span>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Shipping Address</h4>
                            <p className="text-white">
                                {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}<br />
                                {selectedOrder.shippingAddress.address}<br />
                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="mt-6 w-full py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddressModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-800 rounded-xl border border-gray-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-semibold text-white mb-6">
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>

                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Label (e.g., Home, Office)</label>
                                <input
                                    type="text"
                                    value={addressFormData.label}
                                    onChange={(e) => setAddressFormData(p => ({ ...p, label: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                    placeholder="Home"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={addressFormData.firstName}
                                        onChange={(e) => setAddressFormData(p => ({ ...p, firstName: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={addressFormData.lastName}
                                        onChange={(e) => setAddressFormData(p => ({ ...p, lastName: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={addressFormData.phone}
                                    onChange={(e) => setAddressFormData(p => ({ ...p, phone: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Street Address</label>
                                <input
                                    type="text"
                                    value={addressFormData.address}
                                    onChange={(e) => setAddressFormData(p => ({ ...p, address: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                    placeholder="123 Main Street, Apt 4"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={addressFormData.city}
                                        onChange={(e) => setAddressFormData(p => ({ ...p, city: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Province</label>
                                    <div className="relative">
                                        <select
                                            value={addressFormData.province}
                                            onChange={(e) => setAddressFormData(p => ({ ...p, province: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 pr-10 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
                                        >
                                            <option value="">Select</option>
                                            <option value="Eastern Cape">Eastern Cape</option>
                                            <option value="Free State">Free State</option>
                                            <option value="Gauteng">Gauteng</option>
                                            <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                            <option value="Limpopo">Limpopo</option>
                                            <option value="Mpumalanga">Mpumalanga</option>
                                            <option value="Northern Cape">Northern Cape</option>
                                            <option value="North West">North West</option>
                                            <option value="Western Cape">Western Cape</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Postal Code</label>
                                    <input
                                        type="text"
                                        value={addressFormData.postalCode}
                                        onChange={(e) => setAddressFormData(p => ({ ...p, postalCode: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={addressFormData.isDefault}
                                    onChange={(e) => setAddressFormData(p => ({ ...p, isDefault: e.target.checked }))}
                                    className="w-5 h-5 rounded border-gray-600 bg-dark-700 text-teal-500 focus:ring-teal-500"
                                />
                                <span className="text-gray-300">Set as default address</span>
                            </label>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(false)}
                                    className="flex-1 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-teal-500 text-black font-medium rounded-lg hover:bg-teal-400 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : (editingAddress ? 'Update' : 'Add Address')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
