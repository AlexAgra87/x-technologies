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
        ],
    },
}

module.exports = nextConfig
