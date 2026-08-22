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

export function getAdminAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem(ADMIN_SESSION_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedSession = localStorage.getItem(ADMIN_SESSION_KEY)
        if (savedSession) {
          const response = await fetch('/api/admin/session', {
            headers: { Authorization: `Bearer ${savedSession}` },
          })
          if (!response.ok) throw new Error('Admin session expired')
          const { email } = await response.json()
          setAdminEmail(email)
          setIsAdminAuthenticated(true)
        }
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  const adminLogin = async (email: string, accessCode: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accessCode }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Invalid email or access code')

      localStorage.setItem(ADMIN_SESSION_KEY, data.token)
      setAdminEmail(data.email)
      setIsAdminAuthenticated(true)
    } catch (error) {
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
