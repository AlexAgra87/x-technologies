import { pageMetadata } from '@/lib/metadata'

export const metadata = pageMetadata.deals

export default function DealsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
