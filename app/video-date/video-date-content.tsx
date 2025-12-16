'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Video, Copy, Check } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'

const LiveKitVideoRoom = dynamic(() => import('@/components/livekit-room'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-900 rounded-xl">
      <p className="text-white">Loading video call...</p>
    </div>
  ),
})

export default function VideoDateContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [roomId, setRoomId] = useState<string>('')
  const [inputRoomId, setInputRoomId] = useState<string>('')
  const [inCall, setInCall] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const urlRoomId = searchParams?.get('room')
    if (urlRoomId) {
      setRoomId(urlRoomId)
      setInCall(true)
      setIsConnected(true)
    }
  }, [searchParams])

  const generateRoomId = () => {
    const userId = user?.id || 'guest'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    return `${userId}-${random}-${timestamp}`
  }

  const handleStartCall = () => {
    if (!user) {
      toast.error('Please log in to start a video call')
      return
    }

    const newRoomId = generateRoomId()
    setRoomId(newRoomId)
    setInCall(true)
    setIsConnected(true)
    router.push(`/video-date?room=${newRoomId}`)
  }

  const handleJoinCall = () => {
    if (!inputRoomId.trim()) {
      toast.error('Please enter a room ID')
      return
    }

    if (!user) {
      toast.error('Please log in to join a video call')
      return
    }

    setRoomId(inputRoomId.trim())
    setInCall(true)
    setIsConnected(true)
    router.push(`/video-date?room=${inputRoomId.trim()}`)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setInCall(false)
    setRoomId('')
    router.push('/video-date')
  }

  const handleLeaveCall = () => {
    setIsConnected(false)
    setTimeout(() => {
      setInCall(false)
      setRoomId('')
      router.push('/video-date')
    }, 100)
  }

  const copyRoomLink = async () => {
    const link = `${window.location.origin}/video-date?room=${roomId}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Room link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-2xl text-center soft-glow-lg">
              <Video size={48} className="text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Video Calling
              </h2>
              <p className="text-slate-600 mb-6">
                Please log in to start or join a video call
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-6 text-slate-900">
            Video Date
          </h1>

          {inCall && roomId ? (
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">Share this link with your date:</p>
                  <p className="text-xs text-slate-500 font-mono truncate">{`${window.location.origin}/video-date?room=${roomId}`}</p>
                </div>
                <button
                  onClick={copyRoomLink}
                  className="ml-4 p-2 bg-white rounded-lg hover:bg-rose-100 transition border border-rose-200"
                  title="Copy room link"
                >
                  {copied ? (
                    <Check size={20} className="text-green-600" />
                  ) : (
                    <Copy size={20} className="text-primary" />
                  )}
                </button>
              </div>

              <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden soft-glow-lg">
                <LiveKitVideoRoom
                  roomName={roomId}
                  participantName={user.email || user.id}
                  onDisconnect={handleDisconnect}
                  shouldConnect={isConnected}
                />
              </div>

              <button
                onClick={handleLeaveCall}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Leave Call
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-md bg-white p-8 rounded-2xl soft-glow-lg">
                <Video size={48} className="text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                  Start or Join a Video Call
                </h2>

                <div className="space-y-4">
                  <button
                    onClick={handleStartCall}
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-rose-700 transition font-semibold"
                  >
                    Start New Call
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="roomId" className="block text-sm font-medium text-slate-700">
                      Join existing call
                    </label>
                    <input
                      id="roomId"
                      type="text"
                      value={inputRoomId}
                      onChange={(e) => setInputRoomId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinCall()}
                      placeholder="Enter room ID"
                      className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleJoinCall}
                      className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-semibold"
                    >
                      Join Call
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 mt-6 text-sm text-center flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Your video session is encrypted and private
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
