'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { useWebRTC } from '@/hooks/useWebRTC'

interface VideoCallProps {
  otherUserId: string
  otherUserName: string | null
  otherUserImage: string | null
  isIncoming?: boolean
  onAccept: () => void
  onReject: () => void
  onHangup: () => void
}

export default function VideoCall({
  otherUserId,
  otherUserName,
  otherUserImage,
  isIncoming = false,
  onAccept,
  onReject,
  onHangup,
}: VideoCallProps) {
  const { callState, error, initiateCall, acceptCall, rejectCall, endCall, toggleAudio, toggleVideo, incomingCall, remoteStream, localStream } = useWebRTC(otherUserId, 'video')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null)
  const localVideoRef = React.useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!isIncoming && callState.status !== 'active') return
    if (isIncoming && !incomingCall) return

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isIncoming, incomingCall, callState.status])

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (!isIncoming && callState.status === 'idle') {
      initiateCall('video').catch((err) => console.error('Failed to initiate call:', err))
    }
  }, [isIncoming, callState.status, initiateCall])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAccept = async () => {
    await acceptCall()
    onAccept()
  }

  const handleReject = () => {
    rejectCall()
    onReject()
  }

  const handleHangup = () => {
    endCall()
    onHangup()
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    toggleAudio(!isMuted)
  }

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    toggleVideo(!isVideoOn)
  }

  if (incomingCall && callState.status !== 'active') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-24 h-24">
              <Image
                src={otherUserImage || '/placeholder.svg'}
                alt={otherUserName || 'User'}
                fill
                className="rounded-full object-cover"
              />
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{otherUserName || 'User'}</p>
              <p className="text-slate-600 mt-2">Incoming video call...</p>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={handleReject}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition font-semibold flex items-center justify-center gap-2"
              >
                <PhoneOff size={20} />
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2"
              >
                <Phone size={20} />
                Accept
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black rounded-2xl overflow-hidden flex flex-col h-full relative">
      {/* Remote video */}
      <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <Image
                src={otherUserImage || '/placeholder.svg'}
                alt={otherUserName || 'User'}
                fill
                className="rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-black" />
            </div>
            <p className="text-2xl font-bold text-white mb-2">{otherUserName || 'User'}</p>
            <p className="text-slate-300 font-mono text-xl">{formatDuration(callDuration)}</p>
          </div>
        )}
      </div>

      {/* Local video preview (bottom right) */}
      <div className="absolute bottom-6 right-6 w-32 h-40 rounded-xl overflow-hidden border-2 border-white bg-slate-900 flex items-center justify-center">
        {localStream && isVideoOn ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : isVideoOn ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-center p-2">
            <div className="text-sm font-semibold">Waiting for camera...</div>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
            <VideoOff size={32} />
          </div>
        )}
      </div>

      {/* Call Header - User Name and Duration */}
      <div className="absolute top-6 left-6 text-white">
        <p className="text-lg font-semibold">{otherUserName || 'User'}</p>
        <p className="text-sm text-slate-300">{isVideoOn ? 'Video call' : 'Video off'}</p>
      </div>

      {/* End call button (top right) */}
      <button
        onClick={handleHangup}
        className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition"
        aria-label="End call"
      >
        <PhoneOff size={28} className="text-red-400" />
      </button>

      {/* Controls - Bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 items-center justify-center">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
          }`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
            !isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
          }`}
          aria-label={isVideoOn ? 'Turn off video' : 'Turn on video'}
        >
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button
          onClick={handleHangup}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition flex-shrink-0"
          aria-label="End call"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  )
}
