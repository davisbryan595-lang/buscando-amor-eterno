'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { Menu, X, Bell, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n-context'
import { useAuth } from '@/context/auth-context'
import { useNotifications } from '@/hooks/useNotifications'
import { AccountMenu } from '@/components/account-menu'
import { ResponsiveNotificationsPanel } from '@/components/responsive-notifications-panel'

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
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-background/90 dark:bg-background/95 md:bg-background/95 dark:md:bg-background/95 backdrop-blur-md border-b border-rose-100/50 dark:border-rose-900/40 md:border-rose-100 dark:md:border-rose-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 md:py-2 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F5517f718aa7348e88214250292563028%2F09ca0588ac3741678f0d49e142dede0b?format=webp&width=800"
            alt="Buscando Amor Eterno Logo"
            className="h-10 w-10 md:h-12 md:w-12 object-contain"
          />
          <span className="hidden sm:inline text-sm md:text-base font-playfair font-bold text-rose-600 whitespace-nowrap">Buscando Amor Eterno</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/" className="text-foreground hover:text-primary transition">{t('common.home')}</Link>
          <Link href="/browse" className="text-foreground hover:text-primary transition">{t('common.browse')}</Link>
          <Link href="/pricing" className="text-foreground hover:text-primary transition">{t('common.pricing')}</Link>
          <Link href="/messages" className="text-foreground hover:text-primary transition">{t('common.messages')}</Link>
          <Link href="/lounge" className="text-foreground hover:text-primary transition">{t('common.lounge')}</Link>
          <Link href="/nuestra-historia" className="text-foreground hover:text-primary transition">{t('common.ourStory')}</Link>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 hover:bg-card-subtle dark:hover:bg-card-subtle rounded-full transition relative"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-primary" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className="p-2 hover:bg-card-subtle dark:hover:bg-card-subtle rounded-full transition flex items-center gap-1"
              aria-label="Language"
            >
              <Globe size={20} className="text-primary" />
              <span className="text-sm font-semibold text-primary uppercase">{language}</span>
            </button>
            {langDropdown && (
              <div className="absolute right-0 mt-2 bg-card dark:bg-card border border-rose-100 dark:border-rose-900/40 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`block w-full text-left px-4 py-2 hover:bg-card-subtle dark:hover:bg-card-subtle ${language === 'en' ? 'bg-card-subtle dark:bg-card-subtle text-primary font-semibold' : 'text-foreground dark:text-white'}`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('es')}
                  className={`block w-full text-left px-4 py-2 hover:bg-card-subtle dark:hover:bg-card-subtle ${language === 'es' ? 'bg-card-subtle dark:bg-card-subtle text-primary font-semibold' : 'text-foreground dark:text-white'}`}
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
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 hover:bg-card-subtle dark:hover:bg-card-subtle rounded-full transition relative"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-primary" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>
          {isMounted && user ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-card-subtle dark:hover:bg-card-subtle rounded-lg transition"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <AccountMenu />
            </>
          ) : isMounted ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-card-subtle dark:hover:bg-card-subtle rounded-lg transition"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          ) : null}
        </div>
      </div>

      {/* Mobile Menu with slide animation */}
      <AnimatePresence>
        {menuOpen && isMounted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              opacity: { duration: 0.2 },
            }}
            className="md:hidden bg-background dark:bg-background border-t border-rose-100 dark:border-rose-900/40 py-4 px-4 space-y-3 overflow-hidden"
          >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Link href="/" className="block text-foreground hover:text-primary transition py-2" onClick={() => setMenuOpen(false)}>
              {t('common.home')}
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <Link href="/browse" className="block text-foreground hover:text-primary transition py-2" onClick={() => setMenuOpen(false)}>
              {t('common.browse')}
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Link href="/pricing" className="block text-foreground hover:text-primary transition py-2" onClick={() => setMenuOpen(false)}>
              {t('common.pricing')}
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <Link href="/messages" className="block text-foreground hover:text-primary transition py-2" onClick={() => setMenuOpen(false)}>
              {t('common.messages')}
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Link href="/lounge" className="block text-foreground hover:text-primary transition py-2" onClick={() => setMenuOpen(false)}>
              {t('common.lounge')}
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.32, duration: 0.3 }}
          >
            <Link href="/nuestra-historia" className="block text-foreground hover:text-primary transition py-2" onClick={() => setMenuOpen(false)}>
              {t('common.ourStory')}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="border-t border-rose-100 dark:border-rose-900/40 pt-3 mt-3"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Language</p>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`block w-full text-left px-4 py-2 rounded-lg transition ${language === 'en' ? 'bg-card-subtle dark:bg-card-subtle text-primary font-semibold' : 'text-foreground dark:text-white hover:bg-card-subtle dark:hover:bg-card-subtle'}`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('es')}
              className={`block w-full text-left px-4 py-2 rounded-lg transition ${language === 'es' ? 'bg-card-subtle dark:bg-card-subtle text-primary font-semibold' : 'text-foreground dark:text-white hover:bg-card-subtle dark:hover:bg-card-subtle'}`}
            >
              Español
            </button>
          </motion.div>

          {!user && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <div className="border-t border-rose-100 dark:border-rose-900/40 pt-3 mt-3 space-y-3">
                <Link href="/login" className="block text-foreground hover:text-primary transition py-2" onClick={() => setMenuOpen(false)}>
                  {t('common.logIn')}
                </Link>
                <Link
                  href="/signup"
                  className="block px-6 py-2 bg-primary text-white rounded-full hover:bg-rose-700 transition font-semibold text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('common.joinForPrice')}
                </Link>
              </div>
            </motion.div>
          )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Notification Panel - handles both desktop and mobile via isMobile hook */}
      <ResponsiveNotificationsPanel
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        notifications={notifications}
        onDismiss={handleNotificationDismiss}
      />
    </nav>
  )
}
