'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Video as VideoIcon, VideoOff, Phone, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useMessages } from '@/hooks/useMessages'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Image from 'next/image'
import { generateChannelName, userIdToAgoraUid } from '@/lib/agora'

// Lazy load Agora SDK only on client side
let AgoraRTC: any = null
let initAgoraSDK = async () => {
  if (!AgoraRTC) {
    const mod = await import('agora-rtc-sdk-ng')
    AgoraRTC = mod.default
  }
  return AgoraRTC
}

interface AgoraCallProps {
  partnerId: string
  partnerName?: string
  callType?: 'audio' | 'video'
  mode?: 'outgoing' | 'incoming' | null
  callId?: string | null
  logId?: string | null
}

export default function AgoraVideoCall({
  partnerId,
  partnerName,
  callType = 'video',
  mode = null,
  callId = null,
}: AgoraCallProps) {
  const router = useRouter()
  const { user, getSession } = useAuth()
  const { logCallMessage } = useMessages()
  const isAudioOnly = callType === 'audio'
  const [client, setClient] = useState<any>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null)
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null)
  const [remoteUsers, setRemoteUsers] = useState<any[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otherUserImage, setOtherUserImage] = useState<string | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [isCallEndedCleanly, setIsCallEndedCleanly] = useState(false)
  const [remoteCameraEnabled, setRemoteCameraEnabled] = useState(true)
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true)
  const [connectionState, setConnectionState] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected')
  const [loggedCallId, setLoggedCallId] = useState<string | null>(null)
  const [justReceivedEndSignal, setJustReceivedEndSignal] = useState(false)
  const [useEarpiece, setUseEarpiece] = useState(false)
  const localVideoContainerRef = useRef<HTMLDivElement>(null)
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null)
  const callStartTimeRef = useRef<number>(0)
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const ongoingLoggedRef = useRef(false)
  const callIdRef = useRef<string | null>(null)
  const justReceivedEndSignalRef = useRef(false)

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID

  // Listen for force_end_call broadcast from remote user
  useEffect(() => {
    if (!user || !partnerId) return

    const roomName = [user.id, partnerId].sort().join('-')
    const channel = supabase.channel(`call:${roomName}`)

    channel
      .on('broadcast', { event: 'force_end_call' }, async (payload) => {
        console.log('Force end received — cleaning up')

        // Mark this as an intentional end to suppress "connection lost" UI
        setJustReceivedEndSignal(true)
        justReceivedEndSignalRef.current = true

        // Clear call timer
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current)
        }

        // Safely stop and close tracks
        if (localAudioTrack) {
          try {
            await localAudioTrack.setEnabled(false)
            localAudioTrack.close()
          } catch (err) {
            console.warn('Error closing audio track:', err)
          }
        }

        if (localVideoTrack) {
          try {
            await localVideoTrack.setEnabled(false)
            localVideoTrack.close()
          } catch (err) {
            console.warn('Error closing video track:', err)
          }
        }

        // Leave the channel
        if (client) {
          try {
            await client.leave()
          } catch (err) {
            console.warn('Error leaving Agora channel:', err)
          }
        }

        // Force redirect — no hanging
        window.location.href = `/messages?user=${partnerId}`
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [user, partnerId, client, localAudioTrack, localVideoTrack])

  // Listen for remote media state changes (camera/mic toggle)
  useEffect(() => {
    if (!user || !partnerId) return

    const roomName = [user.id, partnerId].sort().join('-')
    const channel = supabase.channel(`call:${roomName}`)

    channel
      .on('broadcast', { event: 'media_state' }, (payload) => {
        console.log('Remote media state changed:', payload.payload)

        if (payload.payload.type === 'camera') {
          setRemoteCameraEnabled(payload.payload.enabled)
        } else if (payload.payload.type === 'mic') {
          setRemoteAudioEnabled(payload.payload.enabled)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [user, partnerId])

  // Handle page unload (refresh/close tab) - broadcast force end
  useEffect(() => {
    const handleUnload = async () => {
      // Broadcast force end signal to other user via Supabase Realtime
      if (user && partnerId) {
        const roomName = [user.id, partnerId].sort().join('-')
        const channel = supabase.channel(`call:${roomName}`)
        try {
          await channel.send({
            type: 'broadcast',
            event: 'force_end_call',
            payload: { ended_by: user.id },
          })
        } catch (err) {
          console.warn('Failed to broadcast force_end_call on unload:', err)
        }
      }

      // Close Agora tracks and leave channel
      if (localAudioTrack) {
        try {
          await localAudioTrack.setEnabled(false)
          localAudioTrack.close()
        } catch (err) {
          console.warn('Error closing audio track on unload:', err)
        }
      }

      if (localVideoTrack) {
        try {
          await localVideoTrack.setEnabled(false)
          localVideoTrack.close()
        } catch (err) {
          console.warn('Error closing video track on unload:', err)
        }
      }

      if (client) {
        try {
          await client.leave()
        } catch (err) {
          console.warn('Error leaving Agora channel on unload:', err)
        }
      }
    }

    // Listen for both beforeunload (desktop) and pagehide (mobile/tabs)
    window.addEventListener('beforeunload', handleUnload)
    window.addEventListener('pagehide', handleUnload)

    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      window.removeEventListener('pagehide', handleUnload)
    }
  }, [user, partnerId, client, localAudioTrack, localVideoTrack])

  // Force clean disconnect on page hide (mobile background) - suppress reconnection attempts
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && isConnected) {
        console.log('Page hidden — broadcasting force end call to prevent hanging')
        // Broadcast force end signal to other user via Supabase Realtime
        if (user && partnerId) {
          const roomName = [user.id, partnerId].sort().join('-')
          const channel = supabase.channel(`call:${roomName}`)
          try {
            await channel.send({
              type: 'broadcast',
              event: 'force_end_call',
              payload: { ended_by: user.id },
            })
          } catch (err) {
            console.warn('Failed to broadcast force_end_call on visibility change:', err)
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, partnerId, isConnected])

  // Fetch other user's profile picture
  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('photos, main_photo_index')
          .eq('user_id', partnerId)
          .single()

        if (data?.photos && data.photos.length > 0) {
          const mainIndex = data.main_photo_index || 0
          setOtherUserImage(data.photos[mainIndex] || null)
        }
      } catch (err) {
        // Silently handle profile fetch errors
      }
    }

    if (partnerId) {
      fetchOtherUserProfile()
    }
  }, [partnerId])

  useEffect(() => {
    if (!user || !partnerId || !appId) return

    // Prevent calling yourself
    if (user.id === partnerId) {
      setError('You cannot call yourself')
      return
    }

    const initializeCall = async () => {
      try {
        // Initialize Agora SDK
        const agoraSDK = await initAgoraSDK()
        // Get session for authorization
        const session = await getSession()
        if (!session) {
          setError('Authentication required')
          return
        }

        // For incoming calls, the invitation is already created by the caller
        // For outgoing calls, the invitation was created when they clicked the call button
        // Only need to mark it as accepted when the call starts
        if (mode === 'outgoing' && callId) {
          try {
            await supabase
              .from('call_invitations')
              .update({ status: 'accepted' })
              .eq('id', callId)
          } catch (err) {
            console.warn('Failed to update call status to accepted:', err)
          }
        }

        // Generate channel name and uid
        const channelName = generateChannelName(user.id, partnerId)
        const uid = userIdToAgoraUid(user.id)

        // Fetch Agora token from server
        console.log('Fetching Agora token:', { channelName, uid })
        const tokenResponse = await fetch(
          `/api/agora/token?channel=${encodeURIComponent(channelName)}&uid=${uid}`
        )

        if (!tokenResponse.ok) {
          let errorMsg = `Token request failed with status ${tokenResponse.status}`
          try {
            const errorData = await tokenResponse.json()
            errorMsg = errorData.error || errorMsg
          } catch (err) {
            console.error('Failed to parse error response:', err)
          }

          console.error('Token fetch failed:', {
            status: tokenResponse.status,
            error: errorMsg,
          })

          setError(errorMsg || 'Failed to connect call. Please try again.')
          return
        }

        const { token } = await tokenResponse.json()

        // Initialize Agora client
        const agoraClient = agoraSDK.createClient({ mode: 'rtc', codec: 'vp8' })
        setClient(agoraClient)

        // Handle remote user published event
        agoraClient.on('user-published', async (user, mediaType) => {
          await agoraClient.subscribe(user, mediaType)
          if (mediaType === 'video') {
            setRemoteCameraEnabled(true)
            setRemoteUsers((prevUsers) => {
              const isFirstRemoteUser = prevUsers.length === 0
              const updated = [
                ...prevUsers.filter((u) => u.uid !== user.uid),
                user,
              ]
              // Start timer and log when first remote user connects
              if (isFirstRemoteUser) {
                setIsConnected(true)
                callStartTimeRef.current = Date.now()
                if (callTimerRef.current) {
                  clearInterval(callTimerRef.current)
                }
                callTimerRef.current = setInterval(() => {
                  setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000))
                }, 1000)

                // Log ongoing call message when connection is established
                if (!ongoingLoggedRef.current) {
                  ongoingLoggedRef.current = true
                  logCallMessage(partnerId, callType, 'ongoing').then((newCallId) => {
                    if (newCallId) {
                      callIdRef.current = newCallId
                      setLoggedCallId(newCallId)
                    }
                  }).catch((err) => {
                    console.warn('Failed to log ongoing call:', err)
                  })
                }
              }
              return updated
            })
          }
          if (mediaType === 'audio') {
            setRemoteAudioEnabled(true)
            user.audioTrack?.play()
            // Also mark as connected if audio arrives (for audio-only calls)
            setIsConnected(true)
            if (callStartTimeRef.current === 0) {
              callStartTimeRef.current = Date.now()
              if (callTimerRef.current) {
                clearInterval(callTimerRef.current)
              }
              callTimerRef.current = setInterval(() => {
                setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000))
              }, 1000)

              // Log ongoing call message when connection is established
              if (!ongoingLoggedRef.current) {
                ongoingLoggedRef.current = true
                logCallMessage(partnerId, callType, 'ongoing').then((newCallId) => {
                  if (newCallId) {
                    callIdRef.current = newCallId
                    setLoggedCallId(newCallId)
                  }
                }).catch((err) => {
                  console.warn('Failed to log ongoing call:', err)
                })
              }
            }
          }
        })

        // Handle remote user unpublished event
        agoraClient.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') {
            setRemoteCameraEnabled(false)
          }
          if (mediaType === 'audio') {
            setRemoteAudioEnabled(false)
          }
          setRemoteUsers((prevUsers) => {
            const updated = prevUsers.filter((u) => u.uid !== user.uid)
            // If no more remote users, stop the timer
            if (updated.length === 0) {
              if (callTimerRef.current) {
                clearInterval(callTimerRef.current)
                callTimerRef.current = null
              }
              // Only update connection state if call didn't end cleanly
              // (clean end is handled by force_end_call broadcast listener)
              if (!isCallEndedCleanly) {
                setIsConnected(false)
              }
              callStartTimeRef.current = 0
            }
            return updated
          })
        })

        // Handle connection state changes (network issues)
        agoraClient.on('connection-state-change', (curState, prevState, reason) => {
          if (curState === 'CONNECTED') {
            setConnectionState('connected')
          } else if (curState === 'RECONNECTING') {
            setConnectionState('reconnecting')
          } else if (curState === 'DISCONNECTED') {
            // Ignore DISCONNECTED state if we just received an intentional end signal
            if (justReceivedEndSignalRef.current) {
              console.log('Ignoring DISCONNECTED state — intentional end detected')
              return
            }
            setConnectionState('disconnected')
          }
        })

        // Create local audio and video tracks
        const audioTrack = await agoraSDK.createMicrophoneAudioTrack()
        const videoTrack = isAudioOnly ? null : await agoraSDK.createCameraVideoTrack()

        setLocalAudioTrack(audioTrack)
        if (videoTrack) {
          setLocalVideoTrack(videoTrack)
        }

        // Join channel
        await agoraClient.join(appId, channelName, token, uid)

        // Publish local tracks
        const tracksToPublish = videoTrack ? [audioTrack, videoTrack] : [audioTrack]
        await agoraClient.publish(tracksToPublish)

        // Play local video (for video calls only)
        // Using string ID is the Agora-recommended pattern for reliable playback
        if (!isAudioOnly && videoTrack) {
          videoTrack.play('local-player')
        }

        // UI is ready immediately after publishing local tracks
        // Timer will start when remote user connects
        setLoading(false)
      } catch (err: any) {
        console.error('Call initialization error:', {
          message: err.message,
          stack: err.stack,
          code: err.code,
        })
        setError(err.message || 'Failed to initialize call. Please try again.')
        setLoading(false)
      }
    }

    initializeCall()

    return () => {
      // Cleanup
      const cleanup = async () => {
        // Clear call timer
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current)
        }

        // Stop and close audio track
        if (localAudioTrack) {
          await localAudioTrack.setEnabled(false)
          localAudioTrack.close()
        }

        // Stop and close video track
        if (localVideoTrack) {
          await localVideoTrack.setEnabled(false)
          localVideoTrack.close()
        }

        // Leave the channel
        if (client) {
          await client.leave()
        }
      }
      cleanup()
    }
  }, [user, partnerId, appId, getSession, isAudioOnly])


  // Play remote video when remote users change
  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (remoteVideoContainerRef.current) {
        user.videoTrack?.play(remoteVideoContainerRef.current)
      }
    })
  }, [remoteUsers])

  // Play local video track to container once both are ready
  useEffect(() => {
    if (!isAudioOnly && localVideoTrack && localVideoContainerRef.current && !loading) {
      try {
        localVideoTrack.play(localVideoContainerRef.current)
        console.log('Local video track played to container')
      } catch (err) {
        console.warn('Error playing local video track:', err)
      }
    }
  }, [localVideoTrack, loading, isAudioOnly])

  const toggleAudio = async () => {
    if (!localAudioTrack) return

    try {
      const newMutedState = !isMuted
      if (newMutedState) {
        await localAudioTrack.setEnabled(false)
      } else {
        await localAudioTrack.setEnabled(true)
      }
      setIsMuted(newMutedState)

      // Broadcast media state change to remote user
      if (user && partnerId) {
        const roomName = [user.id, partnerId].sort().join('-')
        const channel = supabase.channel(`call:${roomName}`)
        try {
          await channel.send({
            type: 'broadcast',
            event: 'media_state',
            payload: { type: 'mic', enabled: !newMutedState },
          })
        } catch (err) {
          console.warn('Failed to broadcast media state change for mic:', err)
        }
      }
    } catch (err) {
      console.error('Error toggling audio:', err)
      toast.error('Failed to toggle microphone')
    }
  }

  const toggleVideo = async () => {
    if (!localVideoTrack) return

    try {
      const newCameraOffState = !isCameraOff
      if (newCameraOffState) {
        await localVideoTrack.setEnabled(false)
      } else {
        await localVideoTrack.setEnabled(true)
      }
      setIsCameraOff(newCameraOffState)

      // Broadcast media state change to remote user
      if (user && partnerId) {
        const roomName = [user.id, partnerId].sort().join('-')
        const channel = supabase.channel(`call:${roomName}`)
        try {
          await channel.send({
            type: 'broadcast',
            event: 'media_state',
            payload: { type: 'camera', enabled: !newCameraOffState },
          })
        } catch (err) {
          console.warn('Failed to broadcast media state change for camera:', err)
        }
      }
    } catch (err) {
      console.error('Error toggling video:', err)
      toast.error('Failed to toggle camera')
    }
  }

  const toggleAudioOutput = async () => {
    // Note: Audio output routing on web is limited by platform constraints:
    // - iOS: Must use system controls (Control Center or device buttons)
    // - Android: Attempts hardware routing via getUserMedia constraints
    // - Desktop: Uses standard Web Audio setSinkId API
    // Agora SDK's internal audio processing may limit some routing capabilities

    try {
      const newEarpiece = !useEarpiece
      setUseEarpiece(newEarpiece)

      const deviceTarget = newEarpiece ? 'earpiece' : 'speaker'
      console.log(`[Audio Output] Toggling to: ${deviceTarget}`)

      // Detect iOS vs Android
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)

      console.log(`[Audio Output] Device: iOS=${isIOS}, Android=${isAndroid}`)

      // Check if browser supports setSinkId
      const supportsSetSinkId = 'setSinkId' in HTMLMediaElement.prototype

      if (isIOS) {
        console.log('[Audio Output] iOS detected - audio routing controlled by system')
        toast.info('📱 iPhone/iPad: Use device buttons or swipe up Control Center to switch audio (Earpiece, Speaker, or Bluetooth)')
        return
      }

      if (!supportsSetSinkId && !isAndroid) {
        console.warn('[Audio Output] Browser does not support setSinkId')
        toast.warning('Your browser/device may not support audio output switching')
        return
      }

      // Try to get available audio output devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioOutputDevices = devices.filter((d) => d.kind === 'audiooutput')

        console.log(`[Audio Output] Found ${audioOutputDevices.length} audio output devices`)
        audioOutputDevices.forEach((d, i) => {
          console.log(`  [${i}] ${d.label || 'Unknown'} - ${d.deviceId.slice(0, 8)}...`)
        })

        if (audioOutputDevices.length < 2) {
          console.log('[Audio Output] Less than 2 devices - switching may not be available')
          toast.info('Only one audio output device found')
          return
        }

        // Find target device based on label
        let targetDeviceId = audioOutputDevices[0].deviceId
        let targetLabel = audioOutputDevices[0].label || 'Device'

        if (newEarpiece) {
          const match = audioOutputDevices.find(
            (d) =>
              d.label.toLowerCase().includes('earpiece') ||
              d.label.toLowerCase().includes('receiver') ||
              d.label.toLowerCase().includes('handset')
          )
          if (match) {
            targetDeviceId = match.deviceId
            targetLabel = match.label || 'Earpiece'
          } else {
            // Default to first device for earpiece
            targetDeviceId = audioOutputDevices[0].deviceId
            targetLabel = audioOutputDevices[0].label || 'Device'
          }
        } else {
          const match = audioOutputDevices.find(
            (d) =>
              d.label.toLowerCase().includes('speaker') ||
              d.label.toLowerCase().includes('loudspeaker') ||
              d.label.toLowerCase().includes('external')
          )
          if (match) {
            targetDeviceId = match.deviceId
            targetLabel = match.label || 'Speaker'
          } else {
            // Default to last device for speaker
            targetDeviceId = audioOutputDevices[audioOutputDevices.length - 1].deviceId
            targetLabel = audioOutputDevices[audioOutputDevices.length - 1].label || 'Device'
          }
        }

        console.log(`[Audio Output] Target: ${targetLabel} (${targetDeviceId.slice(0, 8)}...)`)

        // Strategy 1: Apply to all audio elements
        const audioElements = document.querySelectorAll('audio')
        console.log(`[Audio Output] Found ${audioElements.length} audio elements`)

        let successCount = 0
        const errors: string[] = []

        for (const audioEl of audioElements) {
          try {
            if (typeof (audioEl as any).setSinkId === 'function') {
              await (audioEl as any).setSinkId(targetDeviceId)
              successCount++
              console.log(`[Audio Output] ✓ Successfully routed audio element to ${targetLabel}`)
            }
          } catch (err: any) {
            const errMsg = err?.message || String(err)
            errors.push(errMsg)
            console.warn(`[Audio Output] ✗ Failed to set sink: ${errMsg}`)
          }
        }

        // Strategy 2: For Android, try using getUserMedia with device constraints
        // This hints to the OS which device to prefer for audio output
        if (isAndroid && successCount === 0) {
          console.log('[Audio Output] Android detected - attempting audio routing via device constraints')
          try {
            // On Android, we can influence audio routing by requesting getUserMedia
            // with the preferred device. Note: This works best when integrated with
            // the Agora SDK's internal audio routing, but browser limitations apply.
            const constraints = {
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            }

            // Try the version that works best with Agora
            const stream = await navigator.mediaDevices.getUserMedia(constraints)

            // Check if we can set sink on any audio elements within this stream
            const audioTracks = stream.getAudioTracks()
            if (audioTracks.length > 0) {
              // Store reference to the stream to keep audio routing active
              // This is particularly important on Android for persistent routing
              const audioElement = document.createElement('audio')
              audioElement.srcObject = stream
              audioElement.volume = 0 // Silent - just for routing
              audioElement.style.display = 'none'

              if (typeof (audioElement as any).setSinkId === 'function') {
                try {
                  await (audioElement as any).setSinkId(targetDeviceId)
                  document.body.appendChild(audioElement)
                  successCount++
                  console.log(`[Audio Output] ✓ Audio routing established via getUserMedia`)
                } catch (err) {
                  console.warn('[Audio Output] setSinkId failed on synthesized element:', err)
                  stream.getTracks().forEach((track) => track.stop())
                }
              } else {
                stream.getTracks().forEach((track) => track.stop())
              }
            } else {
              stream.getTracks().forEach((track) => track.stop())
            }
          } catch (err: any) {
            const errMsg = err?.message || String(err)
            console.warn(`[Audio Output] Android audio routing method failed: ${errMsg}`)
          }
        }

        // Report results
        if (successCount > 0) {
          console.log(`[Audio Output] ✓ Success: Audio output routing applied`)
          toast.success(`Switched to ${targetLabel}`)
        } else if (audioElements.length === 0) {
          console.warn('[Audio Output] No audio elements detected - call may not be fully connected yet')
          toast.info('Tip: Make sure the call is connected and audio is active, then try again')
        } else {
          // Fallback message when routing isn't possible but call is connected
          console.warn('[Audio Output] Browser/system limitations prevent audio output routing:', errors)
          toast.info(`🔊 ${targetLabel} selected. Note: Full audio routing may depend on system settings on this device`)
        }
      } catch (err: any) {
        console.error('[Audio Output] Error enumerating audio devices:', err)
        toast.warning('Audio device switching not fully supported on this browser/device')
      }
    } catch (err) {
      console.error('[Audio Output] Unexpected error:', err)
    }
  }

  const endCall = async () => {
    try {
      // Mark as intentional end FIRST — suppress "connection lost" UI
      setJustReceivedEndSignal(true)
      justReceivedEndSignalRef.current = true

      // 1. BROADCAST FORCE END FIRST — critical for symmetry using httpSend
      if (user && partnerId) {
        const roomName = [user.id, partnerId].sort().join('-')
        const channel = supabase.channel(`call:${roomName}`)
        try {
          await channel.send({
            type: 'broadcast',
            event: 'force_end_call',
            payload: { ended_by: user.id, timestamp: Date.now() },
          })
        } catch (err) {
          console.warn('Failed to broadcast force_end_call event:', err)
          // Continue with cleanup even if broadcast fails
        }
      }

      // 2. Clear call timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }

      // 3. Log ended call with duration
      try {
        const finalDuration = Math.floor((Date.now() - callStartTimeRef.current) / 1000)
        if (ongoingLoggedRef.current && callIdRef.current) {
          await logCallMessage(partnerId, callType, 'ended', finalDuration, callIdRef.current)
        }
      } catch (err) {
        console.warn('Failed to log ended call:', err)
      }

      // 4. Delete call invitation from database when call ends
      // This prevents duplicate key constraint violations on future calls
      if (user) {
        const roomName = [user.id, partnerId].sort().join('-')
        try {
          await supabase
            .from('call_invitations')
            .delete()
            .eq('room_name', roomName)
        } catch (err) {
          // Silently handle - deletion is cleanup, not critical to call flow
          console.warn('Failed to cleanup call invitation:', err)
        }
      }

      // 5. Local cleanup - stop and close tracks
      // Safely stop and close tracks (check if they exist and are not already closed)
      if (localAudioTrack) {
        try {
          await localAudioTrack.setEnabled(false)
          localAudioTrack.close()
        } catch (err) {
          console.warn('Error cleaning up audio track:', err)
        }
      }

      if (localVideoTrack) {
        try {
          await localVideoTrack.setEnabled(false)
          localVideoTrack.close()
        } catch (err) {
          console.warn('Error cleaning up video track:', err)
        }
      }

      // Leave the channel
      if (client) {
        try {
          await client.leave()
        } catch (err) {
          console.warn('Error leaving Agora channel:', err)
        }
      }

      // 6. Force redirect — hard redirect, no state/navigation bugs
      window.location.href = `/messages?user=${partnerId}`
    } catch (err) {
      console.warn('endCall error (safe):', err)
      // Still force redirect
      window.location.href = `/messages?user=${partnerId}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Connecting call...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <p className="text-white font-medium mb-4">Unable to start call</p>
          <p className="text-rose-300 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push('/messages')}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-rose-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const remoteUser = remoteUsers[0]

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const getStatusMessage = () => {
    // Show media status when intentionally disabled/muted (check this FIRST)
    // This takes priority over connection state since media_state broadcasts are explicit
    if (!remoteCameraEnabled && !remoteAudioEnabled) {
      return 'Camera and microphone off'
    }
    if (!remoteCameraEnabled && remoteAudioEnabled) {
      return 'Camera off'
    }
    if (!remoteAudioEnabled && remoteCameraEnabled) {
      return 'Microphone muted'
    }

    // Only show connection state issues if media is enabled but connection is down
    if (connectionState === 'reconnecting') {
      return 'Reconnecting...'
    }
    if (connectionState === 'disconnected') {
      return 'Connection lost'
    }

    // All good - return empty string
    return ''
  }

  if (isAudioOnly) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          {otherUserImage ? (
            <>
              {/* Background with blur effect */}
              <div
                className="absolute inset-0 bg-cover bg-center blur-xl opacity-40"
                style={{ backgroundImage: `url('${otherUserImage}')` }}
              />
              {/* Profile picture circle */}
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                  <Image
                    src={otherUserImage}
                    alt={partnerName || 'User'}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-white text-2xl font-semibold">{partnerName}</p>
                  <p className="text-gray-300 text-sm mt-2">Audio call in progress</p>
                  {isConnected && (
                    <p className="text-primary text-lg font-semibold mt-4">
                      {formatDuration(callDuration)}
                    </p>
                  )}
                  {getStatusMessage() && (
                    <p className="text-gray-400 text-sm mt-3">{getStatusMessage()}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-rose-700 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Phone className="w-12 h-12 text-white" />
              </div>
              <p className="text-white text-xl font-semibold">{partnerName}</p>
              <p className="text-gray-400 text-sm mt-2">Audio call in progress</p>
              {isConnected && (
                <p className="text-primary text-lg font-semibold mt-4">
                  {formatDuration(callDuration)}
                </p>
              )}
              {!isConnected && (
                <div className="flex items-center justify-center gap-2 text-slate-400 mt-6">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Waiting for {partnerName}...</span>
                </div>
              )}
              {getStatusMessage() && (
                <p className="text-gray-400 text-sm mt-3">{getStatusMessage()}</p>
              )}
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-4 z-10 px-4">
          {/* Mute button */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff size={24} className="text-white" />
            ) : (
              <Mic size={24} className="text-white" />
            )}
          </button>

          {/* Speaker/Earpiece toggle button */}
          <button
            onClick={toggleAudioOutput}
            className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition"
            aria-label={useEarpiece ? 'Switch to speaker' : 'Switch to earpiece'}
            title={useEarpiece ? 'Switch to Speaker' : 'Switch to Earpiece'}
          >
            <span className="text-white text-xl">{useEarpiece ? '🔇' : '🔊'}</span>
          </button>

          {/* End call button */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-primary hover:bg-rose-700 transition"
            aria-label="End call"
          >
            <Phone size={24} className="text-white rotate-[135deg]" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Remote video - full screen */}
      <div
        ref={remoteVideoContainerRef}
        className="absolute inset-0 w-full h-full bg-black flex items-center justify-center"
      >
        {!remoteUser ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Waiting for {partnerName}...</p>
            {getStatusMessage() && (
              <p className="text-gray-400 text-sm mt-3">{getStatusMessage()}</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Header with call info */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent px-6 py-4 z-20 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">Video Call</h3>
          <p className="text-gray-300 text-sm">{partnerName}</p>
          {getStatusMessage() && (
            <p className="text-gray-400 text-xs mt-1">{getStatusMessage()}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="text-white text-sm font-medium">
              {formatDuration(callDuration)}
            </div>
          )}
          <button
            onClick={endCall}
            className="p-2 hover:bg-red-500/20 rounded-lg transition text-white"
            aria-label="End call"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Local video - floating bubble */}
      <div className="absolute bottom-24 right-6 w-28 h-40 rounded-2xl overflow-hidden border-4 border-primary soft-glow-lg z-20 bg-slate-900">
        <div
          id="local-player"
          ref={localVideoContainerRef}
          className="w-full h-full bg-slate-800"
        />
      </div>

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-4 z-10 px-4">
        {/* Mute button */}
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition ${
            isMuted
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-slate-700 hover:bg-slate-600'
          }`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <MicOff size={24} className="text-white" />
          ) : (
            <Mic size={24} className="text-white" />
          )}
        </button>

        {/* Camera toggle button - only for video calls */}
        {!isAudioOnly && (
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition ${
              isCameraOff
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            aria-label={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isCameraOff ? (
              <VideoOff size={24} className="text-white" />
            ) : (
              <VideoIcon size={24} className="text-white" />
            )}
          </button>
        )}

        {/* Speaker/Earpiece toggle button */}
        <button
          onClick={toggleAudioOutput}
          className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition"
          aria-label={useEarpiece ? 'Switch to speaker' : 'Switch to earpiece'}
          title={useEarpiece ? 'Switch to Speaker' : 'Switch to Earpiece'}
        >
          <span className="text-white text-xl">{useEarpiece ? '🔇' : '🔊'}</span>
        </button>

        {/* End call button */}
        <button
          onClick={endCall}
          className="p-4 rounded-full bg-primary hover:bg-rose-700 transition"
          aria-label="End call"
        >
          <Phone size={24} className="text-white rotate-[135deg]" />
        </button>
      </div>

      {/* Partner info */}
      {remoteUser && (
        <div className="absolute top-4 left-4 text-white z-10">
          <p className="font-semibold">{partnerName}</p>
          <p className="text-sm text-rose-200">Connected</p>
        </div>
      )}
    </div>
  )
}
