'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface AdminAuthContextType {
  adminEmail: string | null
  isAdminAuthenticated: boolean
  loading: boolean
  adminLogin: (email: string, accessCode: string) => Promise<void>
  adminLogout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const ADMIN_SESSION_KEY = 'admin_session'

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(ADMIN_SESSION_KEY)
      if (savedSession) {
        const { email, timestamp } = JSON.parse(savedSession)
        // Optional: add session expiry check here if needed
        setAdminEmail(email)
        setIsAdminAuthenticated(true)
      }
    } catch (error) {
      console.error('Error restoring admin session:', error)
      localStorage.removeItem(ADMIN_SESSION_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const adminLogin = async (email: string, accessCode: string) => {
    try {
      setLoading(true)

      // Get admin credentials from environment variables
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
      const adminAccessCode = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE || ''

      // Debug logging
      console.log('[Admin Auth] Email input:', email)
      console.log('[Admin Auth] Access code input:', accessCode ? '***' : '(empty)')
      console.log('[Admin Auth] Valid admin emails:', adminEmails.length > 0 ? adminEmails : '(NOT SET - check env vars)')
      console.log('[Admin Auth] Access code configured:', adminAccessCode ? 'yes' : 'NO (check env vars)')

      // Validate email and access code
      const isValidEmail = adminEmails.includes(email)
      const isValidCode = accessCode === adminAccessCode

      if (!isValidEmail || !isValidCode) {
        if (!isValidEmail) console.log('[Admin Auth] Invalid email. Valid emails:', adminEmails)
        if (!isValidCode) console.log('[Admin Auth] Invalid access code.')
        throw new Error('Invalid email or access code')
      }

      // Save admin session to localStorage
      localStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify({
          email,
          timestamp: Date.now(),
        })
      )

      setAdminEmail(email)
      setIsAdminAuthenticated(true)
    } catch (error) {
      console.error('Admin login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY)
    setAdminEmail(null)
    setIsAdminAuthenticated(false)
  }

  return (
    <AdminAuthContext.Provider value={{ adminEmail, isAdminAuthenticated, loading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
