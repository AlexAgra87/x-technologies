'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function AccountPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Authentication would be implemented here
        alert('Authentication coming soon!')
    }

    return (
        <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center">
            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto"
                >
                    <div className="card p-8">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h1>
                            <p className="text-gray-400 mt-2">
                                {isLogin ? 'Sign in to your X-Tech account' : 'Join X-Tech today'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="input w-full pl-10"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input w-full pl-10"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input w-full pl-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {isLogin && (
                                <div className="text-right">
                                    <a href="#" className="text-sm text-primary-400 hover:text-primary-300">
                                        Forgot password?
                                    </a>
                                </div>
                            )}

                            <button type="submit" className="btn-primary w-full">
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="ml-2 text-primary-400 hover:text-primary-300 font-medium"
                                >
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </button>
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-700">
                            <p className="text-center text-sm text-gray-500">
                                By continuing, you agree to our{' '}
                                <Link href="/terms" className="text-primary-400 hover:underline">Terms of Service</Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
