'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface QuoteItem {
    sku: string
    name: string
    price: number
    quantity: number
    image?: string
}

export interface QuoteRequest {
    id: string
    items?: QuoteItem[]  // Optional - for backward compatibility
    componentDescription: string  // What components they need a quote for
    customerName: string
    customerEmail: string
    customerPhone: string
    message?: string
    status: 'pending' | 'quoted' | 'accepted' | 'rejected'
    createdAt: string
    quotedPrice?: number
    adminNotes?: string
}

interface QuoteContextType {
    requests: QuoteRequest[]
    isLoading: boolean
    showModal: boolean
    setShowModal: (show: boolean) => void
    submitQuoteRequest: (data: {
        componentDescription: string
        customerName: string
        customerEmail: string
        customerPhone: string
        message?: string
    }) => Promise<boolean>
    updateQuoteStatus: (id: string, status: QuoteRequest['status'], quotedPrice?: number, adminNotes?: string) => void
    deleteQuoteRequest: (id: string) => void
    pendingCount: number
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined)

const STORAGE_KEY = 'xtech-quote-requests'

export function QuoteProvider({ children }: { children: ReactNode }) {
    const [requests, setRequests] = useState<QuoteRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    // Load quote requests from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                setRequests(JSON.parse(stored))
            }
        } catch (e) {
            console.error('Failed to load quote requests:', e)
        }
        setIsLoading(false)
    }, [])

    // Save to localStorage whenever requests change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
        }
    }, [requests, isLoading])

    const submitQuoteRequest = async (data: {
        componentDescription: string
        customerName: string
        customerEmail: string
        customerPhone: string
        message?: string
    }): Promise<boolean> => {
        try {
            const quoteId = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            const newRequest: QuoteRequest = {
                id: quoteId,
                componentDescription: data.componentDescription,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                message: data.message,
                status: 'pending',
                createdAt: new Date().toISOString()
            }

            // Save to local state first
            setRequests(prev => [newRequest, ...prev])

            // Send to API to trigger emails
            try {
                const response = await fetch('/api/quotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        quoteId,
                        componentDescription: data.componentDescription,
                        customerName: data.customerName,
                        customerEmail: data.customerEmail,
                        customerPhone: data.customerPhone,
                        message: data.message
                    })
                })

                if (!response.ok) {
                    console.error('Failed to send quote emails')
                }
            } catch (apiError) {
                console.error('API error:', apiError)
                // Don't fail the submission if email fails
            }

            // Dispatch custom event for admin notification
            window.dispatchEvent(new CustomEvent('quote-request-submitted', { detail: newRequest }))

            return true
        } catch (e) {
            console.error('Failed to submit quote request:', e)
            return false
        }
    }

    const updateQuoteStatus = (
        id: string,
        status: QuoteRequest['status'],
        quotedPrice?: number,
        adminNotes?: string
    ) => {
        setRequests(prev => prev.map(req =>
            req.id === id
                ? { ...req, status, quotedPrice, adminNotes }
                : req
        ))
    }

    const deleteQuoteRequest = (id: string) => {
        setRequests(prev => prev.filter(req => req.id !== id))
    }

    const pendingCount = requests.filter(r => r.status === 'pending').length

    return (
        <QuoteContext.Provider value={{
            requests,
            isLoading,
            showModal,
            setShowModal,
            submitQuoteRequest,
            updateQuoteStatus,
            deleteQuoteRequest,
            pendingCount
        }}>
            {children}
        </QuoteContext.Provider>
    )
}

export function useQuote() {
    const context = useContext(QuoteContext)
    if (!context) {
        throw new Error('useQuote must be used within a QuoteProvider')
    }
    return context
}
