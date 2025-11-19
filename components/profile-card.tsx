'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import Image from 'next/image'

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
      className="rounded-xl overflow-hidden cursor-pointer group relative soft-glow h-80 w-full"
      onClick={onViewProfile}
    >
      <Image
        src={profile.image || "/placeholder.svg"}
        alt={profile.name}
        fill
        className="object-cover group-hover:scale-110 transition duration-500"
        sizes="(max-width: 768px) 100vw, 33vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white text-xl font-bold">{profile.name}, {profile.age}</h3>
        <p className="text-rose-200 text-sm">{profile.location}</p>
      </div>

      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full group-hover:bg-primary group-hover:text-white transition z-10">
        <Heart size={20} className="text-primary group-hover:text-white" />
      </div>
    </div>
  )
}
