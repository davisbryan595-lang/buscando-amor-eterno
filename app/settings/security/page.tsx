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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access settings</p>
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
      // TODO: Implement password change API call
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
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
              <Lock size={28} className="text-primary" />
              <h1 className="text-3xl font-playfair font-bold text-foreground">
                Security Settings
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage your account security and password
            </p>
          </div>

          {/* Change Password Section */}
          <div className="bg-white border border-rose-100 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Change Password
              </h2>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="px-4 py-3 rounded-full border-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-4 py-3 rounded-full border-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="px-4 py-3 rounded-full border-secondary"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="showPasswords"
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  className="rounded cursor-pointer"
                />
                <Label htmlFor="showPasswords" className="text-sm cursor-pointer">
                  Show passwords
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-primary text-white hover:bg-rose-700 font-semibold"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>

          {/* Two-Factor Authentication Section */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 space-y-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>

            <div className="bg-white rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Two-factor authentication is not yet enabled on your account.
              </p>
              <Button
                disabled
                variant="outline"
                className="rounded-full border-secondary"
              >
                Enable Two-Factor Authentication
              </Button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white border border-rose-100 rounded-2xl p-8 space-y-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Active Sessions
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage devices accessing your account
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-rose-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Current Session
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This device
                  </p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
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
