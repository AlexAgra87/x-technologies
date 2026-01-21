'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Star,
    ThumbsUp,
    ThumbsDown,
    User,
    CheckCircle,
    X,
    ChevronDown,
    Loader2,
    AlertCircle
} from 'lucide-react'
import {
    ProductReview,
    ReviewSummary,
    getReviews,
    saveReview,
    updateReviewHelpful,
    getReviewSummary,
    generateReviewId,
    seedSampleReviews
} from '@/lib/types/review'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

interface ProductReviewsProps {
    productSku: string
    productName: string
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'

export function ProductReviews({ productSku, productName }: ProductReviewsProps) {
    const { user, isAuthenticated } = useAuth()
    const [reviews, setReviews] = useState<ProductReview[]>([])
    const [summary, setSummary] = useState<ReviewSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showWriteReview, setShowWriteReview] = useState(false)
    const [sortBy, setSortBy] = useState<SortOption>('newest')
    const [filterRating, setFilterRating] = useState<number | null>(null)
    const [helpfulVotes, setHelpfulVotes] = useState<Record<string, 'up' | 'down'>>({})

    // Load reviews on mount
    useEffect(() => {
        // Seed sample reviews for demo (only if none exist)
        seedSampleReviews(productSku, productName)

        const loadedReviews = getReviews(productSku)
        setReviews(loadedReviews)
        setSummary(getReviewSummary(loadedReviews))

        // Load helpful votes from localStorage
        const votes = localStorage.getItem(`xtech-review-votes-${productSku}`)
        if (votes) {
            setHelpfulVotes(JSON.parse(votes))
        }
        setIsLoading(false)
    }, [productSku])

