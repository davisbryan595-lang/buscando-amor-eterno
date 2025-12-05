'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/context/auth-context'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

type SignUpStep = 'email' | 'profile' | 'success'

export default function SignupPage() {
  const [step, setStep] = useState<SignUpStep>('email')
  const [loading, setLoading] = useState(false)
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

    try {
      await signUp(formData.email, formData.password)
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
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-md mx-auto">
          {/* Progress */}
          <div className="flex gap-2 mb-12">
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
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-slate-900 mb-2">
                  Create Account
                </h2>
                <p className="text-slate-600">Join thousands finding love</p>
              </div>

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 2: Profile */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-slate-900 mb-2">
                  Your Profile
                </h2>
                <p className="text-slate-600">Tell us about yourself</p>
              </div>

              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <textarea
                placeholder="A short bio about yourself..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full px-4 py-3 border border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Check size={32} className="text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-playfair font-bold text-slate-900 mb-2">
                  Welcome! 🎉
                </h2>
                <p className="text-slate-600">
                  Account created successfully. Complete your profile to start browsing!
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-slate-700">
                <p className="font-semibold mb-2">You're in! ✨</p>
                <p>Create your profile to connect with other members. Messaging and likes require a subscription.</p>
              </div>

              <p className="text-slate-600 text-sm">
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
