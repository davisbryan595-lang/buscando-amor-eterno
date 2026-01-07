'use client'

import React, { useState, useCallback } from 'react'
import IncomingCallModal from '@/components/incoming-call-modal'
import AgoraVideoCall from '@/components/agora-video-call'
import { useIncomingCalls } from '@/hooks/useIncomingCalls'
import { supabase } from '@/lib/supabase'

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
    logId: string
  } | null>(null)

  const handleAcceptCall = useCallback(
    async (callId: string) => {
      try {
        await acceptCall(callId)
        if (incomingCall) {
          // Get the call_logs entry for this incoming call
          const { data: callLog } = await supabase
            .from('call_logs')
            .select('id')
            .eq('caller_id', incomingCall.caller_id)
            .eq('receiver_id', incomingCall.recipient_id)
            .eq('status', 'ongoing')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          setAcceptedCallData({
            invitationId: callId,
            callerId: incomingCall.caller_id,
            callerName: incomingCall.caller_name || 'Unknown',
            callType: incomingCall.call_type,
            logId: callLog?.id || '',
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
            mode="incoming"
            callId={acceptedCallData.invitationId}
          />
        </div>
      )}
    </>
  )
}
