/**
 * Email Service for X-Tech
 * Handles sending transactional emails via AWS SES
 */

import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses'
import { awsConfig } from '@/lib/aws-config'
import { Order } from '@/lib/types/user'
import { siteSettings } from '@/lib/site-settings'
import { formatPrice } from '@/lib/utils'

// Note: In production, this should only run on the server (API routes)
// For now, we'll call this via an API route

interface EmailOptions {
    to: string
    subject: string
    html: string
    attachments?: {
        filename: string
        content: string // Base64 encoded
        contentType: string
    }[]
}

export function generateOrderConfirmationEmail(order: Order): { subject: string; html: string } {
    const subject = `Order Confirmation - ${order.orderRef} | X-Technologies`

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <strong>${item.name}</strong><br>
                <span style="color: #6b7280; font-size: 12px;">SKU: ${item.sku}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
    `).join('')

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">X-TECHNOLOGIES</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Premium Computer Components</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #111827; margin: 0 0 20px 0;">Thank You For Your Order! 🎉</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
                Hi ${order.shippingAddress.firstName},<br><br>
                We've received your order and it's being processed. Please find your order details below.
            </p>

            <!-- Order Info Box -->
            <div style="background: #f0fdfa; border: 1px solid #14b8a6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%;">
                    <tr>
                        <td style="color: #6b7280;">Order Reference:</td>
                        <td style="color: #14b8a6; font-weight: bold; text-align: right;">${order.orderRef}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280;">Order Date:</td>
                        <td style="color: #111827; text-align: right;">${new Date(order.createdAt).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280;">Status:</td>
                        <td style="text-align: right;">
                            <span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                Pending Payment
                            </span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Items Table -->
            <h3 style="color: #111827; margin: 25px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #14b8a6;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f9fafb;">
                        <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">Item</th>
                        <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 12px; text-transform: uppercase;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;">Price</th>
                        <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <!-- Totals -->
            <div style="margin-top: 20px; text-align: right;">
                <table style="margin-left: auto;">
                    <tr>
                        <td style="padding: 5px 20px; color: #6b7280;">Subtotal:</td>
                        <td style="padding: 5px 0; color: #111827;">${formatPrice(order.subtotal)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 20px; color: #6b7280;">Shipping:</td>
                        <td style="padding: 5px 0; color: #111827;">${order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</td>
                    </tr>
                    <tr style="font-size: 18px; font-weight: bold;">
                        <td style="padding: 15px 20px; color: #111827; border-top: 2px solid #e5e7eb;">Total:</td>
                        <td style="padding: 15px 0; color: #14b8a6; border-top: 2px solid #e5e7eb;">${formatPrice(order.total)}</td>
                    </tr>
                </table>
            </div>

            <!-- Payment Instructions -->
            <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0;">💳 Payment Instructions</h3>
                <p style="color: #78350f; margin: 0 0 15px 0;">Please make payment to the following account:</p>
                <table style="width: 100%; color: #78350f;">
                    <tr>
                        <td style="padding: 5px 0;"><strong>Bank:</strong></td>
                        <td>${siteSettings.banking.bankName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Account Name:</strong></td>
                        <td>${siteSettings.banking.accountName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Account Number:</strong></td>
                        <td>${siteSettings.banking.accountNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Branch Code:</strong></td>
                        <td>${siteSettings.banking.branchCode}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Reference:</strong></td>
                        <td style="color: #dc2626; font-weight: bold;">${order.orderRef}</td>
                    </tr>
                </table>
                <p style="color: #92400e; margin: 15px 0 0 0; font-size: 13px;">
                    ⚠️ Please use your order reference <strong>${order.orderRef}</strong> as the payment reference.
                </p>
            </div>

            <!-- Shipping Address -->
            <h3 style="color: #111827; margin: 25px 0 15px 0;">📦 Shipping Address</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; color: #374151;">
                    ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}<br>
                    ${order.shippingAddress.phone}
                </p>
            </div>

            <!-- Help Section -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; margin: 0 0 10px 0;">Questions about your order?</p>
                <a href="mailto:${siteSettings.contact.email}" style="color: #14b8a6; text-decoration: none; font-weight: 600;">${siteSettings.contact.email}</a>
                <span style="color: #d1d5db; margin: 0 10px;">|</span>
                <a href="https://wa.me/${siteSettings.contact.whatsapp}" style="color: #14b8a6; text-decoration: none; font-weight: 600;">WhatsApp</a>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0 0 5px 0;">${siteSettings.company.name}</p>
            <p style="margin: 0;">${siteSettings.contact.address}</p>
        </div>
    </div>
</body>
</html>
`

    return { subject, html }
}

