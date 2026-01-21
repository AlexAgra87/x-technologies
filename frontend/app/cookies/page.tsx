'use client'

import { motion } from 'framer-motion'
import { Cookie } from 'lucide-react'

export default function CookiesPage() {
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
                        <Cookie className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Cookie <span className="text-gradient">Policy</span>
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
                            <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
                            <p className="text-gray-400">
                                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
                            <p className="text-gray-400 mb-4">We use cookies for the following purposes:</p>
                            <div className="space-y-4">
                                <div className="p-4 bg-dark-700 rounded-lg">
                                    <h3 className="font-semibold text-white mb-2">Essential Cookies</h3>
                                    <p className="text-gray-400 text-sm">
                                        Required for the website to function properly. These include cookies that enable you to log in, add items to your cart, and complete purchases.
                                    </p>
                                </div>
                                <div className="p-4 bg-dark-700 rounded-lg">
                                    <h3 className="font-semibold text-white mb-2">Analytics Cookies</h3>
                                    <p className="text-gray-400 text-sm">
                                        Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                                    </p>
                                </div>
                                <div className="p-4 bg-dark-700 rounded-lg">
                                    <h3 className="font-semibold text-white mb-2">Functional Cookies</h3>
                                    <p className="text-gray-400 text-sm">
                                        Remember your preferences and settings, such as language or region, to provide a more personalized experience.
                                    </p>
                                </div>
                                <div className="p-4 bg-dark-700 rounded-lg">
                                    <h3 className="font-semibold text-white mb-2">Marketing Cookies</h3>
                                    <p className="text-gray-400 text-sm">
                                        Used to track visitors across websites to display relevant advertisements.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Managing Cookies</h2>
                            <p className="text-gray-400 mb-4">
                                You can control and manage cookies in various ways. Please note that removing or blocking cookies may impact your user experience and some functionality may no longer be available.
                            </p>
                            <p className="text-gray-400">
                                Most browsers allow you to refuse or accept cookies through their settings. You can also delete cookies that have already been set. The methods vary from browser to browser, so please consult your browser's help documentation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
                            <p className="text-gray-400">
                                We may use third-party services that set their own cookies, such as analytics providers and payment processors. We have no control over these cookies. Please refer to the privacy policies of these third parties for more information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                            <p className="text-gray-400">
                                If you have questions about our use of cookies, please contact us at{' '}
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
