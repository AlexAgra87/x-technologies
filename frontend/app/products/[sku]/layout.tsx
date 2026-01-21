import { Metadata } from 'next'
import { createMetadata, siteConfig } from '@/lib/metadata'

// Note: This is a basic layout since the product page is client-side.
// For full SSR/SEO, the product page would need to be refactored to fetch data server-side.

export async function generateMetadata({
    params
}: {
    params: Promise<{ sku: string }>
}): Promise<Metadata> {
    const { sku } = await params
    const decodedSku = decodeURIComponent(sku)

    // Try to fetch product data for dynamic metadata
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        const response = await fetch(`${apiUrl}/products/${encodeURIComponent(decodedSku)}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (response.ok) {
            const result = await response.json()
            const product = result.data || result

            return createMetadata({
                title: product.name,
                description: `Buy ${product.name} from ${product.brand}. ${product.categories?.[0] ? `Shop ${product.categories[0]} at X-Tech.` : 'Shop at X-Tech.'}`,
                path: `/products/${sku}`,
                image: product.images?.[0] || undefined,
            })
        }
    } catch (error) {
        console.error('Failed to fetch product for metadata:', error)
    }

    // Fallback metadata
    return createMetadata({
        title: `Product ${decodedSku}`,
        description: `View product details for ${decodedSku} at X-Tech.`,
        path: `/products/${sku}`,
    })
}

export default function ProductLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
