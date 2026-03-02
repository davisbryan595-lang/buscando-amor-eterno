'use client'

import { useState, useCallback } from 'react'
import { useSubscription } from './useSubscription'

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
      if (loading) {
        return { hasAccess: false, loading: true }
      }

      if (isPremium) {
        return { hasAccess: true, loading: false }
      }

      // Free user - show paywall
      setPaywallState({
        isPaywallOpen: true,
        featureName,
        description:
          description ||
          `Upgrade to premium to access ${featureName}.`,
      })

      return { hasAccess: false, loading: false }
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
