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
              <Settings size={28} className="text-primary" />
              <h1 className="text-3xl font-playfair font-bold text-foreground dark:text-white">
                Preferences
              </h1>
            </div>
            <p className="text-muted-foreground dark:text-slate-400">
              Manage your privacy and notification settings
            </p>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border border-rose-200 dark:border-rose-800 rounded-2xl p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
                <Clock size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-playfair font-bold text-foreground dark:text-white mb-3">
                Coming Soon
              </h2>
              <p className="text-lg text-muted-foreground dark:text-slate-400 mb-4 max-w-md">
                Preference settings for notifications, privacy, and blocked users will be available soon.
              </p>
              <p className="text-sm text-muted-foreground dark:text-slate-500">
                We're working hard to bring you these features in an upcoming update.
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 rounded-xl p-6">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-lg flex items-center justify-center mb-4">
                <Settings size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground dark:text-white mb-2">Notifications</h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Customize notification preferences coming soon
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 rounded-xl p-6">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-lg flex items-center justify-center mb-4">
                <Settings size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground dark:text-white mb-2">Privacy</h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Control your privacy settings coming soon
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 rounded-xl p-6">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-lg flex items-center justify-center mb-4">
                <Settings size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground dark:text-white mb-2">Blocked Users</h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Manage blocked users coming soon
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
