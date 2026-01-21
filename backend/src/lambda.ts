import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { productService } from './services'
import { ProductFilters } from './types'

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json',
}

// Helper to create response
function createResponse(statusCode: number, body: any): APIGatewayProxyResult {
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify(body),
    }
}

// Generate request ID
function generateRequestId(context?: Context): string {
    return context?.awsRequestId || `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

// Route handlers
async function handleGetProducts(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const query = event.queryStringParameters || {}

    const filters: ProductFilters = {
        search: query.search,
        category: query.category,
        brand: query.brand,
        minPrice: query.minPrice ? Number(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
        inStock: query.inStock === 'true',
        supplier: query.supplier as 'syntech' | 'rct' | 'all',
        sortBy: query.sortBy as ProductFilters['sortBy'],
        page: query.page ? Number(query.page) : 1,
        limit: Math.min(Number(query.limit) || 20, 100),
    }

    const result = await productService.getAllProducts(filters)

    return createResponse(200, {
        success: true,
        data: result,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: generateRequestId(context),
        },
    })
}

async function handleSearchProducts(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const query = event.queryStringParameters?.q
    const limit = Math.min(Number(event.queryStringParameters?.limit) || 20, 50)

    if (!query || query.length < 2) {
        return createResponse(400, {
            success: false,
            error: {
                code: 'INVALID_QUERY',
                message: 'Search query must be at least 2 characters',
            },
        })
    }

    const products = await productService.searchProducts(query, limit)

    return createResponse(200, {
        success: true,
        data: products,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: generateRequestId(context),
        },
    })
}

async function handleGetCategories(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const categories = await productService.getCategories()

    return createResponse(200, {
        success: true,
        data: categories,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: generateRequestId(context),
        },
    })
}

async function handleGetBrands(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const brands = await productService.getBrands()

    return createResponse(200, {
        success: true,
        data: brands,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: generateRequestId(context),
        },
    })
}

async function handleGetProduct(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const sku = event.pathParameters?.sku

    if (!sku) {
        return createResponse(400, {
            success: false,
            error: {
                code: 'INVALID_SKU',
                message: 'SKU is required',
            },
        })
    }

    const product = await productService.getProductBySku(sku)

    if (!product) {
        return createResponse(404, {
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: `Product with SKU '${sku}' not found`,
            },
        })
    }

    return createResponse(200, {
        success: true,
        data: product,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: generateRequestId(context),
        },
    })
}

async function handleRefreshCache(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    productService.clearAllCaches()
    await productService.getAllProducts({ limit: 1 })

    return createResponse(200, {
        success: true,
        data: {
            message: 'Cache refreshed successfully',
            timestamp: new Date().toISOString(),
        },
    })
}

async function handleHealth(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    return createResponse(200, {
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'production',
            requestId: generateRequestId(context),
        },
    })
}

// Main Lambda handler
export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: '',
        }
    }

    const path = event.path
    const method = event.httpMethod

    console.log(`${method} ${path}`, {
        queryStringParameters: event.queryStringParameters,
        pathParameters: event.pathParameters,
    })

    try {
        // Route matching
        if (path === '/api/health' && method === 'GET') {
            return handleHealth(event, context)
        }

        if (path === '/api/products' && method === 'GET') {
            return handleGetProducts(event, context)
        }

        if (path === '/api/products/search' && method === 'GET') {
            return handleSearchProducts(event, context)
        }

        if (path === '/api/products/categories' && method === 'GET') {
            return handleGetCategories(event, context)
        }

        if (path === '/api/products/brands' && method === 'GET') {
            return handleGetBrands(event, context)
        }

        if (path === '/api/products/refresh-cache' && method === 'POST') {
            return handleRefreshCache(event, context)
        }

        // Match /api/products/:sku
        const skuMatch = path.match(/^\/api\/products\/([^/]+)$/)
        if (skuMatch && method === 'GET' && !['search', 'categories', 'brands', 'refresh-cache'].includes(skuMatch[1])) {
            event.pathParameters = { sku: skuMatch[1] }
            return handleGetProduct(event, context)
        }

        // 404
        return createResponse(404, {
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: `Route ${method} ${path} not found`,
            },
        })
    } catch (error) {
        console.error('Lambda error:', error)
        return createResponse(500, {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
            },
        })
    }
}
