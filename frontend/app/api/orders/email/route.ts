/**
 * Orders Email API Route
 * Handles sending emails for order lifecycle events
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'
import {
    sendEmail,
    emailConfig,
    generateOrderConfirmationEmail,
    generatePaymentReceivedEmail,
    generateShippingEmail,
    generateDeliveredEmail,
    generateAdminNewOrderEmail,
    OrderDetails,
} from '@/lib/email-service'

// POST - Send order confirmation email (after checkout)
export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIp = getClientIp(request)
        const rateLimitResult = checkRateLimit(clientIp, 'order-email', rateLimitConfigs.order)

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            )
        }

        const body = await request.json()
        const { order, type } = body as { order: OrderDetails; type: 'confirmation' | 'payment' | 'shipping' | 'delivered' }

        if (!order || !order.orderId || !order.customer?.email) {
            return NextResponse.json(
                { error: 'Missing required order data' },
                { status: 400 }
            )
        }

        let emailResult
        let adminEmailResult

        switch (type) {
            case 'confirmation':
                // Send to customer
                const confirmEmail = generateOrderConfirmationEmail(order)
                emailResult = await sendEmail(
                    order.customer.email,
                    confirmEmail.subject,
                    confirmEmail.html
                )

                // Send to admin
                const adminEmail = generateAdminNewOrderEmail(order)
                adminEmailResult = await sendEmail(
                    emailConfig.admin,
                    adminEmail.subject,
                    adminEmail.html
                )
                break

            case 'payment':
                const paymentEmail = generatePaymentReceivedEmail(order)
                emailResult = await sendEmail(
                    order.customer.email,
                    paymentEmail.subject,
                    paymentEmail.html
                )
                break

            case 'shipping':
                if (!body.trackingNumber || !body.courier) {
                    return NextResponse.json(
                        { error: 'Missing tracking information' },
                        { status: 400 }
                    )
                }
                const shippingEmail = generateShippingEmail({
                    ...order,
                    trackingNumber: body.trackingNumber,
                    courier: body.courier,
                    estimatedDelivery: body.estimatedDelivery,
                })
                emailResult = await sendEmail(
                    order.customer.email,
                    shippingEmail.subject,
                    shippingEmail.html
                )
                break

            case 'delivered':
                const deliveredEmail = generateDeliveredEmail(order)
                emailResult = await sendEmail(
                    order.customer.email,
                    deliveredEmail.subject,
                    deliveredEmail.html
                )
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid email type' },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            customerEmail: emailResult,
            adminEmail: adminEmailResult || null,
        })

    } catch (error) {
        console.error('Order email error:', error)
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        )
    }
}
