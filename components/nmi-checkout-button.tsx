'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface NmiCheckoutButtonProps {
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  onSuccess?: () => void
  onError?: (message: string) => void
}

declare global {
  interface Window {
    CollectJS?: {
      configure: (opts: Record<string, any>) => void
      addHandler: (event: string, handler: () => void) => void
    }
  }
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
  const [scriptReady, setScriptReady] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const configuredRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  const tokenizationKey = process.env.NEXT_PUBLIC_NMI_TOKENIZATION_KEY

  useEffect(() => {
    if (!tokenizationKey || scriptRef.current) {
      if (!tokenizationKey) {
        console.error('NMI tokenization key is not configured')
      }
      return
    }

    const script = document.createElement('script')
    script.src = 'https://secure.networkmerchants.com/token/Collect.js'
    script.setAttribute('data-tokenization-key', tokenizationKey)
    script.async = true

    script.onload = () => {
      console.log('NMI CollectJS loaded')
      setScriptReady(true)
    }

    script.onerror = () => {
      console.error('Failed to load NMI CollectJS')
      onError?.('Payment system unavailable. Please try again later.')
    }

    document.head.appendChild(script)
    scriptRef.current = script

    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current)
        scriptRef.current = null
      }
    }
  }, [tokenizationKey])

  useEffect(() => {
    if (!scriptReady || configuredRef.current || !window.CollectJS) return

    try {
      window.CollectJS.configure({
        fields: {
          ccnumber: {
            selector: '#nmi-card-number',
            placeholder: '4111 1111 1111 1111',
          },
          cvv: {
            selector: '#nmi-cvv',
            placeholder: '123',
          },
          exp: {
            selector: '#nmi-exp',
            placeholder: 'MM/YY',
          },
        },
        callback: handlePaymentToken,
      })

      // Add submit handler
      window.CollectJS.addHandler('success', handleTokenSuccess)
      window.CollectJS.addHandler('error', handleTokenError)

      configuredRef.current = true
      console.log('NMI CollectJS configured')
    } catch (error) {
      console.error('Failed to configure NMI:', error)
      onError?.('Failed to initialize payment system')
    }
  }, [scriptReady])

  const handleTokenSuccess = async (token: string) => {
    if (!user) {
      router.push('/signup')
      return
    }

    try {
      setIsLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/nmi/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ paymentToken: token }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Payment processing failed')
      }

      onSuccess?.()
      router.push('/pricing?payment=success')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Payment failed'
      console.error('Payment error:', error)
      onError?.(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokenError = (error: string) => {
    console.error('Token error:', error)
    onError?.(error || 'Payment failed. Please try again.')
    setIsLoading(false)
  }

  const handlePaymentToken = (token: string) => {
    console.log('Token received:', token)
    handleTokenSuccess(token)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/signup')
      return
    }

    setIsLoading(true)
    // Let CollectJS handle the form submission
    formRef.current?.submit()
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} id="nmi-payment-form">
        {scriptReady && (
          <div className="space-y-4 p-6 border border-gray-200 rounded-lg bg-gray-50 mb-6">
            <h3 className="font-semibold text-gray-900">Payment Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div
                id="nmi-card-number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration
                </label>
                <div
                  id="nmi-exp"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                <div
                  id="nmi-cvv"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Your payment information is securely processed by Network Merchants.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || disabled || !scriptReady}
          className={`py-3 md:py-4 bg-primary text-white rounded-full text-base md:text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow disabled:opacity-50 disabled:cursor-not-allowed w-full ${className}`}
        >
          {isLoading
            ? 'Processing...'
            : disabled
              ? 'Already Premium'
              : !scriptReady
                ? 'Loading...'
                : children}
        </button>
      </form>
    </>
  )
}
