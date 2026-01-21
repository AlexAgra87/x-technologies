import { pageMetadata } from '@/lib/metadata'

export const metadata = pageMetadata.cart

export default function CartLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
