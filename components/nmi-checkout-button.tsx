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
      configure: (opts: Record<string, unknown>) => void
      startPaymentRequest: () => void
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
  const userRef = useRef(user)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const configured = useRef(false)

  const tokenizationKey = process.env.NEXT_PUBLIC_NMI_TOKENIZATION_KEY

  // Keep userRef in sync so the token callback always sees the latest user
  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    if (!tokenizationKey || scriptRef.current) return

    const script = document.createElement('script')
    script.src = 'https://secure.networkmerchants.com/token/Collect.js'
    script.setAttribute('data-tokenization-key', tokenizationKey)
    script.async = true
    script.onload = () => setScriptReady(true)
    document.head.appendChild(script)
    scriptRef.current = script

    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current)
        scriptRef.current = null
        configured.current = false
      }
    }
  }, [tokenizationKey])

  useEffect(() => {
    if (!scriptReady || configured.current || !window.CollectJS) return

    window.CollectJS.configure({
      variant: 'lightbox',
      callback: handleToken,
    })
    configured.current = true
  }, [scriptReady])

  const handleToken = async (response: { payment_token: string }) => {
    const currentUser = userRef.current
    if (!currentUser) {
      router.push('/signup')
      return
    }

    try {
      setIsLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      const res = await fetch('/api/nmi/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ paymentToken: response.payment_token }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed')
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

    if (window.CollectJS) {
      window.CollectJS.startPaymentRequest()
    }
  }

  const isButtonDisabled = isLoading || disabled || !scriptReady

  return (
    <button
      onClick={handleClick}
      disabled={isButtonDisabled}
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
  )
}
