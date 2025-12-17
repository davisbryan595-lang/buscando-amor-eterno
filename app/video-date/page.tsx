'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import AgoraVideoCall from '@/components/agora-video-call'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Lock, ArrowLeft } from 'lucide-react'

export default function VideoDatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingPartner, setLoadingPartner] = useState(true)

  const partnerId = searchParams.get('partner')

  useEffect(() => {
    // Check authentication
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    // Check if partner ID is provided
    if (!partnerId) {
      setError('No partner specified. Please start a call from your messages.')
      setLoadingPartner(false)
      return
    }

    // Fetch partner name
    const fetchPartnerName = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', partnerId)
          .single()

        if (fetchError || !data) {
          setError('Could not load partner information')
          return
        }

        setPartnerName(data.display_name)
      } catch (err: any) {
        console.error('Error fetching partner:', err)
        setError('Failed to load partner information')
      } finally {
        setLoadingPartner(false)
      }
    }

    if (user) {
      fetchPartnerName()
    }
  }, [user, partnerId, isLoading, router])

  // Show loading state
  if (isLoading || loadingPartner) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-6 text-slate-900">
              Start a Video Date
            </h1>
            <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl overflow-hidden soft-glow-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Preparing video call...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Show error if no partner or authentication issues
  if (error || !user) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-6 text-slate-900">
              Start a Video Date
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

  // Render the Agora video call
  return (
    <div className="fixed inset-0 bg-slate-900 z-50">
      <AgoraVideoCall partnerId={partnerId} partnerName={partnerName || undefined} />
    </div>
  )
}
