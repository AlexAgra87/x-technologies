'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle } from 'lucide-react'

export default function POPIAPage() {
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
                        <Shield className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            POPIA <span className="text-gradient">Compliance</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Our commitment to protecting your personal information under the Protection of Personal Information Act
                        </p>
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
                            <h2 className="text-2xl font-bold text-white mb-4">What is POPIA?</h2>
                            <p className="text-gray-400">
                                The Protection of Personal Information Act (POPIA) is South Africa's data protection law that governs how organizations collect, process, store, and share personal information. X-Tech is fully committed to complying with POPIA requirements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Your Rights Under POPIA</h2>
                            <p className="text-gray-400 mb-4">As a data subject, you have the right to:</p>
                            <div className="space-y-3">
                                {[
                                    'Be notified when your personal information is collected',
                                    'Know what personal information we hold about you',
                                    'Request access to your personal information',
                                    'Request correction of inaccurate information',
                                    'Request deletion of your personal information',
                                    'Object to the processing of your personal information',
                                    'Lodge a complaint with the Information Regulator',
                                ].map((right, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-400">{right}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">How We Protect Your Information</h2>
                            <p className="text-gray-400 mb-4">We implement the following measures to protect your personal information:</p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2">
                                <li>Secure encryption for all data transmissions (SSL/TLS)</li>
                                <li>Regular security audits and assessments</li>
                                <li>Access controls limiting who can view your information</li>
                                <li>Employee training on data protection</li>
                                <li>Secure storage of physical and electronic records</li>
                                <li>Data breach response procedures</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Information Officer</h2>
                            <p className="text-gray-400">
                                We have appointed an Information Officer responsible for ensuring compliance with POPIA. For any POPIA-related inquiries or to exercise your rights, please contact:
                            </p>
                            <div className="mt-4 p-4 bg-dark-700 rounded-lg">
                                <p className="text-white font-medium">Information Officer</p>
                                <p className="text-gray-400">Email: popia@x-tech.co.za</p>
                                <p className="text-gray-400">Phone: +27 12 345 6789</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Complaints</h2>
                            <p className="text-gray-400">
                                If you believe that we have not addressed your concerns adequately, you have the right to lodge a complaint with the Information Regulator:
                            </p>
                            <div className="mt-4 p-4 bg-dark-700 rounded-lg">
                                <p className="text-white font-medium">Information Regulator (South Africa)</p>
                                <p className="text-gray-400">Email: inforeg@justice.gov.za</p>
                                <p className="text-gray-400">Website: www.justice.gov.za/inforeg</p>
                            </div>
                        </section>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
