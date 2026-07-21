'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface NmiCheckoutButtonProps {
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function NmiCheckoutButton({
  className = '',
  children = 'Start Your Premium Membership',
  disabled = false,
  onSuccess,
  onError,
}: NmiCheckoutButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiration: '',
    cvv: '',
    zipcode: '',
  })

  if (!user) {
    return (
      <button
        onClick={() => router.push('/signup')}
        className={`py-3 md:py-4 bg-primary text-white rounded-full text-base md:text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow disabled:opacity-50 disabled:cursor-not-allowed w-full ${className}`}
      >
        {children}
      </button>
    )
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.cardNumber || !formData.expiration || !formData.cvv || !formData.zipcode) {
      toast.error('Please fill in all payment fields')
      return
    }

    try {
      setIsLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/nmi/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiration: formData.expiration,
          cvv: formData.cvv,
          zipcode: formData.zipcode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Payment processing failed')
      }

      toast.success('Payment successful!')
      onSuccess?.()
      setShowForm(false)
      setFormData({ cardNumber: '', expiration: '', cvv: '', zipcode: '' })
      router.push('/pricing?payment=success')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Payment failed'
      console.error('Payment error:', error)
      toast.error(msg)
      onError?.(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }

  const formatExpiration = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  return (
    <>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          disabled={disabled}
          className={`py-3 md:py-4 bg-primary text-white rounded-full text-base md:text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow disabled:opacity-50 disabled:cursor-not-allowed w-full ${className}`}
        >
          {disabled ? 'Already Premium' : children}
        </button>
      ) : (
        <form onSubmit={handlePayment} className="space-y-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-900">Payment Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
            <input
              type="text"
              placeholder="4111 1111 1111 1111"
              value={formData.cardNumber}
              onChange={(e) =>
                setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })
              }
              maxLength={19}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration (MM/YY)
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={formData.expiration}
                onChange={(e) =>
                  setFormData({ ...formData, expiration: formatExpiration(e.target.value) })
                }
                maxLength={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
              <input
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value.slice(0, 4) })}
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zipcode</label>
              <input
                type="text"
                placeholder="12345"
                value={formData.zipcode}
                onChange={(e) => setFormData({ ...formData, zipcode: e.target.value.slice(0, 10) })}
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Your payment information is securely processed by Network Merchants.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Complete Payment'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={isLoading}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </>
  )
}
