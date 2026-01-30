import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { productsRouter } from './handlers/products.handler'
import { healthRouter } from './handlers/health.handler'
import { startScheduler } from './services/scheduler.service'

const app = express()
const PORT = process.env.PORT || 4000

// Rate limiting configuration
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes per IP
    message: {
        success: false,
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests, please try again later.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
})

// Stricter rate limit for search (more expensive operation)
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 searches per minute per IP
    message: {
        success: false,
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many search requests, please slow down.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
})

// Middleware
app.use(helmet())

// CORS configuration - allow multiple origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://xtech.oikos.casa',
    'https://xtech.oikos.casa',
    'http://x-technologies.co.za',
    'https://x-technologies.co.za',
    'http://www.x-technologies.co.za',
    'https://www.x-technologies.co.za',
]

if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN)
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            console.log(`CORS blocked origin: ${origin}`)
            callback(null, false)
        }
    },
    credentials: true,
}))
app.use(express.json())

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter)

// Request logging
app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
        const duration = Date.now() - start
        console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
    })
    next()
})

// Routes
app.use('/api/health', healthRouter)
// Apply stricter rate limit to search endpoint
app.use('/api/products/search', searchLimiter)
app.use('/api/products', productsRouter)

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err)
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        },
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    })
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 X-Tech API server running on port ${PORT}`)
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
    console.log(`📦 Products API: http://localhost:${PORT}/api/products`)

    // Start the background stock refresh scheduler
    startScheduler()
})

export default app
