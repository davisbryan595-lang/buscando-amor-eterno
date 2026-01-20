'use client'

import { useCallback, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { BanUserForm } from './ban-user-form'
import { UserProfile } from './admin-users-table'
import { useAdminActions } from '@/hooks/useAdminActions'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface AdminUserDetailModalProps {
  user: UserProfile
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: () => void
}

interface DetailedUserProfile extends UserProfile {
  full_name: string | null
  birthday: string | null
  gender: string | null
  location: string | null
  country: string | null
  bio: string | null
  prompt_1: string | null
  prompt_2: string | null
  prompt_3: string | null
  profile_complete: boolean
}

export function AdminUserDetailModal({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: AdminUserDetailModalProps) {
  const [detailedUser, setDetailedUser] = useState<DetailedUserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [showBanForm, setShowBanForm] = useState(false)
  const { verifyUser } = useAdminActions()

  useEffect(() => {
    if (open) {
      fetchDetailedUser()
    }
  }, [open, user.user_id])

  const fetchDetailedUser = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.user_id)
        .maybeSingle()

      if (error) throw error

      setDetailedUser(data as DetailedUserProfile)
    } catch (error: any) {
      console.error('Error fetching user details:', error?.message || JSON.stringify(error))
      toast.error('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }, [user.user_id])

  const handleVerifyUser = async () => {
    try {
      await verifyUser(user.user_id)
      toast.success('User verified successfully')
      await fetchDetailedUser()
      onUserUpdated()
    } catch (error) {
      toast.error('Failed to verify user')
    }
  }

  const handleBanComplete = async () => {
    setShowBanForm(false)
    await fetchDetailedUser()
    onUserUpdated()
  }

  if (!detailedUser && loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogTitle className="sr-only">Loading user profile</DialogTitle>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!detailedUser) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile - {detailedUser.full_name}</DialogTitle>
          <DialogDescription>ID: {user.user_id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Photos */}
          {detailedUser.photos && detailedUser.photos.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {detailedUser.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Photo ${idx + 1}`}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Profile Info */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Profile Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="text-foreground font-medium">{detailedUser.full_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Join Date</p>
                <p className="text-foreground font-medium">
                  {formatDistanceToNow(new Date(detailedUser.created_at), { addSuffix: true })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="text-foreground font-medium">
                  {detailedUser.location || detailedUser.country || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    detailedUser.banned
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {detailedUser.banned ? 'Banned' : 'Active'}
                </span>
              </div>
              {detailedUser.bio && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Bio</p>
                  <p className="text-foreground">{detailedUser.bio}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Prompts */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Profile Responses</h3>
            <div className="space-y-3 text-sm">
              {detailedUser.prompt_1 && (
                <div>
                  <p className="text-muted-foreground">Prompt 1</p>
                  <p className="text-foreground">{detailedUser.prompt_1}</p>
                </div>
              )}
              {detailedUser.prompt_2 && (
                <div>
                  <p className="text-muted-foreground">Prompt 2</p>
                  <p className="text-foreground">{detailedUser.prompt_2}</p>
                </div>
              )}
              {detailedUser.prompt_3 && (
                <div>
                  <p className="text-muted-foreground">Prompt 3</p>
                  <p className="text-foreground">{detailedUser.prompt_3}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Ban Info */}
          {detailedUser.banned && (
            <Card className="p-4 border-red-200 bg-red-50">
              <h3 className="font-semibold text-red-900 mb-3">Ban Information</h3>
              <div className="space-y-2 text-sm text-red-900">
                <div>
                  <p className="text-muted-foreground">Reason</p>
                  <p>{detailedUser.ban_reason}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p>{detailedUser.ban_duration}</p>
                </div>
                {detailedUser.ban_date && (
                  <div>
                    <p className="text-muted-foreground">Banned Date</p>
                    <p>
                      {formatDistanceToNow(new Date(detailedUser.ban_date), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card className="p-4 bg-muted">
            <h3 className="font-semibold text-foreground mb-4">Admin Actions</h3>
            <div className="space-y-3">
              {!detailedUser.verified && !detailedUser.banned && (
                <Button onClick={handleVerifyUser} className="w-full bg-green-600 hover:bg-green-700">
                  Verify User
                </Button>
              )}
              {!showBanForm && !detailedUser.banned && (
                <Button
                  onClick={() => setShowBanForm(true)}
                  variant="destructive"
                  className="w-full"
                >
                  Ban User
                </Button>
              )}
              {showBanForm && <BanUserForm userId={user.user_id} onComplete={handleBanComplete} />}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
