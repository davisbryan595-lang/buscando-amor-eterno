'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react'

interface AudioCallProps {
  otherUserName: string | null
  otherUserImage: string | null
  isIncoming?: boolean
  onAccept: () => void
  onReject: () => void
  onHangup: () => void
}

export default function AudioCall({
  otherUserName,
  otherUserImage,
  isIncoming = false,
  onAccept,
  onReject,
  onHangup,
}: AudioCallProps) {
  const [isCallActive, setIsCallActive] = useState(!isIncoming)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    if (!isCallActive) return

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isCallActive])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAccept = () => {
    setIsCallActive(true)
    onAccept()
  }

  const handleHangup = () => {
    setIsCallActive(false)
    onHangup()
  }

  if (isIncoming && !isCallActive) {
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
              <p className="text-slate-600 mt-2">Incoming audio call...</p>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={onReject}
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-80 text-white relative">
      {/* Call Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <h3 className="font-semibold text-lg">{otherUserName || 'User'}</h3>
        <button
          onClick={handleHangup}
          className="p-2 hover:bg-white/10 rounded-full transition"
          aria-label="End call"
        >
          <PhoneOff size={24} className="text-red-400" />
        </button>
      </div>

      {/* User Avatar */}
      <div className="relative w-32 h-32 mb-6">
        <Image
          src={otherUserImage || '/placeholder.svg'}
          alt={otherUserName || 'User'}
          fill
          className="rounded-full object-cover"
        />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-800" />
      </div>

      {/* Call Status */}
      <div className="text-center mb-8">
        <p className="text-3xl font-bold font-mono tracking-widest mb-2">{formatDuration(callDuration)}</p>
        <p className="text-slate-300">Audio call in progress</p>
      </div>

      {/* Controls */}
      <div className="flex gap-6 items-center justify-center">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
          }`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button
          onClick={handleHangup}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition flex-shrink-0"
          aria-label="End call"
        >
          <PhoneOff size={28} />
        </button>
      </div>

      {/* Muted Indicator */}
      {isMuted && <p className="mt-6 text-sm text-red-400 font-semibold">Microphone muted</p>}
    </div>
  )
}
