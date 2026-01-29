/**
 * Contact Form API Route
 * Handles contact form submissions and sends email to admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'
import {
    sendEmail,
    emailConfig,
    generateContactFormEmail,
} from '@/lib/email-service'

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIp = getClientIp(request)
        const rateLimitResult = checkRateLimit(clientIp, 'contact', rateLimitConfigs.contact)

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            )
        }

        const body = await request.json()
        const { name, email, phone, subject, message } = body

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Generate and send email to admin
        const contactEmail = generateContactFormEmail({
            name,
            email,
            phone,
            subject,
            message,
        })

        const result = await sendEmail(
            emailConfig.admin,
            contactEmail.subject,
            contactEmail.html
        )

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Your message has been sent. We will get back to you soon!',
            })
        } else {
            throw new Error(result.error || 'Failed to send email')
        }

    } catch (error) {
        console.error('Contact form error:', error)
        return NextResponse.json(
            { error: 'Failed to send message. Please try again later.' },
            { status: 500 }
        )
    }
}
