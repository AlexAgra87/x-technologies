import { Product, Category, Brand, ProductFilters, PaginatedResponse, ApiResponse } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

class ApiClient {
    private baseUrl: string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }))
            throw new Error(error.message || `API Error: ${response.status}`)
        }

        const data: ApiResponse<T> = await response.json()

        if (!data.success) {
            throw new Error(data.error?.message || 'Unknown error')
        }

        return data.data as T
    }

    private normalizeProduct(product: any): Product {
        // Normalize stock structure
        const stockTotal = product.stock?.total ?? product.stock?.quantity ?? 0
        return {
            ...product,
            originalPrice: product.rrp || product.originalPrice,
            stock: {
                quantity: stockTotal,
                total: stockTotal,
                status: stockTotal === 0 ? 'out_of_stock' : stockTotal <= 5 ? 'low_stock' : 'in_stock',
                locations: product.stock?.locations || {},
            },
            images: product.images?.filter((img: string) => img && img.length > 0) || [],
        }
    }

    async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
        const params = new URLSearchParams()

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, String(value))
                }
            })
        }

        const queryString = params.toString()
        const response = await this.fetch<{ data: any[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }>(`/products${queryString ? `?${queryString}` : ''}`)

        // Transform the response to match the PaginatedResponse interface
        return {
            items: (response.data || []).map(p => this.normalizeProduct(p)),
            total: response.pagination?.total || 0,
            page: response.pagination?.page || 1,
            limit: response.pagination?.limit || 20,
            totalPages: response.pagination?.totalPages || 1,
            hasNext: response.pagination?.hasNext || false,
            hasPrev: response.pagination?.hasPrev || false,
        }
    }

    async getProduct(sku: string): Promise<Product> {
        const product = await this.fetch<any>(`/products/${encodeURIComponent(sku)}`)
        return this.normalizeProduct(product)
    }

    async searchProducts(query: string, limit = 20): Promise<Product[]> {
        return this.fetch<Product[]>(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`)
    }

    async getDeals(limit = 50, category?: string): Promise<Product[]> {
        const params = new URLSearchParams()
        params.append('limit', String(limit))
        if (category) params.append('category', category)
        const products = await this.fetch<any[]>(`/products/deals?${params.toString()}`)
        return products.map(p => this.normalizeProduct(p))
    }

    async getCategories(): Promise<Category[]> {
        return this.fetch<Category[]>('/products/categories')
    }

    async getBrands(): Promise<Brand[]> {
        return this.fetch<Brand[]>('/products/brands')
    }

    async refreshCache(): Promise<{ message: string }> {
        return this.fetch<{ message: string }>('/products/refresh-cache', {
            method: 'POST',
        })
    }

    async healthCheck(): Promise<{ status: string }> {
        return this.fetch<{ status: string }>('/health')
    }
}

export const apiClient = new ApiClient(API_BASE_URL)

// React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (sku: string) => [...productKeys.details(), sku] as const,
    search: (query: string) => [...productKeys.all, 'search', query] as const,
    categories: () => [...productKeys.all, 'categories'] as const,
    brands: () => [...productKeys.all, 'brands'] as const,
}

export function useProducts(filters?: ProductFilters) {
    return useQuery({
        queryKey: productKeys.list(filters || {}),
        queryFn: () => apiClient.getProducts(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useProduct(sku: string) {
    return useQuery({
        queryKey: productKeys.detail(sku),
        queryFn: () => apiClient.getProduct(sku),
        enabled: !!sku,
    })
}

export function useProductSearch(query: string, enabled = true) {
    return useQuery({
        queryKey: productKeys.search(query),
        queryFn: () => apiClient.searchProducts(query),
        enabled: enabled && query.length >= 2,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

export function useDeals(limit = 50, category?: string) {
    return useQuery({
        queryKey: ['deals', limit, category],
        queryFn: () => apiClient.getDeals(limit, category),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useCategories() {
    return useQuery({
        queryKey: productKeys.categories(),
        queryFn: () => apiClient.getCategories(),
        staleTime: 30 * 60 * 1000, // 30 minutes
    })
}

export function useBrands() {
    return useQuery({
        queryKey: productKeys.brands(),
        queryFn: () => apiClient.getBrands(),
        staleTime: 30 * 60 * 1000, // 30 minutes
    })
}

export function useRefreshCache() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => apiClient.refreshCache(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all })
        },
    })
}
