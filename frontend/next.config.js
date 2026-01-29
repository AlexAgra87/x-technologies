/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.syntech.co.za',
                pathname: '/wp-content/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'rctdatafeed.azurewebsites.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'logo.clearbit.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.worldvectorlogo.com',
                pathname: '/logos/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.frontosa.co.za',
                pathname: '/**',
            },
        ],
        // Enable image optimization for better performance
        // unoptimized: true, // Removed for better Lighthouse scores
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        formats: ['image/webp'],
    },
    // Optimize bundle
    experimental: {
        optimizePackageImports: ['lucide-react', '@heroicons/react', 'framer-motion'],
    },
}

module.exports = nextConfig
