'use client'

import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-dark-900 pt-24">
            {/* Hero */}
            <div className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-gray-800">
                <div className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <FileText className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Terms of <span className="text-gradient">Service</span>
                        </h1>
                        <p className="text-gray-400">Last updated: January 2024</p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card p-8 space-y-8"
                    >
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-400">
                                By accessing and using the X-Tech website, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Products and Pricing</h2>
                            <p className="text-gray-400 mb-4">
                                All prices are displayed in South African Rand (ZAR) and include VAT unless otherwise stated. We reserve the right to modify prices at any time without prior notice. Prices are subject to change until an order is confirmed.
                            </p>
                            <p className="text-gray-400">
                                Product availability is subject to stock levels. We make every effort to display accurate product information, but we do not guarantee that descriptions or images are error-free.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Orders and Payment</h2>
                            <p className="text-gray-400 mb-4">
                                By placing an order, you warrant that you are legally capable of entering into binding contracts. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing, or suspected fraud.
                            </p>
                            <p className="text-gray-400">
                                Payment must be received in full before orders are processed. We accept various payment methods as displayed at checkout.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Shipping and Delivery</h2>
                            <p className="text-gray-400">
                                Delivery times are estimates only and are not guaranteed. We are not responsible for delays caused by shipping carriers or circumstances beyond our control. Risk of loss passes to you upon delivery of the products.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Returns and Refunds</h2>
                            <p className="text-gray-400">
                                Our return policy is outlined on our Returns page. Products must be returned in their original condition and packaging. Certain items are non-returnable as specified in our return policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Warranty</h2>
                            <p className="text-gray-400">
                                Products are covered by manufacturer warranties. Warranty claims must be made in accordance with the manufacturer's warranty terms. We facilitate warranty claims but are not responsible for manufacturer decisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                            <p className="text-gray-400">
                                To the maximum extent permitted by law, X-Tech shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our website or products.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property</h2>
                            <p className="text-gray-400">
                                All content on this website, including text, graphics, logos, images, and software, is the property of X-Tech or its content suppliers and is protected by South African and international intellectual property laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">9. Governing Law</h2>
                            <p className="text-gray-400">
                                These Terms of Service are governed by and construed in accordance with the laws of the Republic of South Africa.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">10. Contact</h2>
                            <p className="text-gray-400">
                                For questions about these Terms, please contact us at{' '}
                                <a href="mailto:legal@x-tech.co.za" className="text-primary-400 hover:underline">
                                    legal@x-tech.co.za
                                </a>
                            </p>
                        </section>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
