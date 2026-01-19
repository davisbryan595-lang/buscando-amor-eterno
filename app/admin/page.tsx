'use client'

import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'
import { AdminStatsCards } from '@/components/admin/admin-stats-cards'
import { AdminUsersTable } from '@/components/admin/admin-users-table'
import { AdminReportedProfiles } from '@/components/admin/admin-reported-profiles'
import { AdminActivityLog } from '@/components/admin/admin-activity-log'
import { AdminIncompleteProfiles } from '@/components/admin/admin-incomplete-profiles'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border sticky top-0 z-10 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Buscando Amor Eterno - User Management</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Dashboard Overview</h2>
            <AdminStatsCards />
          </section>

          <Separator className="my-12" />

          {/* Tabs for different sections */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="incomplete">Incomplete Profiles</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <AdminUsersTable />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <AdminReportedProfiles />
            </TabsContent>

            {/* Activity Log Tab */}
            <TabsContent value="activity" className="space-y-6">
              <AdminActivityLog />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminProtectedRoute>
  )
}
