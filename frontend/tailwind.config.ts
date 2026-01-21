import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Primary brand colors - Teal/Cyan
                primary: {
                    50: '#e0f7fa',
                    100: '#b2ebf2',
                    200: '#80deea',
                    300: '#4dd0e1',
                    400: '#26c6da',
                    500: '#00bcd4', // Main teal
                    600: '#00acc1',
                    700: '#0097a7',
                    800: '#00838f',
                    900: '#006064',
                },
                // Accent - Bright Cyan
                accent: {
                    DEFAULT: '#00e5ff',
                    dark: '#00b8d4',
                    light: '#18ffff',
                },
                // Dark theme backgrounds
                dark: {
                    50: '#2d2d3a',
                    100: '#252532',
                    200: '#1e1e2a',
                    300: '#1a1a26',
                    400: '#161622',
                    500: '#12121c', // Main dark
                    600: '#0e0e16',
                    700: '#0a0a10',
                    800: '#06060a',
                    900: '#020204',
                },
                // Surface colors for cards, modals
                surface: {
                    DEFAULT: '#1e1e2e',
                    light: '#252538',
                    dark: '#161624',
                },
                // Text colors
                text: {
                    primary: '#ffffff',
                    secondary: '#a1a1aa',
                    muted: '#71717a',
                },
                // Status colors
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0d1f22 100%)',
                'card-gradient': 'linear-gradient(180deg, rgba(0,188,212,0.1) 0%, rgba(0,188,212,0) 100%)',
                'glow-teal': 'radial-gradient(ellipse at center, rgba(0,188,212,0.15) 0%, transparent 70%)',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(0, 188, 212, 0.3)',
                'glow-lg': '0 0 40px rgba(0, 188, 212, 0.4)',
                'glow-sm': '0 0 10px rgba(0, 188, 212, 0.2)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
                'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
            },
            animation: {
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'slide-down': 'slide-down 0.5s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'gradient': 'gradient 3s ease infinite',
            },
            keyframes: {
                'glow-pulse': {
                    '0%': { boxShadow: '0 0 20px rgba(0, 188, 212, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(0, 188, 212, 0.6)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-down': {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'gradient': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
        },
    },
    plugins: [],
}
export default config
