'use client'

import { useAdminStats } from '@/hooks/useAdminStats'
import { Card } from '@/components/ui/card'
import { Loader2, Users, UserPlus, MessageSquare, Phone, AlertCircle, Ban, CreditCard, TrendingUp } from 'lucide-react'

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
      label: 'Premium Users',
      value: stats?.totalPremiumUsers ?? 0,
      icon: CreditCard,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Free Users',
      value: stats?.totalFreeUsers ?? 0,
      icon: Users,
      color: 'text-slate-500',
      bgColor: 'bg-slate-50',
    },
    {
      label: 'Monthly Revenue',
      value: `$${(stats?.monthlyRecurringRevenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      isRevenue: true,
    },
    {
      label: 'Active Subscriptions',
      value: stats?.activeSubscriptions ?? 0,
      icon: CreditCard,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
    },
    {
      label: 'Cancelled Subscriptions',
      value: stats?.cancelledSubscriptions ?? 0,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: 'New Today',
      value: stats?.newUsersToday ?? 0,
      icon: UserPlus,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
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
      label: 'Incomplete Profiles',
      value: stats?.incompleteProfiles ?? 0,
      icon: AlertCircle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Reported Profiles',
      value: stats?.reportedProfiles ?? 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : typeof item.value === 'string' ? (
                    item.value
                  ) : (
                    item.value.toLocaleString()
                  )}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${item.bgColor} flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
