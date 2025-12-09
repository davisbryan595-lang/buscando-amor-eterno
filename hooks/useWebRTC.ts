'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Peer from 'peerjs'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import { usePeer } from '@/context/peer-context'

export type CallType = 'audio' | 'video'

export interface CallState {
  status: 'idle' | 'calling' | 'ringing' | 'active' | 'ended'
  callType?: CallType
  remoteUserId?: string
  callStartTime?: number
}

export function useWebRTC(otherUserId: string | null, callType: CallType = 'audio') {
  const { user } = useAuth()
  const { peer, error: peerError, isReady } = usePeer()
  const peerRef = useRef<Peer | null>(null)
  const callRef = useRef<Peer.MediaConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [callState, setCallState] = useState<CallState>({ status: 'idle' })
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [incomingCall, setIncomingCall] = useState<{
    from: string
    type: CallType
    call: Peer.MediaConnection
  } | null>(null)
  const [awaitingAcceptance, setAwaitingAcceptance] = useState<{
    to: string
    type: CallType
  } | null>(null)

  // Use the peer from context
  useEffect(() => {
    peerRef.current = peer
    if (peerError) {
      setError(peerError)
    } else if (isReady) {
      setError(null)
    }
  }, [peer, peerError, isReady])

  // Setup peer call listener
  useEffect(() => {
    if (!peerRef.current) return

    const handlePeerCall = (call: Peer.MediaConnection) => {
      console.log('[WebRTC] Incoming call received')
      handleIncomingCall(call)
    }

    peerRef.current.on('call', handlePeerCall)

    return () => {
      if (peerRef.current) {
        peerRef.current.off('call', handlePeerCall)
      }
    }
  }, [])

  // Subscribe to call signaling via Supabase Realtime
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`calls:${user.id}`)
      .on('broadcast', { event: 'call-invite' }, (payload) => {
        if (payload.payload.to === user.id && payload.payload.from !== user.id) {
          console.log('[WebRTC] Incoming call received from:', payload.payload.from)
          // Handle incoming call invitation if peer connection is not already active
          setIncomingCall({
            from: payload.payload.from,
            type: payload.payload.type || 'audio',
            call: null as any,
          })
        }
      })
      .on('broadcast', { event: 'call-accepted' }, (payload) => {
        if (payload.payload.to === user.id) {
          // Remote user accepted the call, now establish peer connection
          console.log('[WebRTC] Call accepted by remote user:', payload.payload.from)
          setAwaitingAcceptance(null)
          setCallState((prev) => ({
            ...prev,
            status: 'ringing',
          }))
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  const getMediaStream = useCallback(
    async (type: CallType): Promise<MediaStream> => {
      try {
        const constraints =
          type === 'audio'
            ? { audio: true }
            : { audio: true, video: { width: 640, height: 480 } }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        localStreamRef.current = stream
        setLocalStream(stream)
        return stream
      } catch (err: any) {
        const baseMessage = err?.message || (typeof err === 'string' ? err : 'Unknown error')
        const errorMsg = `Failed to access ${type === 'audio' ? 'microphone' : 'camera'}: ${baseMessage}`
        setError(errorMsg)
        throw new Error(errorMsg)
      }
    },
    []
  )

  const endCall = useCallback(() => {
    console.log('[WebRTC] Ending call')

    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current)
      callTimeoutRef.current = null
    }

    if (callRef.current) {
      try {
        callRef.current.close()
      } catch (err) {
        console.warn('[WebRTC] Error closing call:', err)
      }
      callRef.current = null
    }

    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch (err) {
          console.warn('[WebRTC] Error stopping track:', err)
        }
      })
      localStreamRef.current = null
      setLocalStream(null)
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current = null
      setRemoteStream(null)
    }

    setCallState({ status: 'idle' })
    setIncomingCall(null)
    setAwaitingAcceptance(null)
  }, [])

  const handleIncomingCall = useCallback((call: Peer.MediaConnection) => {
    callRef.current = call

    call.on('stream', (remoteStream: MediaStream) => {
      remoteStreamRef.current = remoteStream
      setRemoteStream(remoteStream)
      setCallState((prev) => ({
        ...prev,
        status: 'active',
        callStartTime: Date.now(),
      }))
    })

    call.on('close', () => {
      endCall()
    })

    call.on('error', (err: any) => {
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Call error')
      console.error('Call error:', errorMessage, err)
      setError(errorMessage)
      endCall()
    })

    // Actually answer the peer connection with local stream
    if (localStreamRef.current) {
      call.answer(localStreamRef.current)
      console.log('[WebRTC] Peer call answered with local stream')
    }
  }, [endCall])

  const establishPeerConnection = useCallback(
    async (remoteId: string, type: CallType) => {
      if (!peerRef.current) return

      try {
        console.log(`[WebRTC] Establishing peer connection with ${remoteId}`)

        const callTimeout = setTimeout(() => {
          if (callRef.current) {
            console.error('[WebRTC] Call timeout - no connection after 30s')
            setError('Call timeout - unable to connect')
            endCall()
          }
        }, 30000)

        callTimeoutRef.current = callTimeout

        const call = peerRef.current.call(remoteId, localStreamRef.current!)
        callRef.current = call

        call.on('stream', (remoteStream: MediaStream) => {
          clearTimeout(callTimeout)
          callTimeoutRef.current = null
          console.log('[WebRTC] Remote stream received')
          remoteStreamRef.current = remoteStream
          setRemoteStream(remoteStream)
          setCallState({
            status: 'active',
            callType: type,
            remoteUserId: remoteId,
            callStartTime: Date.now(),
          })
        })

        call.on('close', () => {
          clearTimeout(callTimeout)
          callTimeoutRef.current = null
          console.log('[WebRTC] Call ended')
          endCall()
        })

        call.on('error', (err: any) => {
          clearTimeout(callTimeout)
          callTimeoutRef.current = null
          const errorMessage = err?.message || (typeof err === 'string' ? err : 'Call error')
          console.error('[WebRTC] Call error:', err.type, errorMessage, err)
          setError(errorMessage)
          endCall()
        })
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to establish peer connection')
        console.error('[WebRTC] Failed to establish peer connection:', errorMessage, err)
        setError(errorMessage)
        endCall()
      }
    },
    [endCall]
  )

  const initiateCall = useCallback(
    async (type: CallType) => {
      if (!otherUserId || !user) return

      try {
        setError(null)
        setCallState({
          status: 'calling',
          callType: type,
          remoteUserId: otherUserId,
        })

        console.log(`[WebRTC] Initiating ${type} call to ${otherUserId}`)

        // Get local stream first
        const stream = await getMediaStream(type)

        // Notify other user about incoming call via Supabase Broadcast (low-latency signaling)
        const channel = supabase.channel(`calls:${otherUserId}`)
        await channel.subscribe()

        const invitePayload = {
          from: user.id,
          to: otherUserId,
          type,
          timestamp: Date.now(),
          callId: `${user.id}-${otherUserId}-${Date.now()}`,
        }

        await channel.send('broadcast', {
          event: 'call-invite',
          payload: invitePayload,
        })

        // Cleanup: unsubscribe from the broadcast channel after sending
        await channel.unsubscribe()

        console.log('[WebRTC] Call invite sent, waiting for acceptance...')
        setAwaitingAcceptance({
          to: otherUserId,
          type,
        })

        // Set timeout for call to be accepted
        const acceptanceTimeout = setTimeout(() => {
          console.error('[WebRTC] Call not accepted after 60s')
          setError('Call not answered')
          endCall()
          setAwaitingAcceptance(null)
        }, 60000)

        callTimeoutRef.current = acceptanceTimeout
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to initiate call')
        console.error('[WebRTC] Failed to initiate call:', errorMessage, err)
        setError(errorMessage)
        setCallState({ status: 'idle' })
        setAwaitingAcceptance(null)
      }
    },
    [otherUserId, user, getMediaStream, endCall]
  )

  // When call is accepted by remote user, establish peer connection
  useEffect(() => {
    if (callState.status === 'ringing' && awaitingAcceptance === null && otherUserId) {
      const callType = callState.callType as CallType
      // Clear the acceptance timeout since we got acceptance
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current)
        callTimeoutRef.current = null
      }
      establishPeerConnection(otherUserId, callType)
    }
  }, [callState.status, awaitingAcceptance, otherUserId, establishPeerConnection])

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !user) return

    try {
      setError(null)
      console.log(`[WebRTC] Accepting ${incomingCall.type} call from ${incomingCall.from}`)

      // Get local stream first
      const stream = await getMediaStream(incomingCall.type)

      // Send acceptance notification to the initiator
      const channel = supabase.channel(`calls:${incomingCall.from}`)
      await channel.subscribe()

      await channel.send('broadcast', {
        event: 'call-accepted',
        payload: {
          from: user.id,
          to: incomingCall.from,
          type: incomingCall.type,
          timestamp: Date.now(),
        },
      })

      // Cleanup: unsubscribe from the broadcast channel after sending
      await channel.unsubscribe()

      console.log('[WebRTC] Call acceptance sent to initiator, waiting for peer connection...')

      setCallState({
        status: 'ringing',
        callType: incomingCall.type,
        remoteUserId: incomingCall.from,
      })

      // Set timeout for initiator to establish connection
      const connectionTimeout = setTimeout(() => {
        console.error('[WebRTC] No incoming connection after 30s')
        setError('Connection failed - no incoming call detected')
        endCall()
      }, 30000)

      callTimeoutRef.current = connectionTimeout
      setIncomingCall(null)
    } catch (err: any) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to accept call')
      console.error('[WebRTC] Failed to accept call:', errorMessage, err)
      setError(errorMessage)
      setIncomingCall(null)
    }
  }, [incomingCall, user, getMediaStream, endCall])

  const rejectCall = useCallback(() => {
    console.log('[WebRTC] Rejecting incoming call')
    if (callRef.current) {
      try {
        callRef.current.close()
      } catch (err) {
        console.warn('[WebRTC] Error closing rejected call:', err)
      }
      callRef.current = null
    }
    setIncomingCall(null)
    setCallState({ status: 'idle' })
  }, [])

  const toggleAudio = useCallback(
    (enabled: boolean) => {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = enabled
        })
      }
    },
    []
  )

  const toggleVideo = useCallback(
    (enabled: boolean) => {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = enabled
        })
      }
    },
    []
  )

  return {
    callState,
    localStream,
    remoteStream,
    error,
    incomingCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
  }
}
