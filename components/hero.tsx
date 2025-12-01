'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="pt-32 pb-16 px-4 relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background image with rose logo overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/couple-laughing-park-happy.jpg"
            alt="Happy couple"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Rose logo as background accent */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <svg className="h-96 w-96 text-rose-400" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 C 50 10 60 20 60 30 C 60 40 55 45 50 45 C 45 45 40 40 40 30 C 40 20 50 10 50 10 M 45 45 C 40 50 35 60 35 70 C 35 80 40 85 50 85 C 60 85 65 80 65 70 C 65 60 60 50 55 45 M 30 60 C 25 65 20 70 20 75 C 20 80 25 85 30 85 M 70 60 C 75 65 80 70 80 75 C 80 80 75 85 70 85" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* Rose-tinted gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-rose-50/40 to-rose-100/70 z-10" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-20">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold mb-8 text-slate-900 leading-tight tracking-tight">
          <span className="text-primary relative inline-block">
            Buscando Amor
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-rose-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span> Eterno
        </h1>
        <h2 className="text-2xl md:text-4xl font-playfair font-bold mb-8 text-rose-600">
          Find Your Soulmate
        </h2>

        <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Nearly 50% of the world is single. You deserve eternal love. Join our premium soulmate dating platform with profiles, messaging, and video chat.
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
            Browse Profiles
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-primary mb-2">50M+</p>
            <p className="text-slate-600">Members Worldwide</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary mb-2">1M+</p>
            <p className="text-slate-600">Matches Made</p>
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
