'use client'

import React, { useEffect, useRef, useState } from 'react'
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng'
import { Mic, MicOff, Video as VideoIcon, VideoOff, Phone, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'

interface AgoraCallProps {
  partnerId: string
  partnerName?: string
}

export default function AgoraVideoCall({
  partnerId,
  partnerName,
}: AgoraCallProps) {
  const router = useRouter()
  const { user, getSession } = useAuth()
  const [client, setClient] = useState<IAgoraRTCClient | null>(null)
  const [localAudioTrack, setLocalAudioTrack] =
    useState<ReturnType<typeof AgoraRTC.createMicrophoneAudioTrack> | null>(
      null
    )
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ReturnType<typeof AgoraRTC.createCameraVideoTrack> | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const localVideoContainerRef = useRef<HTMLDivElement>(null)
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null)

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID

  useEffect(() => {
    if (!user || !partnerId || !appId) return

    const initializeCall = async () => {
      try {
        // Get session for authorization
        const session = await getSession()
        if (!session) {
          setError('Authentication required')
          return
        }

        // Fetch Agora token from server
        const tokenResponse = await fetch('/api/agora/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ partnerId }),
        })

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json()
          setError(errorData.error || 'Failed to get call token')
          return
        }

        const { token, uid, channelName } = await tokenResponse.json()

        // Initialize Agora client
        const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        setClient(agoraClient)

        // Handle remote user published event
        agoraClient.on('user-published', async (user, mediaType) => {
          await agoraClient.subscribe(user, mediaType)
          if (mediaType === 'video') {
            setRemoteUsers((prevUsers) => [
              ...prevUsers.filter((u) => u.uid !== user.uid),
              user,
            ])
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play()
          }
        })

        // Handle remote user unpublished event
        agoraClient.on('user-unpublished', (user) => {
          setRemoteUsers((prevUsers) =>
            prevUsers.filter((u) => u.uid !== user.uid)
          )
        })

        // Create local audio and video tracks
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        const videoTrack = await AgoraRTC.createCameraVideoTrack()

        setLocalAudioTrack(audioTrack)
        setLocalVideoTrack(videoTrack)

        // Join channel
        await agoraClient.join(appId, channelName, token, uid)

        // Publish local tracks
        await agoraClient.publish([audioTrack, videoTrack])

        // Play local video
        if (localVideoContainerRef.current) {
          videoTrack.play(localVideoContainerRef.current)
        }

        setLoading(false)
      } catch (err: any) {
        console.error('Call initialization error:', err)
        setError(err.message || 'Failed to initialize call')
        setLoading(false)
      }
    }

    initializeCall()

    return () => {
      // Cleanup
      const cleanup = async () => {
        if (localAudioTrack) {
          localAudioTrack.close()
        }
        if (localVideoTrack) {
          localVideoTrack.close()
        }
        if (client) {
          await client.leave()
        }
      }
      cleanup()
    }
  }, [user, partnerId, appId, getSession])

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
      if (localAudioTrack) {
        localAudioTrack.close()
      }
      if (localVideoTrack) {
        localVideoTrack.close()
      }
      if (client) {
        await client.leave()
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

        {/* Camera toggle button */}
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
