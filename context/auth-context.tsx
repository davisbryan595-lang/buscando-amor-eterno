'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: any | null
  session: any | null
  loading: boolean
  isLoading: boolean
  getSession: () => Promise<any>
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
    let timeoutId: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        // Get existing session from localStorage (persisted across page refreshes)
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

    // Set a 5-second timeout to prevent indefinite loading
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth initialization timeout - proceeding without session')
        setLoading(false)
      }
    }, 5000)

    initializeAuth().then(() => {
      if (isMounted) {
        clearTimeout(timeoutId)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sessionData) => {
      console.log('[Auth] onAuthStateChange event:', event)
      if (isMounted) {
        setSession(sessionData)
        setUser(sessionData?.user ?? null)

        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && sessionData?.user) {
          // Run user setup in the background without blocking auth
          try {
            console.log('[Auth] Checking if user exists...')

            // Create a timeout promise for database queries
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('User setup timeout')), 5000)
            )

            const checkUserPromise = supabase
              .from('users')
              .select('id')
              .eq('id', sessionData.user.id)
              .maybeSingle()

            const { data: existingUser, error: checkError } = await Promise.race([
              checkUserPromise,
              timeoutPromise
            ]) as any

            if (checkError && checkError.code !== 'PGRST116') {
              throw checkError
            }

            if (!existingUser) {
              console.log('[Auth] Creating user profile...')
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

              console.log('[Auth] User profile created')
            } else {
              console.log('[Auth] User already exists')
            }
          } catch (err) {
            console.error('[Auth] Error in onAuthStateChange user setup:', err instanceof Error ? err.message : JSON.stringify(err))
            // Don't block auth flow if user setup fails
          }
        }
      }
    })

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    console.log('[Auth] Starting signup for:', email)
    try {
      console.log('[Auth] Calling supabase.auth.signUp...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('[Auth] signUp response:', { hasError: !!error, hasData: !!data, errorCode: error?.code })
      if (error) {
        console.error('[Auth] signUp error:', error)
        throw error
      }

      // Create user record and free subscription in database
      if (data.user) {
        console.log('[Auth] User created in auth:', data.user.id)
        try {
          // Create user record with upsert to avoid conflicts
          console.log('[Auth] Creating user profile...')
          const { error: userError } = await supabase.from('users').upsert({
            id: data.user.id,
            email: email,
          })

          if (userError && userError.code !== 'PGRST103') {
            console.error('[Auth] Error creating user profile:', userError.message || JSON.stringify(userError))
            // Don't throw - account is already created in auth
          } else {
            console.log('[Auth] User profile created')
          }

          // Create free subscription with upsert to avoid conflicts
          console.log('[Auth] Creating subscription...')
          const { error: subError } = await supabase.from('subscriptions').upsert({
            user_id: data.user.id,
            plan: 'free',
            status: 'active',
          })

          if (subError && subError.code !== 'PGRST103') {
            console.error('[Auth] Error creating subscription:', subError)
            // Don't throw - account is already created in auth
          } else {
            console.log('[Auth] Subscription created')
          }
        } catch (err) {
          console.error('[Auth] Error in user setup:', err)
          // Don't throw - account is already created in auth
        }
      }

      console.log('[Auth] Signup completed successfully')
    } catch (error) {
      console.error('[Auth] Signup failed:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Starting signin for:', email)
    try {
      console.log('[Auth] Calling supabase.auth.signInWithPassword...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('[Auth] signIn response:', { hasError: !!error, hasData: !!data, errorCode: error?.code })
      if (error) {
        console.error('[Auth] signIn error:', error)
        throw error
      }

      console.log('[Auth] Signin completed successfully')
    } catch (error) {
      console.error('[Auth] Signin failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const signOutPromise = supabase.auth.signOut({ scope: 'local' })
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign out request timed out')), 5000)
      )

      const result = await Promise.race([signOutPromise, timeoutPromise]) as any
      if (result?.error) throw result.error

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

  const getSession = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    return currentSession
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isLoading: loading, getSession, signUp, signIn, signOut, signInWithOAuth }}>
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
