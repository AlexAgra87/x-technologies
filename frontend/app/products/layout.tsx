import { pageMetadata } from '@/lib/metadata'

export const metadata = pageMetadata.products

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
