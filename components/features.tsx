'use client'

import React, { useMemo } from 'react'
import { Heart, MessageCircle, Video, Users, Lock, Zap } from 'lucide-react'
import { useLanguage } from '@/lib/i18n-context'

export default function Features() {
  const { t } = useLanguage()

  const features = useMemo(() => [
    {
      icon: Heart,
      titleKey: 'features.smartMatching',
      descKey: 'features.smartMatchingDesc',
    },
    {
      icon: MessageCircle,
      titleKey: 'features.realConversations',
      descKey: 'features.realConversationsDesc',
    },
    {
      icon: Video,
      titleKey: 'features.videoDates',
      descKey: 'features.videoDatesDesc',
    },
    {
      icon: Users,
      titleKey: 'features.globalCommunity',
      descKey: 'features.globalCommunityDesc',
    },
    {
      icon: Lock,
      titleKey: 'features.verifiedProfiles',
      descKey: 'features.verifiedProfilesDesc',
    },
    {
      icon: Zap,
      titleKey: 'features.instantNotifications',
      descKey: 'features.instantNotificationsDesc',
    },
  ], [])

  return (
    <section className="py-16 md:py-20 px-4 bg-background">
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center mb-3 md:mb-4 text-foreground">
          {t('features.sectionTitle')}
        </h2>
        <p className="text-center text-muted-foreground mb-10 md:mb-12 text-base md:text-lg">
          {t('features.sectionDescription')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 dark:from-rose-700 dark:to-rose-900 border border-rose-400 dark:border-rose-600/40 hover:soft-glow transition"
              >
                <div className="w-12 h-12 bg-white dark:bg-white/90 rounded-full flex items-center justify-center mb-4 text-rose-600 dark:text-rose-700 shadow-md">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white dark:text-white mb-2">{t(feature.titleKey)}</h3>
                <p className="text-sm md:text-base text-white/95 dark:text-white/90">{t(feature.descKey)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
