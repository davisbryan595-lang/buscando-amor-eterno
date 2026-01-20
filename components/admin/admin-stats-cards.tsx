'use client'

import { useAdminStats } from '@/hooks/useAdminStats'
import { Card } from '@/components/ui/card'
import { Loader2, Users, UserPlus, MessageSquare, Phone, AlertCircle, Ban } from 'lucide-react'

export function AdminStatsCards() {
  const { stats, loading } = useAdminStats()

  const statItems = [
    {
      label: 'Total Signups',
      value: stats?.totalSignups ?? 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Complete Profiles',
      value: stats?.totalProfiles ?? 0,
      icon: Users,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
    },
    {
      label: 'Incomplete Profiles',
      value: stats?.incompleteProfiles ?? 0,
      icon: AlertCircle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'New Today',
      value: stats?.newUsersToday ?? 0,
      icon: UserPlus,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Active Chats',
      value: stats?.activeChats ?? 0,
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Calls',
      value: stats?.totalCalls ?? 0,
      icon: Phone,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Reported Profiles',
      value: stats?.reportedProfiles ?? 0,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Banned Users',
      value: stats?.bannedUsers ?? 0,
      icon: Ban,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    item.value.toLocaleString()
                  )}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
