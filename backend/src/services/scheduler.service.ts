import cron from 'node-cron'
import { SyntechService } from './syntech.service'
import { RCTService, rctService } from './rct.service'
import { FrontosaService } from './frontosa.service'

// Configuration
const REFRESH_INTERVAL_MINUTES = Number(process.env.STOCK_REFRESH_INTERVAL) || 30
const CRON_EXPRESSION = `*/${REFRESH_INTERVAL_MINUTES} * * * *` // Every N minutes
const FETCH_RCT_IMAGES = process.env.FETCH_RCT_IMAGES !== 'false' // Enable by default

// Service instances
const syntechService = new SyntechService()
const frontosaService = new FrontosaService()

interface RefreshResult {
    supplier: string
    success: boolean
    productCount: number
    duration: number
    error?: string
}

interface SchedulerStats {
    lastRefresh: Date | null
    nextRefresh: Date | null
    refreshCount: number
    lastResults: RefreshResult[]
    isRunning: boolean
}

// Scheduler state
const stats: SchedulerStats = {
    lastRefresh: null,
    nextRefresh: null,
    refreshCount: 0,
    lastResults: [],
    isRunning: false,
}

/**
 * Refresh all supplier data
 */
async function refreshAllSuppliers(): Promise<RefreshResult[]> {
    if (stats.isRunning) {
        console.log('⏳ Stock refresh already in progress, skipping...')
        return stats.lastResults
    }

    stats.isRunning = true
    const startTime = Date.now()
    console.log('\n🔄 ====== Starting scheduled stock refresh ======')
    console.log(`📅 Time: ${new Date().toLocaleString()}`)

    const results: RefreshResult[] = []

    // Refresh each supplier
    const suppliers = [
        { name: 'Syntech', service: syntechService },
        { name: 'RCT', service: rctService },
        { name: 'Frontosa', service: frontosaService },
    ]

    for (const { name, service } of suppliers) {
        const supplierStart = Date.now()
        try {
            // Force cache clear and fetch fresh data
            const products = await service.fetchProducts()
            results.push({
                supplier: name,
                success: true,
                productCount: products.length,
                duration: Date.now() - supplierStart,
            })
            console.log(`  ✅ ${name}: ${products.length} products refreshed (${Date.now() - supplierStart}ms)`)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            results.push({
                supplier: name,
                success: false,
                productCount: 0,
                duration: Date.now() - supplierStart,
                error: errorMessage,
            })
            console.error(`  ❌ ${name}: Failed - ${errorMessage}`)
        }
    }

    const totalDuration = Date.now() - startTime
    const totalProducts = results.reduce((sum, r) => sum + r.productCount, 0)
    const successCount = results.filter(r => r.success).length

    console.log(`\n📊 Refresh complete: ${successCount}/${suppliers.length} suppliers, ${totalProducts.toLocaleString()} total products`)
    console.log(`⏱️  Total duration: ${(totalDuration / 1000).toFixed(1)}s`)

    // Fetch RCT images in background (after main refresh)
    if (FETCH_RCT_IMAGES) {
        const rctResult = results.find(r => r.supplier === 'RCT')
        if (rctResult?.success) {
            // Run image fetch asynchronously (don't block the main refresh)
            rctService.fetchProducts().then(async (products) => {
                const imageCount = await rctService.fetchImagesForProducts(products)
                if (imageCount > 0) {
                    console.log(`  📷 RCT image fetch complete: ${imageCount} products now have images`)
                }
            }).catch(err => {
                console.error('  ⚠️ RCT image fetch failed:', err.message)
            })
        }
    }

    console.log('================================================\n')

    // Update stats
    stats.lastRefresh = new Date()
    stats.refreshCount++
    stats.lastResults = results
    stats.isRunning = false

    // Calculate next refresh time
    const nextRefreshTime = new Date()
    nextRefreshTime.setMinutes(nextRefreshTime.getMinutes() + REFRESH_INTERVAL_MINUTES)
    stats.nextRefresh = nextRefreshTime

    return results
}

/**
 * Start the background scheduler
 */
export function startScheduler(): void {
    console.log(`\n⏰ Starting stock refresh scheduler`)
    console.log(`   Interval: Every ${REFRESH_INTERVAL_MINUTES} minutes`)
    console.log(`   Cron expression: ${CRON_EXPRESSION}`)

    // Validate cron expression
    if (!cron.validate(CRON_EXPRESSION)) {
        console.error('❌ Invalid cron expression:', CRON_EXPRESSION)
        return
    }

    // Schedule the job
    const task = cron.schedule(CRON_EXPRESSION, async () => {
        await refreshAllSuppliers()
    }, {
        timezone: 'Africa/Johannesburg', // South African timezone
    })

    // Calculate and show next run time
    const nextRun = new Date()
    const minutesToNext = REFRESH_INTERVAL_MINUTES - (nextRun.getMinutes() % REFRESH_INTERVAL_MINUTES)
    nextRun.setMinutes(nextRun.getMinutes() + minutesToNext, 0, 0)
    stats.nextRefresh = nextRun

    console.log(`   Next refresh: ${nextRun.toLocaleTimeString()}`)
    console.log(`   Timezone: Africa/Johannesburg\n`)

    // Do an initial refresh on startup (after a short delay to let server start)
    setTimeout(async () => {
        console.log('🚀 Running initial stock refresh on startup...')
        await refreshAllSuppliers()
    }, 5000) // 5 second delay
}

/**
 * Manually trigger a refresh (useful for admin endpoints)
 */
export async function triggerManualRefresh(): Promise<RefreshResult[]> {
    console.log('🔧 Manual stock refresh triggered')
    return refreshAllSuppliers()
}

/**
 * Get scheduler statistics
 */
export function getSchedulerStats(): SchedulerStats {
    return { ...stats }
}

/**
 * Force clear all caches (useful for admin)
 */
export function clearAllCaches(): void {
    console.log('🗑️  Clearing all supplier caches...')
    // Note: Each service has its own cache, we trigger refresh to clear
    // The cache TTL is handled by node-cache internally
}
