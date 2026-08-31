'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminSupportTickets } from '@/components/admin/admin-support-tickets'

export default function AdminSupportPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/admin"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Support Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage contact-form submissions and customer responses.</p>
        </div>
        <AdminSupportTickets />
      </div>
    </div>
  )
}
