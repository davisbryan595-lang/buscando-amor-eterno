'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Helper function to apply theme to document
const applyTheme = (selectedTheme: Theme): 'light' | 'dark' => {
  if (typeof document === 'undefined') return 'light'

  const htmlElement = document.documentElement
  let isDark = selectedTheme === 'dark'

  if (selectedTheme === 'system') {
    if (typeof window !== 'undefined') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  // Always remove dark first to ensure clean state
  htmlElement.classList.remove('dark')

  // Then add if needed
  if (isDark) {
    htmlElement.classList.add('dark')
    console.log('[Theme] Applied dark mode globally')
  } else {
    console.log('[Theme] Applied light mode globally')
  }

  return isDark ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    // Get saved theme from localStorage, default to 'light'
    const savedTheme = (localStorage.getItem('app-theme') as Theme) || 'light'
    console.log('[ThemeProvider] Initializing with:', savedTheme)

    setThemeState(savedTheme)
    const effective = applyTheme(savedTheme)
    setEffectiveTheme(effective)
    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    console.log('[ThemeProvider] Changing theme to:', newTheme)
    setThemeState(newTheme)
    localStorage.setItem('app-theme', newTheme)
    const effective = applyTheme(newTheme)
    setEffectiveTheme(effective)
    console.log('[ThemeProvider] Theme changed to:', newTheme, '- Effective:', effective)
  }

  if (!mounted) {
    return <>{children}</>
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

// Hook for managing theme settings on the customization page
export function useThemeSettings() {
  const [theme, setThemeState] = useState<Theme>('light')
  const [compactMode, setCompactModeState] = useState(false)
  const [largerText, setLargerTextState] = useState(false)
  const [selectedFont, setSelectedFontState] = useState('inter')
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem('app-theme') as Theme) || 'light'
    const savedCompact = localStorage.getItem('compact-mode') === 'true'
    const savedLargerText = localStorage.getItem('larger-text') === 'true'
    const savedFont = localStorage.getItem('app-font') || 'inter'

    console.log('[useThemeSettings] Initializing with:', { savedTheme, savedCompact, savedLargerText, savedFont })

    setThemeState(savedTheme)
    setCompactModeState(savedCompact)
    setLargerTextState(savedLargerText)
    setSelectedFontState(savedFont)

    // Apply the saved theme
    applyTheme(savedTheme)

    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    console.log('[setTheme] Changing theme to:', newTheme)
    setThemeState(newTheme)
    localStorage.setItem('app-theme', newTheme)
    applyTheme(newTheme)
    console.log('[setTheme] Theme changed successfully')
  }

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
    theme,
    setTheme,
    compactMode,
    setCompactMode,
    largerText,
    setLargerText,
    selectedFont,
    setSelectedFont,
    mounted,
  }
}
