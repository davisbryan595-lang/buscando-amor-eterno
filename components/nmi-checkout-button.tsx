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
      startTokenization: () => void
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
      console.log('NMI CollectJS script loaded')
      setScriptReady(true)
    }

    script.onerror = () => {
      console.error('Failed to load NMI CollectJS')
      setScriptReady(false)
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
            selector: '#nmi-ccnumber',
            title: 'Card Number',
            placeholder: '4111 1111 1111 1111',
          },
          cvv: {
            selector: '#nmi-cvv',
            title: 'CVV',
            placeholder: '123',
          },
          exp: {
            selector: '#nmi-exp',
            title: 'Expiration',
            placeholder: 'MM/YY',
          },
        },
        callback: handleToken,
      })
      configuredRef.current = true
      console.log('NMI CollectJS configured successfully')
    } catch (error) {
      console.error('Failed to configure NMI CollectJS:', error)
    }
  }, [scriptReady])

  const handleToken = async (response: any) => {
    if (!user) {
      router.push('/signup')
      return
    }

    try {
      setIsLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        throw new Error('Not authenticated. Please log in again.')
      }

      const paymentToken = response.token || response.payment_token
      if (!paymentToken) {
        throw new Error('Failed to tokenize payment method')
      }

      const res = await fetch('/api/nmi/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ paymentToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Payment processing failed')
      }

      onSuccess?.()
      router.push('/pricing?payment=success')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Payment failed'
      console.error('NMI payment error:', error)
      onError?.(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    if (!user) {
      router.push('/signup')
      return
    }

    if (!window.CollectJS) {
      onError?.('Payment system is not ready. Please refresh and try again.')
      return
    }

    try {
      window.CollectJS.startTokenization()
    } catch (error) {
      console.error('Error starting tokenization:', error)
      onError?.(
        error instanceof Error
          ? error.message
          : 'Failed to start payment. Please try again.'
      )
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading || disabled || !scriptReady}
        className={`py-3 md:py-4 bg-primary text-white rounded-full text-base md:text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading
          ? 'Processing...'
          : disabled && !isLoading
            ? 'Already Premium'
            : !scriptReady
              ? 'Loading...'
              : children}
      </button>

      {scriptReady && (
        <div className="mt-6 space-y-4 hidden" id="nmi-payment-form">
          <div>
            <label htmlFor="nmi-ccnumber" className="block text-sm font-medium mb-2">
              Card Number
            </label>
            <div id="nmi-ccnumber" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nmi-exp" className="block text-sm font-medium mb-2">
                Expiration
              </label>
              <div id="nmi-exp" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="nmi-cvv" className="block text-sm font-medium mb-2">
                CVV
              </label>
              <div id="nmi-cvv" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
