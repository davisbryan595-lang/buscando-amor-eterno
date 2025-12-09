'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: any | null
  session: any | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session: sessionData }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (isMounted) {
          setSession(sessionData)
          setUser(sessionData?.user ?? null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (isMounted) {
          setSession(null)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sessionData) => {
      if (isMounted) {
        setSession(sessionData)
        setUser(sessionData?.user ?? null)

        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && sessionData?.user) {
          try {
            const { data: existingUser, error: checkError } = await supabase
              .from('users')
              .select('id')
              .eq('id', sessionData.user.id)
              .maybeSingle()

            if (checkError && checkError.code !== 'PGRST116') {
              throw checkError
            }

            if (!existingUser) {
              const { error: userError } = await supabase.from('users').insert({
                id: sessionData.user.id,
                email: sessionData.user.email || '',
              })

              if (userError && userError.code !== 'PGRST103') throw userError

              const { error: subError } = await supabase.from('subscriptions').insert({
                user_id: sessionData.user.id,
                plan: 'free',
                status: 'active',
              })

              if (subError && subError.code !== 'PGRST103') throw subError
            }
          } catch (err) {
            console.error('Error creating user profile:', err instanceof Error ? err.message : JSON.stringify(err))
          }
        }
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error

    // Create user record and free subscription in database
    if (data.user) {
      try {
        // Create user record with upsert to avoid conflicts
        const { error: userError } = await supabase.from('users').upsert({
          id: data.user.id,
          email: email,
        })

        if (userError) {
          console.error('Error creating user profile:', userError.message || JSON.stringify(userError))
          throw userError
        }

        // Create free subscription with upsert to avoid conflicts
        const { error: subError } = await supabase.from('subscriptions').upsert({
          user_id: data.user.id,
          plan: 'free',
          status: 'active',
        })

        if (subError) {
          console.error('Error creating subscription:', subError)
          throw subError
        }
      } catch (err) {
        console.error('Error in user setup:', err)
        throw err
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw error
      setSession(null)
      setUser(null)
    } catch (err) {
      console.error('Error signing out:', err)
      setSession(null)
      setUser(null)
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/onboarding`,
      },
    })
    if (error) throw error

    // OAuth sign in will redirect, but we should ensure user record exists
    // This will be handled in the useEffect when auth state changes
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, signInWithOAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
