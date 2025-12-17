'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Heart } from 'lucide-react'
import { useLanguage } from '@/lib/i18n-context'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const { t } = useLanguage()
  const footerRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    gsap.from(columnsRef.current.filter(Boolean), {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      scrollTrigger: {
        trigger: footerRef.current,
        start: 'top 80%',
        end: 'top 20%',
        toggleActions: 'play none none reverse',
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === footerRef.current) {
          trigger.kill()
        }
      })
    }
  }, [])

  return (
    <footer ref={footerRef} className="bg-slate-900 text-white py-12 md:py-16 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          <div
            ref={(el) => {
              if (el) columnsRef.current[0] = el
            }}
          >
            <h3 className="text-xl md:text-2xl font-playfair font-bold mb-4 flex items-center gap-2">
              <Heart className="text-rose-400 flex-shrink-0" size={24} /> Buscando Amor Eterno
            </h3>
            <p className="text-sm md:text-base text-gray-400">{t('footer.tagline')}</p>
          </div>

          <div
            ref={(el) => {
              if (el) columnsRef.current[1] = el
            }}
          >
            <h4 className="font-bold mb-4 text-base md:text-lg">{t('footer.platform')}</h4>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li><Link href="/" className="hover:text-white transition">{t('common.home')}</Link></li>
              <li><Link href="/browse" className="hover:text-white transition">{t('common.browse')}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">{t('common.pricing')}</Link></li>
              <li><Link href="/messages" className="hover:text-white transition">{t('common.messages')}</Link></li>
              <li><Link href="/chat-room" className="hover:text-white transition">{t('common.lounge')}</Link></li>
            </ul>
          </div>

          <div
            ref={(el) => {
              if (el) columnsRef.current[2] = el
            }}
          >
            <h4 className="font-bold mb-4 text-base md:text-lg">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li><a href="#" className="hover:text-white transition">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.safety')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.contact')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center text-sm md:text-base text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
