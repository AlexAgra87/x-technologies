import { pageMetadata } from '@/lib/metadata'

export const metadata = pageMetadata.about

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
