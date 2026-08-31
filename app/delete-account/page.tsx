import Link from 'next/link'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'

export default function DeleteAccountPage() {
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
            <h2 className="text-2xl font-semibold">How to delete your account</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>Sign in to Buscando Amor Eterno on the web or in the mobile app.</li>
              <li>Open <strong className="text-foreground">My Profile</strong>.</li>
              <li>Select <strong className="text-foreground">Delete Account</strong> in Account Settings and confirm the deletion.</li>
            </ol>
            <p className="mt-4 text-muted-foreground">
              The deletion control requires sign-in to protect your account. If you cannot sign in, <Link href="/contact" className="font-medium text-primary underline underline-offset-4">contact support</Link> from the email address associated with your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">What is deleted</h2>
            <p className="mt-3 text-muted-foreground">
              We delete the shared account and associated active data, including your profile, photos, preferences, direct and lounge messages, likes, notifications, call invitations and logs, device notification tokens, subscriptions, support tickets associated with your account email, and account-related reports and activity records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">What may be retained</h2>
            <p className="mt-3 text-muted-foreground">
              We may retain the minimum information necessary to comply with legal obligations, resolve disputes, prevent fraud, or protect the safety of our community. De-identified or aggregated information may also remain. Data retained in backups is removed on the backup retention schedule and is not used to restore an active account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Subscriptions</h2>
            <p className="mt-3 text-muted-foreground">
              Deleting your account does not automatically cancel a subscription purchased through Apple, Google Play, or another payment provider. Cancel recurring billing through the store or provider where you purchased it.
            </p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
