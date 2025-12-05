import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

export interface SubscriptionData {
  id: string
  user_id: string
  plan: 'free' | 'premium'
  status: 'active' | 'cancelled' | 'expired'
  started_at: string
  expires_at: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setSubscription(null)
      setIsPremium(false)
      return
    }

    fetchSubscription()
  }, [user])

  const fetchSubscription = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (err && err.code !== 'PGRST116') {
        throw err
      }

      if (data) {
        setSubscription(data as SubscriptionData)
        setIsPremium(data.plan === 'premium' && data.status === 'active')
      } else {
        setSubscription(null)
        setIsPremium(false)
      }
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching subscription:', err)
      setSubscription(null)
      setIsPremium(false)
    } finally {
      setLoading(false)
    }
  }

  const upgradeToPremium = useCallback(
    async (stripeSubscriptionId: string, expiresAt?: string) => {
      if (!user) throw new Error('No user logged in')

      try {
        const { data, error: err } = await supabase
          .from('subscriptions')
          .update({
            plan: 'premium',
            status: 'active',
            stripe_subscription_id: stripeSubscriptionId,
            expires_at: expiresAt || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single()

        if (err) throw err
        setSubscription(data as SubscriptionData)
        setIsPremium(true)
        return data as SubscriptionData
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user]
  )

  const cancelSubscription = useCallback(
    async () => {
      if (!user) throw new Error('No user logged in')

      try {
        const { data, error: err } = await supabase
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single()

        if (err) throw err
        setSubscription(data as SubscriptionData)
        setIsPremium(false)
        return data as SubscriptionData
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user]
  )

  return {
    subscription,
    loading,
    error,
    isPremium,
    fetchSubscription,
    upgradeToPremium,
    cancelSubscription,
  }
}
