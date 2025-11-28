'use client'

import React from 'react'
import { Heart, MessageCircle, Video, Users, Lock, Zap } from 'lucide-react'

const features = [
  {
    icon: Heart,
    title: 'Smart Matching',
    description: 'Our algorithm finds compatible partners based on your values and interests.',
  },
  {
    icon: MessageCircle,
    title: 'Real Conversations',
    description: 'Chat with matches instantly and build meaningful connections.',
  },
  {
    icon: Video,
    title: 'Video Dates',
    description: 'Meet face-to-face virtually before deciding to meet in person.',
  },
  {
    icon: Users,
    title: 'Global Community',
    description: 'Connect with singles from over 100 countries worldwide.',
  },
  {
    icon: Lock,
    title: 'Verified Profiles',
    description: 'All members are verified to ensure authenticity and safety.',
  },
  {
    icon: Zap,
    title: 'Instant Notifications',
    description: 'Never miss a message with real-time notifications.',
  },
]

export default function Features() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-center mb-4 text-slate-900">
          Why Choose Buscando Amor Eterno
        </h2>
        <p className="text-center text-slate-600 mb-12 text-lg">
          The platform designed to help you find your soulmate
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-8 rounded-xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 hover:soft-glow transition"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
