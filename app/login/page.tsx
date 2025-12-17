'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create a timeout promise (30 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login request timed out - please try again')), 30000)
      )

      const signInPromise = signIn(email, password)

      await Promise.race([signInPromise, timeoutPromise])

      // Track login event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'login', {
          method: 'email'
        })
      }
      toast.success('Logged in successfully! Redirecting...')
      // Small delay to allow user to see success message
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to log in'
      console.error('Login error:', error)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-20 md:pt-24 pb-16 md:pb-20 px-4">
        <div className="w-full max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-slate-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-sm md:text-base text-slate-600">
                Log in to your account to continue
              </p>
            </div>

            {error && (
              <div className="p-3 md:p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-rose-800 text-xs md:text-sm">{error}</p>
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm md:text-base border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm md:text-base border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm md:text-base bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div className="text-center">
              <p className="text-sm md:text-base text-slate-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  )
}
