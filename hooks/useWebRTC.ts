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
            { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
          ],
          config: {
            iceTransportPolicy: 'all',
          },
          debug: process.env.NODE_ENV === 'development' ? 2 : 0,
        })

        peer.on('open', () => {
          setError(null)
        })

        peer.on('error', (err: any) => {
          console.error('Peer error:', err)
          // Don't set error on connection errors during initialization
          if (err.type !== 'peer-unavailable') {
            setError(`Connection error: ${err.message}`)
          }
        })

        peer.on('call', (call: Peer.MediaConnection) => {
          handleIncomingCall(call)
        })

        peerRef.current = peer
      } catch (err: any) {
        console.error('Peer initialization error:', err)
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

        // Notify other user about incoming call via Supabase
        const channel = supabase.channel(`calls:${otherUserId}`)
        await channel.send('broadcast', {
          event: 'call-invite',
          payload: {
            from: user.id,
            to: otherUserId,
            type,
            timestamp: Date.now(),
          },
        })

        // Get local stream
        const stream = await getMediaStream(type)

        // Create and make the call
        const call = peerRef.current.call(otherUserId, stream)

        callRef.current = call

        call.on('stream', (remoteStream: MediaStream) => {
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
          endCall()
        })

        call.on('error', (err: any) => {
          console.error('Call error:', err)
          setError(err.message)
          endCall()
        })
      } catch (err: any) {
        setError(err.message)
        setCallState({ status: 'idle' })
      }
    },
    [otherUserId, user, getMediaStream]
  )

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !peerRef.current) return

    try {
      setError(null)

      // Get local stream
      const stream = await getMediaStream(incomingCall.type)

      // Answer the call (we'll create a new call since we don't have direct reference)
      // In a real implementation, the signaling server would provide this
      // For now, we initiate a call back to establish connection
      const call = peerRef.current.call(incomingCall.from, stream)
      callRef.current = call

      call.on('stream', (remoteStream: MediaStream) => {
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
        endCall()
      })

      call.on('error', (err: any) => {
        console.error('Call error:', err)
        setError(err.message)
        endCall()
      })

      setIncomingCall(null)
    } catch (err: any) {
      setError(err.message)
      setIncomingCall(null)
    }
  }, [incomingCall, getMediaStream])

  const rejectCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.close()
    }
    setIncomingCall(null)
    setCallState({ status: 'idle' })
  }, [])

  const endCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.close()
      callRef.current = null
    }

    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
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
