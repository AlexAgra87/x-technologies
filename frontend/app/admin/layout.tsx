import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Admin Dashboard | X-Tech',
    description: 'X-Tech order management dashboard',
    robots: {
        index: false,
        follow: false,
    },
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
