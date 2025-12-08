'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useProfileProtection } from '@/hooks/useProfileProtection'
import { useBrowseProfiles } from '@/hooks/useBrowseProfiles'
import { useSubscription } from '@/hooks/useSubscription'
import { useProfile } from '@/hooks/useProfile'
import { Heart, X, Star, Info, Loader, Lock, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

export default function BrowsePage() {
  // Protect this route - require complete profile
  const { isLoading } = useProfileProtection(true, '/onboarding')
  const { profiles, loading: profilesLoading, likeProfile, dislikeProfile, superLikeProfile } = useBrowseProfiles()
  const { isPremium, loading: subLoading } = useSubscription()
  const { profile } = useProfile()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'super' | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  if (isLoading || profilesLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={40} />
      </main>
    )
  }

  const currentProfile = profiles[currentIndex]
  const hasMoreProfiles = currentIndex < profiles.length - 1

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (!currentProfile) return

    // Check if trying to like without premium
    if ((direction === 'right' || direction === 'super') && !isPremium) {
      setShowPaywall(true)
      return
    }

    let actionSucceeded = false
    try {
      if (direction === 'left') {
        await dislikeProfile(currentProfile.user_id)
        actionSucceeded = true
      } else if (direction === 'right' || direction === 'super') {
        await likeProfile(currentProfile.user_id)
        actionSucceeded = true
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err)
      console.error('Error swiping:', errorMessage)
      if (errorMessage?.includes('Premium subscription required')) {
        setShowPaywall(true)
      } else {
        toast.error(errorMessage || 'Error liking profile')
      }
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
      }, 300)
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
      <main className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
        <Navigation />
        <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Heart className="w-20 h-20 text-rose-300 mx-auto mb-6" />
            <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-2">
              No More Profiles
            </h1>
            <p className="text-slate-600 mb-6">
              Check back later for new members
            </p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="px-8 py-3 bg-rose-700 text-white rounded-full hover:bg-rose-800 transition-colors"
            >
              Start Over
            </button>
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
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  {!showInfo ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className="text-4xl font-playfair font-bold mb-1">
                            {currentProfile.full_name || 'User'}, {currentProfile.age || '?'}
                          </h2>
                          <p className="text-white/90 text-lg">{currentProfile.city || 'Location not set'}</p>
                        </div>
                        <button
                          onClick={() => setShowInfo(true)}
                          className="w-12 h-12 bg-rose-700/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-rose-700 transition-colors"
                        >
                          <Info className="w-6 h-6" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-playfair font-bold">
                          {currentProfile.full_name || 'User'}, {currentProfile.age || '?'}
                        </h2>
                        <button
                          onClick={() => setShowInfo(false)}
                          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-white/90 text-lg">{currentProfile.city || 'Location not set'}</p>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                        <p className="text-sm text-white/80 mb-2">About</p>
                        <p>{currentProfile.bio || 'No bio yet'}</p>
                      </div>
                      {currentProfile.prompt_1 && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <p className="text-sm text-white/80 mb-2">Interests</p>
                          <p>{currentProfile.prompt_1}</p>
                        </div>
                      )}
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
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
              aria-label="Pass"
            >
              <X className="w-8 h-8 text-rose-700" />
            </button>
            
            <button
              onClick={() => handleSwipe('super')}
              className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
              aria-label="Super Like"
            >
              <Star className="w-6 h-6 text-blue-500 fill-blue-500" />
            </button>
            
            <button
              onClick={() => handleSwipe('right')}
              className="w-16 h-16 bg-rose-700 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
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

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-2">
                Unlock Liking
              </h2>
              <p className="text-slate-600">
                Upgrade to premium to like and connect with profiles.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-rose-50 border-2 border-primary rounded-2xl p-4">
              <p className="text-4xl font-playfair font-bold text-primary mb-2">
                $12<span className="text-sm text-slate-600">/mo</span>
              </p>
              <ul className="space-y-2 text-slate-700 mb-4 text-sm">
                <li className="flex items-center gap-2">
                  ✓ Unlimited likes
                </li>
                <li className="flex items-center gap-2">
                  ✓ Send messages
                </li>
                <li className="flex items-center gap-2">
                  ✓ See who liked you
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link
                href="/pricing"
                className="block py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition text-center"
              >
                Upgrade to Premium
              </Link>

              <button
                onClick={() => setShowPaywall(false)}
                className="w-full py-3 border-2 border-slate-300 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
