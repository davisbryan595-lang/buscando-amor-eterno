'use client'

import React, { Suspense } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Video } from 'lucide-react'
import VideoDateContent from './video-date-content'

function VideoDateLoading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
          <div className="bg-card p-8 rounded-2xl text-center soft-glow-lg">
            <Video size={48} className="text-primary mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Loading Video Call...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we prepare your video session
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default function VideoDatePage() {
  return (
    <Suspense fallback={<VideoDateLoading />}>
      <VideoDateContent />
    </Suspense>
  )
}
