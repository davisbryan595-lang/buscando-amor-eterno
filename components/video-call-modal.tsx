'use client'

import React, { useEffect, useState } from 'react'
import { Participant, ParticipantEvent } from 'livekit-client'
import { X, Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react'
import { useLiveKitCall } from '@/hooks/useLiveKitCall'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

interface VideoCallModalProps {
  isOpen: boolean
  onClose: () => void
  otherUserName: string
  otherUserId: string
  callType: 'audio' | 'video'
  callInvitationId?: string
}

export default function VideoCallModal({
  isOpen,
  onClose,
  otherUserName,
  otherUserId,
  callType,
  callInvitationId,
}: VideoCallModalProps) {
  const { user } = useAuth()
  const { joinCall, leaveCall, isConnected, isConnecting, error, participants, localParticipant, toggleAudio, toggleVideo } =
    useLiveKitCall()
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(callType === 'video')
  const [invitationSent, setInvitationSent] = useState(false)
  const isMobile = useIsMobile()
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null)
  const localVideoRef = React.useRef<HTMLVideoElement>(null)

  // Send call invitation when modal opens (for outgoing calls)
  useEffect(() => {
    if (isOpen && !invitationSent && !callInvitationId && user) {
      const sendInvitation = async () => {
        try {
          const roomName = [user.id, otherUserId].sort().join('-')

          // Check if invitation already exists
          const { data: existingInvitation, error: checkErr } = await supabase
            .from('call_invitations')
            .select('id, status')
            .eq('caller_id', user.id)
            .eq('recipient_id', otherUserId)
            .eq('room_name', roomName)
            .maybeSingle()

          // If an invitation exists and is not ended/declined, reuse it
          if (existingInvitation && !['ended', 'declined'].includes(existingInvitation.status)) {
            setInvitationSent(true)
            return
          }

          // If there's a previous ended/declined invitation, delete it to allow a new one
          if (existingInvitation && ['ended', 'declined'].includes(existingInvitation.status)) {
            await supabase
              .from('call_invitations')
              .delete()
              .eq('id', existingInvitation.id)
          }

          // Create a new invitation
          const { error: err } = await supabase
            .from('call_invitations')
            .insert({
              caller_id: user.id,
              recipient_id: otherUserId,
              call_type: callType,
              room_name: roomName,
              status: 'pending',
            })

          if (err) {
            console.error('Error sending call invitation:', err?.message || err)
          } else {
            setInvitationSent(true)
          }
        } catch (err) {
          console.error('Error sending call invitation:', err instanceof Error ? err.message : err)
        }
      }

      sendInvitation()
    }
  }, [isOpen, invitationSent, callInvitationId, user, otherUserId, callType])

  // Start call when modal opens
  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting && (invitationSent || callInvitationId)) {
      joinCall(otherUserId, callType)
    }
  }, [isOpen, isConnected, isConnecting, otherUserId, callType, joinCall, invitationSent, callInvitationId])

  // Handle local video track
  useEffect(() => {
    if (isConnected && localParticipant && callType === 'video' && localVideoRef.current) {
      const videoTracks = localParticipant.videoTracks
      if (videoTracks && videoTracks.size > 0) {
        const videoTrack = Array.from(videoTracks.values())[0]
        if (videoTrack && videoTrack.track) {
          videoTrack.track.attach(localVideoRef.current)
          return () => {
            videoTrack.track.detach()
          }
        }
      }
    }
  }, [isConnected, localParticipant, callType])

  // Handle remote participant video tracks
  useEffect(() => {
    if (participants.length > 0 && remoteVideoRef.current) {
      const participant = participants[0]

      // Attach video track if it exists
      if (callType === 'video') {
        const videoTracks = participant.videoTracks
        if (videoTracks && videoTracks.size > 0) {
          const videoTrack = Array.from(videoTracks.values())[0]
          if (videoTrack && videoTrack.track) {
            videoTrack.track.attach(remoteVideoRef.current)
            return () => {
              videoTrack.track.detach()
            }
          }
        }
      }
    }
  }, [participants, callType])

  // Update video when toggled
  const toggleVideoClick = async () => {
    const newState = !videoEnabled
    setVideoEnabled(newState)
    await toggleVideo(newState)
  }

  // Update audio when toggled
  const toggleAudioClick = async () => {
    const newState = !audioEnabled
    setAudioEnabled(newState)
    await toggleAudio(newState)
  }

  const handleEndCall = async () => {
    try {
      // Mark call invitation as ended
      if (invitationSent && user) {
        const roomName = [user.id, otherUserId].sort().join('-')
        await supabase
          .from('call_invitations')
          .update({ status: 'ended' })
          .eq('room_name', roomName)
          .eq('caller_id', user.id)
      } else if (callInvitationId) {
        await supabase
          .from('call_invitations')
          .update({ status: 'ended' })
          .eq('id', callInvitationId)
      }
    } catch (err) {
      console.warn('Error updating call status:', err)
    }

    await leaveCall()
    onClose()
  }

  if (!isOpen) return null

  const isMobileView = isMobile
  const containerClasses = isMobileView
    ? 'fixed inset-0 bg-black z-50 flex flex-col'
    : 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'

  const modalClasses = isMobileView
    ? 'w-full h-full'
    : 'bg-slate-900 rounded-2xl w-full max-w-4xl h-96 md:h-screen md:max-w-full md:rounded-none flex flex-col'

  return (
    <div className={containerClasses}>
      <div className={modalClasses}>
        {/* Header */}
        <div className="bg-gradient-to-b from-black/80 to-transparent px-4 py-4 flex items-center justify-between absolute top-0 left-0 right-0 z-10">
          <div>
            <h3 className="text-white font-semibold text-lg">
              {callType === 'video' ? 'Video Call' : 'Audio Call'}
            </h3>
            <p className="text-gray-300 text-sm">{otherUserName}</p>
          </div>
          {!isMobileView && (
            <button
              onClick={handleEndCall}
              className="p-2 hover:bg-red-500/20 rounded-lg transition text-white"
              aria-label="Close call"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Video Container */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white">Connecting to {otherUserName}...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-sm mx-4">
                <p className="text-red-100 mb-2 font-semibold">Call Error</p>
                <p className="text-red-100 text-sm mb-4">{error}</p>
                <p className="text-gray-300 text-xs mb-4">
                  {error.includes('credentials') && 'Check that LiveKit environment variables are set on your deployment platform.'}
                  {error.includes('token') && 'Failed to generate call token. Please refresh and try again.'}
                  {error.includes('URL') && 'LiveKit service is not configured. Please contact support.'}
                </p>
                <button
                  onClick={handleEndCall}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Remote Video */}
          {isConnected && callType === 'video' && (
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
          )}

          {/* Remote Audio Only */}
          {isConnected && callType === 'audio' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-rose-700 flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                <p className="text-white text-xl font-semibold">{otherUserName}</p>
                <p className="text-gray-400 text-sm mt-2">Audio call in progress</p>
              </div>
            </div>
          )}

          {/* Local Video (Picture in Picture) */}
          {isConnected && callType === 'video' && (
            <video
              ref={localVideoRef}
              className="absolute bottom-4 right-4 w-24 h-24 md:w-32 md:h-32 rounded-lg border-2 border-white object-cover"
              autoPlay
              playsInline
              muted
            />
          )}
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-t from-black/80 to-transparent px-4 py-4 flex items-center justify-center gap-4 absolute bottom-0 left-0 right-0">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudioClick}
            className={`p-4 rounded-full transition ${
              audioEnabled
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
          >
            {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Video Toggle (only for video calls) */}
          {callType === 'video' && (
            <button
              onClick={toggleVideoClick}
              className={`p-4 rounded-full transition ${
                videoEnabled
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
          )}

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
            aria-label="End call"
          >
            <Phone size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
