'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, Calendar, Loader, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MutualPreferencesBadges } from '@/components/mutual-preferences-badges'
import { ReportUserButton } from '@/components/report-user-button'
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
        <p className="text-muted-foreground">Profile not found</p>
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
    <div className={`bg-card rounded-none md:rounded-2xl overflow-hidden ${!compact ? 'md:shadow-lg' : ''}`}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-border">
          {onBack ? (
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 hover:bg-card-hover rounded-full transition flex-shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 sm:w-10" />
          )}
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Profile</h2>
          <div className="w-8 sm:w-10" />
        </div>
      )}

      {/* Profile Images */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full bg-card-subtle overflow-hidden">
        <Image
          src={profileImage}
          alt={userProfile.full_name || 'User profile'}
          fill
          className="object-cover"
          priority
        />
        {userProfile.photos && userProfile.photos.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex gap-1">
            {userProfile.photos.slice(0, 4).map((_, index) => (
              <div
                key={index}
                className={`h-1 sm:h-1.5 flex-1 rounded-full ${
                  index === (userProfile.main_photo_index || 0)
                    ? 'bg-white dark:bg-slate-300'
                    : 'bg-white/60 dark:bg-slate-300/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-3 sm:p-4 md:p-6 space-y-3 md:space-y-4">
        {/* Name and Age */}
        <div>
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground">
              {userProfile.full_name || 'User'}
            </h1>
            <span className="text-xl sm:text-2xl md:text-3xl font-playfair text-muted-foreground">
              {userAge}
            </span>
          </div>

          {/* Location */}
          {userProfile.city && (
            <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground mb-3 flex-wrap">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm sm:text-base">
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
            <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">About</h3>
            <p className="text-sm md:text-base text-foreground dark:text-slate-200 leading-relaxed">{userProfile.prompt_1}</p>
          </div>
        )}

        {/* Additional Prompts */}
        {userProfile.prompt_2 && (
          <div className="bg-card-subtle dark:bg-rose-900/30 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">What they're looking for</p>
            <p className="text-sm md:text-base text-foreground">{userProfile.prompt_2}</p>
          </div>
        )}
        {userProfile.prompt_3 && (
          <div className="bg-card-subtle dark:bg-rose-900/30 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Interests</p>
            <p className="text-sm md:text-base text-foreground">{userProfile.prompt_3}</p>
          </div>
        )}
        {userProfile.prompt_4 && (
          <div className="bg-card-subtle dark:bg-rose-900/30 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">A perfect weekend</p>
            <p className="text-sm md:text-base text-foreground">{userProfile.prompt_4}</p>
          </div>
        )}
        {userProfile.prompt_5 && (
          <div className="bg-card-subtle dark:bg-rose-900/30 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Fun fact</p>
            <p className="text-sm md:text-base text-foreground">{userProfile.prompt_5}</p>
          </div>
        )}
        {userProfile.prompt_6 && (
          <div className="bg-card-subtle dark:bg-rose-900/30 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Looking for</p>
            <p className="text-sm md:text-base text-foreground">{userProfile.prompt_6}</p>
          </div>
        )}

        {/* Mutual Preferences */}
        {mutualPreferences.length > 0 && (
          <>
            <Separator />
            <div className="text-sm md:text-base">
              <MutualPreferencesBadges
                mutualPreferences={mutualPreferences}
                showLabel={true}
                maxBadges={10}
              />
            </div>
          </>
        )}

        {/* Preferences Section */}
        {(userProfile.relationship_type ||
          userProfile.religion ||
          userProfile.wants_kids ||
          userProfile.smoking ||
          userProfile.drinking ||
          userProfile.love_language ||
          userProfile.height_cm ||
          userProfile.age_range_min ||
          userProfile.age_range_max ||
          userProfile.distance_radius) && (
          <>
            <Separator />
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
                Their Preferences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {userProfile.relationship_type && (
                  <div className="bg-card-subtle dark:bg-surface rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Looking for</p>
                    <p className="text-sm md:text-base font-medium text-foreground break-words">
                      {userProfile.relationship_type}
                    </p>
                  </div>
                )}
                {userProfile.religion && (
                  <div className="bg-card-subtle dark:bg-surface rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Religion</p>
                    <p className="text-sm md:text-base font-medium text-foreground break-words">
                      {userProfile.religion}
                    </p>
                  </div>
                )}
                {userProfile.wants_kids && (
                  <div className="bg-card-subtle dark:bg-surface rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Kids</p>
                    <p className="text-sm md:text-base font-medium text-foreground break-words">
                      {userProfile.wants_kids}
                    </p>
                  </div>
                )}
                {userProfile.smoking && (
                  <div className="bg-card-subtle dark:bg-surface rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Smoking</p>
                    <p className="text-sm md:text-base font-medium text-foreground break-words">
                      {userProfile.smoking}
                    </p>
                  </div>
                )}
                {userProfile.drinking && (
                  <div className="bg-card-subtle dark:bg-surface rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Drinking</p>
                    <p className="text-sm md:text-base font-medium text-foreground break-words">
                      {userProfile.drinking}
                    </p>
                  </div>
                )}
                {userProfile.love_language && (
                  <div className="bg-card-subtle dark:bg-surface rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Love Language</p>
                    <p className="text-sm md:text-base font-medium text-foreground break-words">
                      {userProfile.love_language}
                    </p>
                  </div>
                )}
                {userProfile.height_cm && userProfile.height_cm > 0 && (
                  <div className="bg-card-subtle dark:bg-surface rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Height</p>
                    <p className="text-sm md:text-base font-medium text-foreground">
                      {userProfile.height_cm} cm
                    </p>
                  </div>
                )}
                {userProfile.age_range_min && userProfile.age_range_max && (
                  <div className="bg-card-subtle dark:bg-surface rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Age Range</p>
                    <p className="text-sm md:text-base font-medium text-foreground">
                      {userProfile.age_range_min} - {userProfile.age_range_max}
                    </p>
                  </div>
                )}
                {userProfile.distance_radius && (
                  <div className="bg-card-subtle dark:bg-surface rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Distance Radius</p>
                    <p className="text-sm md:text-base font-medium text-foreground">
                      {userProfile.distance_radius} km
                    </p>
                  </div>
                )}
              </div>

              {/* Dealbreakers */}
              {userProfile.dealbreakers && userProfile.dealbreakers.length > 0 && (
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50">
                  <p className="text-xs md:text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                    Dealbreakers ⚠️
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.dealbreakers.map((dealbreaker) => (
                      <span
                        key={dealbreaker}
                        className="inline-block bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200 text-xs md:text-sm px-2.5 md:px-3 py-1 md:py-1.5 rounded-full font-medium"
                      >
                        {dealbreaker.charAt(0).toUpperCase() +
                          dealbreaker.slice(1).replace(/([A-Z])/g, ' $1')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        {!compact && (
          <div className="flex gap-2 sm:gap-3 pt-4 mt-4">
            <Button
              onClick={handleDislike}
              disabled={isActing}
              variant="outline"
              className="flex-1 text-sm md:text-base py-2 md:py-3"
            >
              Pass
            </Button>
            <Button
              onClick={handleLike}
              disabled={isActing}
              className="flex-1 gap-2 bg-rose-700 hover:bg-rose-800 text-sm md:text-base py-2 md:py-3"
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
