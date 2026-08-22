'use client'

import { useState, useCallback } from 'react'

interface FeatureAccessState {
  isPaywallOpen: boolean
  featureName: string
  description: string
}

export function useFeatureAccess() {
  const [paywallState, setPaywallState] = useState<FeatureAccessState>({
    isPaywallOpen: false,
    featureName: '',
    description: '',
  })

  const checkAccess = useCallback(
    (featureName: string, description?: string) => {
      return { hasAccess: true, loading: false }
    },
    []
  )

  const closePaywall = useCallback(() => {
    setPaywallState((prev) => ({
      ...prev,
      isPaywallOpen: false,
    }))
  }, [])

  return {
    isPremium: true,
    loading: false,
    checkAccess,
    closePaywall,
    paywallState,
  }
}
