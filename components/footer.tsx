'use client'

import React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useLanguage } from '@/lib/i18n-context'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-slate-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-playfair font-bold mb-4 flex items-center gap-2">
              <Heart className="text-rose-400" /> Buscando Amor Eterno
            </h3>
            <p className="text-gray-400">{t('footer.tagline')}</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('footer.platform')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white transition">{t('common.home')}</Link></li>
              <li><Link href="/browse" className="hover:text-white transition">{t('common.browse')}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">{t('common.pricing')}</Link></li>
              <li><Link href="/messages" className="hover:text-white transition">{t('common.messages')}</Link></li>
              <li><Link href="/chat-room" className="hover:text-white transition">{t('common.lounge')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.safety')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.contact')}</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-700 pt-8 text-center text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
