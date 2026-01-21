'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
    CognitoUserAttribute,
    CognitoUserSession,
} from 'amazon-cognito-identity-js'
import { awsConfig } from '@/lib/aws-config'
import { User, UserAddress, Order, CreateOrderData } from '@/lib/types/user'

// Cognito User Pool setup
const userPool = new CognitoUserPool({
    UserPoolId: awsConfig.cognito.userPoolId,
    ClientId: awsConfig.cognito.clientId,
})

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    register: (data: RegisterData) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>
    confirmEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>
    resendConfirmation: (email: string) => Promise<{ success: boolean; error?: string }>
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
    confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
    addAddress: (address: Omit<UserAddress, 'id'>) => Promise<void>
    updateAddress: (id: string, address: Partial<UserAddress>) => Promise<void>
    deleteAddress: (id: string) => Promise<void>
    setDefaultAddress: (id: string) => Promise<void>
    // Orders
    orders: Order[]
    createOrder: (data: CreateOrderData) => Promise<Order>
    getOrders: () => Order[]
    refreshOrders: () => Promise<void>
}

interface RegisterData {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)
const generateOrderRef = () => `XT${Date.now().toString(36).toUpperCase()}`

// Local storage keys (used as fallback)
const ORDERS_KEY = 'xtech-orders'
const USER_DATA_KEY = 'xtech-user-data'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [session, setSession] = useState<CognitoUserSession | null>(null)

    // Check for existing session on mount
    useEffect(() => {
        checkSession()
    }, [])

    const checkSession = async () => {
        try {
            const cognitoUser = userPool.getCurrentUser()
            if (cognitoUser) {
                cognitoUser.getSession((err: Error | null, sess: CognitoUserSession | null) => {
                    if (err || !sess || !sess.isValid()) {
                        setIsLoading(false)
                        return
                    }
                    setSession(sess)
                    loadUserFromCognito(cognitoUser)
                })
            } else {
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error checking session:', error)
            setIsLoading(false)
        }
    }

    const loadUserFromCognito = (cognitoUser: CognitoUser) => {
        cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
                console.error('Error getting user attributes:', err)
                setIsLoading(false)
                return
            }

            const userAttrs: Record<string, string> = {}
            attributes?.forEach(attr => {
                userAttrs[attr.getName()] = attr.getValue()
            })

            const userId = userAttrs['sub'] || cognitoUser.getUsername()

            // Try to load saved addresses from localStorage
            const savedData = localStorage.getItem(`${USER_DATA_KEY}-${userId}`)
            const localData = savedData ? JSON.parse(savedData) : {}

            // Build user object from Cognito attributes
            const userData: User = {
                id: userId,
                email: userAttrs['email'] || '',
                firstName: userAttrs['given_name'] || '',
                lastName: userAttrs['family_name'] || '',
                phone: userAttrs['phone_number'] || '',
                addresses: localData.addresses || [],
                createdAt: localData.createdAt || new Date().toISOString(),
                isAdmin: false,
            }

            setUser(userData)
            loadOrders(userId)
            setIsLoading(false)
        })
    }

    const loadOrders = (userId: string) => {
        try {
            const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]
            const userOrders = allOrders.filter(o => o.userId === userId)
            setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        } catch (error) {
            console.error('Error loading orders:', error)
        }
    }

    const saveUserToLocalStorage = (userData: User) => {
        try {
            localStorage.setItem(`${USER_DATA_KEY}-${userData.id}`, JSON.stringify({
                addresses: userData.addresses,
                createdAt: userData.createdAt,
            }))
        } catch (error) {
            console.error('Error saving user data:', error)
        }
    }

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            const cognitoUser = new CognitoUser({
                Username: email,
                Pool: userPool,
            })

            const authDetails = new AuthenticationDetails({
                Username: email,
                Password: password,
            })

            cognitoUser.authenticateUser(authDetails, {
                onSuccess: (sess) => {
                    setSession(sess)
                    loadUserFromCognito(cognitoUser)
                    resolve({ success: true })
                },
                onFailure: (err) => {
                    console.error('Login failed:', err)
                    let errorMessage = 'Login failed. Please try again.'

                    if (err.code === 'UserNotConfirmedException') {
                        errorMessage = 'Please verify your email address first.'
                    } else if (err.code === 'NotAuthorizedException') {
                        errorMessage = 'Incorrect email or password.'
                    } else if (err.code === 'UserNotFoundException') {
                        errorMessage = 'No account found with this email.'
                    }

                    resolve({ success: false, error: errorMessage })
                },
                newPasswordRequired: () => {
                    resolve({ success: false, error: 'Password change required. Please contact support.' })
                },
            })
        })
    }

    const register = async (data: RegisterData): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
        return new Promise((resolve) => {
            const attributeList = [
                new CognitoUserAttribute({ Name: 'email', Value: data.email }),
                new CognitoUserAttribute({ Name: 'given_name', Value: data.firstName }),
                new CognitoUserAttribute({ Name: 'family_name', Value: data.lastName }),
            ]

            // Only add phone if provided and format for Cognito (E.164)
            if (data.phone) {
                let formattedPhone = data.phone.replace(/\D/g, '')
                if (formattedPhone.startsWith('0')) {
                    formattedPhone = '+27' + formattedPhone.substring(1)
                } else if (!formattedPhone.startsWith('+')) {
                    formattedPhone = '+27' + formattedPhone
                }
                attributeList.push(new CognitoUserAttribute({ Name: 'phone_number', Value: formattedPhone }))
            }

            userPool.signUp(data.email, data.password, attributeList, [], (err, result) => {
                if (err) {
                    console.error('Registration failed:', err)
                    let errorMessage = 'Registration failed. Please try again.'

                    if (err.message.includes('Password')) {
                        errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, and numbers.'
                    } else if (err.message.includes('email') || err.name === 'UsernameExistsException') {
                        errorMessage = 'An account with this email already exists.'
                    } else if (err.message) {
                        errorMessage = err.message
                    }

                    resolve({ success: false, error: errorMessage })
                    return
                }

                // Store temp data for after verification
                localStorage.setItem('xtech-pending-user', JSON.stringify({
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                }))

                resolve({ success: true, needsVerification: !result?.userConfirmed })
            })
        })
    }

    const confirmEmail = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            const cognitoUser = new CognitoUser({
                Username: email,
                Pool: userPool,
            })

            cognitoUser.confirmRegistration(code, true, (err) => {
                if (err) {
                    console.error('Confirmation failed:', err)
                    let errorMessage = 'Verification failed. Please try again.'

                    if (err.code === 'CodeMismatchException') {
                        errorMessage = 'Invalid verification code.'
                    } else if (err.code === 'ExpiredCodeException') {
                        errorMessage = 'Verification code has expired. Please request a new one.'
                    }

                    resolve({ success: false, error: errorMessage })
                    return
                }

                localStorage.removeItem('xtech-pending-user')
                resolve({ success: true })
            })
        })
    }

    const resendConfirmation = async (email: string): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            const cognitoUser = new CognitoUser({
                Username: email,
                Pool: userPool,
            })

            cognitoUser.resendConfirmationCode((err) => {
                if (err) {
                    console.error('Resend failed:', err)
                    resolve({ success: false, error: 'Failed to resend code. Please try again.' })
                    return
                }
                resolve({ success: true })
            })
        })
    }

    const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            const cognitoUser = new CognitoUser({
                Username: email,
                Pool: userPool,
            })

            cognitoUser.forgotPassword({
                onSuccess: () => {
                    resolve({ success: true })
                },
                onFailure: (err) => {
                    console.error('Forgot password failed:', err)
                    resolve({ success: false, error: 'Failed to send reset code. Please try again.' })
                },
            })
        })
    }

    const confirmForgotPassword = async (email: string, code: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            const cognitoUser = new CognitoUser({
                Username: email,
                Pool: userPool,
            })

            cognitoUser.confirmPassword(code, newPassword, {
                onSuccess: () => {
                    resolve({ success: true })
                },
                onFailure: (err: any) => {
                    console.error('Confirm password failed:', err)
                    let errorMessage = 'Failed to reset password. Please try again.'

                    if (err.code === 'CodeMismatchException') {
                        errorMessage = 'Invalid verification code.'
                    } else if (err.message?.includes('Password')) {
                        errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, and numbers.'
                    }

                    resolve({ success: false, error: errorMessage })
                },
            })
        })
    }

    const logout = () => {
        const cognitoUser = userPool.getCurrentUser()
        if (cognitoUser) {
            cognitoUser.signOut()
        }
        setUser(null)
        setSession(null)
        setOrders([])
    }

    const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        try {
            // Update Cognito attributes if they changed
            const cognitoUser = userPool.getCurrentUser()
            if (cognitoUser && (data.firstName || data.lastName || data.phone)) {
                await new Promise<void>((resolve, reject) => {
                    cognitoUser.getSession((err: Error | null, sess: CognitoUserSession | null) => {
                        if (err || !sess) {
                            reject(err || new Error('No session'))
                            return
                        }

                        const attributeList: CognitoUserAttribute[] = []

                        if (data.firstName) {
                            attributeList.push(new CognitoUserAttribute({ Name: 'given_name', Value: data.firstName }))
                        }
                        if (data.lastName) {
                            attributeList.push(new CognitoUserAttribute({ Name: 'family_name', Value: data.lastName }))
                        }
                        if (data.phone) {
                            let formattedPhone = data.phone.replace(/\D/g, '')
                            if (formattedPhone.startsWith('0')) {
                                formattedPhone = '+27' + formattedPhone.substring(1)
                            } else if (!formattedPhone.startsWith('+')) {
                                formattedPhone = '+27' + formattedPhone
                            }
                            attributeList.push(new CognitoUserAttribute({ Name: 'phone_number', Value: formattedPhone }))
                        }

                        if (attributeList.length > 0) {
                            cognitoUser.updateAttributes(attributeList, (err) => {
                                if (err) reject(err)
                                else resolve()
                            })
                        } else {
                            resolve()
                        }
                    })
                })
            }

            // Update local state
            const updatedUser = { ...user, ...data }
            setUser(updatedUser)
            saveUserToLocalStorage(updatedUser)

            return { success: true }
        } catch (error) {
            console.error('Error updating profile:', error)
            return { success: false, error: 'Failed to update profile' }
        }
    }

    const addAddress = async (address: Omit<UserAddress, 'id'>) => {
        if (!user) return

        const newAddress: UserAddress = {
            ...address,
            id: generateId(),
        }

        const addresses = [...user.addresses]
        if (addresses.length === 0 || address.isDefault) {
            addresses.forEach(a => a.isDefault = false)
            newAddress.isDefault = true
        }
        addresses.push(newAddress)

        await updateProfile({ addresses })
    }

    const updateAddress = async (id: string, data: Partial<UserAddress>) => {
        if (!user) return

        const addresses = user.addresses.map(a =>
            a.id === id ? { ...a, ...data } : a
        )
        await updateProfile({ addresses })
    }

    const deleteAddress = async (id: string) => {
        if (!user) return

        const addresses = user.addresses.filter(a => a.id !== id)
        if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
            addresses[0].isDefault = true
        }
        await updateProfile({ addresses })
    }

    const setDefaultAddress = async (id: string) => {
        if (!user) return

        const addresses = user.addresses.map(a => ({
            ...a,
            isDefault: a.id === id,
        }))
        await updateProfile({ addresses })
    }

    const createOrder = async (data: CreateOrderData): Promise<Order> => {
        try {
            // Call the API to create order (saves to DynamoDB, sends emails)
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderData: data,
                    userId: user?.id || 'guest',
                    userEmail: data.shippingAddress.email,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create order')
            }

            const result = await response.json()

            // Create local order object from API response
            const order: Order = {
                id: result.order.id,
                orderRef: result.order.orderRef,
                userId: user?.id || 'guest',
                userEmail: data.shippingAddress.email,
                items: data.items,
                subtotal: data.subtotal,
                shippingCost: data.shippingCost,
                total: data.total,
                status: result.order.status || 'pending_payment',
                shippingAddress: data.shippingAddress,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            // Also save to localStorage as backup/offline access
            const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]
            allOrders.push(order)
            localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders))

            if (user) {
                setOrders(prev => [order, ...prev])
            }

            return order
        } catch (error) {
            console.error('API order creation failed, falling back to local:', error)

            // Fallback to local order creation
            const order: Order = {
                id: generateId(),
                orderRef: generateOrderRef(),
                userId: user?.id || 'guest',
                userEmail: data.shippingAddress.email,
                items: data.items,
                subtotal: data.subtotal,
                shippingCost: data.shippingCost,
                total: data.total,
                status: 'pending_payment',
                shippingAddress: data.shippingAddress,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            // Save to localStorage
            const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]
            allOrders.push(order)
            localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders))

            if (user) {
                setOrders(prev => [order, ...prev])
            }

            return order
        }
    }

    const getOrders = (): Order[] => {
        return orders
    }

    const refreshOrders = async () => {
        if (!user) return

        try {
            // Try to fetch from API first
            const response = await fetch(`/api/orders?userId=${user.id}`)
            if (response.ok) {
                const { orders: apiOrders } = await response.json()
                if (apiOrders && apiOrders.length > 0) {
                    setOrders(apiOrders.sort((a: Order, b: Order) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    ))
                    return
                }
            }
        } catch (error) {
            console.error('Error fetching orders from API:', error)
        }

        // Fallback to localStorage
        loadOrders(user.id)
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            confirmEmail,
            resendConfirmation,
            forgotPassword,
            confirmForgotPassword,
            logout,
            updateProfile,
            addAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress,
            orders,
            createOrder,
            getOrders,
            refreshOrders,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
