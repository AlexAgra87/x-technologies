/**
 * X-Technologies Email Service
 * Centralized email sending with templates for all transactional emails
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { awsConfig } from '@/lib/aws-config'
import { siteSettings } from '@/lib/site-settings'

// Initialize SES client
const sesClient = new SESClient({
    region: awsConfig.region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
})

// Email configuration
export const emailConfig = {
    from: {
        sales: process.env.SES_SALES_EMAIL || 'sales@x-technologies.co.za',
        noreply: process.env.SES_NOREPLY_EMAIL || 'noreply@x-technologies.co.za',
        support: process.env.SES_SUPPORT_EMAIL || 'support@x-technologies.co.za',
    },
    admin: process.env.ADMIN_EMAIL || 'admin@x-technologies.co.za',
}

// Common email styles
const emailStyles = {
    container: 'max-width: 600px; margin: 0 auto; padding: 20px;',
    header: 'background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;',
    headerTitle: 'color: white; margin: 0; font-size: 28px; font-weight: bold;',
    headerSubtitle: 'color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;',
    body: 'background: #1a1a24; padding: 30px; border-radius: 0 0 12px 12px;',
    text: 'color: #9ca3af; line-height: 1.6; margin: 0 0 15px 0;',
    heading: 'color: white; margin: 0 0 20px 0;',
    infoBox: 'background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%); border: 1px solid #14b8a6; border-radius: 8px; padding: 20px; margin: 20px 0;',
    warningBox: 'background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;',
    successBox: 'background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;',
    card: 'background: #111118; border-radius: 8px; padding: 20px; margin: 20px 0;',
    button: 'display: inline-block; background: #14b8a6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; margin: 10px 0;',
    table: 'width: 100%; border-collapse: collapse;',
    tableHeader: 'text-align: left; padding: 12px; color: #14b8a6; border-bottom: 1px solid #374151; font-size: 12px; text-transform: uppercase;',
    tableCell: 'padding: 12px; color: #e5e7eb; border-bottom: 1px solid #1f2937;',
    footer: 'text-align: center; padding: 20px; color: #6b7280; font-size: 12px;',
    label: 'color: #5eead4; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase;',
    value: 'color: white; margin: 0; font-size: 18px; font-weight: bold;',
}

// Base email template wrapper
function emailWrapper(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f;">
    <div style="${emailStyles.container}">
        <!-- Header -->
        <div style="${emailStyles.header}">
            <h1 style="${emailStyles.headerTitle}">X-TECHNOLOGIES</h1>
            <p style="${emailStyles.headerSubtitle}">Premium Computer Components</p>
        </div>

        <!-- Main Content -->
        <div style="${emailStyles.body}">
            ${content}
        </div>

        <!-- Footer -->
        <div style="${emailStyles.footer}">
            <p style="margin: 0 0 10px 0;">
                <a href="${siteSettings.social.facebook}" style="color: #14b8a6; text-decoration: none; margin: 0 10px;">Facebook</a>
                <a href="${siteSettings.social.instagram}" style="color: #14b8a6; text-decoration: none; margin: 0 10px;">Instagram</a>
            </p>
            <p style="margin: 0 0 5px 0;">${siteSettings.company.name}</p>
            <p style="margin: 0 0 5px 0;">${siteSettings.contact.address}</p>
            <p style="margin: 0;">Phone: ${siteSettings.contact.phone} | Email: ${siteSettings.contact.email}</p>
        </div>
    </div>
</body>
</html>
`
}

// Send email via SES
export async function sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    from?: string
): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
    const toAddresses = Array.isArray(to) ? to : [to]
    const fromAddress = from || emailConfig.from.sales

    // Skip email in development if SES not configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.SES_VERIFIED_EMAIL) {
        console.log('📧 Email would be sent:')
        console.log('From:', fromAddress)
        console.log('To:', toAddresses.join(', '))
        console.log('Subject:', subject)
        console.log('---')
        return { success: true, simulated: true }
    }

    const command = new SendEmailCommand({
        Source: process.env.SES_VERIFIED_EMAIL,
        Destination: {
            ToAddresses: toAddresses,
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
        console.log('✅ Email sent to:', toAddresses.join(', '))
        return { success: true }
    } catch (error) {
        console.error('❌ Failed to send email:', error)
        return { success: false, error: String(error) }
    }
}

// ============================================
// ORDER EMAILS
// ============================================

export interface OrderItem {
    name: string
    sku: string
    quantity: number
    price: number
    image?: string
}

export interface OrderDetails {
    orderId: string
    items: OrderItem[]
    subtotal: number
    shipping: number
    vat: number
    total: number
    customer: {
        name: string
        email: string
        phone: string
    }
    shippingAddress: {
        street: string
        city: string
        province: string
        postalCode: string
    }
    paymentMethod: 'eft' | 'card'
}

// Generate order confirmation email (after checkout - awaiting payment)
export function generateOrderConfirmationEmail(order: OrderDetails): { subject: string; html: string } {
    const subject = `Order Confirmation #${order.orderId} - Awaiting Payment | X-Technologies`

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="${emailStyles.tableCell}">
                <strong style="color: white;">${item.name}</strong><br>
                <span style="color: #6b7280; font-size: 12px;">SKU: ${item.sku}</span>
            </td>
            <td style="${emailStyles.tableCell} text-align: center;">${item.quantity}</td>
            <td style="${emailStyles.tableCell} text-align: right;">R ${item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
        </tr>
    `).join('')

    const content = `
        <h2 style="${emailStyles.heading}">Thank You For Your Order! 🎉</h2>
        
        <p style="${emailStyles.text}">
            Hi ${order.customer.name},<br><br>
            Thank you for your order. Your order has been received and is awaiting payment confirmation.
        </p>

        <!-- Order Reference -->
        <div style="${emailStyles.infoBox}">
            <p style="${emailStyles.label}">Order Reference</p>
            <p style="${emailStyles.value}">${order.orderId}</p>
        </div>

        <!-- Payment Instructions -->
        <div style="${emailStyles.warningBox}">
            <h3 style="color: #f59e0b; margin: 0 0 15px 0;">⚠️ Payment Required</h3>
            <p style="color: #fcd34d; margin: 0 0 10px 0;">
                Please complete your payment within <strong>48 hours</strong> to secure your order.
            </p>
            
            <h4 style="color: #f59e0b; margin: 15px 0 10px 0;">Bank Details:</h4>
            <table style="width: 100%;">
                <tr><td style="color: #fcd34d; padding: 3px 0;">Bank:</td><td style="color: white; padding: 3px 0;">${siteSettings.banking.bankName}</td></tr>
                <tr><td style="color: #fcd34d; padding: 3px 0;">Account Name:</td><td style="color: white; padding: 3px 0;">${siteSettings.banking.accountName}</td></tr>
                <tr><td style="color: #fcd34d; padding: 3px 0;">Account Number:</td><td style="color: white; padding: 3px 0;">${siteSettings.banking.accountNumber}</td></tr>
                <tr><td style="color: #fcd34d; padding: 3px 0;">Branch Code:</td><td style="color: white; padding: 3px 0;">${siteSettings.banking.branchCode}</td></tr>
                <tr><td style="color: #fcd34d; padding: 3px 0;">Reference:</td><td style="color: white; padding: 3px 0; font-weight: bold;">${order.orderId}</td></tr>
            </table>

            <p style="color: #fcd34d; margin: 15px 0 0 0; font-size: 14px;">
                📧 After payment, please email your proof of payment to <a href="mailto:${siteSettings.contact.email}" style="color: #14b8a6;">${siteSettings.contact.email}</a> with your order reference.
            </p>
        </div>

        <!-- Order Items -->
        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 15px 0;">Order Items</h3>
            <table style="${emailStyles.table}">
                <thead>
                    <tr>
                        <th style="${emailStyles.tableHeader}">Item</th>
                        <th style="${emailStyles.tableHeader} text-align: center;">Qty</th>
                        <th style="${emailStyles.tableHeader} text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="border-top: 1px solid #374151; margin-top: 15px; padding-top: 15px;">
                <table style="width: 100%;">
                    <tr>
                        <td style="color: #9ca3af; padding: 5px 0;">Subtotal:</td>
                        <td style="color: white; text-align: right; padding: 5px 0;">R ${order.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td style="color: #9ca3af; padding: 5px 0;">Shipping:</td>
                        <td style="color: white; text-align: right; padding: 5px 0;">R ${order.shipping.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td style="color: #9ca3af; padding: 5px 0;">VAT (15%):</td>
                        <td style="color: white; text-align: right; padding: 5px 0;">R ${order.vat.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td style="color: #14b8a6; font-weight: bold; padding: 10px 0; font-size: 18px;">Total:</td>
                        <td style="color: #14b8a6; font-weight: bold; text-align: right; padding: 10px 0; font-size: 18px;">R ${order.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Shipping Address -->
        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 15px 0;">Shipping Address</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.8;">
                ${order.customer.name}<br>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.province}<br>
                ${order.shippingAddress.postalCode}<br>
                <br>
                📞 ${order.customer.phone}<br>
                ✉️ ${order.customer.email}
            </p>
        </div>

        <p style="${emailStyles.text}">
            If you have any questions about your order, please don't hesitate to contact us.
        </p>

        <a href="https://x-technologies.co.za/track-order?ref=${order.orderId}" style="${emailStyles.button}">
            Track Your Order
        </a>
    `

    return { subject, html: emailWrapper(content) }
}

// Generate payment received confirmation email
export function generatePaymentReceivedEmail(order: OrderDetails): { subject: string; html: string } {
    const subject = `Payment Confirmed - Order #${order.orderId} | X-Technologies`

    const content = `
        <h2 style="${emailStyles.heading}">Payment Received! ✅</h2>
        
        <p style="${emailStyles.text}">
            Hi ${order.customer.name},<br><br>
            Great news! We've received and verified your payment for order <strong>#${order.orderId}</strong>.
        </p>

        <div style="${emailStyles.successBox}">
            <h3 style="color: #22c55e; margin: 0 0 10px 0;">✓ Payment Confirmed</h3>
            <p style="color: #86efac; margin: 0;">
                Your order is now being processed and prepared for shipping.
            </p>
        </div>

        <!-- Order Summary -->
        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 15px 0;">Order Summary</h3>
            <table style="width: 100%;">
                <tr>
                    <td style="color: #9ca3af; padding: 5px 0;">Order Reference:</td>
                    <td style="color: white; text-align: right; padding: 5px 0;">${order.orderId}</td>
                </tr>
                <tr>
                    <td style="color: #9ca3af; padding: 5px 0;">Items:</td>
                    <td style="color: white; text-align: right; padding: 5px 0;">${order.items.length} item(s)</td>
                </tr>
                <tr>
                    <td style="color: #14b8a6; font-weight: bold; padding: 10px 0; font-size: 18px;">Total Paid:</td>
                    <td style="color: #14b8a6; font-weight: bold; text-align: right; padding: 10px 0; font-size: 18px;">R ${order.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                </tr>
            </table>
        </div>

        <div style="${emailStyles.infoBox}">
            <h4 style="color: #14b8a6; margin: 0 0 10px 0;">What Happens Next?</h4>
            <ol style="color: #e5e7eb; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Our team is now packing your order</li>
                <li>You'll receive a shipping notification with tracking details</li>
                <li>Your order will be delivered to your door</li>
            </ol>
        </div>

        <p style="${emailStyles.text}">
            Thank you for shopping with X-Technologies!
        </p>

        <a href="https://x-technologies.co.za/track-order?ref=${order.orderId}" style="${emailStyles.button}">
            Track Your Order
        </a>
    `

    return { subject, html: emailWrapper(content) }
}

// Generate shipping notification email
export function generateShippingEmail(order: OrderDetails & {
    trackingNumber: string
    courier: string
    estimatedDelivery?: string
}): { subject: string; html: string } {
    const subject = `Your Order Has Shipped! 🚚 - Order #${order.orderId} | X-Technologies`

    const content = `
        <h2 style="${emailStyles.heading}">Your Order Is On Its Way! 🚚</h2>
        
        <p style="${emailStyles.text}">
            Hi ${order.customer.name},<br><br>
            Exciting news! Your order <strong>#${order.orderId}</strong> has been shipped and is on its way to you.
        </p>

        <!-- Tracking Info -->
        <div style="${emailStyles.infoBox}">
            <table style="width: 100%;">
                <tr>
                    <td style="padding: 8px 0;">
                        <p style="${emailStyles.label}">Courier</p>
                        <p style="color: white; margin: 0; font-size: 16px;">${order.courier}</p>
                    </td>
                    <td style="padding: 8px 0;">
                        <p style="${emailStyles.label}">Tracking Number</p>
                        <p style="color: white; margin: 0; font-size: 16px; font-weight: bold;">${order.trackingNumber}</p>
                    </td>
                </tr>
                ${order.estimatedDelivery ? `
                <tr>
                    <td colspan="2" style="padding: 8px 0;">
                        <p style="${emailStyles.label}">Estimated Delivery</p>
                        <p style="color: white; margin: 0; font-size: 16px;">${order.estimatedDelivery}</p>
                    </td>
                </tr>
                ` : ''}
            </table>
        </div>

        <!-- Shipping Address -->
        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 15px 0;">Delivering To</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.8;">
                ${order.customer.name}<br>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.province}<br>
                ${order.shippingAddress.postalCode}
            </p>
        </div>

        <div style="${emailStyles.card}">
            <h4 style="color: #14b8a6; margin: 0 0 10px 0;">📦 Items In This Shipment</h4>
            <ul style="color: #e5e7eb; margin: 0; padding-left: 20px; line-height: 1.8;">
                ${order.items.map(item => `<li>${item.name} (x${item.quantity})</li>`).join('')}
            </ul>
        </div>

        <p style="${emailStyles.text}">
            You can track your package using the tracking number above on the courier's website.
        </p>

        <a href="https://x-technologies.co.za/track-order?ref=${order.orderId}" style="${emailStyles.button}">
            Track Your Order
        </a>
    `

    return { subject, html: emailWrapper(content) }
}

// Generate order delivered email
export function generateDeliveredEmail(order: OrderDetails): { subject: string; html: string } {
    const subject = `Order Delivered! 📦 - Order #${order.orderId} | X-Technologies`

    const content = `
        <h2 style="${emailStyles.heading}">Your Order Has Been Delivered! 📦</h2>
        
        <p style="${emailStyles.text}">
            Hi ${order.customer.name},<br><br>
            Your order <strong>#${order.orderId}</strong> has been delivered. We hope you love your new tech!
        </p>

        <div style="${emailStyles.successBox}">
            <h3 style="color: #22c55e; margin: 0 0 10px 0;">✓ Delivery Complete</h3>
            <p style="color: #86efac; margin: 0;">
                Your package has been successfully delivered.
            </p>
        </div>

        <div style="${emailStyles.card}">
            <h4 style="color: #14b8a6; margin: 0 0 10px 0;">Need Help With Your Order?</h4>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.6;">
                If you have any issues with your order or need to return an item, please contact us within 7 days of delivery.
            </p>
        </div>

        <p style="${emailStyles.text}">
            Thank you for choosing X-Technologies. We'd love to hear about your experience!
        </p>

        <a href="https://x-technologies.co.za/account?tab=orders" style="${emailStyles.button}">
            View Your Orders
        </a>
    `

    return { subject, html: emailWrapper(content) }
}

// ============================================
// ADMIN NOTIFICATION EMAILS
// ============================================

// Notify admin of new order
export function generateAdminNewOrderEmail(order: OrderDetails): { subject: string; html: string } {
    const subject = `🔔 New Order Received - #${order.orderId} - R ${order.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`

    const itemsList = order.items.map(item =>
        `<li style="color: #e5e7eb; padding: 5px 0;">${item.name} (x${item.quantity}) - R ${(item.price * item.quantity).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</li>`
    ).join('')

    const content = `
        <h2 style="${emailStyles.heading}">New Order Received! 🔔</h2>
        
        <div style="${emailStyles.infoBox}">
            <table style="width: 100%;">
                <tr>
                    <td style="padding: 8px 0;">
                        <p style="${emailStyles.label}">Order ID</p>
                        <p style="${emailStyles.value}">${order.orderId}</p>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                        <p style="${emailStyles.label}">Total</p>
                        <p style="${emailStyles.value}">R ${order.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                    </td>
                </tr>
            </table>
        </div>

        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 15px 0;">Customer Details</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.8;">
                <strong>${order.customer.name}</strong><br>
                ${order.customer.email}<br>
                ${order.customer.phone}
            </p>
        </div>

        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 15px 0;">Shipping Address</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.8;">
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.province}<br>
                ${order.shippingAddress.postalCode}
            </p>
        </div>

        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 15px 0;">Order Items (${order.items.length})</h3>
            <ul style="margin: 0; padding-left: 20px;">
                ${itemsList}
            </ul>
        </div>

        <div style="${emailStyles.warningBox}">
            <p style="color: #fcd34d; margin: 0;">
                ⏳ This order is awaiting EFT payment. Check for proof of payment from the customer.
            </p>
        </div>

        <a href="https://x-technologies.co.za/admin?tab=orders" style="${emailStyles.button}">
            View in Admin Panel
        </a>
    `

    return { subject, html: emailWrapper(content) }
}

// ============================================
// QUOTE EMAILS
// ============================================

export interface QuoteData {
    quoteId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    componentDescription: string
    message?: string
}

// Generate quote request confirmation email for customer
export function generateCustomerQuoteEmail(data: QuoteData): { subject: string; html: string } {
    const subject = `Quote Request Received - ${data.quoteId} | X-Technologies`

    const content = `
        <h2 style="${emailStyles.heading}">Quote Request Received! 📋</h2>
        
        <p style="${emailStyles.text}">
            Hi ${data.customerName},<br><br>
            Thank you for your quote request. Our team will review your requirements and get back to you within 24 hours with a custom quote.
        </p>

        <div style="${emailStyles.infoBox}">
            <p style="${emailStyles.label}">Quote Reference</p>
            <p style="${emailStyles.value}">${data.quoteId}</p>
        </div>

        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 10px 0;">What You're Looking For:</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.componentDescription}</p>
        </div>

        ${data.message ? `
        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 10px 0;">Additional Notes:</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.6;">${data.message}</p>
        </div>
        ` : ''}

        <p style="${emailStyles.text}">
            We'll be in touch soon. If you have any questions in the meantime, feel free to reply to this email or contact us directly.
        </p>

        <a href="https://x-technologies.co.za/products" style="${emailStyles.button}">
            Browse Products
        </a>
    `

    return { subject, html: emailWrapper(content) }
}

// Generate admin notification for new quote request
export function generateAdminQuoteNotificationEmail(data: QuoteData): { subject: string; html: string } {
    const subject = `🔔 New Quote Request - ${data.quoteId} - ${data.customerName}`

    const content = `
        <h2 style="${emailStyles.heading}">New Quote Request! 📋</h2>
        
        <div style="${emailStyles.infoBox}">
            <p style="${emailStyles.label}">Quote Reference</p>
            <p style="${emailStyles.value}">${data.quoteId}</p>
        </div>

        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 15px 0;">Customer Details</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.8;">
                <strong>${data.customerName}</strong><br>
                ${data.customerEmail}<br>
                ${data.customerPhone}
            </p>
        </div>

        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 10px 0;">Components Requested:</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.componentDescription}</p>
        </div>

        ${data.message ? `
        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 10px 0;">Additional Notes:</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.6;">${data.message}</p>
        </div>
        ` : ''}

        <a href="https://x-technologies.co.za/admin?tab=quotes" style="${emailStyles.button}">
            Respond to Quote
        </a>
    `

    return { subject, html: emailWrapper(content) }
}

// Generate quote response email to customer
export interface QuotedItem {
    description: string
    price: number
}

export function generateQuoteResponseEmail(data: {
    quoteId: string
    customerName: string
    items: QuotedItem[]
    totalPrice: number
    adminNotes?: string
}): { subject: string; html: string } {
    const subject = `Your Quote is Ready! - ${data.quoteId} | X-Technologies`

    const itemsHtml = data.items.map(item => `
        <tr>
            <td style="${emailStyles.tableCell}">${item.description}</td>
            <td style="${emailStyles.tableCell} text-align: right;">R ${item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
        </tr>
    `).join('')

    const content = `
        <h2 style="${emailStyles.heading}">Your Quote is Ready! 💰</h2>
        
        <p style="${emailStyles.text}">
            Hi ${data.customerName},<br><br>
            We've reviewed your requirements and prepared a custom quote for you.
        </p>

        <div style="${emailStyles.infoBox}">
            <p style="${emailStyles.label}">Quote Reference</p>
            <p style="${emailStyles.value}">${data.quoteId}</p>
        </div>

        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 15px 0;">Quoted Items</h3>
            <table style="${emailStyles.table}">
                <thead>
                    <tr>
                        <th style="${emailStyles.tableHeader}">Item</th>
                        <th style="${emailStyles.tableHeader} text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="border-top: 1px solid #374151; margin-top: 15px; padding-top: 15px;">
                <table style="width: 100%;">
                    <tr>
                        <td style="color: #14b8a6; font-weight: bold; padding: 10px 0; font-size: 20px;">Total:</td>
                        <td style="color: #14b8a6; font-weight: bold; text-align: right; padding: 10px 0; font-size: 20px;">R ${data.totalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </table>
            </div>
        </div>

        ${data.adminNotes ? `
        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 10px 0;">Notes from Our Team:</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.6;">${data.adminNotes}</p>
        </div>
        ` : ''}

        <div style="${emailStyles.infoBox}">
            <h4 style="color: #14b8a6; margin: 0 0 10px 0;">Ready to Order?</h4>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.6;">
                To proceed with this quote, simply reply to this email or contact us. This quote is valid for 7 days.
            </p>
        </div>

        <p style="${emailStyles.text}">
            If you have any questions about this quote, please don't hesitate to contact us.
        </p>

        <a href="mailto:${siteSettings.contact.email}?subject=Accept%20Quote%20${data.quoteId}" style="${emailStyles.button}">
            Accept Quote
        </a>
    `

    return { subject, html: emailWrapper(content) }
}

// ============================================
// CONTACT FORM EMAIL
// ============================================

export function generateContactFormEmail(data: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
}): { subject: string; html: string } {
    const subject = `🔔 Contact Form: ${data.subject} - ${data.name}`

    const content = `
        <h2 style="${emailStyles.heading}">New Contact Form Submission</h2>
        
        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 15px 0;">Contact Details</h3>
            <table style="width: 100%;">
                <tr>
                    <td style="color: #9ca3af; padding: 5px 0; width: 100px;">Name:</td>
                    <td style="color: white; padding: 5px 0;">${data.name}</td>
                </tr>
                <tr>
                    <td style="color: #9ca3af; padding: 5px 0;">Email:</td>
                    <td style="color: white; padding: 5px 0;"><a href="mailto:${data.email}" style="color: #14b8a6;">${data.email}</a></td>
                </tr>
                ${data.phone ? `
                <tr>
                    <td style="color: #9ca3af; padding: 5px 0;">Phone:</td>
                    <td style="color: white; padding: 5px 0;">${data.phone}</td>
                </tr>
                ` : ''}
                <tr>
                    <td style="color: #9ca3af; padding: 5px 0;">Subject:</td>
                    <td style="color: white; padding: 5px 0;">${data.subject}</td>
                </tr>
            </table>
        </div>

        <div style="${emailStyles.card}">
            <h3 style="color: #14b8a6; margin: 0 0 10px 0;">Message:</h3>
            <p style="color: #e5e7eb; margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </div>

        <a href="mailto:${data.email}?subject=Re:%20${encodeURIComponent(data.subject)}" style="${emailStyles.button}">
            Reply to Customer
        </a>
    `

    return { subject, html: emailWrapper(content) }
}

// ============================================
// NEWSLETTER EMAILS
// ============================================

export function generateWelcomeNewsletterEmail(email: string): { subject: string; html: string } {
    const subject = `Welcome to X-Technologies! 🎉`

    const content = `
        <h2 style="${emailStyles.heading}">Welcome to the X-Tech Family! 🎉</h2>
        
        <p style="${emailStyles.text}">
            Thank you for subscribing to our newsletter! You're now part of an exclusive community of tech enthusiasts.
        </p>

        <div style="${emailStyles.infoBox}">
            <h3 style="color: #14b8a6; margin: 0 0 10px 0;">What to Expect:</h3>
            <ul style="color: #e5e7eb; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Exclusive deals and discounts</li>
                <li>New product announcements</li>
                <li>Tech tips and tutorials</li>
                <li>Special promotions for subscribers</li>
            </ul>
        </div>

        <p style="${emailStyles.text}">
            Start exploring our latest products and find the perfect components for your next build!
        </p>

        <a href="https://x-technologies.co.za/products" style="${emailStyles.button}">
            Shop Now
        </a>
    `

    return { subject, html: emailWrapper(content) }
}
