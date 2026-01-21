import { pageMetadata } from '@/lib/metadata'

export const metadata = pageMetadata.account

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
