'use client'

import { useEffect, useState, useRef } from 'react'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'
import { Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react'

interface LiveKitRoomProps {
  roomName: string
  participantName: string
  onDisconnect?: () => void
  shouldConnect?: boolean
}

function RoomContent({ onDisconnect }: { onDisconnect?: () => void }) {
  const room = useRoomContext()
  const [connectionState, setConnectionState] = useState('connecting')
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkConnection = () => {
      if (room && room.state === 'connected' && room.participants.size > 0) {
        setConnectionState('connected')
        clearTimeout(connectionCheckRef.current!)
      }
    }

    if (room) {
      connectionCheckRef.current = setInterval(checkConnection, 500)
      return () => {
        if (connectionCheckRef.current) clearTimeout(connectionCheckRef.current)
      }
    }
  }, [room])

  return <VideoConference />
}

export default function LiveKitVideoRoom({
  roomName,
  participantName,
  onDisconnect,
  shouldConnect = true,
}: LiveKitRoomProps) {
  const [token, setToken] = useState<string>('')
  const [serverUrl, setServerUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

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
        setRetryCount(0)
      } catch (err: any) {
        console.error('Error fetching token:', err)
        setError(err.message || 'Failed to join call')

        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
          }, 2000 * Math.pow(2, retryCount))
        }
      } finally {
        setLoading(false)
      }
    }

    if (roomName && participantName) {
      fetchToken()
    }
  }, [roomName, participantName, retryCount])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-slate-900 to-black rounded-xl">
        <div className="text-center">
          <div className="inline-block mb-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          </div>
          <p className="text-white font-medium text-lg mb-1">Connecting to call...</p>
          <p className="text-gray-400 text-sm">Setting up your video session</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-slate-900 to-black rounded-xl">
        <div className="text-center text-white max-w-sm mx-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/20 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-300 mb-2 font-semibold">Connection Failed</p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          {retryCount < 3 ? (
            <div className="text-gray-400 text-xs">
              Retrying... (Attempt {retryCount + 1}/3)
            </div>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary rounded-lg hover:bg-rose-700 transition font-medium"
            >
              Reload Page
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!token || !serverUrl) {
    return null
  }

  return (
    <div className="h-full w-full bg-black rounded-xl overflow-hidden">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        connect={shouldConnect}
        onDisconnected={() => {
          console.log('Disconnected from room')
          onDisconnect?.()
        }}
        onError={(error) => {
          console.error('LiveKit room error:', error)
          setError(error?.message || 'An error occurred')
        }}
        onMediaDeviceFailure={(error) => {
          console.error('Media device error:', error)
          setError(`Camera/Microphone access denied. Please allow access and try again.`)
        }}
        className="h-full"
        options={{
          publishDefaults: {
            videoCodec: 'vp8',
          },
          dynacast: true,
          adaptiveStream: true,
        }}
      >
        <RoomContent onDisconnect={onDisconnect} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
