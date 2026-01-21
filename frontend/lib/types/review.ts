export interface ProductReview {
    id: string
    productSku: string
    userId: string
    userName: string
    userEmail: string
    rating: number // 1-5
    title: string
    content: string
    pros?: string[]
    cons?: string[]
    verified: boolean // verified purchase
    helpful: number
    notHelpful: number
    createdAt: string
    updatedAt: string
}

export interface ReviewSummary {
    averageRating: number
    totalReviews: number
    ratingDistribution: {
        5: number
        4: number
        3: number
        2: number
        1: number
    }
}

export const REVIEWS_STORAGE_KEY = 'xtech-product-reviews'

// Helper functions for reviews
export function getReviews(productSku: string): ProductReview[] {
    if (typeof window === 'undefined') return []
    try {
        const all = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY) || '{}')
        return all[productSku] || []
    } catch {
        return []
    }
}

export function saveReview(review: ProductReview): void {
    if (typeof window === 'undefined') return
    try {
        const all = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY) || '{}')
        if (!all[review.productSku]) {
            all[review.productSku] = []
        }
        all[review.productSku].unshift(review) // Add to beginning
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all))
    } catch (e) {
        console.error('Error saving review:', e)
    }
}

export function updateReviewHelpful(productSku: string, reviewId: string, helpful: boolean): void {
    if (typeof window === 'undefined') return
    try {
        const all = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY) || '{}')
        const reviews = all[productSku] || []
        const index = reviews.findIndex((r: ProductReview) => r.id === reviewId)
        if (index !== -1) {
            if (helpful) {
                reviews[index].helpful += 1
            } else {
                reviews[index].notHelpful += 1
            }
            all[productSku] = reviews
            localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all))
        }
    } catch (e) {
        console.error('Error updating review:', e)
    }
}

export function getReviewSummary(reviews: ProductReview[]): ReviewSummary {
    if (reviews.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let total = 0

    reviews.forEach(review => {
        total += review.rating
        distribution[review.rating as keyof typeof distribution] += 1
    })

    return {
        averageRating: Math.round((total / reviews.length) * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution: distribution
    }
}

export function generateReviewId(): string {
    return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get quick rating info for product cards
export function getProductRating(productSku: string): { average: number; count: number } | null {
    const reviews = getReviews(productSku)
    if (reviews.length === 0) return null

    const total = reviews.reduce((sum, r) => sum + r.rating, 0)
    return {
        average: Math.round((total / reviews.length) * 10) / 10,
        count: reviews.length
    }
}

// Seed sample reviews for demo purposes
export function seedSampleReviews(productSku: string, productName: string): void {
    if (typeof window === 'undefined') return

    const existing = getReviews(productSku)
    if (existing.length > 0) return // Already has reviews

    const sampleReviews: ProductReview[] = [
        {
            id: generateReviewId(),
            productSku,
            userId: 'user_sample_1',
            userName: 'TechEnthusiast',
            userEmail: 'tech@example.com',
            rating: 5,
            title: 'Excellent product, highly recommend!',
            content: 'I\'ve been using this for a few weeks now and I\'m extremely impressed with the quality and performance. It exceeded my expectations in every way. The build quality is solid and it works flawlessly.',
            pros: ['Great build quality', 'Excellent performance', 'Good value for money'],
            cons: ['Packaging could be better'],
            verified: true,
            helpful: 12,
            notHelpful: 1,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateReviewId(),
            productSku,
            userId: 'user_sample_2',
            userName: 'GamerPro',
            userEmail: 'gamer@example.com',
            rating: 4,
            title: 'Great product with minor issues',
            content: 'Overall a solid purchase. Works as advertised and the performance is good. Had a minor issue with setup but customer support was helpful. Would recommend for most users.',
            pros: ['Good performance', 'Reliable', 'Customer support helpful'],
            cons: ['Setup was tricky', 'Manual could be clearer'],
            verified: true,
            helpful: 8,
            notHelpful: 2,
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateReviewId(),
            productSku,
            userId: 'user_sample_3',
            userName: 'CasualUser',
            userEmail: 'casual@example.com',
            rating: 5,
            title: 'Perfect for my needs',
            content: 'Exactly what I was looking for. The price is fair and it does everything I need. Fast shipping from X-Tech and arrived in perfect condition. Will definitely buy from them again.',
            pros: ['Fast shipping', 'Perfect condition', 'Fair price'],
            verified: true,
            helpful: 5,
            notHelpful: 0,
            createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
        }
    ]

    try {
        const all = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY) || '{}')
        all[productSku] = sampleReviews
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all))
    } catch (e) {
        console.error('Error seeding reviews:', e)
    }
}
