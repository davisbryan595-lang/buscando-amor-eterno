'use client'

import React, { useEffect, useState } from 'react'
import { Phone, PhoneOff, Video, Mic } from 'lucide-react'
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
  const [timeLeft, setTimeLeft] = useState(10)

  useEffect(() => {
    if (!call) {
      setTimeLeft(10)
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
    <Video className="w-6 h-6 text-white" />
  ) : (
    <Mic className="w-6 h-6 text-white" />
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-rose-700 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 mx-auto">
            {callIcon}
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {call.call_type === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call'}
          </h2>
          <p className="text-white/80 text-sm">
            Connecting in {timeLeft}s
          </p>
        </div>

        {/* Caller info */}
        <div className="p-6 text-center border-b border-slate-200">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24">
              <Image
                src={call.caller_image || '/placeholder.svg'}
                alt={call.caller_name || 'Caller'}
                fill
                className="rounded-full object-cover"
              />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {call.caller_name}
          </h3>
          <p className="text-slate-600 text-sm mt-1">
            {call.call_type === 'video' ? 'wants to video call' : 'wants to call'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="p-6 flex gap-4">
          <button
            onClick={handleReject}
            disabled={isRejecting || isAccepting}
            className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-50 text-slate-900 rounded-full font-semibold transition flex items-center justify-center gap-2"
          >
            <PhoneOff size={20} />
            <span>Decline</span>
          </button>
          <button
            onClick={handleAccept}
            disabled={isAccepting || isRejecting}
            className="flex-1 py-4 px-6 bg-green-500 hover:bg-green-600 disabled:bg-green-500 disabled:opacity-50 text-white rounded-full font-semibold transition flex items-center justify-center gap-2"
          >
            <Phone size={20} />
            <span>Accept</span>
          </button>
        </div>

        {/* Info message */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-slate-600">
            This call will automatically decline in {timeLeft} seconds
          </p>
        </div>
      </div>
    </div>
  )
}
