'use client'

import { useAdminReports } from '@/hooks/useAdminReports'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { AdminUserDetailModal } from './admin-user-detail-modal'
import { formatDistanceToNow } from 'date-fns'
import { UserProfile } from './admin-users-table'

export function AdminReportedProfiles() {
  const { reports, loading, dismissReport } = useAdminReports()
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleDismiss = async (reportId: string) => {
    try {
      await dismissReport(reportId)
      toast.success('Report dismissed')
    } catch (error) {
      console.error('Error dismissing report:', error)
      toast.error('Failed to dismiss report')
    }
  }

  const handleViewProfile = (report: any) => {
    const userData: UserProfile = {
      user_id: report.reported_user.id,
      id: report.reported_user.id,
      full_name: report.reported_user.full_name,
      photos: report.reported_user.photos || [],
      banned: false,
      verified: false,
      created_at: '',
      updated_at: '',
    }
    setSelectedUser(userData)
    setShowDetailModal(true)
  }

  const pendingReports = reports.filter((r) => r.status === 'pending')

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Reported Profiles</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {pendingReports.length} pending report{pendingReports.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reported User</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : pendingReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No pending reports
                </TableCell>
              </TableRow>
            ) : (
              pendingReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                    <p className="font-medium text-foreground">
                      {report.reported_user?.full_name}
                    </p>
                  </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {report.reported_by?.full_name}
                  </TableCell>
                  <TableCell className="text-sm text-foreground max-w-48">
                    <p className="truncate" title={report.description || report.reason}>
                      {report.description || report.reason}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(report.reported_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {report.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProfile(report)}
                        title="View profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(report.id)}
                        title="Dismiss report"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
          onUserUpdated={() => {}}
        />
      )}
    </Card>
  )
}
