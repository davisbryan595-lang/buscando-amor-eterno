'use client'

import React from 'react'
import { Heart, MessageCircle, Video, Users, Lock, Zap } from 'lucide-react'
import { useLanguage } from '@/context/language-context'

interface Feature {
  icon: React.ComponentType<{ size: number }>
  titleKey: keyof typeof import('@/lib/translations/en.json').features
  descKey: keyof typeof import('@/lib/translations/en.json').features
}

const featureKeys: Feature[] = [
  {
    icon: Heart,
    titleKey: 'smart_matching_title',
    descKey: 'smart_matching_desc',
  },
  {
    icon: MessageCircle,
    titleKey: 'real_conversations_title',
    descKey: 'real_conversations_desc',
  },
  {
    icon: Video,
    titleKey: 'video_dates_title',
    descKey: 'video_dates_desc',
  },
  {
    icon: Users,
    titleKey: 'global_community_title',
    descKey: 'global_community_desc',
  },
  {
    icon: Lock,
    titleKey: 'verified_profiles_title',
    descKey: 'verified_profiles_desc',
  },
  {
    icon: Zap,
    titleKey: 'instant_notifications_title',
    descKey: 'instant_notifications_desc',
  },
]

export default function Features() {
  const { t } = useLanguage()

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-center mb-4 text-slate-900">
          {t.features.title}
        </h2>
        <p className="text-center text-slate-600 mb-12 text-lg">
          {t.features.subtitle}
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {featureKeys.map((feature, index) => {
            const Icon = feature.icon
            const title = t.features[feature.titleKey] as string
            const description = t.features[feature.descKey] as string
            return (
              <div
                key={index}
                className="p-8 rounded-xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 hover:soft-glow transition"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600">{description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
