'use client'

import React, { useState } from 'react'
import { X, Heart, MessageCircle, Video } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Profile {
  id: number
  name: string
  age: number
  location: string
  lookingFor: string
  image: string
  bio: string
}

export default function ProfileModal({
  profile,
  onClose,
}: {
  profile: Profile
  onClose: () => void
}) {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto soft-glow-lg animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-card z-20">
          <h2 className="text-2xl font-playfair font-bold text-foreground">
            {profile.name}, {profile.age}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-card-hover rounded-full transition"
            aria-label="Close"
          >
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        {/* Image */}
        <div className="relative w-full h-96">
          <Image
            src={profile.image || "/placeholder.svg"}
            alt={profile.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground"><strong>Location:</strong> {profile.location}</p>
            <p className="text-muted-foreground"><strong>Looking For:</strong> {profile.lookingFor}</p>
          </div>

          <div>
            <p className="text-foreground text-lg leading-relaxed">{profile.bio}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`py-3 rounded-full font-semibold transition ${
                isLiked
                  ? 'bg-primary text-white'
                  : 'bg-rose-100 text-primary hover:bg-rose-200'
              }`}
            >
              <Heart size={20} className="mx-auto" fill={isLiked ? 'white' : 'none'} />
            </button>

            <Link
              href="/messages"
              className="py-3 rounded-full font-semibold bg-card-subtle text-foreground hover:bg-card-hover transition flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
            </Link>

            <button
              disabled
              title="Video calls available from messages"
              className="py-3 rounded-full font-semibold bg-card-subtle text-muted-foreground cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Video size={20} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 border-2 border-border rounded-full font-semibold text-foreground hover:border-primary hover:text-primary transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
