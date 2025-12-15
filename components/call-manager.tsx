'use client'

import React, { useState, useCallback } from 'react'
import IncomingCallModal from '@/components/incoming-call-modal'
import VideoCallModal from '@/components/video-call-modal'
import { useIncomingCalls } from '@/hooks/useIncomingCalls'

interface CallManagerProps {
  children: React.ReactNode
}

export default function CallManager({ children }: CallManagerProps) {
  const { incomingCall, acceptCall, rejectCall } = useIncomingCalls()
  const [showOutgoingCallModal, setShowOutgoingCallModal] = useState(false)
  const [acceptedCallData, setAcceptedCallData] = useState<{
    callId: string
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
        }
      } catch (err) {
        console.error('Error accepting call:', err)
      }
    },
    [acceptCall, incomingCall]
  )

  const handleRejectCall = useCallback(
    async (callId: string) => {
      try {
        await rejectCall(callId)
      } catch (err) {
        console.error('Error rejecting call:', err)
      }
    },
    [rejectCall]
  )

  const handleCloseOutgoingCall = useCallback(() => {
    setShowOutgoingCallModal(false)
    setAcceptedCallData(null)
  }, [])

  return (
    <>
      {children}

      {/* Incoming call notification */}
      <IncomingCallModal
        call={incomingCall}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      {/* Outgoing call modal when incoming call is accepted */}
      {acceptedCallData && (
        <VideoCallModal
          isOpen={true}
          onClose={handleCloseOutgoingCall}
          otherUserName={acceptedCallData.callerName}
          otherUserId={acceptedCallData.callerId}
          callType={acceptedCallData.callType}
          callInvitationId={acceptedCallData.callId}
        />
      )}
    </>
  )
}
