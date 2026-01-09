'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/context/auth-context'
import { useProfileProtection } from '@/hooks/useProfileProtection'
import { useBrowseProfiles } from '@/hooks/useBrowseProfiles'
import { useSubscription } from '@/hooks/useSubscription'
import { useProfile } from '@/hooks/useProfile'
import { useNotifications } from '@/hooks/useNotifications'
import { useUserProfile } from '@/hooks/useUserProfile'
import { MutualPreferencesBadges } from '@/components/mutual-preferences-badges'
import { Heart, X, Star, Info, Loader, AlertCircle, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

export default function BrowsePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  // Protect this route - require complete profile
  const { isLoading } = useProfileProtection(true, '/onboarding')
  const { profiles, loading: profilesLoading, error: profilesError, likeProfile, dislikeProfile, superLikeProfile } = useBrowseProfiles()
  const { isPremium, loading: subLoading } = useSubscription()
  const { profile } = useProfile()
  const { notifications, dismissNotification } = useNotifications()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'super' | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isActing, setIsActing] = useState(false)

  const currentProfile = profiles[currentIndex]
  const { mutualPreferences, loading: profileLoading } = useUserProfile(
    currentProfile?.user_id || null
  )

  if (authLoading || isLoading || profilesLoading) {
    return (
      <main className="h-screen bg-background text-foreground flex items-center justify-center">
        <Loader className="animate-spin" size={40} />
      </main>
    )
  }

  // Check if user is logged in
  if (!user) {
    return (
      <main className="h-screen bg-background text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Heart className="w-20 h-20 text-rose-300 mx-auto mb-6" />
            <h1 className="text-3xl font-playfair font-bold text-foreground mb-4">
              Sign In to Browse
            </h1>
            <p className="text-muted-foreground mb-8">
              Log in to start discovering amazing profiles and find your soulmate.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="px-8 py-3 bg-rose-700 text-white rounded-full font-semibold hover:bg-rose-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-8 py-3 bg-card text-rose-700 border-2 border-rose-700 rounded-full font-semibold hover:bg-card-hover transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (profilesError) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-rose-400 mx-auto mb-6" />
            <h1 className="text-2xl font-playfair font-bold text-foreground mb-2">
              Unable to Load Profiles
            </h1>
            <p className="text-muted-foreground mb-6">{profilesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-rose-700 text-white rounded-full hover:bg-rose-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const hasMoreProfiles = currentIndex < profiles.length - 1

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (!currentProfile || isActing) return

    setIsActing(true)
    let actionSucceeded = false
    try {
      if (direction === 'left') {
        await dislikeProfile(currentProfile.user_id)
        actionSucceeded = true
      } else if (direction === 'right' || direction === 'super') {
        await likeProfile(currentProfile.user_id, currentProfile.id)
        actionSucceeded = true
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err)
      console.error('Error swiping:', errorMessage)
      toast.error(errorMessage || 'Error liking profile')
    }

    // Animate and move to next profile if action succeeded
    if (actionSucceeded) {
      setSwipeDirection(direction === 'left' ? 'left' : direction === 'right' ? 'right' : 'super')
      setTimeout(() => {
        if (currentIndex < profiles.length - 1) {
          setCurrentIndex(currentIndex + 1)
        }
        setSwipeDirection(null)
        setShowInfo(false)
        setIsActing(false)
      }, 300)
    } else {
      setIsActing(false)
    }
  }

  const handleDragStart = (clientX: number) => {
    setIsDragging(true)
  }

  const handleDragMove = (clientX: number, startX: number) => {
    if (!isDragging) return
    const offset = clientX - startX
    setDragOffset(offset)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    if (Math.abs(dragOffset) > 100) {
      handleSwipe(dragOffset > 0 ? 'right' : 'left')
    }
    setDragOffset(0)
  }

  if (!currentProfile) {
    return (
      <main className="h-screen bg-background text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Heart className="w-20 h-20 text-rose-300 mx-auto mb-6" />
            <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-4">
              No New Profiles Yet
            </h1>
            <p className="text-slate-600 mb-8">
              You've reviewed all available profiles that match your preferences. We'll notify you when someone suitable appears!
            </p>
            <Link
              href="/messages"
              className="inline-block px-8 py-3 bg-rose-700 text-white rounded-full font-semibold hover:bg-rose-800 transition-colors"
            >
              View Messages
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const rotation = isDragging ? dragOffset / 20 : swipeDirection === 'left' ? -20 : swipeDirection === 'right' ? 20 : 0
  const translateX = isDragging ? dragOffset : swipeDirection === 'left' ? -500 : swipeDirection === 'right' ? 500 : 0
  const opacity = isDragging ? Math.max(0.5, 1 - Math.abs(dragOffset) / 200) : swipeDirection ? 0 : 1

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 overflow-hidden">
      <Navigation />

      {/* Profile Incomplete Warning Banner */}
      {profile && !profile.profile_complete && (
        <div className="bg-amber-50 border-b-2 border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">Your profile is hidden</p>
                <p className="text-sm text-amber-700">Complete your profile setup to become visible to other members</p>
              </div>
            </div>
            <Link
              href="/onboarding"
              className="px-4 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition whitespace-nowrap text-sm"
            >
              Complete Setup
            </Link>
          </div>
        </div>
      )}

      <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-[90vh]">
        <div className="w-full max-w-md relative">
          {/* Card Container */}
          <div className="relative h-[65vh] min-h-[500px] mb-8">
            {/* Current Card */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transition-all cursor-grab active:cursor-grabbing bg-white"
              style={{
                transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
                opacity: opacity,
                transition: isDragging ? 'none' : 'all 0.3s ease-out',
                zIndex: 10
              }}
              onMouseDown={(e) => {
                const startX = e.clientX
                handleDragStart(startX)
                const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, startX)
                const handleMouseUp = () => {
                  handleDragEnd()
                  document.removeEventListener('mousemove', handleMouseMove)
                  document.removeEventListener('mouseup', handleMouseUp)
                }
                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX
                handleDragStart(startX)
                const handleTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX, startX)
                const handleTouchEnd = () => {
                  handleDragEnd()
                  document.removeEventListener('touchmove', handleTouchMove)
                  document.removeEventListener('touchend', handleTouchEnd)
                }
                document.addEventListener('touchmove', handleTouchMove)
                document.addEventListener('touchend', handleTouchEnd)
              }}
            >
              {/* Profile Image */}
              <div className="relative h-full w-full">
                <Image
                  src={currentProfile.photos?.[currentProfile.main_photo_index || 0] || "/placeholder.svg"}
                  alt={currentProfile.full_name || 'User'}
                  fill
                  className="object-cover pointer-events-none"
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* NOPE/LIKE Overlays */}
                {dragOffset < -50 && (
                  <div className="absolute top-12 right-12 transform rotate-12">
                    <div className="px-6 py-3 border-4 border-rose-700 rounded-2xl">
                      <span className="text-rose-700 text-4xl font-bold">NOPE</span>
                    </div>
                  </div>
                )}
                {dragOffset > 50 && (
                  <div className="absolute top-12 left-12 transform -rotate-12">
                    <div className="px-6 py-3 border-4 border-green-500 rounded-2xl">
                      <span className="text-green-500 text-4xl font-bold">LIKE</span>
                    </div>
                  </div>
                )}

                {/* Profile Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
                  {!showInfo ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold mb-1 line-clamp-1">
                            {currentProfile.full_name || 'User'}, {currentProfile.birthday ? new Date().getFullYear() - new Date(currentProfile.birthday).getFullYear() : '?'}
                          </h2>
                          <p className="text-white/90 text-base sm:text-lg line-clamp-1">{currentProfile.city || 'Location not set'}</p>
                        </div>
                        <button
                          onClick={() => setShowInfo(true)}
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-700/80 hover:bg-rose-700 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <Info className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto px-0 sm:px-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-2xl sm:text-3xl font-playfair font-bold line-clamp-2">
                          {currentProfile.full_name || 'User'}, {currentProfile.birthday ? new Date().getFullYear() - new Date(currentProfile.birthday).getFullYear() : '?'}
                        </h2>
                        <button
                          onClick={() => setShowInfo(false)}
                          className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                      <p className="text-white/90 text-base sm:text-lg line-clamp-1">{currentProfile.city || 'Location not set'}</p>
                      {currentProfile.prompt_1 && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-white/80 mb-2">About</p>
                          <p className="text-sm sm:text-base line-clamp-4">{currentProfile.prompt_1}</p>
                        </div>
                      )}
                      {mutualPreferences.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-sm">
                          <MutualPreferencesBadges
                            mutualPreferences={mutualPreferences}
                            showLabel={true}
                            maxBadges={4}
                          />
                        </div>
                      )}
                      <button
                        onClick={() => router.push(`/profile/${currentProfile.user_id}`)}
                        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-2 sm:p-3 text-white font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Full Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Next Card Preview */}
            {hasMoreProfiles && (
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl -z-10 scale-95 translate-y-4 opacity-60 bg-white">
                <Image
                  src={profiles[currentIndex + 1].photos?.[profiles[currentIndex + 1].main_photo_index || 0] || "/placeholder.svg"}
                  alt={profiles[currentIndex + 1].full_name || 'User'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => handleSwipe('left')}
              disabled={isActing}
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Pass"
            >
              <X className="w-8 h-8 text-rose-700" />
            </button>

            <button
              onClick={() => handleSwipe('super')}
              disabled={isActing}
              className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Super Like"
            >
              <Star className="w-6 h-6 text-blue-500 fill-blue-500" />
            </button>

            <button
              onClick={() => handleSwipe('right')}
              disabled={isActing}
              className="w-16 h-16 bg-rose-700 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Like"
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 text-center text-slate-600">
            {currentIndex + 1} / {profiles.length}
          </div>
        </div>
      </div>

      <Footer />


    </main>
  )
}
