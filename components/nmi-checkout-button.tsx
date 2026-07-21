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
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      onError?.(
        error instanceof Error
          ? error.message
          : 'Payment system error. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={`py-3 md:py-4 bg-primary text-white rounded-full text-base md:text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? 'Processing...' : disabled && !isLoading ? 'Already Premium' : children}
    </button>
  )
}
