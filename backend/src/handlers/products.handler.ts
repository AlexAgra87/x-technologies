import { Router, Request, Response } from 'express'
import { productService } from '../services'
import { ProductFilters, ApiResponse, Product, PaginatedResponse, Category, Brand } from '../types'

export const productsRouter = Router()

// GET /api/products - List all products with filters
productsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const filters: ProductFilters = {
            search: req.query.search as string,
            category: req.query.category as string,
            brand: req.query.brand as string,
            minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
            inStock: req.query.inStock === 'true',
            supplier: req.query.supplier as 'syntech' | 'rct' | 'all',
            sortBy: req.query.sortBy as ProductFilters['sortBy'],
            page: req.query.page ? Number(req.query.page) : 1,
            limit: Math.min(Number(req.query.limit) || 20, 100),
        }

        const result = await productService.getAllProducts(filters)

        const response: ApiResponse<PaginatedResponse<Product>> = {
            success: true,
            data: result,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: generateRequestId(),
            },
        }

        res.json(response)
    } catch (error) {
        console.error('Error fetching products:', error)
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to fetch products',
            },
        })
    }
})

// GET /api/products/search - Search products
productsRouter.get('/search', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string
        const limit = Math.min(Number(req.query.limit) || 20, 50)

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_QUERY',
                    message: 'Search query must be at least 2 characters',
                },
            })
        }

        console.log(`Searching for: "${query}" with limit ${limit}`)
        const products = await productService.searchProducts(query, limit)
        console.log(`Search returned ${products.length} results`)

        res.json({
            success: true,
            data: products,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: generateRequestId(),
            },
        })
    } catch (error) {
        console.error('Error searching products:', error)
        res.status(500).json({
            success: false,
            error: {
                code: 'SEARCH_ERROR',
                message: 'Failed to search products',
                details: error instanceof Error ? error.message : String(error),
            },
        })
    }
})

// GET /api/products/categories - List all categories
productsRouter.get('/categories', async (req: Request, res: Response) => {
    try {
        const categories = await productService.getCategories()

        const response: ApiResponse<Category[]> = {
            success: true,
            data: categories,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: generateRequestId(),
            },
        }

        res.json(response)
    } catch (error) {
        console.error('Error fetching categories:', error)
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to fetch categories',
            },
        })
    }
})

// GET /api/products/brands - List all brands
productsRouter.get('/brands', async (req: Request, res: Response) => {
    try {
        const brands = await productService.getBrands()

        const response: ApiResponse<Brand[]> = {
            success: true,
            data: brands,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: generateRequestId(),
            },
        }

        res.json(response)
    } catch (error) {
        console.error('Error fetching brands:', error)
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to fetch brands',
            },
        })
    }
})

// GET /api/products/deals - Get products with discounts
productsRouter.get('/deals', async (req: Request, res: Response) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 50, 100)
        const category = req.query.category as string | undefined

        // Fetch all products
        const result = await productService.getAllProducts({ limit: 2000 })

        // Filter for products with discounts and images
        let deals = result.data.filter(p =>
            p.discount && p.discount > 0 &&
            p.images && p.images.length > 0
        )

        // Filter by category if provided
        if (category) {
            deals = deals.filter(p =>
                p.categories?.some(c => c.toLowerCase().includes(category.toLowerCase()))
            )
        }

        // Sort by discount percentage (highest first)
        deals.sort((a, b) => (b.discount || 0) - (a.discount || 0))

        // Limit results
        deals = deals.slice(0, limit)

        const response: ApiResponse<Product[]> = {
            success: true,
            data: deals,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: generateRequestId(),
            },
        }

        res.json({
            ...response,
            totalDeals: deals.length,
        })
    } catch (error) {
        console.error('Error fetching deals:', error)
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to fetch deals',
            },
        })
    }
})

// GET /api/products/:sku - Get single product
productsRouter.get('/:sku', async (req: Request, res: Response) => {
    try {
        const { sku } = req.params
        const product = await productService.getProductBySku(sku)

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: `Product with SKU '${sku}' not found`,
                },
            })
        }

        const response: ApiResponse<Product> = {
            success: true,
            data: product,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: generateRequestId(),
            },
        }

        res.json(response)
    } catch (error) {
        console.error('Error fetching product:', error)
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to fetch product',
            },
        })
    }
})

// POST /api/products/refresh-cache - Manually refresh product cache
productsRouter.post('/refresh-cache', async (req: Request, res: Response) => {
    try {
        productService.clearAllCaches()

        // Trigger a fresh fetch
        await productService.getAllProducts({ limit: 1 })

        res.json({
            success: true,
            data: {
                message: 'Cache refreshed successfully',
                timestamp: new Date().toISOString(),
            },
        })
    } catch (error) {
        console.error('Error refreshing cache:', error)
        res.status(500).json({
            success: false,
            error: {
                code: 'CACHE_ERROR',
                message: 'Failed to refresh cache',
            },
        })
    }
})

// Helper function
function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
}
