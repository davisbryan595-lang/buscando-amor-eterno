'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function DeleteAccountPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      toast.success('Account deleted successfully')
      await signOut()
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-28 md:pb-20 md:pt-32">
        <h1 className="font-playfair text-4xl font-bold md:text-5xl">Delete Your Account</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Buscando Amor Eterno uses one shared account across its website and mobile applications. Deleting your account removes access on every platform.
        </p>

        <div className="mt-10 space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <section>
            <h2 className="text-2xl font-semibold">Request account deletion</h2>

            {loading ? (
              <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                <Loader className="animate-spin" size={18} />
                Checking your session...
              </div>
            ) : user ? (
              <div className="mt-4">
                <p className="text-muted-foreground">
                  You're signed in as <strong className="text-foreground">{user.email}</strong>. Deleting your account is permanent and cannot be undone.
                </p>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  size="lg"
                  className="mt-4 gap-2"
                >
                  <Trash2 size={20} />
                  Delete My Account
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-muted-foreground">
                  Sign in to submit a deletion request for your account.
                </p>
                <Link href="/login?redirect=/delete-account">
                  <Button size="lg" className="mt-4 bg-primary text-white hover:bg-rose-700">
                    Log In to Delete My Account
                  </Button>
                </Link>
                <p className="mt-4 text-muted-foreground">
                  If you can't sign in, <Link href="/contact" className="font-medium text-primary underline underline-offset-4">contact support</Link> from the email address associated with your account to request deletion.
                </p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold">What is deleted</h2>
            <p className="mt-3 text-muted-foreground">
              We delete the shared account and associated active data, including your profile, photos, preferences, direct and lounge messages, likes, notifications, call invitations and logs, device notification tokens, subscriptions, support tickets associated with your account email, and account-related reports and activity records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">When it happens</h2>
            <p className="mt-3 text-muted-foreground">
              Your account and the data listed above are deleted immediately once you confirm the request. Copies of your data that exist in encrypted backups are purged within 30 days as part of our regular backup rotation, and are not used to restore an active account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">What may be retained</h2>
            <p className="mt-3 text-muted-foreground">
              We may retain the minimum information necessary to comply with legal obligations, resolve disputes, prevent fraud, or protect the safety of our community. De-identified or aggregated information may also remain.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Free access</h2>
            <p className="mt-3 text-muted-foreground">
              All features are currently available at no cost, and no payment is required to use your account.
            </p>
          </section>
        </div>
      </section>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your account, profile, photos, messages, and all associated data. This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader className="animate-spin mr-2" size={16} />}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </main>
  )
}
