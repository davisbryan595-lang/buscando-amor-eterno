'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { MutualPreference } from '@/hooks/useUserProfile'

interface MutualPreferencesBadgesProps {
  mutualPreferences: MutualPreference[]
  showLabel?: boolean
  maxBadges?: number
}

export function MutualPreferencesBadges({
  mutualPreferences,
  showLabel = true,
  maxBadges = 5,
}: MutualPreferencesBadgesProps) {
  if (mutualPreferences.length === 0) {
    return null
  }

  const displayedPreferences = mutualPreferences.slice(0, maxBadges)
  const hiddenCount = mutualPreferences.length - maxBadges

  return (
    <div className="space-y-3">
      {showLabel && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Why you matched 💕
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Shared values and preferences
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {displayedPreferences.map((pref) => (
          <Badge
            key={pref.key}
            variant="secondary"
            className="bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs md:text-sm"
          >
            {pref.label}
          </Badge>
        ))}
        {hiddenCount > 0 && (
          <Badge
            variant="outline"
            className="border-rose-200 text-rose-600 text-xs md:text-sm"
          >
            +{hiddenCount} more
          </Badge>
        )}
      </div>
    </div>
  )
}
