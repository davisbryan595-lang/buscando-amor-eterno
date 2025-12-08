'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/i18n-context'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section
      className="pt-32 pb-16 px-4 relative overflow-hidden min-h-[90vh] flex items-center"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(245, 165, 180, 0.65), rgba(255, 255, 255, 0.5), rgba(245, 165, 180, 0.75)), url(/romantic-couple-sunset-beach-luxury.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 -z-10">

        {/* Rose logo watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
          <svg className="h-80 w-80 text-rose-500" viewBox="0 0 200 280" fill="currentColor">
            {/* Petals */}
            <ellipse cx="100" cy="60" rx="25" ry="35" fill="currentColor" opacity="0.9"/>
            <ellipse cx="65" cy="75" rx="20" ry="38" transform="rotate(-45 65 75)" fill="currentColor" opacity="0.85"/>
            <ellipse cx="135" cy="75" rx="20" ry="38" transform="rotate(45 135 75)" fill="currentColor" opacity="0.85"/>
            <ellipse cx="50" cy="110" rx="22" ry="35" transform="rotate(-70 50 110)" fill="currentColor" opacity="0.75"/>
            <ellipse cx="150" cy="110" rx="22" ry="35" transform="rotate(70 150 110)" fill="currentColor" opacity="0.75"/>
            <ellipse cx="40" cy="155" rx="20" ry="32" transform="rotate(-90 40 155)" fill="currentColor" opacity="0.7"/>
            <ellipse cx="160" cy="155" rx="20" ry="32" transform="rotate(90 160 155)" fill="currentColor" opacity="0.7"/>
            <circle cx="100" cy="100" r="40" fill="currentColor" opacity="0.8"/>
            <circle cx="100" cy="90" r="28" fill="#fda4af" opacity="0.9"/>
            {/* Stem */}
            <path d="M 100 140 Q 95 180 90 220" stroke="currentColor" strokeWidth="3" fill="none"/>
            {/* Leaves */}
            <ellipse cx="75" cy="180" rx="12" ry="25" transform="rotate(-45 75 180)" fill="currentColor" opacity="0.6"/>
            <ellipse cx="125" cy="200" rx="12" ry="25" transform="rotate(45 125 200)" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-20">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold mb-8 text-slate-900 leading-tight tracking-tight">
          <span className="text-primary relative inline-block">
            {t('hero.title').split(' ').slice(0, 2).join(' ')}
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-rose-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span> {t('hero.title').split(' ').slice(2).join(' ')}
        </h1>
        <h2 className="text-2xl md:text-4xl font-playfair font-bold mb-8 text-rose-600">
          {t('hero.subtitle')}
        </h2>

        <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          {t('hero.description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-primary text-white rounded-full text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow"
          >
            {t('common.joinForPrice')}
          </Link>
          <Link
            href="/browse"
            className="px-8 py-4 border-2 border-primary text-primary rounded-full text-lg font-semibold hover:bg-rose-50 transition"
          >
            {t('common.browseProfiles')}
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-primary mb-2">50M+</p>
            <p className="text-slate-600">{t('hero.membersWorldwide')}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary mb-2">1M+</p>
            <p className="text-slate-600">{t('hero.matchesMade')}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary mb-2">100+</p>
            <p className="text-slate-600">{t('hero.countries')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
