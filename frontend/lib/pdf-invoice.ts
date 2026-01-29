/**
 * PDF Invoice Generator for X-Tech
 * Generates professional PDF invoices for orders
 */

import { jsPDF } from 'jspdf'
import { Order } from '@/lib/types/user'
import { siteSettings } from '@/lib/site-settings'
import { formatPrice } from '@/lib/utils'

const BANKING_KEY = 'xtech-banking-settings'

interface BankingSettings {
    bankName: string
    accountName: string
    accountNumber: string
    branchCode: string
    accountType: string
    swiftCode: string
}

function getBankingSettings(): BankingSettings {
    // Try to load from localStorage (admin-configured settings)
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem(BANKING_KEY)
            if (saved) {
                return JSON.parse(saved)
            }
        } catch (e) {
            console.error('Failed to parse banking settings')
        }
    }
    // Fallback to default site settings
    return {
        bankName: siteSettings.banking.bankName,
        accountName: siteSettings.banking.accountName,
        accountNumber: siteSettings.banking.accountNumber,
        branchCode: siteSettings.banking.branchCode,
        accountType: siteSettings.banking.accountType,
        swiftCode: siteSettings.banking.swiftCode
    }
}

export function generateInvoicePDF(order: Order): jsPDF {
    const banking = getBankingSettings()
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    const rightEdge = pageWidth - margin
    let yPos = 20

    // Colors
    const primaryColor: [number, number, number] = [20, 184, 166] // Teal
    const darkColor: [number, number, number] = [31, 41, 55]
    const grayColor: [number, number, number] = [107, 114, 128]

    // Header - Company Name
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('X-TECHNOLOGIES', margin, 25)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Premium Computer Components', margin, 33)

    // Invoice Title
    yPos = 55
    doc.setTextColor(...darkColor)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('PROFORMA INVOICE', margin, yPos)

    // Invoice Details (right side)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.text('Invoice No:', rightEdge - 55, 50)
    doc.text('Date:', rightEdge - 55, 57)
    doc.text('Order Ref:', rightEdge - 55, 64)

    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.text(order.orderRef, rightEdge - 55 + 28, 50)
    doc.text(new Date(order.createdAt).toLocaleDateString('en-ZA'), rightEdge - 55 + 28, 57)
    doc.text(order.orderRef, rightEdge - 55 + 28, 64)

    // Bill To Section
    yPos = 85
    doc.setFillColor(249, 250, 251)
    doc.rect(margin, yPos - 5, contentWidth, 35, 'F')

    doc.setTextColor(...primaryColor)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('BILL TO', margin + 5, yPos + 5)

    doc.setTextColor(...darkColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, margin + 5, yPos + 14)
    doc.text(order.shippingAddress.address, margin + 5, yPos + 21)
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}`, margin + 5, yPos + 28)

    // Ship To (right side)
    const shipToX = pageWidth / 2 + 10
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('SHIP TO', shipToX, yPos + 5)

    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'normal')
    doc.text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, shipToX, yPos + 14)
    doc.text(order.shippingAddress.address, shipToX, yPos + 21)
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}`, shipToX, yPos + 28)

    // Items Table Header
    yPos = 130
    doc.setFillColor(...primaryColor)
    doc.rect(margin, yPos, contentWidth, 10, 'F')

    // Column positions (relative to margin)
    const colItem = margin + 3
    const colSku = margin + 85
    const colQty = margin + 115
    const colPrice = margin + 135
    const colTotal = rightEdge - 3  // Right-aligned

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('ITEM', colItem, yPos + 7)
    doc.text('SKU', colSku, yPos + 7)
    doc.text('QTY', colQty, yPos + 7)
    doc.text('PRICE', colPrice, yPos + 7)
    doc.text('TOTAL', colTotal, yPos + 7, { align: 'right' })

    // Items
    yPos += 15
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'normal')

    order.items.forEach((item, index) => {
        // Check if we need a new page
        if (yPos > pageHeight - 100) {
            doc.addPage()
            yPos = 20
        }

        // Alternate row background
        if (index % 2 === 0) {
            doc.setFillColor(249, 250, 251)
            doc.rect(margin, yPos - 4, contentWidth, 10, 'F')
        }

        // Truncate long product names
        const maxNameLength = 40
        const displayName = item.name.length > maxNameLength
            ? item.name.substring(0, maxNameLength) + '...'
            : item.name

        doc.setTextColor(...darkColor)
        doc.text(displayName, colItem, yPos + 2)
        doc.text(item.sku.substring(0, 15), colSku, yPos + 2)
        doc.text(item.quantity.toString(), colQty + 5, yPos + 2)
        doc.text(formatPrice(item.price), colPrice, yPos + 2)
        doc.text(formatPrice(item.price * item.quantity), colTotal, yPos + 2, { align: 'right' })

        yPos += 10
    })

    // Check if we need a new page for totals
    if (yPos > pageHeight - 90) {
        doc.addPage()
        yPos = 20
    }

    // Totals Section
    yPos += 10
    doc.setDrawColor(229, 231, 235)
    doc.line(margin, yPos, rightEdge, yPos)

    yPos += 10
    const labelX = rightEdge - 60
    const valueX = rightEdge - 3

    // Subtotal
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...grayColor)
    doc.text('Subtotal:', labelX, yPos)
    doc.setTextColor(...darkColor)
    doc.text(formatPrice(order.subtotal), valueX, yPos, { align: 'right' })

    // Shipping
    yPos += 8
    doc.setTextColor(...grayColor)
    doc.text('Shipping:', labelX, yPos)
    doc.setTextColor(...darkColor)
    doc.text(order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost), valueX, yPos, { align: 'right' })

    // Total
    yPos += 12
    const totalBoxWidth = 65
    doc.setFillColor(...primaryColor)
    doc.rect(rightEdge - totalBoxWidth, yPos - 5, totalBoxWidth, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOTAL:', rightEdge - totalBoxWidth + 5, yPos + 3)
    doc.text(formatPrice(order.total), valueX, yPos + 3, { align: 'right' })

    // Payment Instructions
    yPos += 20

    // Check if we need a new page for payment instructions
    if (yPos > pageHeight - 70) {
        doc.addPage()
        yPos = 20
    }

    doc.setFillColor(254, 243, 199) // Yellow background
    doc.rect(margin, yPos, contentWidth, 48, 'F')

    doc.setTextColor(...darkColor)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('PAYMENT INSTRUCTIONS', margin + 5, yPos + 10)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    const bankInfoY = yPos + 18
    doc.text(`Bank: ${banking.bankName}`, margin + 5, bankInfoY)
    doc.text(`Account Name: ${banking.accountName}`, margin + 5, bankInfoY + 6)
    doc.text(`Account Number: ${banking.accountNumber}`, margin + 100, bankInfoY)
    doc.text(`Branch Code: ${banking.branchCode}`, margin + 100, bankInfoY + 6)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38) // Red
    doc.text(`Payment Reference: ${order.orderRef}`, margin + 5, bankInfoY + 18)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.text('Please use your order reference as the payment reference.', margin + 5, bankInfoY + 26)

    // Footer
    yPos = yPos + 55
    if (yPos < pageHeight - 25) {
        doc.setDrawColor(229, 231, 235)
        doc.line(margin, yPos, rightEdge, yPos)

        doc.setFontSize(8)
        doc.setTextColor(...grayColor)
        doc.text(siteSettings.company.name, margin, yPos + 8)
        doc.text(siteSettings.contact.email, margin, yPos + 14)
        doc.text(siteSettings.contact.phone, pageWidth / 2, yPos + 8, { align: 'center' })
        doc.text('Thank you for your order!', rightEdge, yPos + 8, { align: 'right' })
    }

    return doc
}

export function getInvoiceAsBase64(order: Order): string {
    const doc = generateInvoicePDF(order)
    return doc.output('datauristring').split(',')[1]
}

export function downloadInvoice(order: Order): void {
    const doc = generateInvoicePDF(order)
    doc.save(`X-Tech-Invoice-${order.orderRef}.pdf`)
}
