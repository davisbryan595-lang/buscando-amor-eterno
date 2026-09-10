'use client'

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
  const unavailable = async () => {
    throw new Error('Subscriptions are temporarily unavailable because all features are free.')
  }

  return {
    subscription: null,
    loading: false,
    error: null,
    isPremium: true,
    fetchSubscription: async () => undefined,
    upgradeToPremium: unavailable,
    cancelSubscription: unavailable,
  }
}
