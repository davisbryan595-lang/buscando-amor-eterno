'use client'

import { useEffect, useState } from 'react'
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Track } from 'livekit-client'
import { Loader2 } from 'lucide-react'

interface LiveKitRoomProps {
  roomName: string
  participantName: string
  onDisconnect?: () => void
}

export default function LiveKitVideoRoom({
  roomName,
  participantName,
  onDisconnect,
}: LiveKitRoomProps) {
  const [token, setToken] = useState<string>('')
  const [serverUrl, setServerUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/livekit/token?room=${encodeURIComponent(
            roomName
          )}&participant=${encodeURIComponent(participantName)}`
        )

        if (!response.ok) {
          throw new Error('Failed to get access token')
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        setToken(data.token)
        setServerUrl(data.url)
      } catch (err: any) {
        console.error('Error fetching token:', err)
        setError(err.message || 'Failed to join call')
      } finally {
        setLoading(false)
      }
    }

    if (roomName && participantName) {
      fetchToken()
    }
  }, [roomName, participantName])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Connecting to call...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 rounded-xl">
        <div className="text-center text-white">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary rounded-lg hover:bg-rose-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!token || !serverUrl) {
    return null
  }

  return (
    <div className="h-full w-full">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        connect={true}
        onDisconnected={() => {
          console.log('Disconnected from room')
          onDisconnect?.()
        }}
        onError={(error) => {
          console.error('LiveKit room error:', error)
          setError(error.message)
        }}
        className="h-full"
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
