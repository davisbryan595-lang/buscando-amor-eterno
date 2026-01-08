'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Settings, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function PreferencesPage() {
  const router = useRouter()
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center max-w-md">
          <Settings className="w-16 h-16 text-rose-300 mx-auto mb-6" />
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

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

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
              <Settings size={28} className="text-primary" />
              <h1 className="text-3xl font-playfair font-bold text-foreground">
                Preferences
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage your privacy and notification settings
            </p>
          </div>

          {/* Notifications Section */}
          <div className="bg-white border border-rose-100 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Notifications
              </h2>
              <p className="text-sm text-muted-foreground">
                Control what notifications you receive
              </p>
            </div>

            <div className="space-y-3">
              {/* Messages */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Message Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone sends you a message
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.messages}
                  onChange={() => toggleNotification('messages')}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {/* Likes */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Like Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone likes your profile
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.likes}
                  onChange={() => toggleNotification('likes')}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {/* Matches */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Match Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get notified about your new matches
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.matches}
                  onChange={() => toggleNotification('matches')}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {/* Updates */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    App Updates
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get notified about new features and updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.updates}
                  onChange={() => toggleNotification('updates')}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Marketing Emails
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive promotional and marketing emails
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={() => toggleNotification('marketing')}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white border border-rose-100 rounded-2xl p-8 space-y-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Privacy
              </h2>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile and information
              </p>
            </div>

            <div className="space-y-3">
              {/* Profile Public */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Public Profile
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Allow others to view your profile
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.profilePublic}
                  onChange={() => togglePrivacy('profilePublic')}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {/* Online Status */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Show Online Status
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Let others see when you're online
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.showOnlineStatus}
                  onChange={() => togglePrivacy('showOnlineStatus')}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {/* Allow Messages */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Allow Messages
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Allow others to message you
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.allowMessages}
                  onChange={() => togglePrivacy('allowMessages')}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {/* Search Engines */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Search Engine Indexing
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Allow search engines to index your profile
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.searchEngines}
                  onChange={() => togglePrivacy('searchEngines')}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Blocked Users */}
          <div className="bg-white border border-rose-100 rounded-2xl p-8 space-y-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Blocked Users
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage users you've blocked
              </p>
            </div>

            <div className="bg-rose-50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                You haven't blocked anyone yet.
              </p>
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
