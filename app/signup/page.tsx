'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/context/auth-context'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'

type SignUpStep = 'email' | 'profile' | 'success'

export default function SignupPage() {
  const [step, setStep] = useState<SignUpStep>('email')
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    bio: '',
  })
  const { signUp } = useAuth()
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create a timeout promise (10 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Signup request timed out - please check your internet connection and try again')), 10000)
      )

      console.log('[SignupPage] Starting signup...')
      const signUpPromise = signUp(formData.email, formData.password)

      await Promise.race([signUpPromise, timeoutPromise])
      console.log('[SignupPage] Signup successful')

      // Track signup event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'sign_up', {
          method: 'email'
        })
      }
      toast.success('Account created! Setting up your profile...')
      setStep('profile')
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create account'
      console.error('Signup error:', error)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Profile information is saved, proceed to success
      setStep('success')
      // Track profile completion event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'profile_setup_started')
      }
      toast.success('Profile setup in progress...')
      // Redirect to onboarding after a short delay
      setTimeout(() => {
        router.push('/onboarding')
      }, 2000)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save profile'
      console.error('Profile save error:', error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-20 md:pt-24 pb-16 md:pb-20 px-4">
        <div className="w-full max-w-md mx-auto">
          {/* Progress */}
          <div className="flex gap-2 mb-8 md:mb-12">
            {(['email', 'profile', 'success'] as const).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition ${
                  (['email', 'profile', 'success'] as const).indexOf(
                    step
                  ) >= i
                    ? 'bg-primary'
                    : 'bg-rose-100'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground mb-2">
                  Create Account
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">Join thousands finding love</p>
              </div>

              {error && (
                <div className="p-3 md:p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 rounded-lg">
                  <p className="text-rose-800 dark:text-rose-300 text-xs md:text-sm">{error}</p>
                </div>
              )}

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 text-sm md:text-base border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 text-sm md:text-base border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm md:text-base bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 2: Profile */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground mb-2">
                  Your Profile
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">Tell us about yourself</p>
              </div>

              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 text-sm md:text-base border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <textarea
                placeholder="A short bio about yourself..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full px-4 py-3 text-sm md:text-base border border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm md:text-base bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="space-y-4 md:space-y-6 text-center">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Check size={isMobile ? 24 : 32} className="text-white" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground mb-2">
                  Welcome! 🎉
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Account created successfully. Complete your profile to start browsing!
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-3 md:p-4 text-xs md:text-sm text-foreground">
                <p className="font-semibold mb-2">You're in! ✨</p>
                <p>Create your profile to connect with other members. Messaging and likes require a subscription.</p>
              </div>

              <p className="text-muted-foreground text-xs md:text-sm">
                Redirecting to profile setup...
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
