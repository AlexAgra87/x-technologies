import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { productsRouter } from './handlers/products.handler'
import { healthRouter } from './handlers/health.handler'

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(helmet())
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}))
app.use(express.json())

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
})

export default app
