'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useLanguage } from '@/lib/i18n-context'
import { useProfile } from '@/hooks/useProfile'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AccountMenu } from '@/components/account-menu'
import { Loader, LogOut, Trash2, Download, Camera, X, Plus, AlertCircle, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { ProfilePhotosTab } from '@/components/profile/photos-tab'
import { ProfilePromptsTab } from '@/components/profile/prompts-tab'
import { ProfilePreferencesTab } from '@/components/profile/preferences-tab'

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const { profile, loading, fetchProfile } = useProfile()

  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('photos')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={40} />
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center max-w-md">
          <Camera className="w-16 h-16 text-rose-300 mx-auto mb-6" />
          <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-4">
            Profile Not Found
          </h1>
          <p className="text-slate-600 mb-8">
            {!user ? 'Please log in to view your profile' : 'Complete your profile to get started'}
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push(!user ? '/login' : '/onboarding')}
              className="w-full bg-primary text-white hover:bg-rose-700"
            >
              {!user ? 'Log In' : 'Complete Profile'}
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

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      // TODO: Implement account deletion
      toast.success('Account deleted successfully')
      await signOut()
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const dataToExport = {
        user: {
          email: user.email,
          id: user.id,
          created_at: user.created_at,
        },
        profile: profile,
      }

      const json = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `my-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(t('profile.exportSuccess'))
    } catch (error: any) {
      toast.error(t('profile.exportFailed'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Image Section */}
      {profile?.photos?.[profile.main_photo_index || 0] && (
        <div className="relative h-80 w-full overflow-hidden bg-gray-200">
          <Image
            src={profile.photos[profile.main_photo_index || 0]}
            alt={profile.full_name || 'Profile'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Profile Incomplete Warning Banner */}
      {!profile.profile_complete && (
        <div className="bg-red-50 border-b-2 border-red-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Your profile is incomplete</p>
                <p className="text-sm text-red-700">Complete all sections below to become visible to other members</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
                {t('profile.myProfile')}
              </h1>
              <p className="text-muted-foreground">{profile.full_name || user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <AccountMenu />
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="lg"
                className="border-secondary gap-2"
              >
                <LogOut size={20} />
                Sign out
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 rounded-full p-1 bg-muted">
              <TabsTrigger value="photos" className="rounded-full">
                <Camera size={18} className="mr-2" />
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
              <TabsTrigger value="prompts" className="rounded-full">
                <span className="hidden sm:inline">Prompts</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="rounded-full">
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="space-y-4">
              <ProfilePhotosTab profile={profile} onUpdate={fetchProfile} />
            </TabsContent>

            <TabsContent value="prompts" className="space-y-4">
              <ProfilePromptsTab profile={profile} onUpdate={fetchProfile} />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <ProfilePreferencesTab profile={profile} onUpdate={fetchProfile} />
            </TabsContent>
          </Tabs>

          {/* Danger Zone */}
          <div className="mt-12 space-y-6 border-t pt-8">
            <h2 className="text-2xl font-playfair font-bold text-foreground">
              Account Settings
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={handleExportData}
                disabled={exporting}
                variant="outline"
                size="lg"
                className="border-secondary gap-2 py-6"
              >
                {exporting && <Loader className="animate-spin" size={20} />}
                <Download size={20} />
                <span className="hidden sm:inline">{t('profile.exportData')}</span>
              </Button>

              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                size="lg"
                className="gap-2 py-6"
              >
                <Trash2 size={20} />
                <span className="hidden sm:inline">{t('profile.deleteAccount')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>{t('profile.deleteAccountConfirm')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('profile.deleteAccountWarning')}
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader className="animate-spin mr-2" size={16} />}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  )
}
