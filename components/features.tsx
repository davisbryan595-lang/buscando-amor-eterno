'use client'

import React, { useMemo, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Heart, MessageCircle, Video, Users, Lock, Zap } from 'lucide-react'
import { useLanguage } from '@/lib/i18n-context'

gsap.registerPlugin(ScrollTrigger)

export default function Features() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 md:py-20 px-4 bg-white">
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center mb-3 md:mb-4 text-slate-900">
          {t('features.sectionTitle')}
        </h2>
        <p className="text-center text-slate-600 mb-10 md:mb-12 text-base md:text-lg">
          {t('features.sectionDescription')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el
                }}
                className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 hover:soft-glow transition"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{t(feature.titleKey)}</h3>
                <p className="text-sm md:text-base text-slate-600">{t(feature.descKey)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
