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
          throw new Error('Failed to get access token')
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
          }))
          roomRef.current = null
        })

        // Connect to room
        await room.connect(liveKitUrl, token)

        setState((prev) => ({
          ...prev,
          room,
          isConnected: true,
          isConnecting: false,
          participants: Array.from(room.participants.values()),
        }))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to join call'
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isConnecting: false,
        }))
        console.error('Error joining call:', err)
      }
    },
    [user]
  )

  const leaveCall = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect()
      roomRef.current = null
      setState({
        room: null,
        participants: [],
        isConnecting: false,
        isConnected: false,
        error: null,
      })
    }
  }, [])

  const toggleAudio = useCallback(async (enabled: boolean) => {
    if (roomRef.current) {
      const audioTracks = roomRef.current.localParticipant?.audioTracks
      if (audioTracks) {
        for (const track of audioTracks.values()) {
          await track.mute(!enabled)
        }
      }
    }
  }, [])

  const toggleVideo = useCallback(async (enabled: boolean) => {
    if (roomRef.current) {
      const videoTracks = roomRef.current.localParticipant?.videoTracks
      if (videoTracks) {
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
