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
    if (!footerRef.current) return

    const columns = columnsRef.current.filter(Boolean)
    if (columns.length === 0) return

    gsap.from(columns, {
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
    <footer ref={footerRef} className="bg-slate-900 text-white py-6 md:py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div
            ref={(el) => {
              if (el) columnsRef.current[0] = el
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F5517f718aa7348e88214250292563028%2F09ca0588ac3741678f0d49e142dede0b?format=webp&width=800"
                alt="Buscando Amor Eterno Logo"
                className="h-8 w-8 md:h-10 md:w-10 object-contain flex-shrink-0"
              />
              <h3 className="text-lg md:text-xl font-playfair font-bold text-white">
                Buscando Amor Eterno
              </h3>
            </div>
            <p className="text-xs md:text-sm text-white">{t('footer.tagline')}</p>
          </div>

          <div
            ref={(el) => {
              if (el) columnsRef.current[1] = el
            }}
          >
            <h4 className="font-bold mb-2 text-sm md:text-base text-rose-200">{t('footer.platform')}</h4>
            <ul className="space-y-1 text-xs md:text-sm text-slate-100">
              <li><Link href="/" className="hover:text-rose-300 transition">{t('common.home')}</Link></li>
              <li><Link href="/browse" className="hover:text-rose-300 transition">{t('common.browse')}</Link></li>
              <li><Link href="/pricing" className="hover:text-rose-300 transition">{t('common.pricing')}</Link></li>
              <li><Link href="/messages" className="hover:text-rose-300 transition">{t('common.messages')}</Link></li>
              <li><Link href="/chat-room" className="hover:text-rose-300 transition">{t('common.lounge')}</Link></li>
            </ul>
          </div>

          <div
            ref={(el) => {
              if (el) columnsRef.current[2] = el
            }}
          >
            <h4 className="font-bold mb-2 text-sm md:text-base text-rose-200">{t('footer.legal')}</h4>
            <ul className="space-y-1 text-xs md:text-sm text-slate-100">
              <li><a href="#" className="hover:text-rose-300 transition">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-rose-300 transition">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-rose-300 transition">{t('footer.safety')}</a></li>
              <li><a href="#" className="hover:text-rose-300 transition">{t('footer.contact')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4 text-center text-xs md:text-sm text-slate-100">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
