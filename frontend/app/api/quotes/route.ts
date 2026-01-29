/**
 * Quotes API Route
 * Handles quote request creation and email notifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { awsConfig } from '@/lib/aws-config'
import { siteSettings } from '@/lib/site-settings'
import { checkRateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'

// Initialize SES client
const sesClient = new SESClient({
    region: awsConfig.region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
})

// Send email via SES
async function sendEmail(to: string, subject: string, html: string) {
    // Skip email in development if SES not configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.SES_VERIFIED_EMAIL) {
        console.log('📧 Email would be sent to:', to)
        console.log('Subject:', subject)
        console.log('---')
        return { success: true, simulated: true }
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
        return { success: true }
    } catch (error) {
        console.error('Failed to send email:', error)
        return { success: false, error }
    }
}

// Generate quote request confirmation email for customer
function generateCustomerQuoteEmail(data: {
    customerName: string
    componentDescription: string
    message?: string
    quoteId: string
}): { subject: string; html: string } {
    const subject = `Quote Request Received - ${data.quoteId} | X-Technologies`

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">X-TECHNOLOGIES</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Premium Computer Components</p>
        </div>

        <!-- Main Content -->
        <div style="background: #1a1a24; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: white; margin: 0 0 20px 0;">Quote Request Received! 📋</h2>
            
            <p style="color: #9ca3af; line-height: 1.6;">
                Hi ${data.customerName},<br><br>
                Thank you for your quote request. Our team will review your requirements and get back to you within 24 hours with a custom quote.
            </p>

            <!-- Quote Reference -->
            <div style="background: #0d9488; background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%); border: 1px solid #14b8a6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #5eead4; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase;">Quote Reference</p>
                <p style="color: white; margin: 0; font-size: 24px; font-weight: bold;">${data.quoteId}</p>
            </div>

            <!-- What You Requested -->
            <div style="background: #111118; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #14b8a6; margin: 0 0 10px 0; font-size: 14px;">What You're Looking For:</h3>
                <p style="color: #e5e7eb; margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.componentDescription}</p>
            </div>

            ${data.message ? `
            <div style="background: #111118; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #14b8a6; margin: 0 0 10px 0; font-size: 14px;">Your Notes:</h3>
                <p style="color: #9ca3af; margin: 0; line-height: 1.6;">${data.message}</p>
            </div>
            ` : ''}

            <p style="color: #9ca3af; line-height: 1.6; margin-top: 30px;">
                We'll be in touch soon with pricing and availability.<br><br>
                Best regards,<br>
                <strong style="color: white;">The X-Technologies Team</strong>
            </p>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    ${siteSettings.contact.phone} | ${siteSettings.contact.email}<br>
                    ${siteSettings.contact.address}
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`

    return { subject, html }
}

// Generate quote request notification email for admin
function generateAdminQuoteNotificationEmail(data: {
    customerName: string
    customerEmail: string
    customerPhone: string
    componentDescription: string
    message?: string
    quoteId: string
}): { subject: string; html: string } {
    const subject = `🆕 New Quote Request - ${data.quoteId} from ${data.customerName}`

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🆕 New Quote Request</h1>
        </div>

        <!-- Main Content -->
        <div style="background: #1a1a24; padding: 30px; border-radius: 0 0 12px 12px;">
            <div style="background: #111118; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: white; margin: 0 0 15px 0;">Customer Details</h3>
                <table style="width: 100%;">
                    <tr>
                        <td style="color: #6b7280; padding: 5px 0;">Name:</td>
                        <td style="color: white; text-align: right;">${data.customerName}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; padding: 5px 0;">Email:</td>
                        <td style="color: #14b8a6; text-align: right;"><a href="mailto:${data.customerEmail}" style="color: #14b8a6;">${data.customerEmail}</a></td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; padding: 5px 0;">Phone:</td>
                        <td style="color: white; text-align: right;"><a href="tel:${data.customerPhone}" style="color: white;">${data.customerPhone}</a></td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; padding: 5px 0;">Quote ID:</td>
                        <td style="color: #f59e0b; text-align: right; font-weight: bold;">${data.quoteId}</td>
                    </tr>
                </table>
            </div>

            <div style="background: #111118; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #14b8a6; margin: 0 0 10px 0;">Components Requested:</h3>
                <p style="color: #e5e7eb; margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.componentDescription}</p>
            </div>

            ${data.message ? `
            <div style="background: #111118; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #6b7280; margin: 0 0 10px 0;">Additional Notes:</h3>
                <p style="color: #9ca3af; margin: 0; line-height: 1.6;">${data.message}</p>
            </div>
            ` : ''}

            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin?tab=quotes" 
               style="display: block; background: #14b8a6; color: black; text-align: center; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
                View Quote Request in Admin
            </a>
        </div>
    </div>
</body>
</html>
`

    return { subject, html }
}

// POST - Submit a new quote request
export async function POST(request: NextRequest) {
    try {
        // Check rate limit
        const clientIp = getClientIp(request)
        const rateLimitResult = checkRateLimit(clientIp, 'quotes', rateLimitConfigs.quote)

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            )
        }

        const body = await request.json()
        const {
            quoteId,
            componentDescription,
            customerName,
            customerEmail,
            customerPhone,
            message
        } = body

        // Validate required fields
        if (!componentDescription || !customerName || !customerEmail || !customerPhone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Send confirmation email to customer
        const customerEmailData = generateCustomerQuoteEmail({
            customerName,
            componentDescription,
            message,
            quoteId
        })

        await sendEmail(customerEmail, customerEmailData.subject, customerEmailData.html)

        // Send notification email to admin
        const adminEmail = siteSettings.contact.email
        const adminEmailData = generateAdminQuoteNotificationEmail({
            customerName,
            customerEmail,
            customerPhone,
            componentDescription,
            message,
            quoteId
        })

        await sendEmail(adminEmail, adminEmailData.subject, adminEmailData.html)

        return NextResponse.json({
            success: true,
            message: 'Quote request submitted successfully',
            quoteId
        })

    } catch (error) {
        console.error('Quote submission error:', error)
        return NextResponse.json(
            { error: 'Failed to submit quote request' },
            { status: 500 }
        )
    }
}

// POST to /api/quotes/respond - Send quote response to customer
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            quoteId,
            customerName,
            customerEmail,
            componentDescription,
            quotedItems,
            totalPrice,
            adminNotes
        } = body

        // Validate required fields
        if (!quoteId || !customerEmail || !quotedItems || !totalPrice) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Generate and send quote response email
        const subject = `Your Quote is Ready - ${quoteId} | X-Technologies`

        const itemsHtml = quotedItems.map((item: { description: string; price: number }) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #374151; color: #e5e7eb;">${item.description}</td>
                <td style="padding: 12px; border-bottom: 1px solid #374151; color: #14b8a6; text-align: right; font-weight: bold;">R ${item.price.toLocaleString()}</td>
            </tr>
        `).join('')

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">X-TECHNOLOGIES</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Your Quote is Ready!</p>
        </div>

        <!-- Main Content -->
        <div style="background: #1a1a24; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="color: #9ca3af; line-height: 1.6;">
                Hi ${customerName},<br><br>
                Great news! We've prepared a custom quote based on your requirements.
            </p>

            <!-- Quote Reference -->
            <div style="background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%); border: 1px solid #14b8a6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #5eead4; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase;">Quote Reference</p>
                <p style="color: white; margin: 0; font-size: 24px; font-weight: bold;">${quoteId}</p>
            </div>

            <!-- Original Request -->
            <div style="background: #111118; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <h4 style="color: #6b7280; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase;">Your Original Request:</h4>
                <p style="color: #9ca3af; margin: 0; font-size: 14px; white-space: pre-wrap;">${componentDescription}</p>
            </div>

            <!-- Quoted Items -->
            <h3 style="color: white; margin: 25px 0 15px 0;">Your Quote</h3>
            <table style="width: 100%; border-collapse: collapse; background: #111118; border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: #1f2937;">
                        <th style="padding: 12px; text-align: left; color: #9ca3af; font-size: 12px; text-transform: uppercase;">Item</th>
                        <th style="padding: 12px; text-align: right; color: #9ca3af; font-size: 12px; text-transform: uppercase;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr style="background: #14b8a6;">
                        <td style="padding: 15px; color: black; font-weight: bold;">TOTAL</td>
                        <td style="padding: 15px; color: black; font-weight: bold; text-align: right; font-size: 18px;">R ${totalPrice.toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>

            ${adminNotes ? `
            <div style="background: #111118; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h4 style="color: #14b8a6; margin: 0 0 10px 0;">Notes:</h4>
                <p style="color: #9ca3af; margin: 0; line-height: 1.6;">${adminNotes}</p>
            </div>
            ` : ''}

            <p style="color: #9ca3af; line-height: 1.6; margin-top: 30px;">
                This quote is valid for 7 days. To proceed with your order, simply reply to this email or give us a call.<br><br>
                Best regards,<br>
                <strong style="color: white;">The X-Technologies Team</strong>
            </p>

            <!-- Contact Info -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    ${siteSettings.contact.phone} | ${siteSettings.contact.email}<br>
                    ${siteSettings.contact.address}
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`

        await sendEmail(customerEmail, subject, html)

        return NextResponse.json({
            success: true,
            message: 'Quote sent to customer successfully'
        })

    } catch (error) {
        console.error('Quote response error:', error)
        return NextResponse.json(
            { error: 'Failed to send quote response' },
            { status: 500 }
        )
    }
}
