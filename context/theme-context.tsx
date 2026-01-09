'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { supabase } from '@/lib/supabase'

export interface ThemeSettings {
  theme: 'light' | 'dark'
  compactMode: boolean
  largerText: boolean
}

interface ThemeContextType {
  settings: ThemeSettings
  tempSettings: ThemeSettings
  setTempTheme: (theme: 'light' | 'dark') => void
  setTempCompactMode: (enabled: boolean) => void
  setTempLargerText: (enabled: boolean) => void
  saveSettings: () => Promise<void>
  revertSettings: () => void
  loading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<ThemeSettings>({
    theme: 'light',
    compactMode: false,
    largerText: false,
  })
  const [tempSettings, setTempSettings] = useState<ThemeSettings>(settings)
  const [loading, setLoading] = useState(false)

  // Load settings from localStorage and database on mount and user change
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load from localStorage first
        const storedSettings = localStorage.getItem('theme-settings')
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings)
          setSettings(parsed)
          setTempSettings(parsed)
          applyTheme(parsed)
          return
        }

        // If user is logged in, try to load from database
        if (user) {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('theme, compact_mode, larger_text')
            .eq('user_id', user.id)
            .single()

          if (!error && data) {
            const dbSettings: ThemeSettings = {
              theme: data.theme || 'light',
              compactMode: data.compact_mode || false,
              largerText: data.larger_text || false,
            }
            setSettings(dbSettings)
            setTempSettings(dbSettings)
            localStorage.setItem('theme-settings', JSON.stringify(dbSettings))
            applyTheme(dbSettings)
          }
        }
      } catch (err) {
        console.warn('Failed to load theme settings:', err)
        // Fall back to default
        applyTheme(settings)
      }
    }

    loadSettings()
  }, [user])

  // Apply theme changes to DOM
  const applyTheme = (themeSettings: ThemeSettings) => {
    const htmlElement = document.documentElement
    
    // Apply dark mode class
    if (themeSettings.theme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }

    // Apply compact mode
    if (themeSettings.compactMode) {
      htmlElement.classList.add('compact-mode')
    } else {
      htmlElement.classList.remove('compact-mode')
    }

    // Apply larger text
    if (themeSettings.largerText) {
      htmlElement.classList.add('larger-text')
    } else {
      htmlElement.classList.remove('larger-text')
    }
  }

  const setTempTheme = (theme: 'light' | 'dark') => {
    const newSettings = { ...tempSettings, theme }
    setTempSettings(newSettings)
    applyTheme(newSettings)
  }

  const setTempCompactMode = (enabled: boolean) => {
    const newSettings = { ...tempSettings, compactMode: enabled }
    setTempSettings(newSettings)
    applyTheme(newSettings)
  }

  const setTempLargerText = (enabled: boolean) => {
    const newSettings = { ...tempSettings, largerText: enabled }
    setTempSettings(newSettings)
    applyTheme(newSettings)
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem('theme-settings', JSON.stringify(tempSettings))

      // Save to database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            theme: tempSettings.theme,
            compact_mode: tempSettings.compactMode,
            larger_text: tempSettings.largerText,
            updated_at: new Date().toISOString(),
          })

        if (error) throw error
      }

      // Update saved settings
      setSettings(tempSettings)
    } catch (err) {
      console.error('Failed to save theme settings:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const revertSettings = () => {
    setTempSettings(settings)
    applyTheme(settings)
  }

  return (
    <ThemeContext.Provider
      value={{
        settings,
        tempSettings,
        setTempTheme,
        setTempCompactMode,
        setTempLargerText,
        saveSettings,
        revertSettings,
        loading,
      }}
    >
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
