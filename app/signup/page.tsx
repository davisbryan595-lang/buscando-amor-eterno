'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Check } from 'lucide-react'

type SignUpStep = 'email' | 'profile' | 'payment' | 'success'

export default function SignupPage() {
  const [step, setStep] = useState<SignUpStep>('email')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    bio: '',
  })

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('profile')
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('payment')
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('success')
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-md mx-auto">
          {/* Progress */}
          <div className="flex gap-2 mb-12">
            {(['email', 'profile', 'payment', 'success'] as const).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition ${
                  (['email', 'profile', 'payment', 'success'] as const).indexOf(
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
                className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition"
              >
                Continue
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
                className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition"
              >
                Continue
              </button>
            </form>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-slate-900 mb-2">
                  Choose Plan
                </h2>
                <p className="text-slate-600">$12/month, cancel anytime</p>
              </div>

              <div className="bg-gradient-to-br from-white to-rose-50 border-2 border-primary rounded-2xl p-6">
                <p className="text-5xl font-playfair font-bold text-primary mb-2">
                  $12<span className="text-lg text-slate-600">/mo</span>
                </p>
                <ul className="space-y-2 text-slate-700 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary" /> Unlimited messages
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary" /> Video calls
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary" /> See who liked you
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition"
              >
                Proceed to Payment
              </button>

              <p className="text-center text-xs text-slate-600">
                We use Stripe for secure payments
              </p>
            </form>
          )}

          {/* Step 4: Success */}
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
                  Your premium membership is active. Start exploring profiles now!
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-slate-700">
                <p className="font-semibold mb-2">Confetti celebration! ✨</p>
                <p>Welcome to the Buscando Amor Eterno family. True love awaits.</p>
              </div>

              <Link
                href="/browse"
                className="block py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition"
              >
                Browse Profiles
              </Link>

              <Link
                href="/"
                className="block py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-rose-50 transition"
              >
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
