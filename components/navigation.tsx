'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { Menu, X, Bell, Globe } from 'lucide-react'
import { useLanguage } from '@/lib/i18n-context'
import { useAuth } from '@/context/auth-context'
import { useNotifications } from '@/hooks/useNotifications'
import { AccountMenu } from '@/components/account-menu'
import { NotificationsDropdown } from '@/components/notifications-dropdown'

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [langDropdown, setLangDropdown] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const { language, setLanguage, t } = useLanguage()
  const { user } = useAuth()
  const { notifications, dismissNotification } = useNotifications()

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (navRef.current) {
      gsap.from(navRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.6,
      })
    }
  }, [])

  const toggleOneSignal = () => {
    if (typeof window !== 'undefined' && window.OneSignal) {
      window.OneSignal.push(function() {
        window.OneSignal.showSlidedownPrompt();
      });
    }
  }

  const handleNotificationDismiss = (id: string) => {
    dismissNotification(id)
  }

  const handleLanguageChange = (lang: 'en' | 'es') => {
    setLanguage(lang)
    setLangDropdown(false)
  }

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F5517f718aa7348e88214250292563028%2F09ca0588ac3741678f0d49e142dede0b?format=webp&width=800"
            alt="Buscando Amor Eterno Logo"
            className="h-16 w-16 object-contain"
          />
          <span className="text-lg font-playfair font-bold text-rose-600">Buscando Amor Eterno</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/" className="text-foreground hover:text-primary transition">{t('common.home')}</Link>
          <Link href="/browse" className="text-foreground hover:text-primary transition">{t('common.browse')}</Link>
          <Link href="/pricing" className="text-foreground hover:text-primary transition">{t('common.pricing')}</Link>
          <Link href="/messages" className="text-foreground hover:text-primary transition">{t('common.messages')}</Link>
          <Link href="/chat-room" className="text-foreground hover:text-primary transition">{t('common.lounge')}</Link>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 hover:bg-rose-50 rounded-full transition relative"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-primary" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <NotificationsDropdown
                notifications={notifications}
                onDismiss={handleNotificationDismiss}
              />
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className="p-2 hover:bg-rose-50 rounded-full transition flex items-center gap-1"
              aria-label="Language"
            >
              <Globe size={20} className="text-primary" />
              <span className="text-sm font-semibold text-primary uppercase">{language}</span>
            </button>
            {langDropdown && (
              <div className="absolute right-0 mt-2 bg-white border border-rose-100 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`block w-full text-left px-4 py-2 hover:bg-rose-50 ${language === 'en' ? 'bg-rose-50 text-primary font-semibold' : 'text-foreground'}`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('es')}
                  className={`block w-full text-left px-4 py-2 hover:bg-rose-50 ${language === 'es' ? 'bg-rose-50 text-primary font-semibold' : 'text-foreground'}`}
                >
                  Español
                </button>
              </div>
            )}
          </div>

          {isMounted && user ? (
            <AccountMenu />
          ) : isMounted ? (
            <>
              <Link href="/login" className="px-4 py-2 text-foreground hover:text-primary transition">
                {t('common.logIn')}
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-rose-700 transition font-semibold"
              >
                {t('common.joinForPrice')}
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 hover:bg-rose-50 rounded-full transition relative"
            >
              <Bell size={20} className="text-primary" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <NotificationsDropdown
                notifications={notifications}
                onDismiss={handleNotificationDismiss}
              />
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className="p-2 hover:bg-rose-50 rounded-full transition"
            >
              <Globe size={20} className="text-primary" />
            </button>
            {langDropdown && (
              <div className="absolute right-0 mt-2 bg-white border border-rose-100 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`block w-full text-left px-4 py-2 hover:bg-rose-50 ${language === 'en' ? 'bg-rose-50 text-primary font-semibold' : 'text-foreground'}`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('es')}
                  className={`block w-full text-left px-4 py-2 hover:bg-rose-50 ${language === 'es' ? 'bg-rose-50 text-primary font-semibold' : 'text-foreground'}`}
                >
                  Español
                </button>
              </div>
            )}
          </div>
          {isMounted && user ? (
            <AccountMenu />
          ) : isMounted ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-rose-50 rounded-lg transition"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          ) : null}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && isMounted && !user && (
        <div className="md:hidden bg-white border-t border-rose-100 py-4 px-4 space-y-3">
          <Link href="/" className="block text-foreground hover:text-primary transition py-2">
            {t('common.home')}
          </Link>
          <Link href="/browse" className="block text-foreground hover:text-primary transition py-2">
            {t('common.browse')}
          </Link>
          <Link href="/pricing" className="block text-foreground hover:text-primary transition py-2">
            {t('common.pricing')}
          </Link>
          <Link href="/messages" className="block text-foreground hover:text-primary transition py-2">
            {t('common.messages')}
          </Link>
          <Link href="/chat-room" className="block text-foreground hover:text-primary transition py-2">
            {t('common.lounge')}
          </Link>
          <Link href="/login" className="block text-foreground hover:text-primary transition py-2">
            {t('common.logIn')}
          </Link>
          <Link
            href="/signup"
            className="block px-6 py-2 bg-primary text-white rounded-full hover:bg-rose-700 transition font-semibold text-center"
          >
            {t('common.joinForPrice')}
          </Link>
        </div>
      )}
    </nav>
  )
}
