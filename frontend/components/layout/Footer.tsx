import Link from 'next/link'
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Truck,
    Shield,
    Clock
} from 'lucide-react'
import { siteSettings, getPhoneLink } from '@/lib/site-settings'

const footerLinks = {
    shop: [
        { name: 'All Products', href: '/products' },
        { name: 'Graphics Cards', href: '/products?category=Graphics%20cards' },
        { name: 'Processors', href: '/products?category=CPU' },
        { name: 'Memory', href: '/products?category=Memory' },
        { name: 'Storage', href: '/products?category=Solid%20state%20drives' },
        { name: 'Deals', href: '/deals' },
    ],
    support: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Track Order', href: '/track-order' },
        { name: 'Shipping Info', href: '/shipping' },
        { name: 'Returns', href: '/returns' },
        { name: 'Warranty', href: '/warranty' },
    ],
    company: [
        { name: 'About Us', href: '/about' },
        { name: 'Blog', href: '/blog' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'POPIA Compliance', href: '/popia' },
    ],
}

const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: siteSettings.social.facebook },
    { name: 'Instagram', icon: Instagram, href: siteSettings.social.instagram },
]

const features = [
    { icon: Truck, title: 'Free Shipping', description: `On orders over R${siteSettings.shipping.freeShippingThreshold}` },
    { icon: Shield, title: 'Secure Payments', description: 'SSL encrypted checkout' },
    { icon: Clock, title: 'Fast Support', description: '24/7 customer service' },
    { icon: CreditCard, title: 'Easy Returns', description: '30-day return policy' },
]

export function Footer() {
    return (
        <footer className="bg-dark-600 border-t border-white/5">
            {/* Features Bar */}
            <div className="border-b border-white/5">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {features.map((feature) => (
                            <div key={feature.title} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                                    <feature.icon className="w-6 h-6 text-primary-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{feature.title}</h4>
                                    <p className="text-sm text-text-muted">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent rounded-lg rotate-45" />
                                <span className="relative font-display font-bold text-xl text-white">X</span>
                            </div>
                            <span className="font-display font-bold text-xl text-gradient">X-Tech</span>
                        </Link>
                        <p className="text-text-secondary mb-6 max-w-xs">
                            Your trusted source for premium computer components. Building dreams, one part at a time.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <a href={`mailto:${siteSettings.contact.email}`} className="flex items-center gap-3 text-text-secondary hover:text-white transition-colors">
                                <Mail className="w-5 h-5 text-primary-400" />
                                {siteSettings.contact.email}
                            </a>
                            <a href={getPhoneLink()} className="flex items-center gap-3 text-text-secondary hover:text-white transition-colors">
                                <Phone className="w-5 h-5 text-primary-400" />
                                {siteSettings.contact.phone}
                            </a>
                            <div className="flex items-start gap-3 text-text-secondary">
                                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                <span>{siteSettings.contact.address}</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-2 mt-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:bg-primary-500/20 transition-all"
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-display font-semibold text-white mb-4">Shop</h4>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-text-secondary hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-text-secondary hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-text-secondary hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-text-secondary hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-text-muted text-sm">
                            © {new Date().getFullYear()} X-Tech. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
