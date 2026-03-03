'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

interface StripeCheckoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export function StripeCheckoutButton({
  className = '',
  children = 'Start Your Premium Membership',
}: StripeCheckoutButtonProps) {
  const { user } = useAuth()
  const router = useRouter()

  const handleCheckout = () => {
    if (!user) {
      // Redirect to signup if not logged in
      router.push('/signup')
      return
    }

    // Redirect to pricing page where they can learn more and proceed to checkout
    router.push('/pricing')
  }

  return (
    <button
      onClick={handleCheckout}
      className={`py-3 md:py-4 bg-primary text-white rounded-full text-base md:text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow ${className}`}
    >
      {children}
    </button>
  )
}
