'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, Search, Filter } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

export interface SubscriptionRecord {
  id: string
  user_id: string
  plan: 'free' | 'premium'
  status: 'active' | 'cancelled' | 'expired'
  stripe_subscription_id: string | null
  started_at: string
  expires_at: string | null
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
}

export function AdminSubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<SubscriptionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'premium'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled' | 'expired'>('all')

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          plan,
          status,
          stripe_subscription_id,
          started_at,
          expires_at,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error

      // Fetch user info for each subscription
      const subsWithUsers = await Promise.all(
        (data || []).map(async (sub) => {
          try {
            const { data: authUser } = await supabase.auth.admin.getUserById(sub.user_id)
            return {
              ...sub,
              user_email: authUser?.user?.email,
            }
          } catch (err) {
            return sub
          }
        })
      )

      setSubscriptions(subsWithUsers as SubscriptionRecord[])
      setFilteredSubscriptions(subsWithUsers as SubscriptionRecord[])
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error?.message || JSON.stringify(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  useEffect(() => {
    let filtered = subscriptions

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (sub) =>
          sub.user_id.toLowerCase().includes(query) ||
          sub.user_email?.toLowerCase().includes(query)
      )
    }

    // Filter by plan
    if (filterPlan !== 'all') {
      filtered = filtered.filter((sub) => sub.plan === filterPlan)
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((sub) => sub.status === filterStatus)
    }

    setFilteredSubscriptions(filtered)
  }, [searchQuery, subscriptions, filterPlan, filterStatus])

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Subscriptions</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user ID or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as 'all' | 'free' | 'premium')}
                className="px-3 py-1 rounded border border-border bg-background text-foreground text-sm"
              >
                <option value="all">All Plans</option>
                <option value="premium">Premium</option>
                <option value="free">Free</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'cancelled' | 'expired')}
                className="px-3 py-1 rounded border border-border bg-background text-foreground text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterPlan('all')
                setFilterStatus('all')
                setSearchQuery('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Stripe ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-accent">
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {sub.user_id.substring(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">{sub.user_email || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          sub.plan === 'premium'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          sub.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : sub.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(sub.started_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sub.expires_at ? format(new Date(sub.expires_at), 'MMM d, yyyy') : '—'}
                    </TableCell>
                    <TableCell>
                      {sub.stripe_subscription_id ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded max-w-xs truncate">
                          {sub.stripe_subscription_id.substring(0, 20)}...
                        </code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
        </div>
      </Card>
    </div>
  )
}
