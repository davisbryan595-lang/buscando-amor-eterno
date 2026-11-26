'use client'

import { useAuth } from '@/context/auth-context'

export interface SubscriptionData {
  id: string
  user_id: string
  plan: 'free' | 'premium'
  status: 'active' | 'cancelled' | 'expired'
  started_at: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

export function useSubscription() {
  const { user, loading } = useAuth()
  const unavailable = async () => {
    throw new Error('Online premium checkout is not available yet. Contact support to request premium access.')
  }

  return {
    subscription: null,
    loading,
    error: null,
    isPremium: user?.app_metadata?.is_premium === true,
    fetchSubscription: async () => undefined,
    upgradeToPremium: unavailable,
    cancelSubscription: unavailable,
  }
}
