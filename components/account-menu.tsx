'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import {
  Menu,
  X,
  User,
  Lock,
  Settings,
  Palette,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

export function AccountMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration issues
  if (!isMounted || !user) return null

  const handleSignOut = async () => {
    try {
      await signOut()
      setMenuOpen(false)
      router.push('/login')
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 hover:bg-rose-50 rounded-full transition flex items-center gap-2"
        aria-label="Account menu"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-rose-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user.email?.[0].toUpperCase() || 'U'}
        </div>
        <ChevronDown size={18} className="text-primary" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-rose-100 rounded-xl shadow-lg z-50">
          <div className="p-4 border-b border-rose-100">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.email}
            </p>
          </div>

          <div className="py-2">
            {/* Account Details */}
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Account
            </div>
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 transition text-foreground text-sm"
            >
              <User size={18} className="text-primary" />
              Account Details
            </Link>

            {/* Security */}
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
              Security
            </div>
            <Link
              href="/settings/security"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 transition text-foreground text-sm"
            >
              <Lock size={18} className="text-primary" />
              Change Password
            </Link>

            {/* Customization */}
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
              Customization
            </div>
            <Link
              href="/settings/customization"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 transition text-foreground text-sm"
            >
              <Palette size={18} className="text-primary" />
              Theme & Display
            </Link>

            {/* Settings */}
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
              Settings
            </div>
            <Link
              href="/settings/preferences"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 transition text-foreground text-sm"
            >
              <Settings size={18} className="text-primary" />
              Preferences
            </Link>

            {/* Sign Out */}
            <div className="border-t border-rose-100 mt-2 pt-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 transition text-destructive text-sm"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
