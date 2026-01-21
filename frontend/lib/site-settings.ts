/**
 * X-Tech Site Configuration
 * Update these values with your real business details
 */

export const siteSettings = {
    // Company Info
    company: {
        name: 'X-Technologies',
        legalName: 'X-Technologies (Pty) Ltd',
        tagline: 'Premium Computer Components',
        description: 'Your trusted source for high-quality computer components in South Africa.',
    },

    // Contact Details
    contact: {
        email: 'sales@x-technologies.co.za',
        phone: '+27 11 234 5678', // Update with real number
        whatsapp: '27745304359', // WhatsApp number without + (already set from your code)
        address: '123 Tech Street, Johannesburg, South Africa', // Update with real address
    },

    // Social Media
    social: {
        facebook: 'https://facebook.com/xtechnologies',
        instagram: 'https://instagram.com/xtechnologies',
        twitter: 'https://twitter.com/xtechnologies',
    },

    // Banking Details for EFT Payments
    // ⚠️ UPDATE THESE WITH REAL BANKING DETAILS
    banking: {
        bankName: 'First National Bank (FNB)',
        accountName: 'X-Technologies (Pty) Ltd',
        accountNumber: '62XXXXXXXXX', // Replace with real account number
        branchCode: '250655',
        accountType: 'Cheque/Current',
        swiftCode: 'FIRNZAJJ', // For international payments
    },

    // Business Hours
    businessHours: {
        weekdays: '08:00 - 17:00',
        saturday: '09:00 - 13:00',
        sunday: 'Closed',
        publicHolidays: 'Closed',
    },

    // Shipping
    shipping: {
        freeShippingThreshold: 1500, // Free shipping over R1500
        standardRate: 150, // Standard shipping cost
        estimatedDays: '3-5 business days',
        courier: 'The Courier Guy / Dawn Wing', // Supplier uses these
    },

    // Order Settings
    orders: {
        // How long to wait for payment before order expires (in hours)
        paymentTimeoutHours: 48,
        // Minimum order value
        minimumOrderValue: 0,
    },
}

// Helper function to format WhatsApp link
export function getWhatsAppLink(message?: string): string {
    const baseUrl = `https://wa.me/${siteSettings.contact.whatsapp}`
    if (message) {
        return `${baseUrl}?text=${encodeURIComponent(message)}`
    }
    return baseUrl
}

// Helper function to format phone for tel: links
export function getPhoneLink(): string {
    return `tel:${siteSettings.contact.phone.replace(/\s/g, '')}`
}

// Helper function to format email link
export function getEmailLink(subject?: string, body?: string): string {
    let link = `mailto:${siteSettings.contact.email}`
    const params: string[] = []

    if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
    if (body) params.push(`body=${encodeURIComponent(body)}`)

    if (params.length > 0) {
        link += `?${params.join('&')}`
    }

    return link
}
