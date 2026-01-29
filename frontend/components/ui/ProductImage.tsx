'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImageProps {
    src: string | undefined | null
    alt: string
    fill?: boolean
    width?: number
    height?: number
    className?: string
    containerClassName?: string
    priority?: boolean
    sizes?: string
    loading?: 'lazy' | 'eager'
}

// Decode HTML entities in URLs (e.g., &#x2122; -> ™)
function decodeHtmlEntities(url: string): string {
    const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null
    if (textarea) {
        textarea.innerHTML = url
        return textarea.value
    }
    // Server-side fallback - decode common entities
    return url
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
}

export function ProductImage({
    src,
    alt,
    fill = false,
    width,
    height,
    className,
    containerClassName,
    priority = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    loading = 'lazy'
}: ProductImageProps) {
    const [imageError, setImageError] = useState(false)

    // Check if we have a valid image URL
    const hasValidSrc = src && typeof src === 'string' && src.length > 0

    // Decode HTML entities from URLs
    const cleanSrc = hasValidSrc ? decodeHtmlEntities(src) : null

    // Show fallback placeholder if no valid src or error occurred
    if (imageError || !cleanSrc) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-gray-100",
                    fill ? "absolute inset-0" : "w-full h-full"
                )}
                role="img"
                aria-label={alt || 'Product image unavailable'}
            >
                <Package className="w-12 h-12 text-gray-400" aria-hidden="true" />
            </div>
        )
    }

    if (fill) {
        return (
            <Image
                src={cleanSrc}
                alt={alt}
                fill
                className={cn("object-contain", className)}
                onError={() => setImageError(true)}
                priority={priority}
                loading={priority ? 'eager' : loading}
                sizes={sizes}
                unoptimized
            />
        )
    }

    return (
        <Image
            src={cleanSrc}
            alt={alt}
            width={width || 200}
            height={height || 200}
            className={cn("object-contain", className)}
            onError={() => setImageError(true)}
            priority={priority}
            loading={priority ? 'eager' : loading}
            unoptimized
        />
    )
}