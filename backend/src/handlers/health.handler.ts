import { Router } from 'express'

export const healthRouter = Router()

healthRouter.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        },
    })
})

healthRouter.get('/ready', async (req, res) => {
    // Check if we can connect to supplier APIs
    const checks = {
        syntech: false,
        rct: false,
    }

    try {
        // Add actual health checks here
        checks.syntech = true
        checks.rct = !!process.env.RCT_USER_ID

        const allHealthy = Object.values(checks).every(Boolean)

        res.status(allHealthy ? 200 : 503).json({
            success: allHealthy,
            data: {
                status: allHealthy ? 'ready' : 'degraded',
                checks,
                timestamp: new Date().toISOString(),
            },
        })
    } catch (error) {
        res.status(503).json({
            success: false,
            error: {
                code: 'HEALTH_CHECK_FAILED',
                message: 'Service not ready',
            },
        })
    }
})