export function generateAdminNotificationEmail(order: Order): { subject: string; html: string } {
    const subject = `🛒 New Order: ${order.orderRef} - ${formatPrice(order.total)}`

    const itemsList = order.items.map(item =>
        `<li>${item.quantity}x ${item.name} (${item.sku}) - ${formatPrice(item.price * item.quantity)}</li>`
    ).join('')

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Order Notification</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background: #1f2937; color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; background: #111827; padding: 30px; border-radius: 12px;">
        <h1 style="color: #14b8a6; margin: 0 0 20px 0;">🛒 New Order Received!</h1>
        
        <div style="background: #1f2937; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #f3f4f6; margin: 0 0 15px 0;">Order Details</h2>
            <p style="margin: 5px 0;"><strong>Order Ref:</strong> ${order.orderRef}</p>
            <p style="margin: 5px 0;"><strong>Total:</strong> <span style="color: #14b8a6; font-size: 20px;">${formatPrice(order.total)}</span></p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('en-ZA')}</p>
        </div>

        <div style="background: #1f2937; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #f3f4f6; margin: 0 0 10px 0;">Customer</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${order.userEmail}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
        </div>

        <div style="background: #1f2937; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #f3f4f6; margin: 0 0 10px 0;">Items</h3>
            <ul style="margin: 0; padding-left: 20px;">
                ${itemsList}
            </ul>
        </div>

        <div style="background: #1f2937; padding: 20px; border-radius: 8px;">
            <h3 style="color: #f3f4f6; margin: 0 0 10px 0;">Shipping Address</h3>
            <p style="margin: 0;">
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}
            </p>
        </div>

        <div style="margin-top: 20px; text-align: center;">
            <a href="https://x-tech.vercel.app/admin" style="display: inline-block; background: #14b8a6; color: #111827; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">View in Admin Dashboard</a>
        </div>
    </div>
</body>
</html>
`

    return { subject, html }
}

export function generateOrderStatusEmail(order: Order, newStatus: string): { subject: string; html: string } {
    const statusMessages: Record<string, { emoji: string; title: string; message: string }> = {
        payment_received: {
            emoji: '✅',
            title: 'Payment Received',
            message: 'We have received your payment and are now processing your order.'
        },
        processing: {
            emoji: '⚙️',
            title: 'Order Processing',
            message: 'Your order is being prepared and will be shipped soon.'
        },
        ordered: {
            emoji: '📦',
            title: 'Order Placed with Supplier',
            message: 'Your order has been placed with our supplier and will be shipped directly to you.'
        },
        shipped: {
            emoji: '🚚',
            title: 'Order Shipped',
            message: 'Great news! Your order has been shipped and is on its way to you.'
        },
        delivered: {
            emoji: '🎉',
            title: 'Order Delivered',
            message: 'Your order has been delivered. Enjoy your new tech!'
        }
    }

    const status = statusMessages[newStatus] || { emoji: '📋', title: 'Status Update', message: 'Your order status has been updated.' }
    const subject = `${status.emoji} ${status.title} - Order ${order.orderRef} | X-Technologies`

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">X-TECHNOLOGIES</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 48px;">${status.emoji}</span>
                <h2 style="color: #111827; margin: 10px 0 0 0;">${status.title}</h2>
            </div>

            <p style="color: #4b5563; text-align: center; line-height: 1.6;">
                Hi ${order.shippingAddress.firstName},<br><br>
                ${status.message}
            </p>

            <div style="background: #f0fdfa; border: 1px solid #14b8a6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #6b7280;">Order Reference</p>
                <p style="margin: 5px 0 0 0; color: #14b8a6; font-size: 24px; font-weight: bold;">${order.orderRef}</p>
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <a href="https://x-tech.vercel.app/account" style="display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Track Your Order</a>
            </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">${siteSettings.company.name}</p>
        </div>
    </div>
</body>
</html>
`

    return { subject, html }
}
