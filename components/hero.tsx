'use client'

import React from 'react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="pt-32 pb-16 px-4 relative overflow-hidden">
      {/* Video background placeholder */}
      <div className="absolute inset-0 -z-10">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1522252234503-8d0324a4f8e0?w=1200&h=600&fit=crop)',
            opacity: 0.2,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center pt-20">
        <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-6 text-slate-900 leading-tight">
          <span className="text-primary">Nearly 50%</span> of the world is single.
        </h1>
        <h2 className="text-2xl md:text-4xl font-playfair font-bold mb-8 text-rose-600">
          You deserve eternal love.
        </h2>

        <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Connect with genuine souls worldwide. Premium profiles, real conversations, and meaningful connections.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-primary text-white rounded-full text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow"
          >
            Join for $12/month
          </Link>
          <Link
            href="/browse"
            className="px-8 py-4 border-2 border-primary text-primary rounded-full text-lg font-semibold hover:bg-rose-50 transition"
          >
            Browse Members
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-primary mb-2">50M+</p>
            <p className="text-slate-600">Active Members</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary mb-2">1M+</p>
            <p className="text-slate-600">Matches Daily</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary mb-2">100+</p>
            <p className="text-slate-600">Countries</p>
          </div>
        </div>
      </div>
    </section>
  )
}
