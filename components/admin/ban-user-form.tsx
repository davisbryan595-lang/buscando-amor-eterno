'use client'

import { useState } from 'react'
import { useAdminActions } from '@/hooks/useAdminActions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface BanUserFormProps {
  userId: string
  onComplete: () => void
}

export function BanUserForm({ userId, onComplete }: BanUserFormProps) {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState<'permanent' | '7d' | '30d'>('permanent')
  const [loading, setLoading] = useState(false)
  const { banUser } = useAdminActions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast.error('Please provide a ban reason')
      return
    }

    try {
      setLoading(true)
      await banUser({
        userId,
        reason: reason.trim(),
        duration,
      })
      toast.success('User banned successfully')
      onComplete()
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('Failed to ban user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Ban Duration</label>
        <Select value={duration} onValueChange={(value: any) => setDuration(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="permanent">Permanent</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Ban Reason</label>
        <Textarea
          placeholder="Explain why this user is being banned (fake profile, harassment, etc.)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-h-24"
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={loading}
          variant="destructive"
          className="flex-1"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm Ban
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onComplete}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
