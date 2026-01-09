'use client'

import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

// Initialize theme on mount
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const savedTheme = (localStorage.getItem('app-theme') as Theme) || 'light'
  let isDark = savedTheme === 'dark'

  if (savedTheme === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Helper function to apply theme to document
const applyTheme = (selectedTheme: Theme) => {
  let isDark = selectedTheme === 'dark'

  if (selectedTheme === 'system') {
    if (typeof window !== 'undefined') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  // Apply to document root
  if (typeof document !== 'undefined') {
    const htmlElement = document.documentElement
    if (isDark) {
      htmlElement.classList.add('dark')
      console.log('[Theme] Applied dark mode')
    } else {
      htmlElement.classList.remove('dark')
      console.log('[Theme] Applied light mode')
    }
  }
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
    // Immediately apply the saved theme from localStorage
    const savedTheme = (localStorage.getItem('app-theme') as Theme) || 'light'
    const savedCompact = localStorage.getItem('compact-mode') === 'true'
    const savedLargerText = localStorage.getItem('larger-text') === 'true'
    const savedFont = localStorage.getItem('app-font') || 'inter'

    setThemeState(savedTheme)
    setCompactModeState(savedCompact)
    setLargerTextState(savedLargerText)
    setSelectedFontState(savedFont)

    // Re-apply theme in case it got overridden
    applyTheme(savedTheme)

    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('app-theme', newTheme)
    applyTheme(newTheme)
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
