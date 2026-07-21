'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

  const handleClick = async () => {
    if (!user) {
      router.push('/signup')
      return
    }

    try {
      setIsLoading(true)

      const res = await fetch('/api/nmi/hosted-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Unable to start checkout')
      }

      window.location.href = data.checkoutUrl
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Checkout failed'
      console.error('NMI checkout error:', error)
      onError?.(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const isButtonDisabled = isLoading || disabled

  return (
    <button
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`py-3 md:py-4 bg-primary text-white rounded-full text-base md:text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? 'Redirecting...' : disabled && !isLoading ? 'Already Premium' : children}
    </button>
  )
}
