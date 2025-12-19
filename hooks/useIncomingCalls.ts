import { useCallback, useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { useMessages } from './useMessages'

export interface IncomingCall {
  id: string
  caller_id: string
  recipient_id: string
  call_type: 'audio' | 'video'
  status: string
  room_name: string
  created_at: string
  expires_at: string
  caller_name?: string
  caller_image?: string
}

export function useIncomingCalls() {
  const { user } = useAuth()
  const { logCallMessage } = useMessages()
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const subscriptionRef = useRef<any>(null)
  const callTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCallTimeout = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current)
      callTimeoutRef.current = null
    }
  }, [])

  const rejectCall = useCallback(
    async (callId: string) => {
      try {
        // Get the call invitation details before deleting
        const { data: callInvitation } = await supabase
          .from('call_invitations')
          .select('caller_id, call_type')
          .eq('id', callId)
          .single()

        // Delete the invitation when declining to prevent duplicate key violations
        const { error: err } = await supabase
          .from('call_invitations')
          .delete()
          .eq('id', callId)

        if (err) throw err

        // Log missed call message (from caller's perspective)
        if (callInvitation) {
          try {
            await logCallMessage(callInvitation.caller_id, callInvitation.call_type, 'missed')
          } catch (logErr) {
            console.warn('Failed to log missed call:', logErr)
          }
        }

        setIncomingCall(null)
        clearCallTimeout()
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to reject call'
        setError(errorMessage)
      }
    },
    [clearCallTimeout, logCallMessage]
  )

  const acceptCall = useCallback(
    async (callId: string) => {
      try {
        const { error: err } = await supabase
          .from('call_invitations')
          .update({ status: 'accepted' })
          .eq('id', callId)

        if (err) throw err
        clearCallTimeout()
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to accept call'
        setError(errorMessage)
      }
    },
    [clearCallTimeout]
  )

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const setupSubscription = () => {
      let isMounted = true
      let subscriptionActive = false
      let reconnectAttempts = 0
      const maxReconnectAttempts = 5
      const timeoutsRef = new Set<ReturnType<typeof setTimeout>>()

      const clearAllTimeouts = () => {
        timeoutsRef.forEach(timeout => clearTimeout(timeout))
        timeoutsRef.clear()
      }

      const subscribeToIncomingCalls = () => {
        try {
          const handleCallInvitation = async (payload: any) => {
            if (isMounted && subscriptionActive) {
              try {
                const callInvitation = payload.new as any

                // Only show pending calls
                if (callInvitation.status !== 'pending') {
                  return
                }

                // Check if call has expired
                const expiresAt = new Date(callInvitation.expires_at).getTime()
                if (Date.now() > expiresAt) {
                  // Auto-cleanup expired invitations
                  try {
                    await supabase
                      .from('call_invitations')
                      .delete()
                      .eq('id', callInvitation.id)
                  } catch (cleanupErr) {
                    console.warn('Failed to cleanup expired call invitation:', cleanupErr)
                  }
                  return
                }

                // Fetch caller profile info
                const { data: callerProfile } = await supabase
                  .from('profiles')
                  .select('full_name, photos, main_photo_index')
                  .eq('user_id', callInvitation.caller_id)
                  .single()

                const processedCall: IncomingCall = {
                  id: callInvitation.id,
                  caller_id: callInvitation.caller_id,
                  recipient_id: callInvitation.recipient_id,
                  call_type: callInvitation.call_type,
                  status: callInvitation.status,
                  room_name: callInvitation.room_name,
                  created_at: callInvitation.created_at,
                  expires_at: callInvitation.expires_at,
                  caller_name: callerProfile?.full_name || 'Unknown',
                  caller_image: callerProfile?.photos?.[callerProfile?.main_photo_index || 0] || undefined,
                }

                if (isMounted) {
                  setIncomingCall(processedCall)
                  setError(null)

                  // Auto-decline after 5 minutes
                  clearCallTimeout()
                  callTimeoutRef.current = setTimeout(() => {
                    if (isMounted && incomingCall?.id === processedCall.id) {
                      rejectCall(processedCall.id)
                    }
                  }, 300000)
                }
              } catch (err) {
                console.error('Error processing incoming call:', err)
              }
            }
          }

          subscriptionRef.current = supabase
            .channel(`incoming_calls:${user.id}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'call_invitations',
                filter: `recipient_id=eq.${user.id}`,
              },
              handleCallInvitation
            )
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'call_invitations',
                filter: `recipient_id=eq.${user.id}`,
              },
              handleCallInvitation
            )
            .on(
              'postgres_changes',
              {
                event: 'DELETE',
                schema: 'public',
                table: 'call_invitations',
                filter: `recipient_id=eq.${user.id}`,
              },
              (payload: any) => {
                if (isMounted && subscriptionActive && incomingCall?.id === payload.old.id) {
                  // Call was deleted (likely missed or ended), clear the incoming call
                  setIncomingCall(null)
                  clearCallTimeout()
                }
              }
            )
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                subscriptionActive = true
                reconnectAttempts = 0
                if (isMounted) {
                  setLoading(false)
                }
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                subscriptionActive = false
                if (isMounted && reconnectAttempts < maxReconnectAttempts) {
                  reconnectAttempts++
                  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000)
                  const timeout = setTimeout(() => {
                    if (isMounted) {
                      if (subscriptionRef.current) {
                        subscriptionRef.current.unsubscribe()
                      }
                      subscribeToIncomingCalls()
                    }
                  }, delay)
                  timeoutsRef.add(timeout)
                } else if (isMounted) {
                  setError('Failed to connect to incoming calls')
                  setLoading(false)
                }
              }
            })

          return () => {
            isMounted = false
            subscriptionActive = false
            if (subscriptionRef.current) {
              subscriptionRef.current.unsubscribe()
            }
            clearAllTimeouts()
            clearCallTimeout()
          }
        } catch (err) {
          if (isMounted && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000)
            const timeout = setTimeout(() => {
              if (isMounted) {
                subscribeToIncomingCalls()
              }
            }, delay)
            timeoutsRef.add(timeout)
          } else if (isMounted) {
            setError('Failed to setup incoming calls')
            setLoading(false)
          }

          return () => {
            isMounted = false
            subscriptionActive = false
            clearAllTimeouts()
            clearCallTimeout()
          }
        }
      }

      return subscribeToIncomingCalls()
    }

    const unsubscribe = setupSubscription()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user, rejectCall, clearCallTimeout])

  return {
    incomingCall,
    loading,
    error,
    acceptCall,
    rejectCall,
    clearCall: () => {
      setIncomingCall(null)
      clearCallTimeout()
    },
  }
}
