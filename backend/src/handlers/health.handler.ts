import { Router } from 'express'
import { getSchedulerStats, triggerManualRefresh } from '../services/scheduler.service'
import { syntechService } from '../services/syntech.service'
import { rctService } from '../services/rct.service'
import { frontosaService } from '../services/frontosa.service'

export const healthRouter = Router()

healthRouter.get('/', (req, res) => {
    const schedulerStats = getSchedulerStats()
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            scheduler: {
                lastRefresh: schedulerStats.lastRefresh,
                nextRefresh: schedulerStats.nextRefresh,
                refreshCount: schedulerStats.refreshCount,
                isRunning: schedulerStats.isRunning,
            },
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

// Admin endpoint to manually trigger stock refresh
healthRouter.post('/refresh', async (req, res) => {
    try {
        console.log('📡 Manual refresh requested via API')
        const results = await triggerManualRefresh()

        res.json({
            success: true,
            data: {
                message: 'Stock refresh completed',
                results,
                timestamp: new Date().toISOString(),
            },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'REFRESH_FAILED',
                message: error instanceof Error ? error.message : 'Refresh failed',
            },
        })
    }
})

// Get detailed scheduler status
healthRouter.get('/scheduler', (req, res) => {
    const stats = getSchedulerStats()
    res.json({
        success: true,
        data: {
            ...stats,
            refreshIntervalMinutes: Number(process.env.STOCK_REFRESH_INTERVAL) || 30,
            timezone: 'Africa/Johannesburg',
        },
    })
})

// Get image coverage statistics
healthRouter.get('/images', async (req, res) => {
    try {
        const [syntechProducts, rctProducts, frontosaProducts] = await Promise.all([
            syntechService.fetchProducts(),
            rctService.fetchProducts(),
            frontosaService.fetchProducts(),
        ])

        const countImages = (products: any[]) => {
            let withImage = 0
            let withoutImage = 0
            const noImageSamples: string[] = []

            for (const p of products) {
                const hasImage = !!(p.featuredImage || (p.images && p.images.length > 0))
                if (hasImage) {
                    withImage++
                } else {
                    withoutImage++
                    if (noImageSamples.length < 5) {
                        noImageSamples.push(`${p.sku}: ${p.name}`)
                    }
                }
            }
            return { withImage, withoutImage, total: products.length, noImageSamples }
        }

        const syntech = countImages(syntechProducts)
        const rct = countImages(rctProducts)
        const frontosa = countImages(frontosaProducts)

        const totalWith = syntech.withImage + rct.withImage + frontosa.withImage
        const totalAll = syntech.total + rct.total + frontosa.total

        res.json({
            success: true,
            data: {
                syntech: {
                    ...syntech,
                    coverage: `${((syntech.withImage / syntech.total) * 100).toFixed(1)}%`,
                },
                rct: {
                    ...rct,
                    coverage: `${((rct.withImage / rct.total) * 100).toFixed(1)}%`,
                },
                frontosa: {
                    ...frontosa,
                    coverage: `${((frontosa.withImage / frontosa.total) * 100).toFixed(1)}%`,
                },
                overall: {
                    withImage: totalWith,
                    withoutImage: totalAll - totalWith,
                    total: totalAll,
                    coverage: `${((totalWith / totalAll) * 100).toFixed(1)}%`,
                },
            },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'IMAGE_STATS_FAILED',
                message: error instanceof Error ? error.message : 'Failed to get image stats',
            },
        })
    }
})
