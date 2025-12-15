import { useState, useCallback, useRef, useEffect } from 'react'
import { Room, Participant, RoomEvent, ParticipantEvent } from 'livekit-client'
import { useAuth } from '@/context/auth-context'

export interface CallState {
  room: Room | null
  participants: Participant[]
  localParticipant: Participant | null
  isConnecting: boolean
  isConnected: boolean
  error: string | null
}

export function useLiveKitCall() {
  const { user } = useAuth()
  const [state, setState] = useState<CallState>({
    room: null,
    participants: [],
    localParticipant: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  })
  const roomRef = useRef<Room | null>(null)

  const joinCall = useCallback(
    async (otherUserId: string, callType: 'audio' | 'video') => {
      if (!user) {
        setState((prev) => ({ ...prev, error: 'User not authenticated' }))
        return
      }

      try {
        setState((prev) => ({ ...prev, isConnecting: true, error: null }))

        // Request media permissions first
        try {
          const constraints = {
            audio: true,
            video: callType === 'video' ? { width: 640, height: 480 } : false,
          }
          await navigator.mediaDevices.getUserMedia(constraints)
        } catch (permError) {
          if (permError instanceof DOMException && permError.name === 'NotAllowedError') {
            throw new Error('Camera/microphone permissions denied. Please allow access in browser settings.')
          } else if (permError instanceof DOMException && permError.name === 'NotFoundError') {
            throw new Error('Camera or microphone not found on your device.')
          }
          throw permError
        }

        // Generate room name (same for both users)
        const roomName = [user.id, otherUserId].sort().join('-')

        // Get token from backend
        const tokenResponse = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName,
            userName: user.id,
            callType,
          }),
        })

        if (!tokenResponse.ok) {
          let errorMessage = 'Failed to generate call token'
          try {
            const errorData = await tokenResponse.json()
            errorMessage = errorData.error || errorMessage
          } catch (e) {
            errorMessage = `Failed to generate call token (HTTP ${tokenResponse.status})`
          }
          throw new Error(errorMessage)
        }

        const { token } = await tokenResponse.json()

        // Create and connect to room
        const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL
        if (!liveKitUrl) {
          throw new Error('LiveKit URL not configured')
        }

        const room = new Room({
          audio: true,
          video: callType === 'video',
          adaptiveStream: true,
          dynacast: true,
          reconnectPolicy: {
            maxRetries: 3,
            initialWaitTime: 100,
            maxWaitTime: 1000,
          },
        })

        roomRef.current = room

        // Handle room events
        room.on(RoomEvent.ParticipantConnected, (participant: Participant) => {
          setState((prev) => ({
            ...prev,
            participants: [...prev.participants, participant],
          }))
        })

        room.on(RoomEvent.ParticipantDisconnected, (participant: Participant) => {
          setState((prev) => ({
            ...prev,
            participants: prev.participants.filter((p) => p.sid !== participant.sid),
          }))
        })

        room.on(RoomEvent.Disconnected, () => {
          setState((prev) => ({
            ...prev,
            isConnected: false,
            room: null,
            participants: [],
            localParticipant: null,
          }))
          roomRef.current = null
        })

        // Handle connection errors
        room.on(RoomEvent.Error, (error: Error) => {
          const errorMessage = error instanceof Error ? error.message : 'Connection error occurred'
          setState((prev) => ({
            ...prev,
            error: errorMessage,
            isConnecting: false,
          }))
          console.error('Room error:', error)
          if (roomRef.current) {
            roomRef.current.disconnect()
          }
        })

        // Handle media track subscription failures
        room.on(RoomEvent.TrackSubscriptionFailed, (trackSid: string, participant: Participant) => {
          console.warn('Failed to subscribe to track:', trackSid, 'from participant:', participant.identity)
        })

        // Connect to room with timeout
        const connectPromise = room.connect(liveKitUrl, token)
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
        )

        await Promise.race([connectPromise, timeoutPromise])

        setState((prev) => ({
          ...prev,
          room,
          localParticipant: room.localParticipant,
          isConnected: true,
          isConnecting: false,
          participants: room.participants ? Array.from(room.participants.values()) : [],
        }))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to join call'
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isConnecting: false,
        }))
        console.error('Error joining call:', err)
        if (roomRef.current) {
          roomRef.current.disconnect()
        }
      }
    },
    [user]
  )

  const leaveCall = useCallback(async () => {
    try {
      if (roomRef.current) {
        await roomRef.current.disconnect()
        roomRef.current = null
      }
    } catch (err) {
      console.warn('Error disconnecting from call:', err)
    } finally {
      setState({
        room: null,
        participants: [],
        localParticipant: null,
        isConnecting: false,
        isConnected: false,
        error: null,
      })
    }
  }, [])

  const toggleAudio = useCallback(async (enabled: boolean) => {
    if (roomRef.current?.localParticipant) {
      const audioTracks = roomRef.current.localParticipant.audioTracks
      if (audioTracks && typeof audioTracks.values === 'function') {
        for (const track of audioTracks.values()) {
          await track.mute(!enabled)
        }
      }
    }
  }, [])

  const toggleVideo = useCallback(async (enabled: boolean) => {
    if (roomRef.current?.localParticipant) {
      const videoTracks = roomRef.current.localParticipant.videoTracks
      if (videoTracks && typeof videoTracks.values === 'function') {
        for (const track of videoTracks.values()) {
          await track.mute(!enabled)
        }
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect()
      }
    }
  }, [])

  return {
    ...state,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
  }
}
