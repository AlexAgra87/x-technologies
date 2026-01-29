/**
 * Simple in-memory rate limiter for Next.js API routes
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

// In-memory store (note: this resets on server restart and doesn't work across multiple instances)
// For production, consider using Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
    windowMs: number  // Time window in milliseconds
    max: number       // Maximum requests per window
}

interface RateLimitResult {
    success: boolean
    remaining: number
    resetTime: number
}

/**
 * Check if a request should be rate limited
 * @param ip Client IP address
 * @param prefix Optional prefix for the key (e.g., endpoint name)
 * @param config Rate limit configuration
 * @returns Rate limit result with allowed status and remaining requests
 */
export function checkRateLimit(
    ip: string,
    prefix: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
    const key = prefix ? `${prefix}:${ip}` : ip
    const now = Date.now()
    const entry = rateLimitStore.get(key)

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        cleanupExpiredEntries()
    }

    if (!entry || now > entry.resetTime) {
        // Create new entry
        const newEntry: RateLimitEntry = {
            count: 1,
            resetTime: now + config.windowMs,
        }
        rateLimitStore.set(key, newEntry)
        return {
            allowed: true,
            remaining: config.max - 1,
            resetTime: newEntry.resetTime,
        }
    }

    if (entry.count >= config.max) {
        // Rate limited
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime,
        }
    }

    // Increment count
    entry.count++
    return {
        allowed: true,
        remaining: config.max - entry.count,
        resetTime: entry.resetTime,
    }
}

function cleanupExpiredEntries() {
    const now = Date.now()
    const keysToDelete: string[] = []
    rateLimitStore.forEach((entry, key) => {
        if (now > entry.resetTime) {
            keysToDelete.push(key)
        }
    })
    keysToDelete.forEach(key => rateLimitStore.delete(key))
}

/**
 * Get client IP from Next.js request
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    if (realIp) {
        return realIp
    }
    return 'unknown'
}

// Pre-configured rate limiters
export const rateLimitConfigs = {
    // General API: 100 requests per minute
    general: { windowMs: 60 * 1000, max: 100 },
    // Order creation: 10 per minute (prevent spam)
    orders: { windowMs: 60 * 1000, max: 10 },
    // Order emails: 5 per minute
    order: { windowMs: 60 * 1000, max: 5 },
    // Admin: 60 per minute
    admin: { windowMs: 60 * 1000, max: 60 },
    // Contact form: 5 per 10 minutes
    contact: { windowMs: 10 * 60 * 1000, max: 5 },
    // Quote requests: 5 per 10 minutes
    quote: { windowMs: 10 * 60 * 1000, max: 5 },
}
