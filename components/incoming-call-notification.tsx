'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useIncomingCall, type CallType } from '@/context/incoming-call-context'
import { useWebRTC } from '@/hooks/useWebRTC'
import AudioCall from '@/components/audio-call'
import VideoCall from '@/components/video-call'
import { toast } from 'sonner'

export function IncomingCallNotification() {
  const router = useRouter()
  const { user } = useAuth()
  const { incomingCall, dismissCall } = useIncomingCall()
  const { callState, acceptCall, rejectCall, incomingCall: webrtcIncomingCall } = useWebRTC(incomingCall?.from || null, (incomingCall?.type as CallType) || 'audio')
  const [isRinging, setIsRinging] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Auto-dismiss after 60 seconds if not answered
  useEffect(() => {
    if (!incomingCall) return

    const timeoutId = setTimeout(() => {
      if (isRinging) {
        dismissCall()
        rejectCall()
        toast.info('Missed call')
      }
    }, 60000)

    return () => clearTimeout(timeoutId)
  }, [incomingCall, isRinging, dismissCall, rejectCall])

  // Play ringing sound
  useEffect(() => {
    if (incomingCall && isRinging) {
      // Use Web Audio API for simple beep/ring
      const playRingTone = async () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          oscillator.frequency.value = 800
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)

          // Ring pattern: 1s on, 0.5s off
          oscillator.start(audioContext.currentTime)
          gainNode.gain.setTargetAtTime(0, audioContext.currentTime + 1, 0.05)
          oscillator.stop(audioContext.currentTime + 1.05)

          // Repeat
          const ringInterval = setInterval(() => {
            if (!isRinging) {
              clearInterval(ringInterval)
              return
            }

            const osc = audioContext.createOscillator()
            const gain = audioContext.createGain()
            osc.connect(gain)
            gain.connect(audioContext.destination)
            osc.frequency.value = 800
            gain.gain.setValueAtTime(0.3, audioContext.currentTime)
            osc.start(audioContext.currentTime)
            gain.gain.setTargetAtTime(0, audioContext.currentTime + 1, 0.05)
            osc.stop(audioContext.currentTime + 1.05)
          }, 1500)

          return () => clearInterval(ringInterval)
        } catch (err) {
          console.warn('[IncomingCallNotification] Could not play ring tone:', err)
        }
      }

      playRingTone()
    }
  }, [incomingCall, isRinging])

  const handleAccept = async () => {
    setIsRinging(false)
    try {
      await acceptCall()
      // Navigate to messages with this user
      router.push(`/messages?user=${incomingCall?.from}`)
    } catch (err) {
      console.error('[IncomingCallNotification] Error accepting call:', err)
      toast.error('Failed to accept call')
      dismissCall()
    }
  }

  const handleReject = () => {
    setIsRinging(false)
    rejectCall()
    dismissCall()
    toast.info('Call declined')
  }

  if (!incomingCall) {
    return null
  }

  // If WebRTC connection is active, show the full call UI
  if (callState.status === 'active' && webrtcIncomingCall) {
    const callType = incomingCall.type as CallType
    if (callType === 'video') {
      return (
        <VideoCall
          otherUserId={incomingCall.from}
          otherUserName={incomingCall.fromName}
          otherUserImage={incomingCall.fromImage || null}
          isIncoming={true}
          onAccept={() => {
            setIsRinging(false)
            router.push(`/messages?user=${incomingCall.from}`)
          }}
          onReject={handleReject}
          onHangup={handleReject}
        />
      )
    } else {
      return (
        <AudioCall
          otherUserId={incomingCall.from}
          otherUserName={incomingCall.fromName}
          otherUserImage={incomingCall.fromImage || null}
          isIncoming={true}
          onAccept={() => {
            setIsRinging(false)
            router.push(`/messages?user=${incomingCall.from}`)
          }}
          onReject={handleReject}
          onHangup={handleReject}
        />
      )
    }
  }

  // Show incoming call notification/ringing state
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
        {/* Caller Info */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={incomingCall.fromImage || '/placeholder.svg'}
              alt={incomingCall.fromName || 'Caller'}
              fill
              className="rounded-full object-cover"
              priority
            />
            {isRinging && (
              <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-pulse" />
            )}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-playfair font-bold text-slate-900">
              {incomingCall.fromName || 'Unknown User'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {incomingCall.type === 'video' ? 'Video' : 'Audio'} call incoming...
            </p>
          </div>

          {isRinging && (
            <div className="flex gap-2 items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleReject}
            className="flex-1 px-6 py-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            aria-label="Decline call"
          >
            <PhoneOff size={20} />
            <span>Decline</span>
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-6 py-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            aria-label="Accept call"
          >
            <Phone size={20} />
            <span>Accept</span>
          </button>
        </div>

        {/* Audio element for ring tone */}
        <audio ref={audioRef} hidden />
      </div>
    </div>
  )
}
