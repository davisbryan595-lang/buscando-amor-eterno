'use client'

import { useState, useCallback } from 'react'
import { useSubscription } from '@/hooks/useSubscription'

interface FeatureAccessState {
  isPaywallOpen: boolean
  featureName: string
  description: string
}

export function useFeatureAccess() {
  const { isPremium, loading } = useSubscription()
  const [paywallState, setPaywallState] = useState<FeatureAccessState>({
    isPaywallOpen: false,
    featureName: '',
    description: '',
  })

  const checkAccess = useCallback(
    (featureName: string, description?: string) => {
      if (loading) return { hasAccess: false, loading: true }
      if (!isPremium) {
        setPaywallState({
          isPaywallOpen: true,
          featureName,
          description: description || 'Audio and video calls are available with Premium.',
        })
      }
      return { hasAccess: isPremium, loading }
    },
    [isPremium, loading]
  )

  const closePaywall = useCallback(() => {
    setPaywallState((prev) => ({
      ...prev,
      isPaywallOpen: false,
    }))
  }, [])

  return {
    isPremium,
    loading,
    checkAccess,
    closePaywall,
    paywallState,
  }
}
