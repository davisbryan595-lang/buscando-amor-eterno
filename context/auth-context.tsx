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
        const { data: { session: sessionData } } = await supabase.auth.getSession()
        if (isMounted) {
          setSession(sessionData)
          setUser(sessionData?.user ?? null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
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

        // Create user record and subscription if signing in and user record doesn't exist
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && sessionData?.user) {
          try {
            // Check if user record exists
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('id', sessionData.user.id)
              .single()

            if (!existingUser) {
              // Create user record
              await supabase.from('users').insert({
                id: sessionData.user.id,
                email: sessionData.user.email || '',
              })

              // Create free subscription
              await supabase.from('subscriptions').insert({
                user_id: sessionData.user.id,
                plan: 'free',
                status: 'active',
              })
            }
          } catch (err) {
            console.error('Error creating user profile:', err)
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
          console.error('Error creating user profile:', userError)
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
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw error
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
