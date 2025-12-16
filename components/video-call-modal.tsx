'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Participant, ParticipantEvent, Track } from 'livekit-client'
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
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const sendingInvitationRef = useRef(false)
  const remoteTracksRef = useRef<Map<string, any>>(new Map())

  // Send call invitation when modal opens
  useEffect(() => {
    if (isOpen && !invitationSent && !callInvitationId && user && !sendingInvitationRef.current) {
      const sendInvitation = async () => {
        sendingInvitationRef.current = true
        try {
          const roomName = [user.id, otherUserId].sort().join('-')
          const expiresAt = new Date()
          expiresAt.setMinutes(expiresAt.getMinutes() + 5)

          const { error: err } = await supabase
            .from('call_invitations')
            .upsert(
              {
                caller_id: user.id,
                recipient_id: otherUserId,
                call_type: callType,
                room_name: roomName,
                status: 'pending',
                expires_at: expiresAt.toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: 'caller_id,recipient_id,room_name',
              }
            )

          if (!err) {
            setInvitationSent(true)
          }
        } catch (err) {
          // Silently handle invitation errors
        } finally {
          sendingInvitationRef.current = false
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
    if (!isConnected || !localParticipant || callType !== 'video' || !localVideoRef.current) {
      return
    }

    const videoTracks = localParticipant.videoTracks
    if (videoTracks?.size > 0) {
      const videoTrack = Array.from(videoTracks.values())[0]
      if (videoTrack?.track) {
        try {
          videoTrack.track.attach(localVideoRef.current)
          return () => {
            videoTrack.track?.detach()
          }
        } catch (err) {
          // Silently handle attach errors
        }
      }
    }
  }, [isConnected, localParticipant, callType])

  // Handle remote participant tracks
  useEffect(() => {
    if (participants.length === 0) {
      return
    }

    const participant = participants[0] as Participant
    if (!participant) return

    // Handle remote video track
    if (callType === 'video' && remoteVideoRef.current) {
      const handleVideoTrackSubscribed = (track: Track) => {
        if (track.kind === 'video' && remoteVideoRef.current) {
          try {
            remoteTracksRef.current.set('video', track)
            track.attach(remoteVideoRef.current)
          } catch (err) {
            // Silently handle attach errors
          }
        }
      }

      const handleVideoTrackUnsubscribed = (track: Track) => {
        if (track.kind === 'video' && remoteVideoRef.current) {
          try {
            track.detach()
            remoteTracksRef.current.delete('video')
          } catch (err) {
            // Silently handle detach errors
          }
        }
      }

      // Check for existing video track
      const videoTracks = participant.videoTracks
      if (videoTracks?.size > 0) {
        const videoTrack = Array.from(videoTracks.values())[0]
        if (videoTrack?.track) {
          handleVideoTrackSubscribed(videoTrack.track)
        }
      }

      participant.on(ParticipantEvent.TrackSubscribed, handleVideoTrackSubscribed)
      participant.on(ParticipantEvent.TrackUnsubscribed, handleVideoTrackUnsubscribed)

      return () => {
        participant.off(ParticipantEvent.TrackSubscribed, handleVideoTrackSubscribed)
        participant.off(ParticipantEvent.TrackUnsubscribed, handleVideoTrackUnsubscribed)
        if (remoteVideoRef.current) {
          try {
            const videoTrack = remoteTracksRef.current.get('video')
            if (videoTrack) {
              videoTrack.detach()
            }
          } catch (err) {
            // Silently handle cleanup errors
          }
        }
      }
    }
  }, [participants, callType])

  // Handle remote audio track
  useEffect(() => {
    if (participants.length === 0 || !remoteAudioRef.current) {
      return
    }

    const participant = participants[0] as Participant
    if (!participant) return

    const audioElement = remoteAudioRef.current

    const handleAudioTrackSubscribed = (track: Track) => {
      if (track.kind === 'audio') {
        try {
          const stream = new MediaStream([track.mediaStreamTrack!])
          audioElement.srcObject = stream
          audioElement.muted = false
          audioElement.volume = 1.0

          // Attempt to play
          const playPromise = audioElement.play()
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay blocked - will play on user interaction
              const enableAudio = () => {
                audioElement.play().catch(() => {})
              }
              document.addEventListener('click', enableAudio, { once: true })
            })
          }
          remoteTracksRef.current.set('audio', track)
        } catch (err) {
          // Silently handle audio setup errors
        }
      }
    }

    const handleAudioTrackUnsubscribed = (track: Track) => {
      if (track.kind === 'audio') {
        try {
          if (audioElement.srcObject) {
            audioElement.srcObject = null
          }
          remoteTracksRef.current.delete('audio')
        } catch (err) {
          // Silently handle cleanup errors
        }
      }
    }

    // Check for existing audio track
    const audioTracks = participant.audioTracks
    if (audioTracks?.size > 0) {
      const audioTrack = Array.from(audioTracks.values())[0]
      if (audioTrack?.track) {
        handleAudioTrackSubscribed(audioTrack.track)
      }
    }

    participant.on(ParticipantEvent.TrackSubscribed, handleAudioTrackSubscribed)
    participant.on(ParticipantEvent.TrackUnsubscribed, handleAudioTrackUnsubscribed)

    return () => {
      participant.off(ParticipantEvent.TrackSubscribed, handleAudioTrackSubscribed)
      participant.off(ParticipantEvent.TrackUnsubscribed, handleAudioTrackUnsubscribed)
      if (remoteAudioRef.current) {
        try {
          remoteAudioRef.current.srcObject = null
        } catch (err) {
          // Silently handle cleanup errors
        }
      }
    }
  }, [participants])

  // Toggle video
  const toggleVideoClick = async () => {
    const newState = !videoEnabled
    setVideoEnabled(newState)
    await toggleVideo(newState)
  }

  // Toggle audio
  const toggleAudioClick = async () => {
    const newState = !audioEnabled
    setAudioEnabled(newState)
    await toggleAudio(newState)
  }

  const handleEndCall = async () => {
    try {
      if (invitationSent && user) {
        const roomName = [user.id, otherUserId].sort().join('-')
        await supabase
          .from('call_invitations')
          .update({ status: 'ended' })
          .eq('room_name', roomName)
          .eq('caller_id', user.id)
          .catch(() => {})
      } else if (callInvitationId) {
        await supabase
          .from('call_invitations')
          .update({ status: 'ended' })
          .eq('id', callInvitationId)
          .catch(() => {})
      }
    } catch (err) {
      // Silently handle errors
    }

    // Clean up tracks
    remoteTracksRef.current.forEach((track) => {
      try {
        track.detach()
      } catch (err) {
        // Silently handle errors
      }
    })
    remoteTracksRef.current.clear()

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

          {/* Remote Audio Element (hidden but necessary for playback) */}
          <audio
            ref={remoteAudioRef}
            autoPlay
            playsInline
            style={{ display: 'none' }}
          />
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
