'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Bell } from 'lucide-react'

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleOneSignal = () => {
    if (typeof window !== 'undefined' && window.OneSignal) {
      window.OneSignal.push(function() {
        window.OneSignal.showSlidedownPrompt();
      });
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-playfair font-bold text-rose-600">
          ♥ Buscando Amor Eterno
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/" className="text-foreground hover:text-primary transition">Home</Link>
          <Link href="/browse" className="text-foreground hover:text-primary transition">Browse</Link>
          <Link href="/stories" className="text-foreground hover:text-primary transition">Stories</Link>
          <Link href="/pricing" className="text-foreground hover:text-primary transition">Pricing</Link>
          <Link href="/chat-room" className="text-foreground hover:text-primary transition">Lounge</Link>

          <button
            onClick={toggleOneSignal}
            className="p-2 hover:bg-rose-50 rounded-full transition"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-primary" />
          </button>

          <Link href="/login" className="px-4 py-2 text-foreground hover:text-primary transition">
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-rose-700 transition font-semibold"
          >
            Join for $12/month
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={toggleOneSignal}
            className="p-2 hover:bg-rose-50 rounded-full transition"
          >
            <Bell size={20} className="text-primary" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-rose-50 rounded-lg transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-rose-100 py-4 px-4 space-y-3">
          <Link href="/" className="block text-foreground hover:text-primary transition py-2">
            Home
          </Link>
          <Link href="/browse" className="block text-foreground hover:text-primary transition py-2">
            Browse
          </Link>
          <Link href="/stories" className="block text-foreground hover:text-primary transition py-2">
            Stories
          </Link>
          <Link href="/pricing" className="block text-foreground hover:text-primary transition py-2">
            Pricing
          </Link>
          <Link href="/chat-room" className="block text-foreground hover:text-primary transition py-2">
            Lounge
          </Link>
          <Link href="/login" className="block text-foreground hover:text-primary transition py-2">
            Log In
          </Link>
          <Link
            href="/signup"
            className="block px-6 py-2 bg-primary text-white rounded-full hover:bg-rose-700 transition font-semibold text-center"
          >
            Join for $12/month
          </Link>
        </div>
      )}
    </nav>
  )
}
