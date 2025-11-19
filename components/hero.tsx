'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="pt-32 pb-16 px-4 relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Video background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-rose-50/90 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/romantic-couple-sunset-beach-luxury.jpg"
        >
          <source
            src="https://cdn.pixabay.com/video/2022/11/23/140115-774468479_large.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-20">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold mb-8 text-slate-900 leading-tight tracking-tight">
          <span className="text-primary relative inline-block">
            Nearly 50%
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-rose-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span> of the world is single.
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
