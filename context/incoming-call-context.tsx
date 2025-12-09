'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'

export type CallType = 'audio' | 'video'

export interface IncomingCallNotification {
  callId: string
  from: string
  fromName?: string
  fromImage?: string
  type: CallType
  timestamp: number
}

interface IncomingCallContextType {
  incomingCall: IncomingCallNotification | null
  dismissCall: () => void
}

const IncomingCallContext = createContext<IncomingCallContextType | undefined>(undefined)

export function IncomingCallProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [incomingCall, setIncomingCall] = useState<IncomingCallNotification | null>(null)

  useEffect(() => {
    if (!user) {
      setIncomingCall(null)
      return
    }

    let channel: ReturnType<typeof supabase.channel> | null = null
    let isMounted = true
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const timeoutsRef = new Set<ReturnType<typeof setTimeout>>()

    const clearAllTimeouts = () => {
      timeoutsRef.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.clear()
    }

    const setupCallListener = () => {
      try {
        channel = supabase
          .channel(`calls:${user.id}`)
          .on(
            'broadcast',
            { event: 'call-invite' },
            async (payload) => {
              if (!isMounted) return

              const callData = payload.payload
              if (callData.to === user.id && callData.from !== user.id) {
                console.log('[IncomingCallContext] Incoming call received from:', callData.from)

                // Fetch caller profile details
                try {
                  const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, photos, main_photo_index')
                    .eq('user_id', callData.from)
                    .single()

                  if (isMounted) {
                    setIncomingCall({
                      callId: callData.callId,
                      from: callData.from,
                      fromName: profile?.full_name || 'Unknown User',
                      fromImage: profile?.photos?.[profile?.main_photo_index || 0] || undefined,
                      type: callData.type || 'audio',
                      timestamp: callData.timestamp || Date.now(),
                    })
                  }
                } catch (err) {
                  console.error('[IncomingCallContext] Error fetching caller profile:', err)
                  // Still show notification even if profile fetch fails
                  if (isMounted) {
                    setIncomingCall({
                      callId: callData.callId,
                      from: callData.from,
                      fromName: 'Unknown User',
                      type: callData.type || 'audio',
                      timestamp: callData.timestamp || Date.now(),
                    })
                  }
                }
              }
            }
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('[IncomingCallContext] Channel subscription error:', status)
              if (isMounted && reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000)
                console.log(`[IncomingCallContext] Attempting reconnect in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`)
                const timeout = setTimeout(() => {
                  if (isMounted) {
                    if (channel) {
                      channel.unsubscribe()
                    }
                    setupCallListener()
                  }
                }, delay)
                timeoutsRef.add(timeout)
              }
            } else if (status === 'SUBSCRIBED') {
              console.log('[IncomingCallContext] Call listener subscribed')
              reconnectAttempts = 0
            }
          })
      } catch (err) {
        console.error('[IncomingCallContext] Error setting up call listener:', err)
        if (isMounted && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000)
          console.log(`[IncomingCallContext] Retrying setup in ${delay}ms`)
          const timeout = setTimeout(() => {
            if (isMounted) {
              setupCallListener()
            }
          }, delay)
          timeoutsRef.add(timeout)
        }
      }
    }

    setupCallListener()

    return () => {
      isMounted = false
      clearAllTimeouts()
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [user])

  const dismissCall = useCallback(() => {
    setIncomingCall(null)
  }, [])

  return (
    <IncomingCallContext.Provider value={{ incomingCall, dismissCall }}>
      {children}
    </IncomingCallContext.Provider>
  )
}

export function useIncomingCall() {
  const context = useContext(IncomingCallContext)
  if (!context) {
    throw new Error('useIncomingCall must be used within IncomingCallProvider')
  }
  return context
}
