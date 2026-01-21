import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://x-tech.co.za'

export const siteConfig = {
    name: 'X-Tech',
    description: 'Your trusted source for high-quality computer components in South Africa. GPUs, CPUs, motherboards, memory, and more from top brands.',
    url: baseUrl,
    ogImage: `${baseUrl}/og-image.jpg`,
    links: {
        twitter: 'https://twitter.com/xtech',
        facebook: 'https://facebook.com/xtech',
        instagram: 'https://instagram.com/xtech',
    },
    contact: {
        email: 'sales@x-tech.co.za',
        phone: '+27 11 234 5678',
        whatsapp: '27112345678',
    }
}

export function createMetadata(page: {
    title?: string
    description?: string
    path?: string
    image?: string
    noIndex?: boolean
}): Metadata {
    const title = page.title
        ? `${page.title} | ${siteConfig.name}`
        : `${siteConfig.name} | Premium Computer Components`

    const description = page.description || siteConfig.description
    const url = page.path ? `${siteConfig.url}${page.path}` : siteConfig.url
    const image = page.image || siteConfig.ogImage

    return {
        title,
        description,
        keywords: [
            'computer components',
            'PC parts',
            'GPU',
            'graphics cards',
            'CPU',
            'processors',
            'motherboard',
            'RAM',
            'memory',
            'storage',
            'SSD',
            'gaming PC',
            'South Africa',
            'X-Tech',
        ],
        authors: [{ name: siteConfig.name }],
        creator: siteConfig.name,
        metadataBase: new URL(siteConfig.url),
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: 'website',
            locale: 'en_ZA',
            url,
            title,
            description,
            siteName: siteConfig.name,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
        robots: page.noIndex ? {
            index: false,
            follow: true,
        } : {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    }
}

// Page-specific metadata
export const pageMetadata = {
    home: createMetadata({
        description: 'Shop premium computer components at X-Tech. Find the best deals on GPUs, CPUs, motherboards, RAM and more from trusted brands. Fast delivery across South Africa.',
    }),

    products: createMetadata({
        title: 'All Products',
        description: 'Browse our complete range of computer components. Graphics cards, processors, memory, storage, and more from top brands like NVIDIA, AMD, Intel, and Corsair.',
        path: '/products',
    }),

    deals: createMetadata({
        title: 'Special Offers & Deals',
        description: 'Save big on premium computer components. Check out our latest deals and discounts on GPUs, CPUs, and more.',
        path: '/deals',
    }),

    about: createMetadata({
        title: 'About Us',
        description: 'Learn about X-Tech - your trusted partner for computer components in South Africa. Quality products, expert advice, and fast delivery.',
        path: '/about',
    }),

    contact: createMetadata({
        title: 'Contact Us',
        description: 'Get in touch with X-Tech. We\'re here to help with your computer component needs. Call, email, or visit our showroom.',
        path: '/contact',
    }),

    cart: createMetadata({
        title: 'Shopping Cart',
        description: 'Review your cart and checkout at X-Tech.',
        path: '/cart',
        noIndex: true,
    }),

    checkout: createMetadata({
        title: 'Checkout',
        description: 'Complete your purchase at X-Tech.',
        path: '/checkout',
        noIndex: true,
    }),

    account: createMetadata({
        title: 'My Account',
        description: 'Manage your X-Tech account, orders, and preferences.',
        path: '/account',
        noIndex: true,
    }),

    wishlist: createMetadata({
        title: 'My Wishlist',
        description: 'View your saved products at X-Tech.',
        path: '/wishlist',
        noIndex: true,
    }),
}
