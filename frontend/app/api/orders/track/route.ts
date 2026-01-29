/**
 * Guest Order Tracking API
 * Allows guests to look up their order by reference and email
 */

import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { awsConfig } from '@/lib/aws-config'

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({
    region: awsConfig.region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
})

const docClient = DynamoDBDocumentClient.from(dynamoClient)

// GET - Look up order by reference and email
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const orderRef = searchParams.get('orderRef')
        const email = searchParams.get('email')

        if (!orderRef || !email) {
            return NextResponse.json(
                { error: 'Order reference and email are required' },
                { status: 400 }
            )
        }

        // First, try to find in localStorage (for demo/testing - in production this would be DB only)
        // Query DynamoDB by order reference using GSI
        const queryCommand = new QueryCommand({
            TableName: awsConfig.dynamodb.ordersTable,
            IndexName: 'gsi1',
            KeyConditionExpression: 'gsi1pk = :orderRef',
            ExpressionAttributeValues: {
                ':orderRef': `ORDER#${orderRef}`,
            },
            Limit: 1,
        })

        const result = await docClient.send(queryCommand)

        if (!result.Items || result.Items.length === 0) {
            // Order not found in DynamoDB - check if there's a localStorage fallback message
            return NextResponse.json(
                { error: 'Order not found. Please check your order reference and try again.' },
                { status: 404 }
            )
        }

        const order = result.Items[0]

        // Verify email matches (case-insensitive)
        if (order.userEmail.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json(
                { error: 'Email does not match order records. Please use the email address you provided when placing the order.' },
                { status: 403 }
            )
        }

        // Return order without sensitive info
        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                orderRef: order.orderRef,
                status: order.status,
                items: order.items,
                subtotal: order.subtotal,
                shippingCost: order.shippingCost,
                total: order.total,
                shippingAddress: {
                    firstName: order.shippingAddress.firstName,
                    lastName: order.shippingAddress.lastName,
                    city: order.shippingAddress.city,
                    province: order.shippingAddress.province,
                },
                // Tracking info
                supplierName: order.supplierName,
                courierName: order.courierName,
                trackingNumber: order.trackingNumber,
                trackingUrl: order.trackingUrl,
                // Timestamps
                createdAt: order.createdAt,
                paidAt: order.paidAt,
                orderedAt: order.orderedAt,
                shippedAt: order.shippedAt,
                deliveredAt: order.deliveredAt,
            },
        })
    } catch (error) {
        console.error('Failed to track order:', error)
        return NextResponse.json(
            { error: 'Failed to look up order. Please try again later.' },
            { status: 500 }
        )
    }
}
