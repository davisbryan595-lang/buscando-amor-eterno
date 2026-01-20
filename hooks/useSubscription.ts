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

    let isMounted = true

    const fetchSubscriptionData = async () => {
      try {
        setLoading(true)
        console.log('[Subscription] Fetching subscription for user:', user.id)

        const { data, error: err } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!isMounted) return

        if (err) {
          console.error('[Subscription] Query error:', err.code, err.message)
          throw err
        }

        if (data) {
          console.log('[Subscription] Subscription found:', data)
          setSubscription(data as SubscriptionData)
          setIsPremium(data.plan === 'premium')
        } else {
          console.log('[Subscription] No subscription found, defaulting to free')
          setSubscription(null)
          setIsPremium(false)
        }
        setError(null)
      } catch (err: any) {
        if (isMounted) {
          const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to fetch subscription')
          console.error('[Subscription] Fatal error:', errorMessage, err)
          setError(errorMessage)
          setSubscription(null)
          setIsPremium(false)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSubscriptionData()

    return () => {
      isMounted = false
    }
  }, [user])

  const fetchSubscription = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (err) {
        throw err
      }

      if (data) {
        setSubscription(data as SubscriptionData)
        setIsPremium(data.plan === 'premium')
      } else {
        setSubscription(null)
        setIsPremium(false)
      }
      setError(null)
    } catch (err: any) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to fetch subscription')
      setError(errorMessage)
      console.error('Error fetching subscription:', errorMessage, err)
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
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to upgrade subscription')
        setError(errorMessage)
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
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to cancel subscription')
        setError(errorMessage)
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
