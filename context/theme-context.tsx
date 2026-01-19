'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: 'light'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Helper function to apply theme to document
const applyTheme = (selectedTheme: Theme): 'light' => {
  if (typeof document === 'undefined') return 'light'

  const htmlElement = document.documentElement

  // Always remove dark class to ensure light mode only
  htmlElement.classList.remove('dark')

  // Set data-theme attribute for CSS selectors
  htmlElement.setAttribute('data-theme', 'light')
  console.log('[Theme] Applied light mode globally')

  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [effectiveTheme, setEffectiveTheme] = useState<'light'>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    try {
      console.log('[ThemeProvider] Initializing with light mode')

      setThemeState('light')
      const effective = applyTheme('light')
      setEffectiveTheme(effective)
    } catch (e) {
      console.error('[ThemeProvider] Error initializing:', e)
    } finally {
      setMounted(true)
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    // Light mode only - always light
    try {
      console.log('[ThemeProvider] Theme is set to light mode (no switching available)')
      setThemeState('light')
      localStorage.setItem('app-theme', 'light')
      const effective = applyTheme('light')
      setEffectiveTheme(effective)
    } catch (e) {
      console.error('[ThemeProvider] Error setting theme:', e)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// Hook for customization-specific settings (compact mode, text size, font)
export function useCustomizationSettings() {
  const [compactMode, setCompactModeState] = useState(false)
  const [largerText, setLargerTextState] = useState(false)
  const [selectedFont, setSelectedFontState] = useState('inter')
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedCompact = localStorage.getItem('compact-mode') === 'true'
    const savedLargerText = localStorage.getItem('larger-text') === 'true'
    const savedFont = localStorage.getItem('app-font') || 'inter'

    console.log('[useCustomizationSettings] Initializing with:', { savedCompact, savedLargerText, savedFont })

    setCompactModeState(savedCompact)
    setLargerTextState(savedLargerText)
    setSelectedFontState(savedFont)

    setMounted(true)
  }, [])

  const setCompactMode = (value: boolean) => {
    setCompactModeState(value)
    localStorage.setItem('compact-mode', value.toString())
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (value) {
        root.classList.add('compact-mode')
      } else {
        root.classList.remove('compact-mode')
      }
    }
  }

  const setLargerText = (value: boolean) => {
    setLargerTextState(value)
    localStorage.setItem('larger-text', value.toString())
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (value) {
        root.classList.add('larger-text')
      } else {
        root.classList.remove('larger-text')
      }
    }
  }

  const setSelectedFont = (font: string) => {
    setSelectedFontState(font)
    localStorage.setItem('app-font', font)
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (font === 'playfair') {
        root.style.fontFamily = 'var(--font-playfair)'
      } else {
        root.style.fontFamily = 'var(--font-inter)'
      }
    }
  }

  return {
    compactMode,
    setCompactMode,
    largerText,
    setLargerText,
    selectedFont,
    setSelectedFont,
    mounted,
  }
}
