'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import en from '@/lib/translations/en.json'
import es from '@/lib/translations/es.json'

export type Language = 'en' | 'es'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const translations = { en, es }

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

function replaceTemplateVariables(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text

  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key]
    return value !== undefined ? String(value) : match
  })
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const stored = localStorage.getItem('language') as Language | null
    // Default to English, only use Spanish if explicitly set in localStorage
    const detectedLang = stored || 'en'
    setLanguageState(detectedLang)
  }, [])

  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[language], key)
    if (value === undefined || value === null) {
      return key
    }
    const stringValue = String(value)
    return replaceTemplateVariables(stringValue, variables)
  }, [language])

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }, [])

  const contextValue: I18nContextType = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t,
  }), [language, handleSetLanguage, t])

  return (
    <I18nContext.Provider value={contextValue}>
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
