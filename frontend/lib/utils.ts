import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
}

export function calculateDiscount(price: number, rrp: number): number {
    if (rrp <= price) return 0
    return Math.round(((rrp - price) / rrp) * 100)
}

export function getStockStatus(stock: number): { status: 'in-stock' | 'low-stock' | 'out-of-stock', label: string } {
    if (stock === 0) return { status: 'out-of-stock', label: 'Out of Stock' }
    if (stock <= 5) return { status: 'low-stock', label: `Only ${stock} left` }
    return { status: 'in-stock', label: 'In Stock' }
}

export function getStockLabel(stock: number): string {
    if (stock === 0) return 'Out of Stock'
    if (stock <= 5) return `Only ${stock} left`
    return 'In Stock'
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
}
