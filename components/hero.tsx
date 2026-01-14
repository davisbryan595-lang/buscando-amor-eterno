'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import { useLanguage } from '@/lib/i18n-context'

export default function Hero() {
  const { t } = useLanguage()
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const [backgroundAttachment, setBackgroundAttachment] = useState<'fixed' | 'scroll'>('scroll')

  useEffect(() => {
    // Set parallax effect only on non-mobile clients
    const isMobile = /iPhone|iPad|iPod|Android/.test(navigator.userAgent)
    setBackgroundAttachment(isMobile ? 'scroll' : 'fixed')
  }, [])

  useEffect(() => {
    if (!titleRef.current) return

    const tl = gsap.timeline()

    // Hero title animation
    tl.from(titleRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
    }, 0)

    // Subtitle animation
    tl.from(
      subtitleRef.current,
      {
        opacity: 0,
        y: 20,
        duration: 0.8,
      },
      0.2
    )

    // Description animation
    tl.from(
      descriptionRef.current,
      {
        opacity: 0,
        y: 20,
        duration: 0.8,
      },
      0.4
    )

    // Buttons animation
    tl.from(
      buttonsRef.current?.children,
      {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.15,
      },
      0.6
    )

    // Stats animation
    tl.from(
      statsRef.current?.children,
      {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.1,
      },
      0.8
    )

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="pt-24 md:pt-36 pb-12 md:pb-16 px-4 relative overflow-hidden min-h-screen md:min-h-[90vh] flex items-center"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(245, 165, 180, 0.65), rgba(255, 255, 255, 0.5), rgba(245, 165, 180, 0.75)), url(/romantic-couple-sunset-beach-luxury.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment,
      }}
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
          <svg className="h-40 md:h-64 lg:h-80 w-40 md:w-64 lg:w-80 text-rose-500" viewBox="0 0 200 280" fill="currentColor">
            <ellipse cx="100" cy="60" rx="25" ry="35" fill="currentColor" opacity="0.9"/>
            <ellipse cx="65" cy="75" rx="20" ry="38" transform="rotate(-45 65 75)" fill="currentColor" opacity="0.85"/>
            <ellipse cx="135" cy="75" rx="20" ry="38" transform="rotate(45 135 75)" fill="currentColor" opacity="0.85"/>
            <ellipse cx="50" cy="110" rx="22" ry="35" transform="rotate(-70 50 110)" fill="currentColor" opacity="0.75"/>
            <ellipse cx="150" cy="110" rx="22" ry="35" transform="rotate(70 150 110)" fill="currentColor" opacity="0.75"/>
            <ellipse cx="40" cy="155" rx="20" ry="32" transform="rotate(-90 40 155)" fill="currentColor" opacity="0.7"/>
            <ellipse cx="160" cy="155" rx="20" ry="32" transform="rotate(90 160 155)" fill="currentColor" opacity="0.7"/>
            <circle cx="100" cy="100" r="40" fill="currentColor" opacity="0.8"/>
            <circle cx="100" cy="90" r="28" fill="#fda4af" opacity="0.9"/>
            <path d="M 100 140 Q 95 180 90 220" stroke="currentColor" strokeWidth="3" fill="none"/>
            <ellipse cx="75" cy="180" rx="12" ry="25" transform="rotate(-45 75 180)" fill="currentColor" opacity="0.6"/>
            <ellipse cx="125" cy="200" rx="12" ry="25" transform="rotate(45 125 200)" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto text-center relative z-20">
        <h1 ref={titleRef} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-playfair font-bold mb-6 md:mb-8 leading-tight tracking-tight">
          <span className="hero-title-gradient relative inline-block">
            {t('hero.title').split(' ').slice(0, 2).join(' ')}
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-rose-400 dark:text-pink-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span> <span className="hero-title-gradient">{t('hero.title').split(' ').slice(2).join(' ')}</span>
        </h1>
        <h2 ref={subtitleRef} className="text-xl sm:text-2xl md:text-4xl font-playfair font-bold mb-6 md:mb-8 hero-subtitle-gradient">
          {t('hero.subtitle')}
        </h2>

        <p ref={descriptionRef} className="text-base sm:text-lg md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed font-semibold" style={{ color: 'rgba(14, 13, 13, 1)' }}>
          {t('hero.description')}
        </p>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 md:py-4 bg-primary text-white rounded-full text-base md:text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow"
          >
            {t('common.joinForPrice')}
          </Link>
          <Link
            href="/browse"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 md:py-4 border-2 border-primary text-primary rounded-full text-base md:text-lg font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/30 transition"
          >
            {t('common.browseProfiles')}
          </Link>
        </div>

        <div ref={statsRef} className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#e2164b' }}>50M+</p>
            <p className="text-sm md:text-base font-semibold" style={{ color: 'rgba(0, 0, 0, 1)' }}>{t('hero.membersWorldwide')}</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#e2164b' }}>1M+</p>
            <p className="text-sm md:text-base font-semibold" style={{ color: 'rgba(0, 0, 0, 1)' }}>{t('hero.matchesMade')}</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#e2164b' }}>100+</p>
            <p className="text-sm md:text-base font-semibold" style={{ color: 'rgba(0, 0, 0, 1)' }}>{t('hero.countries')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
