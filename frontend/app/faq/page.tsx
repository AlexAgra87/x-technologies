'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, Search } from 'lucide-react'

const faqCategories = [
    {
        name: 'Orders & Shipping',
        faqs: [
            {
                question: 'How long does shipping take?',
                answer: 'Standard shipping within South Africa takes 3-5 business days. Express shipping is available for 1-2 business day delivery to major cities. Rural areas may take an additional 1-2 days.',
            },
            {
                question: 'How can I track my order?',
                answer: 'Once your order ships, you\'ll receive an email with a tracking number. You can use this to track your package on our website or the courier\'s website.',
            },
            {
                question: 'Do you ship internationally?',
                answer: 'Currently, we only ship within South Africa. We\'re working on expanding to neighboring countries in the future.',
            },
            {
                question: 'What are the shipping costs?',
                answer: 'Shipping is free on orders over R1,500. For orders under R1,500, shipping costs R99 for standard delivery or R199 for express delivery.',
            },
        ],
    },
    {
        name: 'Returns & Refunds',
        faqs: [
            {
                question: 'What is your return policy?',
                answer: 'We offer a 14-day return policy on most items. Products must be unused, in original packaging, and in resalable condition. Some items like opened software are non-returnable.',
            },
            {
                question: 'How do I initiate a return?',
                answer: 'Contact our support team at returns@x-tech.co.za with your order number. We\'ll provide you with a return authorization and shipping instructions.',
            },
            {
                question: 'When will I receive my refund?',
                answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. It may take an additional 3-5 business days for the refund to appear in your account.',
            },
        ],
    },
    {
        name: 'Products & Warranty',
        faqs: [
            {
                question: 'Are all products genuine?',
                answer: 'Yes! We only source products from authorized distributors and manufacturers. All products come with manufacturer warranties.',
            },
            {
                question: 'What warranty do products come with?',
                answer: 'Warranty periods vary by manufacturer and product. Most components come with 2-3 year warranties. Specific warranty information is listed on each product page.',
            },
            {
                question: 'How do I claim warranty?',
                answer: 'For warranty claims, contact our support team with your order details and proof of purchase. We\'ll guide you through the manufacturer\'s warranty process.',
            },
        ],
    },
    {
        name: 'Payment & Security',
        faqs: [
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept Visa, Mastercard, PayFast, Instant EFT, and bank transfers. All payments are processed securely through encrypted connections.',
            },
            {
                question: 'Is my payment information secure?',
                answer: 'Absolutely. We use industry-standard SSL encryption and never store your full credit card details on our servers. All transactions are processed through PCI-compliant payment gateways.',
            },
            {
                question: 'Can I pay on collection?',
                answer: 'Currently, we only accept online payments. This allows us to keep our prices competitive and process orders quickly.',
            },
        ],
    },
]

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [openItems, setOpenItems] = useState<string[]>([])

    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const filteredCategories = faqCategories.map(category => ({
        ...category,
        faqs: category.faqs.filter(
            faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter(category => category.faqs.length > 0)

    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-gray-800">
                <div className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <HelpCircle className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Frequently Asked <span className="text-gradient">Questions</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                            Find quick answers to common questions about orders, shipping, returns, and more.
                        </p>

                        {/* Search */}
                        <div className="max-w-md mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search FAQs..."
                                className="input w-full pl-12"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No FAQs found matching your search.</p>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-8">
                        {filteredCategories.map((category, catIndex) => (
                            <motion.div
                                key={category.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: catIndex * 0.1 }}
                            >
                                <h2 className="text-xl font-bold text-white mb-4">{category.name}</h2>
                                <div className="space-y-3">
                                    {category.faqs.map((faq, faqIndex) => {
                                        const itemId = `${catIndex}-${faqIndex}`
                                        const isOpen = openItems.includes(itemId)

                                        return (
                                            <div key={itemId} className="card overflow-hidden">
                                                <button
                                                    onClick={() => toggleItem(itemId)}
                                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-dark-700/50 transition-colors"
                                                >
                                                    <span className="font-medium text-white pr-4">{faq.question}</span>
                                                    <ChevronDown
                                                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''
                                                            }`}
                                                    />
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-4 pb-4 text-gray-400">
                                                                {faq.answer}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Still need help */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-3xl mx-auto mt-12"
                >
                    <div className="card p-8 text-center bg-primary-500/5 border-primary-500/20">
                        <h3 className="text-xl font-semibold text-white mb-2">Still have questions?</h3>
                        <p className="text-gray-400 mb-4">
                            Can't find the answer you're looking for? Our support team is here to help.
                        </p>
                        <a href="/contact" className="btn-primary">
                            Contact Support
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
