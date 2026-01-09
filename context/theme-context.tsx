'use client'

import React, { useEffect, useState } from 'react'

// Simple theme manager without context to avoid hydration issues
export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = (localStorage.getItem('app-theme') as 'light' | 'dark' | 'system') || 'light'
    setThemeState(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    let isDark = selectedTheme === 'dark'
    if (selectedTheme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme)
    localStorage.setItem('app-theme', newTheme)
    applyTheme(newTheme)
  }

  return { theme, setTheme, mounted }
}

// Simple provider that just applies theme on mount
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedTheme = (localStorage.getItem('app-theme') as 'light' | 'dark' | 'system') || 'light'
    let isDark = savedTheme === 'dark'
    if (savedTheme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return <>{children}</>
}
