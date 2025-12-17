'use client'

import React, { useEffect, useState } from 'react'
import { Phone, PhoneOff, Video, Mic, Clock } from 'lucide-react'
import Image from 'next/image'
import { IncomingCall } from '@/hooks/useIncomingCalls'

interface IncomingCallModalProps {
  call: IncomingCall | null
  onAccept: (callId: string) => Promise<void>
  onReject: (callId: string) => Promise<void>
}

export default function IncomingCallModal({
  call,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (!call) {
      setTimeLeft(60)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [call])

  if (!call) return null

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      await onAccept(call.id)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      await onReject(call.id)
    } finally {
      setIsRejecting(false)
    }
  }

  const callIcon = call.call_type === 'video' ? (
    <Video className="w-8 h-8 text-white" />
  ) : (
    <Mic className="w-8 h-8 text-white" />
  )

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm pointer-events-auto">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in duration-300">
        {/* Gradient Header with Call Type */}
        <div className="bg-gradient-to-r from-primary via-rose-500 to-rose-700 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 mx-auto border border-white/30">
              {callIcon}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {call.call_type === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call'}
            </h2>
            <div className="flex items-center justify-center gap-2 text-white/90 text-sm font-medium">
              <Clock size={14} />
              <span>Answering in {timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Caller Info - Enhanced */}
        <div className="p-8 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-28">
              {call.caller_image ? (
                <Image
                  src={call.caller_image}
                  alt={call.caller_name || 'Caller'}
                  fill
                  className="rounded-full object-cover shadow-lg border-4 border-white"
                  priority
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-rose-700 flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-white text-3xl font-bold">
                    {(call.caller_name || 'C')[0].toUpperCase()}
                  </span>
                </div>
              )}
              {/* Call type badge */}
              <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-md">
                {call.call_type === 'video' ? (
                  <Video size={16} />
                ) : (
                  <Mic size={16} />
                )}
              </div>
            </div>
          </div>

          {/* Caller Name */}
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            {call.caller_name || 'Unknown Caller'}
          </h3>
          <p className="text-slate-600 text-sm">
            {call.call_type === 'video'
              ? 'wants to video call with you'
              : 'wants to call you'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex gap-4 bg-white">
          <button
            onClick={handleReject}
            disabled={isRejecting || isAccepting}
            className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-50 text-slate-900 rounded-full font-semibold transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            <PhoneOff size={20} />
            <span>Decline</span>
          </button>
          <button
            onClick={handleAccept}
            disabled={isAccepting || isRejecting}
            className="flex-1 py-4 px-6 bg-green-500 hover:bg-green-600 disabled:bg-green-500 disabled:opacity-50 text-white rounded-full font-semibold transition flex items-center justify-center gap-2 transform active:scale-95 shadow-lg"
          >
            <Phone size={20} />
            <span>Accept</span>
          </button>
        </div>

        {/* Timer Footer */}
        <div className="px-6 pb-6 text-center bg-white">
          <div className="inline-flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-4 py-2 rounded-full">
            <Clock size={12} />
            <span>Call will auto-decline in {timeLeft} seconds</span>
          </div>
        </div>
      </div>
    </div>
  )
}
