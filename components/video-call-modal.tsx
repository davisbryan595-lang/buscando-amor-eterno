'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Participant, ParticipantEvent, Track, ConnectionQuality } from 'livekit-client'
import { X, Mic, MicOff, Video, VideoOff, Phone, Signal, Timer, Wifi, WifiOff } from 'lucide-react'
import { useLiveKitCall } from '@/hooks/useLiveKitCall'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface VideoCallModalProps {
  isOpen: boolean
  onClose: () => void
  otherUserName: string
  otherUserId: string
  callType: 'audio' | 'video'
  callInvitationId?: string
}

interface ConnectionStats {
  quality: 'good' | 'poor' | 'unknown'
  latency: number | null
  packetLoss: number | null
  bandwidth: number | null
  duration: number
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
  const { joinCall, leaveCall, isConnected, isConnecting, error, participants, localParticipant, toggleAudio, toggleVideo, room } =
    useLiveKitCall()
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(callType === 'video')
  const [invitationSent, setInvitationSent] = useState(false)
  const [stats, setStats] = useState<ConnectionStats>({
    quality: 'unknown',
    latency: null,
    packetLoss: null,
    bandwidth: null,
    duration: 0,
  })
  const [otherUserImage, setOtherUserImage] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)
  const isMobile = useIsMobile()
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const sendingInvitationRef = useRef(false)
  const remoteTracksRef = useRef<Map<string, any>>(new Map())
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const callStartTimeRef = useRef<number>(0)
  const connectionErrorRef = useRef(false)

  // Fetch other user's profile picture
  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('photos, main_photo_index')
          .eq('user_id', otherUserId)
          .single()

        if (data?.photos && data.photos.length > 0) {
          const mainIndex = data.main_photo_index || 0
          setOtherUserImage(data.photos[mainIndex] || null)
        }
      } catch (err) {
        // Silently handle profile fetch errors
      }
    }

    if (otherUserId) {
      fetchOtherUserProfile()
    }
  }, [otherUserId])

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

          // Set invitation sent regardless of error - we need to proceed with the call
          setInvitationSent(true)
        } catch (err) {
          // Still mark as sent so we can attempt the call
          setInvitationSent(true)
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

  // Collect connection statistics
  useEffect(() => {
    if (!isConnected || !room) return

    callStartTimeRef.current = Date.now()

    const collectStats = async () => {
      try {
        if (!room) return

        const stats = await room.localParticipant.getStats()

        if (stats && stats.length > 0) {
          const videoStats = stats.find((s) => s.kind === 'video')
          const audioStats = stats.find((s) => s.kind === 'audio')

          let latency = null
          let packetLoss = null
          let bandwidth = null
          let quality: 'good' | 'poor' | 'unknown' = 'unknown'

          if (audioStats && 'roundTripTime' in audioStats) {
            latency = Math.round((audioStats as any).roundTripTime * 1000)
          }

          if (audioStats && 'packetLoss' in audioStats) {
            packetLoss = Math.round(((audioStats as any).packetLoss || 0) * 100 * 100) / 100
          }

          if (audioStats && 'bytesSent' in audioStats) {
            bandwidth = Math.round((audioStats as any).bytesSent / 1024 / 1024 * 100) / 100
          }

          // Determine quality based on latency and packet loss
          if (latency !== null && packetLoss !== null) {
            quality = latency < 100 && packetLoss < 2 ? 'good' : 'poor'
          }

          const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000)

          setStats({
            quality,
            latency,
            packetLoss,
            bandwidth,
            duration,
          })

          // Update connection error state
          if (latency !== null && latency > 500) {
            connectionErrorRef.current = true
          } else {
            connectionErrorRef.current = false
          }
        }
      } catch (err) {
        // Silently handle stats collection errors
      }
    }

    // Collect stats every second
    statsIntervalRef.current = setInterval(collectStats, 1000)
    collectStats()

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
      }
    }
  }, [isConnected, room])

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
            try {
              videoTrack.track?.detach()
            } catch (err) {
              // Silently handle detach errors
            }
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
          // Directly attach the track to the audio element
          // This is the correct way to handle remote audio in LiveKit
          track.attach(audioElement)
          audioElement.muted = false
          audioElement.volume = 1.0

          // Ensure the audio element can play
          const playPromise = audioElement.play()
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              // Autoplay blocked or other play error - will play on user interaction
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
          if (remoteAudioRef.current) {
            track.detach()
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

      // Properly detach and clean up audio track
      if (remoteAudioRef.current) {
        const audioTrack = remoteTracksRef.current.get('audio')
        if (audioTrack) {
          try {
            audioTrack.detach()
            remoteTracksRef.current.delete('audio')
          } catch (err) {
            // Silently handle cleanup errors
          }
        }
      }
    }
  }, [participants])

  // Toggle video with proper state management
  const toggleVideoClick = async () => {
    try {
      const newState = !videoEnabled
      setVideoEnabled(newState)
      await toggleVideo(newState)
    } catch (err) {
      console.error('Error toggling video:', err)
      setVideoEnabled(!videoEnabled)
    }
  }

  // Toggle audio with proper state management
  const toggleAudioClick = async () => {
    try {
      const newState = !audioEnabled
      setAudioEnabled(newState)
      await toggleAudio(newState)
    } catch (err) {
      console.error('Error toggling audio:', err)
      setAudioEnabled(!audioEnabled)
    }
  }

  // Handle end call with proper cleanup
  const handleEndCall = async () => {
    try {
      // Update call status in database
      if (user) {
        const roomName = [user.id, otherUserId].sort().join('-')
        try {
          await supabase
            .from('call_invitations')
            .update({ status: 'ended' })
            .eq('room_name', roomName)
            .match({
              caller_id: user.id,
              recipient_id: otherUserId,
            })
        } catch (err) {
          // Try the other direction (if they initiated the call)
          try {
            await supabase
              .from('call_invitations')
              .update({ status: 'ended' })
              .eq('room_name', roomName)
              .match({
                caller_id: otherUserId,
                recipient_id: user.id,
              })
          } catch (err2) {
            // Silently handle errors
          }
        }
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

    // Clear stats interval
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current)
    }

    // Leave the call first
    await leaveCall()

    // Close the modal and return to messages
    onClose()
  }

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  const isMobileView = isMobile
  const containerClasses = isMobileView
    ? 'fixed inset-0 z-[9999] flex flex-col pointer-events-auto'
    : 'fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] pointer-events-auto'

  const modalClasses = isMobileView
    ? 'w-full h-full bg-black'
    : 'bg-slate-900 rounded-2xl w-full max-w-4xl h-screen md:max-w-full md:rounded-none flex flex-col overflow-hidden'

  return (
    <div className={containerClasses}>
      <div className={modalClasses}>
        {/* Header */}
        <div className="bg-gradient-to-b from-black/90 via-black/50 to-transparent px-6 py-4 flex items-center justify-between absolute top-0 left-0 right-0 z-20 pointer-events-none">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">
              {callType === 'video' ? 'Video Call' : 'Audio Call'}
            </h3>
            <p className="text-gray-300 text-sm">{otherUserName}</p>
          </div>

          {/* Connection Status & Stats */}
          <div className="flex items-center gap-4 mr-4 pointer-events-auto">
            {/* Call Duration */}
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Timer size={16} />
              <span>{formatDuration(stats.duration)}</span>
            </div>

            {/* Connection Quality Indicator */}
            {isConnected && (
              <button
                onClick={() => setShowStats(!showStats)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full transition text-sm font-medium ${
                  stats.quality === 'good'
                    ? 'bg-green-500/20 text-green-300'
                    : stats.quality === 'poor'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-slate-700 text-gray-300'
                }`}
                aria-label="Toggle connection stats"
              >
                {connectionErrorRef.current || stats.quality === 'poor' ? (
                  <WifiOff size={14} />
                ) : (
                  <Signal size={14} />
                )}
                <span>{stats.quality === 'unknown' ? 'Connecting...' : stats.quality}</span>
              </button>
            )}

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
        </div>

        {/* Connection Stats Panel - Desktop Always Visible, Mobile on Demand */}
        {isConnected && (showStats || !isMobileView) && (
          <div className={`${!isMobileView ? 'absolute top-20 right-6 z-30 pointer-events-auto' : 'absolute top-20 right-6 z-30'} bg-slate-900/95 border border-slate-700 rounded-lg p-4 w-64 backdrop-blur-sm`}>
            <h4 className="text-white font-semibold mb-3 text-sm">Connection Stats</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Latency:</span>
                <span className="text-white font-medium">
                  {stats.latency !== null ? `${stats.latency}ms` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Packet Loss:</span>
                <span className="text-white font-medium">
                  {stats.packetLoss !== null ? `${stats.packetLoss}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Data Sent:</span>
                <span className="text-white font-medium">
                  {stats.bandwidth !== null ? `${stats.bandwidth}MB` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-700">
                <span>Connection:</span>
                <span className={`font-medium ${stats.quality === 'good' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {stats.quality === 'good' ? 'Excellent' : 'Fair'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Video Container */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {/* Desktop Connection Status Banner */}
          {!isMobileView && isConnected && (
            <div className="absolute top-24 left-6 z-30 flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">Call Connected</span>
            </div>
          )}

          {/* Connecting State */}
          {isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
              <div className="text-center">
                <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-white text-lg font-medium mb-2">Connecting to {otherUserName}...</p>
                <p className="text-gray-400 text-sm">Setting up your {callType} call</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
              <div className="text-center bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-sm mx-4">
                <p className="text-red-100 mb-2 font-semibold">Call Error</p>
                <p className="text-red-100 text-sm mb-4">{error}</p>
                <button
                  onClick={handleEndCall}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Close Call
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

          {/* Remote Audio with Background */}
          {isConnected && callType === 'audio' && (
            <div className="absolute inset-0 flex items-center justify-center">
              {otherUserImage ? (
                <>
                  {/* Background with blur effect */}
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-40"
                    style={{ backgroundImage: `url('${otherUserImage}')` }}
                  />
                  {/* Profile picture circle */}
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                      <Image
                        src={otherUserImage}
                        alt={otherUserName}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-white text-2xl font-semibold">{otherUserName}</p>
                      <p className="text-gray-300 text-sm mt-2">Audio call in progress</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-rose-700 flex items-center justify-center mx-auto mb-6">
                    <Mic className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-white text-xl font-semibold">{otherUserName}</p>
                  <p className="text-gray-400 text-sm mt-2">Audio call in progress</p>
                </div>
              )}
            </div>
          )}

          {/* Local Video (Picture in Picture) */}
          {isConnected && callType === 'video' && (
            <video
              ref={localVideoRef}
              className="absolute bottom-20 right-6 w-28 h-28 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-xl object-cover"
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

        {/* Controls Footer */}
        <div className="bg-gradient-to-t from-black/95 via-black/70 to-transparent px-6 py-6 flex items-center justify-center gap-6 absolute bottom-0 left-0 right-0 z-40 pointer-events-auto">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudioClick}
            disabled={isConnecting || !isConnected}
            className={`p-4 rounded-full transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              audioEnabled
                ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
            }`}
            aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
            title={audioEnabled ? 'Mute' : 'Unmute'}
          >
            {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          {/* Video Toggle (only for video calls) */}
          {callType === 'video' && (
            <button
              onClick={toggleVideoClick}
              disabled={isConnecting || !isConnected}
              className={`p-4 rounded-full transition transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                videoEnabled
                  ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
              }`}
              aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
              title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
          )}

          {/* End Call */}
          <button
            onClick={handleEndCall}
            disabled={isConnecting}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition transform hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="End call"
            title="End call"
          >
            <Phone size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}
