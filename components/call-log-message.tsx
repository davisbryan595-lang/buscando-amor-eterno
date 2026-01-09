'use client'

import React from 'react'
import { Phone, Video } from 'lucide-react'

interface CallLog {
  id: string
  caller_id: string
  receiver_id: string
  call_type: 'audio' | 'video'
  status: 'ongoing' | 'completed' | 'missed' | 'declined' | 'cancelled'
  started_at: string
  answered_at?: string
  ended_at?: string
  duration?: number
}

interface CallLogMessageProps {
  callLog: CallLog
  currentUserId: string
  onCallBack?: () => void
}

export default function CallLogMessage({
  callLog,
  currentUserId,
  onCallBack,
}: CallLogMessageProps) {
  const isOutgoing = callLog.caller_id === currentUserId
  const isIncoming = callLog.receiver_id === currentUserId

  // Format call duration
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds < 1) return '0s'
    if (seconds < 60) return `${seconds}s`

    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Determine icon based on call type, direction, and status
  const getCallIcon = () => {
    if (callLog.status === 'missed' && isIncoming) {
      return <Phone className="w-5 h-5 text-red-500" />
    }
    if (callLog.status === 'declined') {
      return <Phone className="w-5 h-5 text-slate-400" />
    }

    if (callLog.call_type === 'video') {
      return <Video className="w-5 h-5 text-primary" />
    }

    return <Phone className="w-5 h-5 text-primary" />
  }

  // Generate call description text
  const getCallText = () => {
    const callTypeLabel = callLog.call_type === 'video' ? 'video' : 'audio'

    if (callLog.status === 'completed') {
      const direction = isOutgoing ? 'Outgoing' : 'Incoming'
      const duration = callLog.duration ? formatDuration(callLog.duration) : '0s'
      return `${direction} ${callTypeLabel} call • ${duration}`
    }

    if (callLog.status === 'missed') {
      return isIncoming ? 'Missed call' : 'Call not answered'
    }

    if (callLog.status === 'declined') {
      return 'Declined call'
    }

    if (callLog.status === 'cancelled') {
      return 'Cancelled call'
    }

    return 'Ongoing call'
  }

  // Color coding
  const getTextColor = () => {
    if (callLog.status === 'missed' && isIncoming) {
      return 'text-red-600'
    }
    if (callLog.status === 'completed') {
      return 'text-green-600'
    }
    return 'text-muted-foreground'
  }

  return (
    <div className={`flex items-center gap-3 py-3 px-4 my-2 rounded-lg bg-card-subtle border border-border ${getTextColor()}`}>
      <div className="flex-shrink-0">{getCallIcon()}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{getCallText()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatTime(callLog.started_at)}
        </p>
      </div>

      {/* Optional: Call back button */}
      {onCallBack && (
        <button
          onClick={onCallBack}
          className="flex-shrink-0 p-2 text-primary hover:text-rose-700 hover:bg-rose-100 rounded-full transition"
          title="Call back"
          aria-label="Call back"
        >
          <Phone className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
