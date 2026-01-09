'use client'

import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

// Helper function to apply theme to document
const applyTheme = (selectedTheme: Theme) => {
  if (typeof document === 'undefined') return

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
    console.log('[Theme] Applied dark mode')
  } else {
    console.log('[Theme] Applied light mode')
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
