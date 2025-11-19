'use client'

import React from 'react'
import { Heart, MessageCircle, Video, Users, Lock, Zap } from 'lucide-react'

const features = [
  {
    icon: Heart,
    title: 'Smart Matching',
    description: 'AI-powered algorithm finds your perfect match based on values and interests',
  },
  {
    icon: MessageCircle,
    title: 'Real Conversations',
    description: 'Unlimited messaging with verified members in our secure platform',
  },
  {
    icon: Video,
    title: 'Video Dates',
    description: 'Connect face-to-face before meeting in person. Feel the real connection.',
  },
  {
    icon: Users,
    title: 'Global Community',
    description: 'Meet soulmates from 100+ countries. Love knows no borders.',
  },
  {
    icon: Lock,
    title: 'Verified Profiles',
    description: 'All members are verified. Your safety is our priority.',
  },
  {
    icon: Zap,
    title: 'Instant Notifications',
    description: 'Never miss a match. Get real-time notifications of new connections.',
  },
]

export default function Features() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-center mb-4 text-slate-900">
          Everything You Need
        </h2>
        <p className="text-center text-slate-600 mb-12 text-lg">
          Premium features designed for serious relationships
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