    // Sort and filter reviews
    const displayedReviews = [...reviews]
        .filter(r => filterRating === null || r.rating === filterRating)
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case 'highest': return b.rating - a.rating
                case 'lowest': return a.rating - b.rating
                case 'helpful': return b.helpful - a.helpful
                default: return 0
            }
        })

    const handleReviewSubmit = (review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt' | 'helpful' | 'notHelpful'>) => {
        const newReview: ProductReview = {
            ...review,
            id: generateReviewId(),
            helpful: 0,
            notHelpful: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        saveReview(newReview)
        const updatedReviews = [newReview, ...reviews]
        setReviews(updatedReviews)
        setSummary(getReviewSummary(updatedReviews))
        setShowWriteReview(false)
    }

    const handleHelpfulVote = (reviewId: string, helpful: boolean) => {
        if (helpfulVotes[reviewId]) return // Already voted

        updateReviewHelpful(productSku, reviewId, helpful)
        setHelpfulVotes(prev => {
            const updated = { ...prev, [reviewId]: (helpful ? 'up' : 'down') as 'up' | 'down' }
            localStorage.setItem(`xtech-review-votes-${productSku}`, JSON.stringify(updated))
            return updated
        })

        // Update local state
        setReviews(prev => prev.map(r => {
            if (r.id === reviewId) {
                return {
                    ...r,
                    helpful: helpful ? r.helpful + 1 : r.helpful,
                    notHelpful: !helpful ? r.notHelpful + 1 : r.notHelpful
                }
            }
            return r
        }))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Summary Section */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Rating Overview */}
                <div className="bg-dark-800 rounded-xl p-6 border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Customer Reviews</h3>

                    {summary && summary.totalReviews > 0 ? (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-5xl font-bold text-white">
                                    {summary.averageRating.toFixed(1)}
                                </div>
                                <div>
                                    <StarRating rating={summary.averageRating} size="lg" />
                                    <p className="text-gray-400 text-sm mt-1">
                                        Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Rating Distribution */}
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map(rating => {
                                    const count = summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution]
                                    const percentage = summary.totalReviews > 0
                                        ? (count / summary.totalReviews) * 100
                                        : 0
                                    return (
                                        <button
                                            key={rating}
                                            onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                                                filterRating === rating
                                                    ? "bg-teal-500/20"
                                                    : "hover:bg-dark-700"
                                            )}
                                        >
                                            <span className="text-sm text-gray-400 w-8">{rating} ★</span>
                                            <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-500 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-500 w-8">{count}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            {filterRating && (
                                <button
                                    onClick={() => setFilterRating(null)}
                                    className="mt-4 text-sm text-teal-400 hover:text-teal-300"
                                >
                                    Clear filter
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="flex justify-center mb-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="w-6 h-6 text-gray-600" />
                                ))}
                            </div>
                            <p className="text-gray-400">No reviews yet</p>
                            <p className="text-gray-500 text-sm mt-1">Be the first to review this product!</p>
                        </div>
                    )}
                </div>

                {/* Write Review CTA */}
                <div className="bg-dark-800 rounded-xl p-6 border border-gray-800 flex flex-col justify-center">
                    <h3 className="text-lg font-semibold text-white mb-2">Share Your Thoughts</h3>
                    <p className="text-gray-400 mb-6">
                        Help other customers make informed decisions by sharing your experience with this product.
                    </p>
                    <button
                        onClick={() => setShowWriteReview(true)}
                        className="btn-primary w-full"
                    >
                        Write a Review
                    </button>
                </div>
            </div>

            {/* Write Review Modal */}
            <AnimatePresence>
                {showWriteReview && (
                    <WriteReviewModal
                        productSku={productSku}
                        productName={productName}
                        user={user}
                        isAuthenticated={isAuthenticated}
                        onClose={() => setShowWriteReview(false)}
                        onSubmit={handleReviewSubmit}
                    />
                )}
            </AnimatePresence>

            {/* Reviews List */}
            {reviews.length > 0 && (
                <div>
                    {/* Sort & Filter Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <p className="text-gray-400">
                            Showing {displayedReviews.length} of {reviews.length} reviews
                            {filterRating && ` (${filterRating} stars only)`}
                        </p>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                                <option value="helpful">Most Helpful</option>
                            </select>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="space-y-6">
                        {displayedReviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-dark-800 rounded-xl p-6 border border-gray-800"
                            >
                                {/* Review Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white">{review.userName}</span>
                                                {review.verified && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString('en-ZA', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <StarRating rating={review.rating} />
                                </div>

                                {/* Review Content */}
                                <h4 className="font-semibold text-white mb-2">{review.title}</h4>
                                <p className="text-gray-300 mb-4">{review.content}</p>

                                {/* Pros & Cons */}
                                {(review.pros?.length || review.cons?.length) && (
                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        {review.pros && review.pros.length > 0 && (
                                            <div className="bg-green-500/10 rounded-lg p-3">
                                                <p className="text-green-400 text-sm font-medium mb-2">Pros</p>
                                                <ul className="space-y-1">
                                                    {review.pros.map((pro, i) => (
                                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                            <span className="text-green-400">+</span>
                                                            {pro}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {review.cons && review.cons.length > 0 && (
                                            <div className="bg-red-500/10 rounded-lg p-3">
                                                <p className="text-red-400 text-sm font-medium mb-2">Cons</p>
                                                <ul className="space-y-1">
                                                    {review.cons.map((con, i) => (
                                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                            <span className="text-red-400">−</span>
                                                            {con}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Helpful */}
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                                    <span className="text-sm text-gray-500">Was this review helpful?</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleHelpfulVote(review.id, true)}
                                            disabled={!!helpfulVotes[review.id]}
                                            className={cn(
                                                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors",
                                                helpfulVotes[review.id] === 'up'
                                                    ? "bg-green-500/20 text-green-400"
                                                    : helpfulVotes[review.id]
                                                        ? "bg-dark-700 text-gray-500 cursor-not-allowed"
                                                        : "bg-dark-700 text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                                            )}
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                            {review.helpful > 0 && review.helpful}
                                        </button>
                                        <button
                                            onClick={() => handleHelpfulVote(review.id, false)}
                                            disabled={!!helpfulVotes[review.id]}
                                            className={cn(
                                                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors",
                                                helpfulVotes[review.id] === 'down'
                                                    ? "bg-red-500/20 text-red-400"
                                                    : helpfulVotes[review.id]
                                                        ? "bg-dark-700 text-gray-500 cursor-not-allowed"
                                                        : "bg-dark-700 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                            )}
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                            {review.notHelpful > 0 && review.notHelpful}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// Star Rating Component
function StarRating({ rating, size = 'sm', interactive = false, onChange }: {
    rating: number
    size?: 'sm' | 'lg'
    interactive?: boolean
    onChange?: (rating: number) => void
}) {
    const [hoverRating, setHoverRating] = useState(0)
    const displayRating = interactive ? (hoverRating || rating) : rating

    const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => interactive && setHoverRating(star)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    className={cn(
                        "transition-colors",
                        interactive ? "cursor-pointer" : "cursor-default"
                    )}
                >
                    <Star
                        className={cn(
                            sizeClass,
                            star <= displayRating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                        )}
                    />
                </button>
            ))}
        </div>
    )
}

// Write Review Modal
function WriteReviewModal({
    productSku,
    productName,
    user,
    isAuthenticated,
    onClose,
    onSubmit
}: {
    productSku: string
    productName: string
    user: any
    isAuthenticated: boolean
    onClose: () => void
    onSubmit: (review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt' | 'helpful' | 'notHelpful'>) => void
}) {
    const [rating, setRating] = useState(0)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [pros, setPros] = useState<string[]>([''])
    const [cons, setCons] = useState<string[]>([''])
    const [guestName, setGuestName] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (rating === 0) {
            setError('Please select a rating')
            return
        }
        if (!title.trim()) {
            setError('Please enter a review title')
            return
        }
        if (!content.trim() || content.length < 20) {
            setError('Please write a review of at least 20 characters')
            return
        }
        if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
            setError('Please enter your name and email')
            return
        }

        setIsSubmitting(true)

        // Filter out empty pros/cons
        const filteredPros = pros.filter(p => p.trim())
        const filteredCons = cons.filter(c => c.trim())

        const reviewData = {
            productSku,
            userId: isAuthenticated ? (user?.sub || 'anonymous') : 'guest',
            userName: isAuthenticated ? (user?.given_name || user?.name || 'Anonymous') : guestName,
            userEmail: isAuthenticated ? (user?.email || '') : guestEmail,
            rating,
            title: title.trim(),
            content: content.trim(),
            pros: filteredPros.length > 0 ? filteredPros : undefined,
            cons: filteredCons.length > 0 ? filteredCons : undefined,
            verified: false // Would be true if we check order history
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        onSubmit(reviewData)
        setIsSubmitting(false)
    }

    const addPro = () => setPros([...pros, ''])
    const addCon = () => setCons([...cons, ''])
    const updatePro = (index: number, value: string) => {
        const newPros = [...pros]
        newPros[index] = value
        setPros(newPros)
    }
    const updateCon = (index: number, value: string) => {
        const newCons = [...cons]
        newCons[index] = value
        setCons(newCons)
    }
    const removePro = (index: number) => setPros(pros.filter((_, i) => i !== index))
    const removeCon = (index: number) => setCons(cons.filter((_, i) => i !== index))

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] overflow-y-auto bg-dark-900 border border-gray-800 rounded-2xl z-50"
            >
                <div className="sticky top-0 bg-dark-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Write a Review</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Product Name */}
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Reviewing:</p>
                        <p className="text-white font-medium">{productName}</p>
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Your Rating <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <StarRating rating={rating} size="lg" interactive onChange={setRating} />
                            {rating > 0 && (
                                <span className="text-gray-400 text-sm">
                                    {rating === 5 && 'Excellent'}
                                    {rating === 4 && 'Good'}
                                    {rating === 3 && 'Average'}
                                    {rating === 2 && 'Poor'}
                                    {rating === 1 && 'Terrible'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Guest Info (if not authenticated) */}
                    {!isAuthenticated && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Your Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    className="input w-full"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Your Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    className="input w-full"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Review Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input w-full"
                            placeholder="Summarize your experience"
                            maxLength={100}
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Your Review <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="input w-full min-h-[120px] resize-y"
                            placeholder="Share your experience with this product. What did you like or dislike?"
                            maxLength={2000}
                        />
                        <p className="text-xs text-gray-500 mt-1">{content.length}/2000 characters</p>
                    </div>

                    {/* Pros */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Pros (Optional)
                        </label>
                        <div className="space-y-2">
                            {pros.map((pro, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-green-400">+</span>
                                    <input
                                        type="text"
                                        value={pro}
                                        onChange={(e) => updatePro(index, e.target.value)}
                                        className="input flex-1"
                                        placeholder="What did you like?"
                                    />
                                    {pros.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePro(index)}
                                            className="p-2 text-gray-500 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {pros.length < 5 && (
                                <button
                                    type="button"
                                    onClick={addPro}
                                    className="text-sm text-teal-400 hover:text-teal-300"
                                >
                                    + Add another pro
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cons */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Cons (Optional)
                        </label>
                        <div className="space-y-2">
                            {cons.map((con, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-red-400">−</span>
                                    <input
                                        type="text"
                                        value={con}
                                        onChange={(e) => updateCon(index, e.target.value)}
                                        className="input flex-1"
                                        placeholder="What could be improved?"
                                    />
                                    {cons.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCon(index)}
                                            className="p-2 text-gray-500 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {cons.length < 5 && (
                                <button
                                    type="button"
                                    onClick={addCon}
                                    className="text-sm text-teal-400 hover:text-teal-300"
                                >
                                    + Add another con
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </>
    )
}
