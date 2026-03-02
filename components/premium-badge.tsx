'use client'

import { Lock, Crown } from 'lucide-react'

interface PremiumBadgeProps {
  variant?: 'inline' | 'badge' | 'label'
}

export function PremiumBadge({ variant = 'inline' }: PremiumBadgeProps) {
  if (variant === 'badge') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-semibold rounded-full">
        <Crown size={12} />
        Premium
      </span>
    )
  }

  if (variant === 'label') {
    return (
      <div className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
        <Lock size={10} />
        Premium Only
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
      <Lock size={12} />
      Premium
    </span>
  )
}
