'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

export default function PrivacyPage() {
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
                        <Lock className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Privacy <span className="text-gradient">Policy</span>
                        </h1>
                        <p className="text-gray-400">Last updated: January 2024</p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card p-8 space-y-8"
                    >
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                            <p className="text-gray-400">
                                X-Tech ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                            <p className="text-gray-400 mb-4">We collect information that you provide directly to us, including:</p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2">
                                <li>Name, email address, and contact information</li>
                                <li>Billing and shipping addresses</li>
                                <li>Payment information (processed securely through our payment providers)</li>
                                <li>Order history and preferences</li>
                                <li>Communications with our support team</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                            <p className="text-gray-400 mb-4">We use the information we collect to:</p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2">
                                <li>Process and fulfill your orders</li>
                                <li>Send order confirmations and shipping updates</li>
                                <li>Respond to your inquiries and provide customer support</li>
                                <li>Send promotional communications (with your consent)</li>
                                <li>Improve our website and services</li>
                                <li>Detect and prevent fraud</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing</h2>
                            <p className="text-gray-400">
                                We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, processing payments, and delivering orders. These parties are bound by confidentiality agreements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
                            <p className="text-gray-400">
                                We implement appropriate security measures to protect your personal information. All payment transactions are encrypted using SSL technology. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                            <p className="text-gray-400 mb-4">You have the right to:</p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2">
                                <li>Access the personal information we hold about you</li>
                                <li>Request correction of inaccurate information</li>
                                <li>Request deletion of your personal information</li>
                                <li>Opt-out of marketing communications</li>
                                <li>Lodge a complaint with the Information Regulator</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
                            <p className="text-gray-400">
                                If you have questions about this Privacy Policy, please contact us at{' '}
                                <a href="mailto:privacy@x-tech.co.za" className="text-primary-400 hover:underline">
                                    privacy@x-tech.co.za
                                </a>
                            </p>
                        </section>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
