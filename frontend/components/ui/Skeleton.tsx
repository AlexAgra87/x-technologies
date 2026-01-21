export function ProductCardSkeleton() {
    return (
        <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden animate-pulse">
            <div className="aspect-square bg-dark-700" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-dark-700 rounded w-1/4" />
                <div className="h-4 bg-dark-700 rounded w-full" />
                <div className="h-4 bg-dark-700 rounded w-3/4" />
                <div className="h-3 bg-dark-700 rounded w-1/3" />
                <div className="h-6 bg-dark-700 rounded w-1/2 mt-2" />
                <div className="h-10 bg-dark-700 rounded w-full mt-3" />
            </div>
        </div>
    )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(count)].map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}

export function ProductDetailSkeleton() {
    return (
        <div className="animate-pulse grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="aspect-square bg-dark-800 rounded-lg" />
                <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-20 h-20 bg-dark-800 rounded-lg" />
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <div className="h-4 bg-dark-800 rounded w-1/4" />
                <div className="h-8 bg-dark-800 rounded w-3/4" />
                <div className="h-4 bg-dark-800 rounded w-1/2" />
                <div className="h-12 bg-dark-800 rounded w-1/3" />
                <div className="h-32 bg-dark-800 rounded" />
                <div className="flex gap-4">
                    <div className="h-12 bg-dark-800 rounded w-32" />
                    <div className="h-12 bg-dark-800 rounded flex-1" />
                </div>
            </div>
        </div>
    )
}

export function TextLineSkeleton({ width = '100%' }: { width?: string }) {
    return (
        <div
            className="h-4 bg-dark-700 rounded animate-pulse"
            style={{ width }}
        />
    )
}

export function CircleSkeleton({ size = 48 }: { size?: number }) {
    return (
        <div
            className="bg-dark-700 rounded-full animate-pulse"
            style={{ width: size, height: size }}
        />
    )
}

export function PageLoadingSpinner() {
    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-dark-700 rounded-full" />
                    <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        </div>
    )
}
