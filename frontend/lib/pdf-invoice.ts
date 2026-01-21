/**
 * PDF Invoice Generator for X-Tech
 * Generates professional PDF invoices for orders
 */

import { jsPDF } from 'jspdf'
import { Order } from '@/lib/types/user'
import { siteSettings } from '@/lib/site-settings'
import { formatPrice } from '@/lib/utils'

export function generateInvoicePDF(order: Order): jsPDF {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
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
    const rightCol = pageWidth - margin - 60
    doc.text('Invoice No:', rightCol, 50)
    doc.text('Date:', rightCol, 57)
    doc.text('Order Ref:', rightCol, 64)

    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.text(order.orderRef, rightCol + 35, 50)
    doc.text(new Date(order.createdAt).toLocaleDateString('en-ZA'), rightCol + 35, 57)
    doc.text(order.orderRef, rightCol + 35, 64)

    // Bill To Section
    yPos = 85
    doc.setFillColor(249, 250, 251)
    doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 35, 'F')

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
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('SHIP TO', pageWidth / 2 + 10, yPos + 5)

    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'normal')
    doc.text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, pageWidth / 2 + 10, yPos + 14)
    doc.text(order.shippingAddress.address, pageWidth / 2 + 10, yPos + 21)
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}`, pageWidth / 2 + 10, yPos + 28)

    // Items Table Header
    yPos = 130
    doc.setFillColor(...primaryColor)
    doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('ITEM', margin + 3, yPos + 7)
    doc.text('SKU', 100, yPos + 7)
    doc.text('QTY', 130, yPos + 7)
    doc.text('PRICE', 150, yPos + 7)
    doc.text('TOTAL', 175, yPos + 7)

    // Items
    yPos += 15
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'normal')

    order.items.forEach((item, index) => {
        // Alternate row background
        if (index % 2 === 0) {
            doc.setFillColor(249, 250, 251)
            doc.rect(margin, yPos - 4, pageWidth - (margin * 2), 10, 'F')
        }

        // Truncate long product names
        const maxNameLength = 45
        const displayName = item.name.length > maxNameLength
            ? item.name.substring(0, maxNameLength) + '...'
            : item.name

        doc.text(displayName, margin + 3, yPos + 2)
        doc.text(item.sku, 100, yPos + 2)
        doc.text(item.quantity.toString(), 133, yPos + 2)
        doc.text(formatPrice(item.price), 150, yPos + 2)
        doc.text(formatPrice(item.price * item.quantity), 175, yPos + 2)

        yPos += 10
    })

    // Totals Section
    yPos += 10
    doc.setDrawColor(229, 231, 235)
    doc.line(margin, yPos, pageWidth - margin, yPos)

    yPos += 10
    const totalsX = 140

    // Subtotal
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.text('Subtotal:', totalsX, yPos)
    doc.setTextColor(...darkColor)
    doc.text(formatPrice(order.subtotal), 175, yPos)

    // Shipping
    yPos += 8
    doc.setTextColor(...grayColor)
    doc.text('Shipping:', totalsX, yPos)
    doc.setTextColor(...darkColor)
    doc.text(order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost), 175, yPos)

    // Total
    yPos += 12
    doc.setFillColor(...primaryColor)
    doc.rect(totalsX - 5, yPos - 5, 55, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOTAL:', totalsX, yPos + 3)
    doc.text(formatPrice(order.total), 175, yPos + 3)

    // Payment Instructions
    yPos += 25
    doc.setFillColor(254, 243, 199) // Yellow background
    doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 50, 'F')

    doc.setTextColor(...darkColor)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('PAYMENT INSTRUCTIONS', margin + 5, yPos + 5)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    yPos += 12
    doc.text(`Bank: ${siteSettings.banking.bankName}`, margin + 5, yPos)
    doc.text(`Account Name: ${siteSettings.banking.accountName}`, margin + 5, yPos + 6)
    doc.text(`Account Number: ${siteSettings.banking.accountNumber}`, margin + 5, yPos + 12)
    doc.text(`Branch Code: ${siteSettings.banking.branchCode}`, margin + 5, yPos + 18)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38) // Red
    doc.text(`Reference: ${order.orderRef}`, margin + 5, yPos + 28)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.text('Please use your order reference as the payment reference.', margin + 5, yPos + 36)

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20
    doc.setDrawColor(229, 231, 235)
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    doc.text(siteSettings.company.name, margin, footerY)
    doc.text(siteSettings.contact.email, margin, footerY + 5)
    doc.text(siteSettings.contact.phone, pageWidth / 2 - 15, footerY)
    doc.text('Thank you for your order!', pageWidth - margin - 35, footerY)

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
