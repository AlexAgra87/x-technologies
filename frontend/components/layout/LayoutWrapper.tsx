'use client'

import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// Lazy load WhatsAppButton as it uses framer-motion
const WhatsAppButton = dynamic(() => import('@/components/layout/WhatsAppButton').then(mod => ({ default: mod.WhatsAppButton })), {
    ssr: false,
})

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdminRoute = pathname?.startsWith('/admin')

    if (isAdminRoute) {
        // Admin pages get no header/footer - completely standalone
        return <>{children}</>
    }

    return (
        <>
            {/* Background gradient effects */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-hero-gradient" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <WhatsAppButton />
        </>
    )
}
