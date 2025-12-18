'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, Calendar, Loader, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MutualPreferencesBadges } from '@/components/mutual-preferences-badges'
import { useAuth } from '@/context/auth-context'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useBrowseProfiles } from '@/hooks/useBrowseProfiles'
import { toast } from 'sonner'
import type { ProfileData } from '@/hooks/useProfile'

interface UserProfileDetailProps {
  userId: string
  onBack?: () => void
  compact?: boolean
}

export function UserProfileDetail({ userId, onBack, compact = false }: UserProfileDetailProps) {
  const { user } = useAuth()
  const { userProfile, loading, mutualPreferences } = useUserProfile(userId)
  const { likeProfile, dislikeProfile } = useBrowseProfiles()
  const [isActing, setIsActing] = React.useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin w-8 h-8 text-rose-700" />
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Profile not found</p>
      </div>
    )
  }

  const profileImage = userProfile.photos?.[userProfile.main_photo_index || 0] || '/placeholder.svg'
  const userAge = userProfile.birthday
    ? new Date().getFullYear() - new Date(userProfile.birthday).getFullYear()
    : '?'

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like profiles')
      return
    }

    setIsActing(true)
    try {
      await likeProfile(userProfile.user_id, userProfile.id)
      toast.success('Liked! 💕')
    } catch (error: any) {
      toast.error(error.message || 'Failed to like profile')
    } finally {
      setIsActing(false)
    }
  }

  const handleDislike = async () => {
    if (!user) {
      toast.error('Please sign in')
      return
    }

    setIsActing(true)
    try {
      await dislikeProfile(userProfile.user_id)
      toast.success('Passed')
    } catch (error: any) {
      toast.error(error.message || 'Failed to pass')
    } finally {
      setIsActing(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl overflow-hidden ${!compact ? 'shadow-lg' : ''}`}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          {onBack ? (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full transition"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div />
          )}
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <div className="w-10" />
        </div>
      )}

      {/* Profile Images */}
      <div className="relative h-96 md:h-[500px] w-full bg-slate-200 overflow-hidden">
        <Image
          src={profileImage}
          alt={userProfile.full_name || 'User profile'}
          fill
          className="object-cover"
          priority
        />
        {userProfile.photos && userProfile.photos.length > 1 && (
          <div className="absolute bottom-4 left-4 right-4 flex gap-1">
            {userProfile.photos.slice(0, 4).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full ${
                  index === (userProfile.main_photo_index || 0)
                    ? 'bg-white'
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-4 md:p-6 space-y-4">
        {/* Name and Age */}
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-slate-900">
              {userProfile.full_name || 'User'}
            </h1>
            <span className="text-2xl md:text-3xl font-playfair text-slate-700">
              {userAge}
            </span>
          </div>

          {/* Location */}
          {userProfile.city && (
            <div className="flex items-center gap-2 text-slate-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span>
                {userProfile.city}
                {userProfile.country && `, ${userProfile.country}`}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Bio */}
        {userProfile.prompt_1 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">About</h3>
            <p className="text-slate-700 leading-relaxed">{userProfile.prompt_1}</p>
          </div>
        )}

        {/* Additional Prompts */}
        {userProfile.prompt_2 && (
          <div className="bg-rose-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">What they're looking for</p>
            <p className="text-slate-900">{userProfile.prompt_2}</p>
          </div>
        )}

        {/* Mutual Preferences */}
        {mutualPreferences.length > 0 && (
          <>
            <Separator />
            <MutualPreferencesBadges
              mutualPreferences={mutualPreferences}
              showLabel={true}
              maxBadges={10}
            />
          </>
        )}

        {/* Preferences */}
        {(userProfile.relationship_type ||
          userProfile.religion ||
          userProfile.wants_kids ||
          userProfile.smoking ||
          userProfile.drinking) && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {userProfile.relationship_type && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Looking for</p>
                    <p className="text-sm font-medium text-slate-900">
                      {userProfile.relationship_type}
                    </p>
                  </div>
                )}
                {userProfile.religion && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Religion</p>
                    <p className="text-sm font-medium text-slate-900">
                      {userProfile.religion}
                    </p>
                  </div>
                )}
                {userProfile.wants_kids && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Kids</p>
                    <p className="text-sm font-medium text-slate-900">
                      {userProfile.wants_kids}
                    </p>
                  </div>
                )}
                {userProfile.smoking && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Smoking</p>
                    <p className="text-sm font-medium text-slate-900">
                      {userProfile.smoking}
                    </p>
                  </div>
                )}
                {userProfile.drinking && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Drinking</p>
                    <p className="text-sm font-medium text-slate-900">
                      {userProfile.drinking}
                    </p>
                  </div>
                )}
                {userProfile.height_cm && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Height</p>
                    <p className="text-sm font-medium text-slate-900">
                      {userProfile.height_cm} cm
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        {!compact && (
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDislike}
              disabled={isActing}
              variant="outline"
              className="flex-1"
            >
              Pass
            </Button>
            <Button
              onClick={handleLike}
              disabled={isActing}
              className="flex-1 gap-2 bg-rose-700 hover:bg-rose-800"
            >
              <Heart className="w-4 h-4" />
              Like
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
