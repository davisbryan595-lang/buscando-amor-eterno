'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAdminAuthHeaders } from '@/context/admin-auth-context'
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
import { Loader2, Search } from 'lucide-react'
import { AdminUserDetailModal } from './admin-user-detail-modal'
import { formatDistanceToNow } from 'date-fns'

export interface UserProfile {
  user_id: string
  id: string
  full_name: string | null
  photos: string[]
  banned: boolean
  verified: boolean
  created_at: string
  updated_at: string
}

export function AdminUsersTable() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', {
        headers: getAdminAuthHeaders(),
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      const { users: profileData } = await response.json()

      setUsers(profileData || [])
      setFilteredUsers(profileData || [])
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
          user.full_name?.toLowerCase().includes(query) ||
          user.user_id.toLowerCase().includes(query)
      )
    }


    setFilteredUsers(filtered)
  }, [searchQuery, users])

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
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const displayName = user.full_name?.trim() || 'Unknown user'
                return (
                <TableRow key={user.user_id} className="hover:bg-accent cursor-pointer">
                  <TableCell>
                    {user.photos && user.photos[0] ? (
                      <img
                        src={user.photos[0]}
                        alt={displayName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{displayName}</p>
                      {user.verified && (
                        <p className="text-xs text-green-600">Verified</p>
                      )}
                    </div>
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
