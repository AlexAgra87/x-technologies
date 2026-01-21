/**
 * Orders API Route
 * Handles order creation and retrieval
 */

import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { awsConfig } from '@/lib/aws-config'
import { Order, CreateOrderData } from '@/lib/types/user'
import { generateOrderConfirmationEmail, generateAdminNotificationEmail } from '@/lib/email-templates'
import { getInvoiceAsBase64 } from '@/lib/pdf-invoice'

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({
    region: awsConfig.region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
})

const docClient = DynamoDBDocumentClient.from(dynamoClient)

const sesClient = new SESClient({
    region: awsConfig.region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
})

// Generate unique order reference
function generateOrderRef(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `XT-${timestamp}-${random}`
}

// Generate unique ID
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// Send email via SES
async function sendEmail(to: string, subject: string, html: string) {
    // Skip email in development if SES not configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.SES_VERIFIED_EMAIL) {
        console.log('Email would be sent to:', to)
        console.log('Subject:', subject)
        return
    }

    const command = new SendEmailCommand({
        Source: process.env.SES_VERIFIED_EMAIL,
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: { Data: subject },
            Body: {
                Html: { Data: html },
            },
        },
    })

    try {
        await sesClient.send(command)
        console.log('Email sent to:', to)
    } catch (error) {
        console.error('Failed to send email:', error)
        // Don't throw - order should still succeed even if email fails
    }
}

// POST - Create a new order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderData, userId, userEmail } = body as {
            orderData: CreateOrderData
            userId: string
            userEmail: string
        }

        // Validate required fields
        if (!orderData || !userId || !userEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create the order
        const now = new Date().toISOString()
        const order: Order = {
            id: generateId(),
            orderRef: generateOrderRef(),
            userId,
            userEmail,
            items: orderData.items,
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost,
            total: orderData.total,
            status: 'pending_payment',
            shippingAddress: orderData.shippingAddress,
            createdAt: now,
            updatedAt: now,
        }

        // Save to DynamoDB
        const putCommand = new PutCommand({
            TableName: awsConfig.dynamodb.ordersTable,
            Item: {
                pk: `USER#${userId}`,
                sk: `ORDER#${order.id}`,
                gsi1pk: `ORDER#${order.orderRef}`,
                gsi1sk: order.createdAt,
                ...order,
            },
        })

        await docClient.send(putCommand)
        console.log('Order saved to DynamoDB:', order.orderRef)

        // Generate PDF invoice (as base64 for future attachment)
        try {
            const invoiceBase64 = getInvoiceAsBase64(order)
            console.log('Invoice generated, size:', invoiceBase64.length)
        } catch (pdfError) {
            console.error('Failed to generate PDF:', pdfError)
        }

        // Send confirmation email to customer
        const { subject: customerSubject, html: customerHtml } = generateOrderConfirmationEmail(order)
        await sendEmail(userEmail, customerSubject, customerHtml)

        // Send notification to admin
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@x-technologies.co.za'
        const { subject: adminSubject, html: adminHtml } = generateAdminNotificationEmail(order)
        await sendEmail(adminEmail, adminSubject, adminHtml)

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                orderRef: order.orderRef,
                total: order.total,
                status: order.status,
            },
        })
    } catch (error) {
        console.error('Failed to create order:', error)
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        )
    }
}

// GET - Get orders for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const orderRef = searchParams.get('orderRef')

        // Get single order by reference
        if (orderRef) {
            const queryCommand = new QueryCommand({
                TableName: awsConfig.dynamodb.ordersTable,
                IndexName: 'gsi1',
                KeyConditionExpression: 'gsi1pk = :pk',
                ExpressionAttributeValues: {
                    ':pk': `ORDER#${orderRef}`,
                },
            })

            const result = await docClient.send(queryCommand)

            if (!result.Items || result.Items.length === 0) {
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                )
            }

            return NextResponse.json({ order: result.Items[0] })
        }

        // Get all orders for a user
        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            )
        }

        const queryCommand = new QueryCommand({
            TableName: awsConfig.dynamodb.ordersTable,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'ORDER#',
            },
            ScanIndexForward: false, // Most recent first
        })

        const result = await docClient.send(queryCommand)

        return NextResponse.json({
            orders: result.Items || [],
        })
    } catch (error) {
        console.error('Failed to get orders:', error)
        return NextResponse.json(
            { error: 'Failed to get orders' },
            { status: 500 }
        )
    }
}

// PATCH - Update order status (admin)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderId, userId, status, trackingNumber, trackingUrl, supplierOrderRef, notes } = body

        if (!orderId || !userId) {
            return NextResponse.json(
                { error: 'orderId and userId are required' },
                { status: 400 }
            )
        }

        // Build update expression dynamically
        const updateExpressions: string[] = ['updatedAt = :updatedAt']
        const expressionValues: Record<string, any> = {
            ':updatedAt': new Date().toISOString(),
        }

        if (status) {
            updateExpressions.push('#status = :status')
            expressionValues[':status'] = status

            // Set timestamp based on status
            if (status === 'payment_received') {
                updateExpressions.push('paidAt = :paidAt')
                expressionValues[':paidAt'] = new Date().toISOString()
            } else if (status === 'ordered') {
                updateExpressions.push('orderedAt = :orderedAt')
                expressionValues[':orderedAt'] = new Date().toISOString()
            } else if (status === 'shipped') {
                updateExpressions.push('shippedAt = :shippedAt')
                expressionValues[':shippedAt'] = new Date().toISOString()
            } else if (status === 'delivered') {
                updateExpressions.push('deliveredAt = :deliveredAt')
                expressionValues[':deliveredAt'] = new Date().toISOString()
            }
        }

        if (trackingNumber) {
            updateExpressions.push('trackingNumber = :trackingNumber')
            expressionValues[':trackingNumber'] = trackingNumber
        }

        if (trackingUrl) {
            updateExpressions.push('trackingUrl = :trackingUrl')
            expressionValues[':trackingUrl'] = trackingUrl
        }

        if (supplierOrderRef) {
            updateExpressions.push('supplierOrderRef = :supplierOrderRef')
            expressionValues[':supplierOrderRef'] = supplierOrderRef
        }

        if (notes !== undefined) {
            updateExpressions.push('notes = :notes')
            expressionValues[':notes'] = notes
        }

        const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb')

        const updateCommand = new UpdateCommand({
            TableName: awsConfig.dynamodb.ordersTable,
            Key: {
                pk: `USER#${userId}`,
                sk: `ORDER#${orderId}`,
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeValues: expressionValues,
            ExpressionAttributeNames: status ? { '#status': 'status' } : undefined,
            ReturnValues: 'ALL_NEW',
        })

        const result = await docClient.send(updateCommand)

        // TODO: Send status update email when SES is configured
        // if (status && result.Attributes) {
        //     const { subject, html } = generateOrderStatusEmail(result.Attributes as Order, status)
        //     await sendEmail(result.Attributes.userEmail, subject, html)
        // }

        return NextResponse.json({
            success: true,
            order: result.Attributes,
        })
    } catch (error) {
        console.error('Failed to update order:', error)
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        )
    }
}
