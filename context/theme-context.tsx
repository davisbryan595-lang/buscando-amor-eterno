'use client'

import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

// Simple hook for managing theme in the customization page only
export function useThemeSettings() {
  const [theme, setThemeState] = useState<Theme>('light')
  const [compactMode, setCompactModeState] = useState(false)
  const [largerText, setLargerTextState] = useState(false)
  const [selectedFont, setSelectedFontState] = useState('inter')
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = (localStorage.getItem('app-theme') as Theme) || 'light'
    const savedCompact = localStorage.getItem('compact-mode') === 'true'
    const savedLargerText = localStorage.getItem('larger-text') === 'true'
    const savedFont = localStorage.getItem('app-font') || 'inter'

    setThemeState(savedTheme)
    setCompactModeState(savedCompact)
    setLargerTextState(savedLargerText)
    setSelectedFontState(savedFont)

    // Apply theme
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (selectedTheme: Theme) => {
    let isDark = selectedTheme === 'dark'

    if (selectedTheme === 'system') {
      if (typeof window !== 'undefined') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    }

    // Only apply to document if we're on a page that supports it
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('app-theme', newTheme)
    applyTheme(newTheme)
  }

  const setCompactMode = (value: boolean) => {
    setCompactModeState(value)
    localStorage.setItem('compact-mode', value.toString())
    const root = document.documentElement
    if (value) {
      root.classList.add('compact-mode')
    } else {
      root.classList.remove('compact-mode')
    }
  }

  const setLargerText = (value: boolean) => {
    setLargerTextState(value)
    localStorage.setItem('larger-text', value.toString())
    const root = document.documentElement
    if (value) {
      root.classList.add('larger-text')
    } else {
      root.classList.remove('larger-text')
    }
  }

  const setSelectedFont = (font: string) => {
    setSelectedFontState(font)
    localStorage.setItem('app-font', font)
    const root = document.documentElement
    if (font === 'playfair') {
      root.style.fontFamily = 'var(--font-playfair)'
    } else {
      root.style.fontFamily = 'var(--font-inter)'
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
