'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useCustomizationSettings } from '@/context/theme-context'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Palette, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'

export default function CustomizationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    compactMode,
    setCompactMode,
    largerText,
    setLargerText,
    selectedFont,
    setSelectedFont,
    mounted,
  } = useCustomizationSettings()
  const [loading, setLoading] = useState(false)
  const [localTheme, setLocalThemeState] = useState<'light' | 'dark' | 'system'>('light')

  React.useEffect(() => {
    const savedTheme = (localStorage.getItem('app-theme') as 'light' | 'dark' | 'system') || 'light'
    setLocalThemeState(savedTheme)
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center max-w-md">
          <Palette className="w-16 h-16 text-rose-300 mx-auto mb-6" />
          <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-4">
            Please Log In
          </h1>
          <p className="text-slate-600 mb-8">
            You need to log in to access settings
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-primary text-white hover:bg-rose-700"
            >
              Log In
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full border-secondary text-foreground hover:bg-muted flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      // Settings are saved in real-time via the hook functions
      toast.success('Preferences saved successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Palette },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navigation />

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-rose-700 transition mb-8"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Palette size={28} className="text-primary" />
              <h1 className="text-3xl font-playfair font-bold text-foreground dark:text-white">
                Customization
              </h1>
            </div>
            <p className="text-muted-foreground dark:text-slate-400">
              Personalize your experience
            </p>
          </div>

          {/* Theme Section */}
          <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                Theme
              </h2>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Choose your preferred display theme
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setLocalTheme(value as typeof localTheme)
                    toast.success(`Theme changed to ${label}`)
                  }}
                  className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 transition ${
                    localTheme === value
                      ? 'border-primary bg-rose-50 dark:bg-rose-900'
                      : 'border-rose-100 dark:border-rose-800 hover:border-primary'
                  }`}
                >
                  <Icon size={32} className={localTheme === value ? 'text-primary' : 'text-muted-foreground'} />
                  <p className="text-sm font-semibold text-foreground dark:text-white mt-2">
                    {label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 rounded-2xl p-8 space-y-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                Display Options
              </h2>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Adjust the layout and text size
              </p>
            </div>

            <div className="space-y-4">
              {/* Compact Mode */}
              <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground dark:text-white text-sm">
                    Compact Mode
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">
                    Reduce spacing between elements
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => {
                    setCompactMode(e.target.checked)
                    toast.success(e.target.checked ? 'Compact mode enabled' : 'Compact mode disabled')
                  }}
                  className="w-5 h-5 rounded cursor-pointer accent-primary"
                />
              </div>

              {/* Larger Text */}
              <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground dark:text-white text-sm">
                    Larger Text
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">
                    Increase text size for better readability
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={largerText}
                  onChange={(e) => {
                    setLargerText(e.target.checked)
                    toast.success(e.target.checked ? 'Larger text enabled' : 'Larger text disabled')
                  }}
                  className="w-5 h-5 rounded cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Font Preferences */}
          <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 rounded-2xl p-8 space-y-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                Font Preferences
              </h2>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Choose your preferred font style
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-rose-100 dark:border-rose-800 rounded-lg cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900 transition">
                <input
                  type="radio"
                  id="font-inter"
                  name="font"
                  value="inter"
                  checked={selectedFont === 'inter'}
                  onChange={() => {
                    setSelectedFont('inter')
                    toast.success('Font changed to Modern (Inter)')
                  }}
                  className="cursor-pointer"
                />
                <Label htmlFor="font-inter" className="flex-1 cursor-pointer text-sm font-medium dark:text-white">
                  Modern (Inter)
                </Label>
              </div>
              <div className="flex items-center gap-3 p-3 border border-rose-100 dark:border-rose-800 rounded-lg cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900 transition">
                <input
                  type="radio"
                  id="font-playfair"
                  name="font"
                  value="playfair"
                  checked={selectedFont === 'playfair'}
                  onChange={() => {
                    setSelectedFont('playfair')
                    toast.success('Font changed to Elegant (Playfair Display)')
                  }}
                  className="cursor-pointer"
                />
                <Label htmlFor="font-playfair" className="flex-1 cursor-pointer text-sm font-medium font-playfair dark:text-white">
                  Elegant (Playfair Display)
                </Label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSavePreferences}
            disabled={loading}
            className="w-full mt-8 py-3 rounded-full bg-primary text-white hover:bg-rose-700 dark:hover:bg-rose-600 font-semibold"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
