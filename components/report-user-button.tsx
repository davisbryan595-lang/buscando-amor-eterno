'use client'

import React, { useState } from 'react'
import { Flag } from 'lucide-react'
import { useReportUser } from '@/hooks/useReportUser'
import { useAuth } from '@/context/auth-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ReportUserButtonProps {
  userId: string
  userName?: string
  subtle?: boolean
}

const REPORT_REASONS = [
  { value: 'inappropriate_behavior', label: 'Inappropriate behavior' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'scam_fraud', label: 'Scam or fraud' },
  { value: 'harassment', label: 'Harassment or threats' },
  { value: 'explicit_content', label: 'Explicit or offensive content' },
  { value: 'other', label: 'Other' },
]

export function ReportUserButton({
  userId,
  userName = 'User',
  subtle = true,
}: ReportUserButtonProps) {
  const { user } = useAuth()
  const { reportUser } = useReportUser()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please select a reason for your report')
      return
    }

    setIsSubmitting(true)
    try {
      await reportUser(userId, reason, description)
      setOpen(false)
      setReason('')
      setDescription('')
    } catch (error) {
      // Error is already handled by toast in the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.id === userId) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          subtle
            ? 'text-xs text-muted-foreground hover:text-rose-600 transition flex items-center gap-1'
            : 'flex items-center gap-1 text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded transition border border-rose-200'
        }
        title={`Report ${userName}`}
      >
        <Flag size={subtle ? 14 : 16} />
        {!subtle && <span>Report</span>}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report {userName}</DialogTitle>
            <DialogDescription>
              Help us keep our community safe by reporting inappropriate profiles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Reason Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Reason for report
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className="flex items-center p-2 rounded border border-border hover:bg-card-hover cursor-pointer transition"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-sm text-foreground">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Additional details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional information that will help us review this report..."
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !reason}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
