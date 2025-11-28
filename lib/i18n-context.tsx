'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import en from '@/lib/translations/en.json'
import es from '@/lib/translations/es.json'

type Language = 'en' | 'es'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, defaultValue?: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const translations = { en, es }

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const stored = localStorage.getItem('language') as Language | null
    const browserLang = navigator.language.split('-')[0] as Language
    const detectedLang = stored || (browserLang === 'es' ? 'es' : 'en')
    setLanguage(detectedLang)
  }, [])

  const t = (key: string, defaultValue?: string): string => {
    const value = getNestedValue(translations[language], key)
    if (value === undefined || value === null) {
      return defaultValue || key
    }
    return String(value)
  }

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useLanguage must be used within I18nProvider')
  }
  return context
}
