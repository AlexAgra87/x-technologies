'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                {/* Error Icon */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8"
                >
                    <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-12 h-12 text-red-400" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="text-3xl font-bold text-white mb-3">
                        Something Went Wrong
                    </h1>
                    <p className="text-gray-400 mb-8">
                        We apologize for the inconvenience. An unexpected error has occurred.
                        Please try again or contact support if the problem persists.
                    </p>

                    {/* Error Details (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mb-8 p-4 bg-dark-800 border border-red-500/20 rounded-lg text-left">
                            <p className="text-red-400 text-sm font-mono break-all">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-gray-500 text-xs mt-2">
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                        <button
                            onClick={() => reset()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-black font-medium rounded-lg hover:bg-teal-400 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                        <a
                            href="/"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-dark-800 border border-gray-700 text-white font-medium rounded-lg hover:bg-dark-700 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            Go Home
                        </a>
                    </div>

                    {/* Go Back */}
                    <button
                        onClick={() => window.history.back()}
                        className="text-gray-500 hover:text-white flex items-center gap-2 mx-auto text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back to previous page
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
