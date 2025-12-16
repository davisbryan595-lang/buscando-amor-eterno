import { useState, useCallback, useRef, useEffect } from 'react'
import { Room, Participant, RoomEvent, ParticipantEvent, createLocalAudioTrack } from 'livekit-client'
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

        // Handle successful track subscriptions
        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          console.log('✅ Track subscribed:', {
            kind: track.kind,
            participant: participant.identity,
            sid: track.sid,
            enabled: track.mediaStreamTrack?.enabled,
            muted: publication.isMuted,
            readyState: track.mediaStreamTrack?.readyState,
          })

          // For audio tracks, log additional details
          if (track.kind === 'audio' && track.mediaStreamTrack) {
            console.log('🔊 Remote audio track ready:', {
              trackId: track.mediaStreamTrack.id,
              label: track.mediaStreamTrack.label,
              enabled: track.mediaStreamTrack.enabled,
            })
          }
        })

        // Handle track publications
        room.on(RoomEvent.TrackPublished, (publication, participant) => {
          console.log('📤 Track published:', {
            kind: publication.kind,
            participant: participant.identity,
            source: publication.source,
            muted: publication.isMuted,
          })
        })

        // Connect to room with timeout
        const connectPromise = room.connect(liveKitUrl, token)
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
        )

        await Promise.race([connectPromise, timeoutPromise])

        // Enable microphone and camera after connection
        try {
          console.log('Enabling local media tracks...')

          // Enable microphone first
          const micPublication = await room.localParticipant.setMicrophoneEnabled(true)
          console.log('Microphone enabled:', {
            trackSid: micPublication?.trackSid,
            trackName: micPublication?.trackName,
            isMuted: micPublication?.isMuted,
            audioTrackCount: room.localParticipant.audioTracks?.size ?? 0,
          })

          // Verify microphone track is publishing
          let audioTrackFound = false
          // Wait a bit for the track to be registered
          for (let i = 0; i < 10; i++) {
            if (room.localParticipant.audioTracks && room.localParticipant.audioTracks.size > 0) {
              audioTrackFound = true
              break
            }
            await new Promise((resolve) => setTimeout(resolve, 200))
          }

          if (audioTrackFound) {
            const audioPublication = Array.from(room.localParticipant.audioTracks.values())[0]
            if (audioPublication.track) {
              const track = audioPublication.track.mediaStreamTrack
              console.log('Local audio track details:', {
                id: track?.id,
                kind: track?.kind,
                label: track?.label,
                enabled: track?.enabled,
                muted: track?.muted,
                readyState: track?.readyState,
              })

              // Ensure track is enabled
              if (track) {
                track.enabled = true
              }
            }
          } else {
            console.warn('No audio tracks found after enabling microphone! Using fallback publish...')

            // Fallback: manually create and publish audio track
            try {
              const audioTrack = await createLocalAudioTrack({
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              })
              const publication = await room.localParticipant.publishTrack(audioTrack)
              console.log('✅ Manually published audio track:', {
                trackId: audioTrack.mediaStreamTrack.id,
                label: audioTrack.mediaStreamTrack.label,
                enabled: audioTrack.mediaStreamTrack.enabled,
                publicationSid: publication?.trackSid,
              })

              // Wait a bit for the track to be registered in the map
              await new Promise((resolve) => setTimeout(resolve, 500))

              // Verify again
              if (room.localParticipant.audioTracks.size === 0) {
                // If we have a publication, we can consider it a success even if the map isn't updated yet
                if (publication) {
                  console.warn('Audio track published but not yet in localParticipant.audioTracks map')
                } else {
                  throw new Error('Still no audio track after fallback — check mic permissions/device')
                }
              }
            } catch (fallbackError) {
              console.error('Fallback publish failed:', fallbackError)
              throw new Error('Still no audio track after fallback — check mic permissions/device')
            }
          }

          // Enable camera for video calls
          if (callType === 'video') {
            const camPublication = await room.localParticipant.setCameraEnabled(true)
            console.log('Camera enabled:', {
              trackSid: camPublication?.trackSid,
              trackName: camPublication?.trackName,
              videoTrackCount: room.localParticipant.videoTracks?.size ?? 0,
            })
          }
        } catch (publishError) {
          console.error('Error publishing tracks:', publishError)
          throw new Error('Failed to enable microphone/camera: ' + (publishError instanceof Error ? publishError.message : 'Unknown error'))
        }

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
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(enabled)
      } catch (err) {
        console.error('Error toggling audio:', err)
      }
    }
  }, [])

  const toggleVideo = useCallback(async (enabled: boolean) => {
    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setCameraEnabled(enabled)
      } catch (err) {
        console.error('Error toggling video:', err)
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect().catch((err) => {
          console.warn('Error during cleanup disconnect:', err)
        })
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
