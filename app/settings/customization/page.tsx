'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Palette, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'

export default function CustomizationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [compactMode, setCompactMode] = useState(false)
  const [largerText, setLargerText] = useState(false)
  const [loading, setLoading] = useState(false)

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
      // TODO: Implement preference saving API call
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
    <div className="min-h-screen bg-white">
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
              <h1 className="text-3xl font-playfair font-bold text-foreground">
                Customization
              </h1>
            </div>
            <p className="text-muted-foreground">
              Personalize your experience
            </p>
          </div>

          {/* Theme Section */}
          <div className="bg-white border border-rose-100 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Theme
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose your preferred display theme
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value as typeof theme)}
                  className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 transition ${
                    theme === value
                      ? 'border-primary bg-rose-50'
                      : 'border-rose-100 hover:border-primary'
                  }`}
                >
                  <Icon size={32} className={theme === value ? 'text-primary' : 'text-muted-foreground'} />
                  <p className="text-sm font-semibold text-foreground mt-2">
                    {label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-white border border-rose-100 rounded-2xl p-8 space-y-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Display Options
              </h2>
              <p className="text-sm text-muted-foreground">
                Adjust the layout and text size
              </p>
            </div>

            <div className="space-y-4">
              {/* Compact Mode */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Compact Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reduce spacing between elements
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {/* Larger Text */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Larger Text
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Increase text size for better readability
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={largerText}
                  onChange={(e) => setLargerText(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Font Preferences */}
          <div className="bg-white border border-rose-100 rounded-2xl p-8 space-y-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Font Preferences
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose your preferred font style
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-rose-100 rounded-lg cursor-pointer hover:bg-rose-50">
                <input
                  type="radio"
                  id="font-inter"
                  name="font"
                  value="inter"
                  defaultChecked
                  className="cursor-pointer"
                />
                <Label htmlFor="font-inter" className="flex-1 cursor-pointer text-sm font-medium">
                  Modern (Inter)
                </Label>
              </div>
              <div className="flex items-center gap-3 p-3 border border-rose-100 rounded-lg cursor-pointer hover:bg-rose-50">
                <input
                  type="radio"
                  id="font-playfair"
                  name="font"
                  value="playfair"
                  className="cursor-pointer"
                />
                <Label htmlFor="font-playfair" className="flex-1 cursor-pointer text-sm font-medium font-playfair">
                  Elegant (Playfair Display)
                </Label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSavePreferences}
            disabled={loading}
            className="w-full mt-8 py-3 rounded-full bg-primary text-white hover:bg-rose-700 font-semibold"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
