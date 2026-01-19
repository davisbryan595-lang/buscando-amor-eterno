'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ActivityLog {
  id: string
  admin_id: string
  action_type: 'ban_user' | 'unban_user' | 'verify_user' | 'dismiss_report' | 'view_profile'
  target_user_id: string | null
  details: Record<string, any> | null
  created_at: string
  admin?: {
    display_name: string
    email: string
  }
  target_user?: {
    display_name: string
    email: string
  }
}

export function AdminActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAction, setSelectedAction] = useState<string>('all')

  useEffect(() => {
    fetchLogs()
    // Refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedAction === 'all') {
      setFilteredLogs(logs)
    } else {
      setFilteredLogs(logs.filter((log) => log.action_type === selectedAction))
    }
  }, [selectedAction, logs])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select(
          `
          *,
          admin:admin_id(display_name, email),
          target_user:target_user_id(display_name, email)
          `
        )
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setLogs(data as ActivityLog[])
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      ban_user: 'Banned User',
      unban_user: 'Unbanned User',
      verify_user: 'Verified User',
      dismiss_report: 'Dismissed Report',
      view_profile: 'Viewed Profile',
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      ban_user: 'text-red-600 bg-red-50',
      unban_user: 'text-orange-600 bg-orange-50',
      verify_user: 'text-green-600 bg-green-50',
      dismiss_report: 'text-gray-600 bg-gray-50',
      view_profile: 'text-blue-600 bg-blue-50',
    }
    return colors[action] || 'text-gray-600 bg-gray-50'
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Activity Log</h2>
        <Select value={selectedAction} onValueChange={setSelectedAction}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="ban_user">Banned User</SelectItem>
            <SelectItem value="unban_user">Unbanned User</SelectItem>
            <SelectItem value="verify_user">Verified User</SelectItem>
            <SelectItem value="dismiss_report">Dismissed Report</SelectItem>
            <SelectItem value="view_profile">Viewed Profile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No activity logs found</div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getActionColor(
                      log.action_type
                    )}`}
                  >
                    {getActionLabel(log.action_type)}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">Admin:</span> {log.admin?.display_name} ({log.admin?.email})
                  </p>
                  {log.target_user && (
                    <p className="text-foreground">
                      <span className="font-medium">Target:</span> {log.target_user.display_name} (
                      {log.target_user.email})
                    </p>
                  )}
                  {log.details && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Details:</span> {JSON.stringify(log.details)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
