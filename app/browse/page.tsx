'use client'

import React, { useState } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Heart, X, Star, Info } from 'lucide-react'

const profiles = [
  {
    id: 1,
    name: 'Sofia',
    age: 26,
    location: 'Barcelona, Spain',
    lookingFor: 'Someone who believes in true love',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
    bio: 'Artist, dreamer, and hopeless romantic. Love travel, wine, and long conversations.',
    interests: ['Art', 'Travel', 'Wine']
  },
  {
    id: 2,
    name: 'Isabella',
    age: 28,
    location: 'Madrid, Spain',
    lookingFor: 'A genuine connection',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
    bio: 'Professional woman looking for someone authentic. Coffee lover, weekend traveler.',
    interests: ['Coffee', 'Travel', 'Career']
  },
  {
    id: 3,
    name: 'Elena',
    age: 25,
    location: 'Buenos Aires, Argentina',
    lookingFor: 'My soulmate',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop',
    bio: 'Passionate about life, family-oriented, and seeking a long-term commitment.',
    interests: ['Family', 'Dancing', 'Cooking']
  },
  {
    id: 4,
    name: 'Lucia',
    age: 29,
    location: 'Mexico City, Mexico',
    lookingFor: 'True love and adventure',
    image: 'https://images.unsplash.com/photo-1534528741775-53a8682fde92?w=600&h=800&fit=crop',
    bio: 'Adventurous spirit, yoga enthusiast, always up for spontaneous trips.',
    interests: ['Yoga', 'Adventure', 'Travel']
  },
  {
    id: 5,
    name: 'Mariana',
    age: 27,
    location: 'Lisbon, Portugal',
    lookingFor: 'Someone kind and thoughtful',
    image: 'https://images.unsplash.com/photo-1506276590553-0c3688c8e6ca?w=600&h=800&fit=crop',
    bio: 'Teacher, book lover, and believer in destiny. Looking for my forever person.',
    interests: ['Reading', 'Teaching', 'Destiny']
  },
  {
    id: 6,
    name: 'Valentina',
    age: 26,
    location: 'Rio de Janeiro, Brazil',
    lookingFor: 'A partner for life',
    image: 'https://images.unsplash.com/photo-1502230917128-1aa500764cbd?w=600&h=800&fit=crop',
    bio: 'Free spirit, nature lover, passionate about helping others.',
    interests: ['Nature', 'Volunteering', 'Beach']
  },
  {
    id: 7,
    name: 'Catalina',
    age: 28,
    location: 'Santiago, Chile',
    lookingFor: 'Real connection and love',
    image: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=600&h=800&fit=crop',
    bio: 'Professional achiever seeking balance and meaningful relationships.',
    interests: ['Business', 'Balance', 'Wine']
  },
  {
    id: 8,
    name: 'Rosa',
    age: 25,
    location: 'Valencia, Spain',
    lookingFor: 'Someone who gets me',
    image: 'https://images.unsplash.com/photo-1488426862026-56bde9d879af?w=600&h=800&fit=crop',
    bio: 'Creative, empathetic, and searching for my soulmate.',
    interests: ['Art', 'Music', 'Poetry']
  },
  {
    id: 9,
    name: 'Gabriela',
    age: 27,
    location: 'São Paulo, Brazil',
    lookingFor: 'Forever love',
    image: 'https://images.unsplash.com/photo-1530268729831-4ca8167eac3f?w=600&h=800&fit=crop',
    bio: 'Determined, ambitious, and ready for the right relationship.',
    interests: ['Fitness', 'Career', 'Travel']
  },
  {
    id: 10,
    name: 'Alejandra',
    age: 26,
    location: 'Bogotá, Colombia',
    lookingFor: 'A true soulmate',
    image: 'https://images.unsplash.com/photo-1505252585461-04db1267ae5e?w=600&h=800&fit=crop',
    bio: 'Warm-hearted, genuine, and looking for lasting love.',
    interests: ['Cooking', 'Family', 'Music']
  },
  {
    id: 11,
    name: 'Manuela',
    age: 29,
    location: 'Lima, Peru',
    lookingFor: 'Someone special',
    image: 'https://images.unsplash.com/photo-1485521585311-56f3a5ff17b7?w=600&h=800&fit=crop',
    bio: 'Independent woman seeking partnership and mutual growth.',
    interests: ['Business', 'Growth', 'Travel']
  },
  {
    id: 12,
    name: 'Claudia',
    age: 25,
    location: 'Havana, Cuba',
    lookingFor: 'Everlasting love',
    image: 'https://images.unsplash.com/photo-1524634126442-357e0ebbffa4?w=600&h=800&fit=crop',
    bio: 'Joyful, optimistic, and ready to meet my match.',
    interests: ['Dancing', 'Music', 'Culture']
  },
]

export default function BrowsePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'super' | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const currentProfile = profiles[currentIndex]
  const hasMoreProfiles = currentIndex < profiles.length - 1

  const handleSwipe = (direction: 'left' | 'right' | 'super') => {
    setSwipeDirection(direction)
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
      setSwipeDirection(null)
      setShowInfo(false)
    }, 300)
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
    <main className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="relative h-[600px] mb-6">
            {/* Current Card */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transition-all cursor-grab active:cursor-grabbing"
              style={{
                transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
                opacity: opacity,
                transition: isDragging ? 'none' : 'all 0.3s ease-out',
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
                <img
                  src={currentProfile.image || "/placeholder.svg"}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
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
                            {currentProfile.name}, {currentProfile.age}
                          </h2>
                          <p className="text-white/90 text-lg">{currentProfile.location}</p>
                        </div>
                        <button
                          onClick={() => setShowInfo(true)}
                          className="w-12 h-12 bg-rose-700/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-rose-700 transition-colors"
                        >
                          <Info className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {currentProfile.interests.map((interest) => (
                          <span
                            key={interest}
                            className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-playfair font-bold">
                          {currentProfile.name}, {currentProfile.age}
                        </h2>
                        <button
                          onClick={() => setShowInfo(false)}
                          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-white/90 text-lg">{currentProfile.location}</p>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                        <p className="text-sm text-white/80 mb-2">Looking for</p>
                        <p className="text-lg">{currentProfile.lookingFor}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                        <p className="text-sm text-white/80 mb-2">About</p>
                        <p>{currentProfile.bio}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Next Card Preview */}
            {hasMoreProfiles && (
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl -z-10 scale-95 opacity-50">
                <img
                  src={profiles[currentIndex + 1].image || "/placeholder.svg"}
                  alt={profiles[currentIndex + 1].name}
                  className="w-full h-full object-cover"
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
    </main>
  )
}
