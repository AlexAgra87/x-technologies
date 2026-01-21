'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react'
import { siteSettings, getPhoneLink, getEmailLink, getWhatsAppLink } from '@/lib/site-settings'

const contactInfo = [
    {
        icon: Mail,
        title: 'Email',
        value: siteSettings.contact.email,
        link: `mailto:${siteSettings.contact.email}`,
    },
    {
        icon: Phone,
        title: 'Phone',
        value: siteSettings.contact.phone,
        link: getPhoneLink(),
    },
    {
        icon: MapPin,
        title: 'Address',
        value: siteSettings.contact.address,
        link: '#',
    },
    {
        icon: Clock,
        title: 'Business Hours',
        value: `Mon - Fri: ${siteSettings.businessHours.weekdays}`,
        link: '#',
    },
]

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSubmitted(true)
        setIsSubmitting(false)
    }

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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Contact <span className="text-gradient">Us</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Have a question or need assistance? We're here to help.
                            Reach out to our team and we'll get back to you as soon as possible.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
                        {contactInfo.map((info, index) => (
                            <motion.a
                                key={info.title}
                                href={info.link}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                                    <info.icon className="w-6 h-6 text-primary-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{info.title}</p>
                                    <p className="text-white">{info.value}</p>
                                </div>
                            </motion.a>
                        ))}

                        {/* FAQ Link */}
                        <motion.a
                            href="/faq"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="card p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all bg-primary-500/5"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Check our FAQ</p>
                                <p className="text-sm text-gray-400">Find quick answers to common questions</p>
                            </div>
                        </motion.a>
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="card p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                                    <p className="text-gray-400">
                                        Thank you for reaching out. We'll get back to you within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input w-full"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="input w-full"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="input w-full"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="input w-full resize-none"
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary w-full md:w-auto"
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
