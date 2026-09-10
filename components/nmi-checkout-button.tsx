'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

interface NmiCheckoutButtonProps {
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function NmiCheckoutButton({ className = '' }: NmiCheckoutButtonProps) {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push(user ? '/browse' : '/signup')}
      className={`w-full rounded-full bg-primary py-3 text-base font-semibold text-white transition hover:bg-rose-700 md:py-4 md:text-lg ${className}`}
    >
      {user ? 'Free Access Enabled' : 'Join Free'}
    </button>
  )
}
