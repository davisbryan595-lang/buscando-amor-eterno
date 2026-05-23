'use client'

import React from 'react'
import { Shield, Video, Mic } from 'lucide-react'

interface CallRecordingDisclosureProps {
  callType: 'video' | 'audio'
  partnerName: string | null
  onAccept: () => void
  onDecline: () => void
}

export function CallRecordingDisclosure({
  callType,
  partnerName,
  onAccept,
  onDecline,
}: CallRecordingDisclosureProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-center w-14 h-14 bg-rose-100 rounded-full mx-auto mb-4">
          {callType === 'video' ? (
            <Video className="text-primary" size={28} />
          ) : (
            <Mic className="text-primary" size={28} />
          )}
        </div>

        <h2 className="text-xl font-bold text-foreground text-center mb-1">
          {callType === 'video' ? 'Video' : 'Voice'} Date
          {partnerName ? ` with ${partnerName}` : ''}
        </h2>

        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 my-5 text-left">
          <Shield className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Safety & Recording Notice</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              By joining this call, you acknowledge that sessions may be recorded or monitored for
              safety and quality purposes as outlined in our{' '}
              <a href="/terms-of-service" target="_blank" className="underline font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy-policy" target="_blank" className="underline font-medium">
                Privacy Policy
              </a>
              . Call duration and metadata are always collected. Never share financial information,
              passwords, or sensitive personal data on calls.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 py-2.5 rounded-full border border-border text-foreground text-sm font-medium hover:bg-muted transition"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-semibold transition"
          >
            Accept &amp; Join
          </button>
        </div>
      </div>
    </div>
  )
}
