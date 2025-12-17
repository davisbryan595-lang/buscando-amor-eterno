'use client'

import React, { useState, useCallback } from 'react'
import IncomingCallModal from '@/components/incoming-call-modal'
import AgoraVideoCall from '@/components/agora-video-call'
import { useIncomingCalls } from '@/hooks/useIncomingCalls'

interface CallManagerProps {
  children: React.ReactNode
}

export default function CallManager({ children }: CallManagerProps) {
  const { incomingCall, acceptCall, rejectCall, clearCall } = useIncomingCalls()
  const [acceptedCallData, setAcceptedCallData] = useState<{
    invitationId: string
    callerId: string
    callerName: string
    callType: 'audio' | 'video'
  } | null>(null)

  const handleAcceptCall = useCallback(
    async (callId: string) => {
      try {
        await acceptCall(callId)
        if (incomingCall) {
          setAcceptedCallData({
            callId,
            callerId: incomingCall.caller_id,
            callerName: incomingCall.caller_name || 'Unknown',
            callType: incomingCall.call_type,
          })
          // Clear the incoming call notification
          clearCall()
        }
      } catch (err) {
        // Silently handle errors
      }
    },
    [acceptCall, incomingCall, clearCall]
  )

  const handleRejectCall = useCallback(
    async (callId: string) => {
      try {
        await rejectCall(callId)
        // Clear the incoming call notification
        clearCall()
      } catch (err) {
        // Silently handle errors
      }
    },
    [rejectCall, clearCall]
  )

  const handleCloseCall = useCallback(() => {
    setAcceptedCallData(null)
    // Clear any remaining call state
    clearCall()
  }, [clearCall])

  return (
    <>
      {children}

      {/* Incoming call notification */}
      <IncomingCallModal
        call={incomingCall}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      {/* Agora video/audio call when incoming call is accepted */}
      {acceptedCallData && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <AgoraVideoCall
            partnerId={acceptedCallData.callerId}
            partnerName={acceptedCallData.callerName}
            callType={acceptedCallData.callType}
          />
        </div>
      )}
    </>
  )
}
