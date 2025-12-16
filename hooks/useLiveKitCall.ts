import { useState, useCallback, useRef, useEffect } from 'react'
import { Room, Participant, RoomEvent, LocalParticipant, RemoteParticipant } from 'livekit-client'
import { useAuth } from '@/context/auth-context'

export interface CallState {
  room: Room | null
  participants: Participant[]
  localParticipant: LocalParticipant | null
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
  const cleanupListenersRef = useRef<Array<() => void>>([])

  const safeSetState = useCallback((updater: (prev: CallState) => CallState) => {
    setState((prev) => {
      const next = updater(prev)
      return next
    })
  }, [])

  const removeAllListeners = useCallback(() => {
    cleanupListenersRef.current.forEach((cleanup) => {
      try {
        cleanup()
      } catch (err) {
        // Silently handle cleanup errors
      }
    })
    cleanupListenersRef.current = []
  }, [])

  const joinCall = useCallback(
    async (otherUserId: string, callType: 'audio' | 'video') => {
      if (!user) {
        safeSetState((prev) => ({ ...prev, error: 'User not authenticated' }))
        return
      }

      let room: Room | null = null

      try {
        safeSetState((prev) => ({ ...prev, isConnecting: true, error: null }))

        // Request media permissions first
        try {
          const constraints = {
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            video: callType === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
          }
          const stream = await navigator.mediaDevices.getUserMedia(constraints)
          // Stop the stream after getting permissions - LiveKit will request it again
          stream.getTracks().forEach((track) => {
            try {
              track.stop()
            } catch (err) {
              // Silently handle track stop errors
            }
          })
        } catch (permError) {
          if (permError instanceof DOMException) {
            if (permError.name === 'NotAllowedError') {
              throw new Error('Camera/microphone permissions denied. Please allow access in browser settings.')
            } else if (permError.name === 'NotFoundError') {
              throw new Error('Camera or microphone not found on your device.')
            }
          }
          throw permError
        }

        // Generate room name
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

        // Create room with proper configuration
        const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL
        if (!liveKitUrl) {
          throw new Error('LiveKit URL not configured')
        }

        room = new Room({
          audioCaptureDefaults: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
          },
          videoCaptureDefaults: {
            resolution: {
              width: 640,
              height: 480,
            },
          },
          adaptiveStream: true,
          dynacast: true,
          autoSubscribe: true,
          maxParticipants: 2,
          reconnectPolicy: {
            maxRetries: 5,
            initialWaitTime: 100,
            maxWaitTime: 2000,
          },
        })

        roomRef.current = room

        // Setup room event listeners
        const handleParticipantConnected = (participant: Participant) => {
          safeSetState((prev) => ({
            ...prev,
            participants: [...prev.participants, participant],
          }))
        }

        const handleParticipantDisconnected = (participant: Participant) => {
          safeSetState((prev) => ({
            ...prev,
            participants: prev.participants.filter((p) => p.sid !== participant.sid),
          }))
        }

        const handleDisconnected = () => {
          safeSetState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            room: null,
            participants: [],
            localParticipant: null,
          }))
          roomRef.current = null
          removeAllListeners()
        }

        const handleRoomError = (error: Error) => {
          safeSetState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Connection error occurred',
            isConnecting: false,
          }))
          if (roomRef.current) {
            roomRef.current.disconnect().catch(() => {})
          }
        }

        const handleReconnected = () => {
          safeSetState((prev) => ({
            ...prev,
            error: null,
            isConnecting: false,
          }))
        }

        room.on(RoomEvent.ParticipantConnected, handleParticipantConnected)
        room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
        room.on(RoomEvent.Disconnected, handleDisconnected)
        room.on(RoomEvent.Error, handleRoomError)
        room.on(RoomEvent.Reconnected, handleReconnected)

        cleanupListenersRef.current.push(() => {
          room?.off(RoomEvent.ParticipantConnected, handleParticipantConnected)
          room?.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
          room?.off(RoomEvent.Disconnected, handleDisconnected)
          room?.off(RoomEvent.Error, handleRoomError)
          room?.off(RoomEvent.Reconnected, handleReconnected)
        })

        // Connect to room with timeout
        const connectPromise = room.connect(liveKitUrl, token)
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
        )

        await Promise.race([connectPromise, timeoutPromise])

        // Enable media with proper sequencing
        try {
          // Enable microphone
          await room.localParticipant.setMicrophoneEnabled(true)

          // Enable camera for video calls
          if (callType === 'video') {
            await room.localParticipant.setCameraEnabled(true)
          }

          // Wait for tracks to be ready
          await new Promise<void>((resolve, reject) => {
            const maxWaitTime = 5000
            const startTime = Date.now()

            const checkTracks = () => {
              const hasAudio = (room?.localParticipant.audioTracks?.size ?? 0) > 0
              const hasVideo = callType === 'video' ? (room?.localParticipant.videoTracks?.size ?? 0) > 0 : true

              if (hasAudio && hasVideo) {
                resolve()
                return
              }

              if (Date.now() - startTime > maxWaitTime) {
                reject(new Error('Timeout waiting for media tracks to be ready'))
                return
              }

              setTimeout(checkTracks, 100)
            }

            checkTracks()
          })
        } catch (mediaError) {
          throw new Error(`Failed to enable media: ${mediaError instanceof Error ? mediaError.message : 'Unknown error'}`)
        }

        // Update state with successful connection
        safeSetState((prev) => ({
          ...prev,
          room,
          localParticipant: room.localParticipant,
          isConnected: true,
          isConnecting: false,
          error: null,
          participants: room.participants ? Array.from(room.participants.values()) : [],
        }))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to join call'
        safeSetState((prev) => ({
          ...prev,
          error: errorMessage,
          isConnecting: false,
        }))
        if (roomRef.current) {
          roomRef.current.disconnect().catch(() => {})
        }
      }
    },
    [user, safeSetState, removeAllListeners]
  )

  const leaveCall = useCallback(async () => {
    try {
      if (roomRef.current) {
        await roomRef.current.disconnect()
        roomRef.current = null
      }
    } catch (err) {
      // Silently handle disconnect errors
    } finally {
      removeAllListeners()
      safeSetState(() => ({
        room: null,
        participants: [],
        localParticipant: null,
        isConnecting: false,
        isConnected: false,
        error: null,
      }))
    }
  }, [removeAllListeners, safeSetState])

  const toggleAudio = useCallback(async (enabled: boolean) => {
    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(enabled)
      } catch (err) {
        safeSetState((prev) => ({
          ...prev,
          error: `Failed to ${enabled ? 'enable' : 'disable'} audio`,
        }))
      }
    }
  }, [safeSetState])

  const toggleVideo = useCallback(async (enabled: boolean) => {
    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setCameraEnabled(enabled)
      } catch (err) {
        safeSetState((prev) => ({
          ...prev,
          error: `Failed to ${enabled ? 'enable' : 'disable'} video`,
        }))
      }
    }
  }, [safeSetState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeAllListeners()
      if (roomRef.current) {
        roomRef.current.disconnect().catch(() => {})
        roomRef.current = null
      }
      // Ensure state is cleared to prevent any lingering references
      setState({
        room: null,
        participants: [],
        localParticipant: null,
        isConnecting: false,
        isConnected: false,
        error: null,
      })
    }
  }, [removeAllListeners])

  return {
    ...state,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
  }
}
