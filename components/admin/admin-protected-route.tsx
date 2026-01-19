'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/hooks/useAdmin'
import { Loader2 } from 'lucide-react'

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const router = useRouter()
  const { isAdmin, loading } = useAdmin()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/login')
    }
  }, [loading, isAdmin, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have admin permissions to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
