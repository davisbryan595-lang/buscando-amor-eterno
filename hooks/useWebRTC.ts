'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Peer from 'peerjs'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'

export type CallType = 'audio' | 'video'

export interface CallState {
  status: 'idle' | 'calling' | 'ringing' | 'active' | 'ended'
  callType?: CallType
  remoteUserId?: string
  callStartTime?: number
}

export function useWebRTC(otherUserId: string | null, callType: CallType = 'audio') {
  const { user } = useAuth()
  const peerRef = useRef<Peer | null>(null)
  const callRef = useRef<Peer.MediaConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  
  const [callState, setCallState] = useState<CallState>({ status: 'idle' })
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [incomingCall, setIncomingCall] = useState<{
    from: string
    type: CallType
    call: Peer.MediaConnection
  } | null>(null)

  // Initialize PeerJS connection
  useEffect(() => {
    if (!user) return

    const initPeer = async () => {
      try {
        const peer = new Peer(user.id, {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ],
          config: {
            iceTransportPolicy: 'all',
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
          },
          debug: process.env.NODE_ENV === 'development' ? 2 : 0,
          ping: 30000,
        })

        peer.on('open', () => {
          console.log('[WebRTC] Peer connection established')
          setError(null)
        })

        peer.on('error', (err: any) => {
          console.error('[WebRTC] Peer error:', err.type, err.message)
          // Don't set error on connection errors during initialization
          if (err.type !== 'peer-unavailable' && err.type !== 'network') {
            setError(`Connection error: ${err.message}`)
          }
        })

        peer.on('call', (call: Peer.MediaConnection) => {
          console.log('[WebRTC] Incoming call received')
          handleIncomingCall(call)
        })

        peer.on('disconnected', () => {
          console.log('[WebRTC] Peer disconnected - attempting reconnect')
          setTimeout(() => {
            if (peerRef.current && peerRef.current.disconnected) {
              peerRef.current.reconnect()
            }
          }, 1000)
        })

        peerRef.current = peer
      } catch (err: any) {
        console.error('[WebRTC] Peer initialization error:', err)
        setError(err.message)
      }
    }

    initPeer()

    return () => {
      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.destroy()
      }
    }
  }, [user])

  // Subscribe to call signaling via Supabase Realtime
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`calls:${user.id}`)
      .on('broadcast', { event: 'call-invite' }, (payload) => {
        if (payload.payload.to === user.id && payload.payload.from !== user.id) {
          // Handle incoming call invitation if peer connection is not already active
          if (callState.status === 'idle' && !incomingCall) {
            setIncomingCall({
              from: payload.payload.from,
              type: payload.payload.type || 'audio',
              call: null as any,
            })
          }
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, callState.status, incomingCall])

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
      console.error('Call error:', err)
      setError(err.message)
      endCall()
    })
  }, [])

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
        const errorMsg = `Failed to access ${type === 'audio' ? 'microphone' : 'camera'}: ${err.message}`
        setError(errorMsg)
        throw new Error(errorMsg)
      }
    },
    []
  )

  const initiateCall = useCallback(
    async (type: CallType) => {
      if (!otherUserId || !peerRef.current || !user) return

      try {
        setError(null)
        setCallState({
          status: 'calling',
          callType: type,
          remoteUserId: otherUserId,
        })

        console.log(`[WebRTC] Initiating ${type} call to ${otherUserId}`)

        // Notify other user about incoming call via Supabase Broadcast (low-latency signaling)
        const channel = supabase.channel(`calls:${otherUserId}`)

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

        console.log('[WebRTC] Call invite sent via Broadcast')

        // Get local stream
        const stream = await getMediaStream(type)

        // Create and make the call with timeout handling
        const callTimeout = setTimeout(() => {
          if (callRef.current && callState.status === 'calling') {
            console.error('[WebRTC] Call timeout - no connection after 30s')
            setError('Call timeout - unable to connect')
            endCall()
          }
        }, 30000)

        const call = peerRef.current.call(otherUserId, stream)
        callRef.current = call

        call.on('stream', (remoteStream: MediaStream) => {
          clearTimeout(callTimeout)
          console.log('[WebRTC] Remote stream received')
          remoteStreamRef.current = remoteStream
          setRemoteStream(remoteStream)
          setCallState({
            status: 'active',
            callType: type,
            remoteUserId: otherUserId,
            callStartTime: Date.now(),
          })
        })

        call.on('close', () => {
          clearTimeout(callTimeout)
          console.log('[WebRTC] Call ended')
          endCall()
        })

        call.on('error', (err: any) => {
          clearTimeout(callTimeout)
          console.error('[WebRTC] Call error:', err.type, err)
          if (err.type === 'network' || err.type === 'media') {
            console.log('[WebRTC] Retrying call after network/media error')
            setTimeout(() => {
              if (callState.status === 'calling') {
                initiateCall(type)
              }
            }, 2000)
          } else {
            setError(err.message)
            endCall()
          }
        })
      } catch (err: any) {
        console.error('[WebRTC] Failed to initiate call:', err)
        setError(err.message)
        setCallState({ status: 'idle' })
      }
    },
    [otherUserId, user, getMediaStream, callState.status, endCall]
  )

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !peerRef.current) return

    try {
      setError(null)
      console.log(`[WebRTC] Accepting ${incomingCall.type} call from ${incomingCall.from}`)

      setCallState({
        status: 'active',
        callType: incomingCall.type,
        remoteUserId: incomingCall.from,
        callStartTime: Date.now(),
      })

      // Get local stream
      const stream = await getMediaStream(incomingCall.type)

      // Answer the call by initiating a call back to establish connection
      const answerTimeout = setTimeout(() => {
        if (callRef.current && callState.status !== 'active') {
          console.error('[WebRTC] Answer timeout - no connection after 30s')
          setError('Answer timeout - unable to connect')
          endCall()
        }
      }, 30000)

      const call = peerRef.current.call(incomingCall.from, stream)
      callRef.current = call

      call.on('stream', (remoteStream: MediaStream) => {
        clearTimeout(answerTimeout)
        console.log('[WebRTC] Remote stream received after accepting call')
        remoteStreamRef.current = remoteStream
        setRemoteStream(remoteStream)
        setCallState({
          status: 'active',
          callType: incomingCall.type,
          remoteUserId: incomingCall.from,
          callStartTime: Date.now(),
        })
      })

      call.on('close', () => {
        clearTimeout(answerTimeout)
        console.log('[WebRTC] Call ended')
        endCall()
      })

      call.on('error', (err: any) => {
        clearTimeout(answerTimeout)
        console.error('[WebRTC] Call error during answer:', err.type, err)
        if (err.type === 'network' || err.type === 'media') {
          console.log('[WebRTC] Retrying answer after network/media error')
          setTimeout(() => {
            if (incomingCall) {
              acceptCall()
            }
          }, 2000)
        } else {
          setError(err.message)
          endCall()
        }
      })

      setIncomingCall(null)
    } catch (err: any) {
      console.error('[WebRTC] Failed to accept call:', err)
      setError(err.message)
      setIncomingCall(null)
    }
  }, [incomingCall, getMediaStream, callState.status, endCall])

  const rejectCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.close()
    }
    setIncomingCall(null)
    setCallState({ status: 'idle' })
  }, [])

  const endCall = useCallback(() => {
    console.log('[WebRTC] Ending call')

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
