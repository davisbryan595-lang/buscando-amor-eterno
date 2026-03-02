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
import { AdminUserDetailModal } from './admin-user-detail-modal'
import { formatDistanceToNow } from 'date-fns'

export interface UserProfile {
  user_id: string
  id: string
  full_name: string
  photos: string[]
  banned: boolean
  verified: boolean
  created_at: string
  updated_at: string
  subscription_plan?: 'free' | 'premium'
  subscription_status?: 'active' | 'cancelled' | 'expired'
}

export function AdminUsersTable() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'free' | 'premium'>('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, id, full_name, photos, banned, verified, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (profileError) throw profileError

      // Fetch subscription data
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('user_id, plan, status')

      if (subError) {
        console.warn('Warning: Could not fetch subscription data')
      }

      // Combine user and subscription data
      const usersWithSubscriptions = (profileData || []).map((user) => {
        const subscription = subscriptionData?.find((s) => s.user_id === user.user_id)
        return {
          ...user,
          subscription_plan: (subscription?.plan as 'free' | 'premium') || 'free',
          subscription_status: (subscription?.status as 'active' | 'cancelled' | 'expired') || undefined,
        }
      })

      setUsers(usersWithSubscriptions as UserProfile[])
      setFilteredUsers(usersWithSubscriptions as UserProfile[])
    } catch (error: any) {
      console.error('Error fetching users:', error?.message || JSON.stringify(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    let filtered = users

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.user_id.toLowerCase().includes(query)
      )
    }

    // Filter by subscription type
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter((user) => user.subscription_plan === subscriptionFilter)
    }

    setFilteredUsers(filtered)
  }, [searchQuery, users, subscriptionFilter])

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user)
    setShowDetailModal(true)
  }

  const handleUserUpdated = () => {
    fetchUsers()
  }

  return (
    <Card className="p-6">
      <div className="space-y-4 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Users Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or user ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value as 'all' | 'free' | 'premium')}
            className="px-3 py-1 rounded border border-border bg-background text-foreground text-sm"
          >
            <option value="all">All Users</option>
            <option value="premium">Premium Only</option>
            <option value="free">Free Only</option>
          </select>
          {subscriptionFilter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubscriptionFilter('all')}
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id} className="hover:bg-accent cursor-pointer">
                  <TableCell>
                    {user.photos && user.photos[0] ? (
                      <img
                        src={user.photos[0]}
                        alt={user.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{user.full_name}</p>
                      {user.verified && (
                        <p className="text-xs text-green-600">Verified</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        user.subscription_plan === 'premium'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {user.subscription_plan?.charAt(0).toUpperCase() || 'F'}{user.subscription_plan?.slice(1) || 'ree'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        user.subscription_status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : user.subscription_status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {user.subscription_status ? user.subscription_status.charAt(0).toUpperCase() + user.subscription_status.slice(1) : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        user.banned
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.banned ? 'Banned' : 'Active'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserClick(user)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <AdminUserDetailModal
          user={selectedUser}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </Card>
  )
}
