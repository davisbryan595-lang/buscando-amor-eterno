'use client'

import React from 'react'
import { Heart } from 'lucide-react'

interface Profile {
  id: number
  name: string
  age: number
  location: string
  lookingFor: string
  image: string
}

export default function ProfileCard({
  profile,
  onViewProfile,
}: {
  profile: Profile
  onViewProfile: () => void
}) {
  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer group relative soft-glow"
      onClick={onViewProfile}
    >
      <img
        src={profile.image || "/placeholder.svg"}
        alt={profile.name}
        className="w-full h-80 object-cover group-hover:scale-110 transition duration-300"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white text-xl font-bold">{profile.name}, {profile.age}</h3>
        <p className="text-rose-200 text-sm">{profile.location}</p>
      </div>

      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full group-hover:bg-primary group-hover:text-white transition">
        <Heart size={20} className="text-primary group-hover:text-white" />
      </div>
    </div>
  )
}
