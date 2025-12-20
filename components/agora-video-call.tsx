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
  const [remoteCameraEnabled, setRemoteCameraEnabled] = useState(true)
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true)
  const [connectionState, setConnectionState] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected')
  const localVideoContainerRef = useRef<HTMLDivElement>(null)
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null)
  const callStartTimeRef = useRef<number>(0)
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const ongoingLoggedRef = useRef(false)

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID

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
                  logCallMessage(partnerId, callType, 'ongoing').catch((err) => {
                    console.warn('Failed to log ongoing call:', err)
                  })
                }
              }
              return updated
            })
          }
          if (mediaType === 'audio') {
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
                logCallMessage(partnerId, callType, 'ongoing').catch((err) => {
                  console.warn('Failed to log ongoing call:', err)
                })
              }
            }
          }
        })

        // Handle remote user unpublished event
        agoraClient.on('user-unpublished', (user) => {
          setRemoteUsers((prevUsers) => {
            const updated = prevUsers.filter((u) => u.uid !== user.uid)
            // If no more remote users, stop the timer
            if (updated.length === 0) {
              if (callTimerRef.current) {
                clearInterval(callTimerRef.current)
                callTimerRef.current = null
              }
              setIsConnected(false)
              callStartTimeRef.current = 0
            }
            return updated
          })
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
        if (!isAudioOnly && videoTrack && localVideoContainerRef.current) {
          videoTrack.play(localVideoContainerRef.current)
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

  const toggleAudio = async () => {
    if (!localAudioTrack) return

    try {
      if (isMuted) {
        await localAudioTrack.setEnabled(true)
      } else {
        await localAudioTrack.setEnabled(false)
      }
      setIsMuted(!isMuted)
    } catch (err) {
      console.error('Error toggling audio:', err)
      toast.error('Failed to toggle microphone')
    }
  }

  const toggleVideo = async () => {
    if (!localVideoTrack) return

    try {
      if (isCameraOff) {
        await localVideoTrack.setEnabled(true)
      } else {
        await localVideoTrack.setEnabled(false)
      }
      setIsCameraOff(!isCameraOff)
    } catch (err) {
      console.error('Error toggling video:', err)
      toast.error('Failed to toggle camera')
    }
  }

  const endCall = async () => {
    try {
      // Clear call timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }

      // Log ended call with duration
      try {
        const finalDuration = Math.floor((Date.now() - callStartTimeRef.current) / 1000)
        if (ongoingLoggedRef.current) {
          await logCallMessage(partnerId, callType, 'ended', finalDuration)
        }
      } catch (err) {
        console.warn('Failed to log ended call:', err)
      }

      // Delete call invitation from database when call ends
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

      // Unpublish all tracks before leaving
      if (client) {
        await client.unpublish()
      }

      // Leave the channel
      if (client) {
        await client.leave()
      }

      // Clear video containers
      if (localVideoContainerRef.current) {
        localVideoContainerRef.current.innerHTML = ""
      }
      if (remoteVideoContainerRef.current) {
        remoteVideoContainerRef.current.innerHTML = ""
      }

      router.push('/messages')
    } catch (err) {
      console.error('Error ending call:', err)
      router.push('/messages')
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
          </div>
        ) : null}
      </div>

      {/* Header with call info */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent px-6 py-4 z-20 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">Video Call</h3>
          <p className="text-gray-300 text-sm">{partnerName}</p>
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
