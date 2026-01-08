'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function SecuritySettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 text-rose-300 mx-auto mb-6" />
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      // Import Supabase client
      const { supabase } = await import('@/lib/supabase')

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword,
      })

      if (signInError) {
        toast.error('Current password is incorrect')
        setLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        toast.error(updateError.message || 'Failed to change password')
        setLoading(false)
        return
      }

      toast.success('Password changed successfully! Please log in again.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Sign out and redirect to login
      await supabase.auth.signOut()
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
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
              <Lock size={28} className="text-primary" />
              <h1 className="text-3xl font-playfair font-bold text-foreground dark:text-white">
                Security Settings
              </h1>
            </div>
            <p className="text-muted-foreground dark:text-slate-400">
              Manage your account security and password
            </p>
          </div>

          {/* Change Password Section */}
          <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                Change Password
              </h2>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Update your password to keep your account secure
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="dark:text-white">Current Password</Label>
                <Input
                  id="currentPassword"
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="px-4 py-3 rounded-full border-secondary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="dark:text-white">New Password</Label>
                <Input
                  id="newPassword"
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-4 py-3 rounded-full border-secondary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="dark:text-white">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="px-4 py-3 rounded-full border-secondary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="showPasswords"
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  className="rounded cursor-pointer accent-primary"
                />
                <Label htmlFor="showPasswords" className="text-sm cursor-pointer dark:text-white">
                  Show passwords
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-primary text-white hover:bg-rose-700 dark:hover:bg-rose-600 font-semibold"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>

          {/* Active Sessions */}
          <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 rounded-2xl p-8 space-y-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                Active Sessions
              </h2>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Manage devices accessing your account
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-rose-50 dark:bg-rose-950 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground dark:text-white text-sm">
                    Current Session
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">
                    This device
                  </p>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
