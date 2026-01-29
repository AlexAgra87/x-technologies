/**
 * Admin Orders API Route
 * Handles fetching all orders for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { awsConfig } from '@/lib/aws-config'
import { checkRateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({
    region: awsConfig.region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
})

const docClient = DynamoDBDocumentClient.from(dynamoClient)

// Admin credentials (in production, use proper auth service)
const ADMIN_CREDENTIALS = {
    email: 'admin@x-tech.co.za',
    // In production, verify against Cognito admin group
}

// Verify admin authentication
function verifyAdminAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get('x-admin-auth')
    if (!authHeader) return false

    try {
        // Decode base64 auth header
        const decoded = Buffer.from(authHeader, 'base64').toString('utf-8')
        const [email, password] = decoded.split(':')

        // Verify credentials (in production, use Cognito or proper auth)
        return email === ADMIN_CREDENTIALS.email && password === 'admin123'
    } catch {
        return false
    }
}

// GET - Get all orders (admin only)
export async function GET(request: NextRequest) {
    try {
        // Check rate limit
        const clientIp = getClientIp(request)
        const rateLimitResult = checkRateLimit(clientIp, 'admin', rateLimitConfigs.admin)

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            )
        }

        // Verify admin authentication
        if (!verifyAdminAuth(request)) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '100')

        // Scan for all orders
        const scanCommand = new ScanCommand({
            TableName: awsConfig.dynamodb.ordersTable,
            FilterExpression: status
                ? 'begins_with(sk, :sk) AND #status = :status'
                : 'begins_with(sk, :sk)',
            ExpressionAttributeValues: status
                ? { ':sk': 'ORDER#', ':status': status }
                : { ':sk': 'ORDER#' },
            ExpressionAttributeNames: status ? { '#status': 'status' } : undefined,
            Limit: limit,
        })

        const result = await docClient.send(scanCommand)

        // Sort by creation date (most recent first)
        const orders = (result.Items || []).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        // Calculate stats
        const stats = {
            total: orders.length,
            pendingPayment: orders.filter(o => o.status === 'pending_payment').length,
            processing: orders.filter(o => ['payment_received', 'processing', 'ordered'].includes(o.status)).length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            totalRevenue: orders
                .filter(o => o.status !== 'cancelled')
                .reduce((sum, o) => sum + (o.total || 0), 0),
        }

        return NextResponse.json({
            orders,
            stats,
        })
    } catch (error) {
        console.error('Failed to get orders:', error)
        return NextResponse.json(
            { error: 'Failed to get orders' },
            { status: 500 }
        )
    }
}
