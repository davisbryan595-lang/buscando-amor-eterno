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
import { Loader2, Search, AlertCircle } from 'lucide-react'
import { AdminUserDetailModal } from './admin-user-detail-modal'
import { formatDistanceToNow } from 'date-fns'

export interface IncompleteProfile {
  user_id: string
  id: string
  full_name: string
  photos: string[]
  banned: boolean
  verified: boolean
  created_at: string
  updated_at: string
  profile_complete: boolean
}

export function AdminIncompleteProfiles() {
  const [users, setUsers] = useState<IncompleteProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<IncompleteProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<IncompleteProfile | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchIncompleteProfiles = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, id, full_name, photos, banned, verified, created_at, updated_at, profile_complete')
        .eq('profile_complete', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data as IncompleteProfile[])
      setFilteredUsers(data as IncompleteProfile[])
    } catch (error: any) {
      console.error('Error fetching incomplete profiles:', error?.message || JSON.stringify(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIncompleteProfiles()
  }, [fetchIncompleteProfiles])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.user_id.toLowerCase().includes(query)
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleUserClick = (user: IncompleteProfile) => {
    setSelectedUser(user)
    setShowDetailModal(true)
  }

  const handleUserUpdated = () => {
    fetchIncompleteProfiles()
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <h2 className="text-2xl font-bold text-foreground">Incomplete Profiles</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Users who have signed up but haven't completed onboarding ({filteredUsers.length} total)
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or user ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Signup Date</TableHead>
              <TableHead>Days Since Signup</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {users.length === 0 ? 'No incomplete profiles' : 'No profiles match your search'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const signupDate = new Date(user.created_at)
                const daysAgo = Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24))
                return (
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
                        <p className="font-medium text-foreground">{user.full_name || '(No name)'}</p>
                        {user.verified && <p className="text-xs text-green-600">Verified</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(signupDate, { addSuffix: false })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {daysAgo} day{daysAgo !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          user.banned
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {user.banned ? 'Banned' : 'Incomplete'}
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
                )
              })
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
