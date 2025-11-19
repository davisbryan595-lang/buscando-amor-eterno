'use client'

import React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useLanguage } from '@/context/language-context'

export default function Footer() {
  const { t } = useLanguage()

  const openTawkDashboard = () => {
    window.open('https://dashboard.tawk.to', '_blank')
  }

  return (
    <footer className="bg-slate-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-playfair font-bold mb-4 flex items-center gap-2">
              <Heart className="text-rose-400" /> {t.nav.logo}
            </h3>
            <p className="text-gray-400">Finding eternal love worldwide</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white transition">{t.nav.home}</Link></li>
              <li><Link href="/browse" className="hover:text-white transition">{t.nav.browse}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">{t.nav.pricing}</Link></li>
              <li><Link href="/chat-room" className="hover:text-white transition">{t.nav.lounge}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Safety</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Admin</h4>
            <button
              onClick={openTawkDashboard}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded transition text-sm"
            >
              Agent Login
            </button>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center text-gray-400">
          <p>&copy; 2025 {t.nav.logo}. {t.footer.rights} with ♥</p>
        </div>
      </div>
    </footer>
  )
}
