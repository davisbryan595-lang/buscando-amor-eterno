'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="pt-32 pb-16 px-4 relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background image */}
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
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-rose-50/85 z-10" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-20">
        <div className="flex justify-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/30 via-rose-300/20 to-rose-200/10 rounded-full blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-full p-6 backdrop-blur-sm border border-rose-200/40 shadow-2xl">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F5517f718aa7348e88214250292563028%2F09ca0588ac3741678f0d49e142dede0b?format=webp&width=800"
                alt="Buscando Amor Eterno Logo"
                className="h-32 w-32 object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
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
