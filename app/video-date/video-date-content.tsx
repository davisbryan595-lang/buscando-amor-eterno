'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import AgoraVideoCall from '@/components/agora-video-call'
import { Lock, ArrowLeft, Phone } from 'lucide-react'

export default function VideoDateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [partnerImage, setPartnerImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingPartner, setLoadingPartner] = useState(true)
  const [callAccepted, setCallAccepted] = useState(false)
  const [callRejected, setCallRejected] = useState(false)

  const partnerId = searchParams.get('partner')
  const callType = (searchParams.get('type') as 'audio' | 'video') || 'video'
  const mode = searchParams.get('mode') as 'outgoing' | 'incoming' | null
  const callId = searchParams.get('callId')

  useEffect(() => {
    // Wait for auth to load before proceeding
    if (authLoading) {
      return
    }

    // Check if partner ID is provided
    if (!partnerId) {
      setError('No partner specified. Please start a call from your messages.')
      setLoadingPartner(false)
      return
    }

    // Check authentication - if not authenticated, redirect to login
    if (!user) {
      router.push('/login')
      return
    }

    // Fetch partner name and image
    const fetchPartnerName = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('full_name, photos, main_photo_index')
          .eq('user_id', partnerId)
          .single()

        if (fetchError || !data) {
          setError('Could not load partner information')
          return
        }

        setPartnerName(data.full_name)
        const mainPhoto = data.photos?.[data.main_photo_index || 0]
        if (mainPhoto) {
          setPartnerImage(mainPhoto)
        }
      } catch (err: any) {
        console.error('Error fetching partner:', err)
        setError('Failed to load partner information')
      } finally {
        setLoadingPartner(false)
      }
    }

    fetchPartnerName()
  }, [user, partnerId, router, authLoading])

  // For outgoing calls, listen for acceptance via real-time subscription
  useEffect(() => {
    if (mode !== 'outgoing' || !callId || !user) return

    let isMounted = true
    let subscription: any = null

    const setupSubscription = () => {
      try {
        subscription = supabase
          .channel(`call-status:${callId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'call_invitations',
              filter: `id=eq.${callId}`,
            },
            (payload: any) => {
              if (isMounted) {
                const status = payload.new.status
                if (status === 'accepted') {
                  setCallAccepted(true)
                } else if (status === 'declined') {
                  setCallRejected(true)
                  setError('Call was declined')
                } else if (status === 'ended') {
                  setError('Call has ended')
                }
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'call_invitations',
              filter: `id=eq.${callId}`,
            },
            (payload: any) => {
              if (isMounted) {
                // When the call invitation is deleted, the other person has ended the call
                setError('Call has ended')
              }
            }
          )
          .subscribe()
      } catch (err) {
        console.error('Error setting up call status subscription:', err)
      }
    }

    setupSubscription()

    return () => {
      isMounted = false
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [mode, callId, user])

  // Show error if no partner or authentication issues
  if (error || !user) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-6 text-slate-900">
              Start a Call
            </h1>
            <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl overflow-hidden soft-glow-lg flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl text-center soft-glow-lg max-w-md">
                <Lock size={48} className="text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {error ? 'Unable to Start Call' : 'Authentication Required'}
                </h2>
                <p className="text-slate-600 mb-6">
                  {error ||
                    'You need to be logged in to start a video date. Please log in and try again.'}
                </p>
                <button
                  onClick={() => router.push('/messages')}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full hover:bg-rose-700 transition"
                >
                  <ArrowLeft size={20} />
                  Back to Messages
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Show waiting screen for outgoing calls
  if (mode === 'outgoing' && !callAccepted && !callRejected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Navigation />
        <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              {partnerImage && (
                <div className="mb-8 flex justify-center">
                  <img
                    src={partnerImage}
                    alt={partnerName || 'Calling'}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg"
                  />
                </div>
              )}
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-2">
                {partnerName || 'Calling'}
              </h2>
              <p className="text-slate-300 mb-8">Waiting for {partnerName || 'them'} to accept...</p>
              <button
                onClick={() => router.push('/messages')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition"
              >
                <Phone size={20} className="rotate-[135deg]" />
                End Call
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Render the agora video call when partner is loaded and (incoming or outgoing accepted)
  if (!loadingPartner && partnerId && user && (mode !== 'outgoing' || callAccepted)) {
    return (
      <div className="w-full h-screen bg-black">
        <AgoraVideoCall
          partnerId={partnerId}
          partnerName={partnerName || 'User'}
          callType={callType}
          mode={mode}
          callId={callId}
        />
      </div>
    )
  }

  return null
}
