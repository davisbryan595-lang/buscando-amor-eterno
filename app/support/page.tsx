import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, HelpCircle, Mail, ShieldCheck, Trash2 } from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Dating Platform Support | Buscando Amor Eterno',
  description: 'Get help with your Buscando Amor Eterno account, privacy requests, account deletion, and online dating safety.',
  alternates: { canonical: '/support' },
}

const supportOptions = [
  {
    href: '/faq',
    icon: HelpCircle,
    title: 'Browse FAQs',
    description: 'Find answers about profiles, messaging, safety, privacy, and using the dating platform.',
    action: 'See common questions',
  },
  {
    href: '/delete-account',
    icon: Trash2,
    title: 'Account deletion',
    description: 'Review the account deletion process and submit a request for your Buscando Amor Eterno account.',
    action: 'Manage account deletion',
  },
  {
    href: '/safety',
    icon: ShieldCheck,
    title: 'Safety and community',
    description: 'Read our Safety & Community Policy, Community Guidelines, and dating safety advice.',
    action: 'Open the Safety Center',
  },
]

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-28 md:pb-20 md:pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Buscando Amor Eterno</p>
        <h1 className="mt-3 font-playfair text-4xl font-bold md:text-5xl">Support</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Need help with your account, a privacy question, a safety concern, or a Premium subscription request? Start with the resources below or contact our support team.</p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {supportOptions.map(({ href, icon: Icon, title, description, action }) => (
            <Link key={href} href={href} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md">
              <Icon className="text-primary" size={26} aria-hidden="true" />
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">{action}<ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <Mail className="text-primary" size={26} aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-semibold">Contact the support team</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Send us a message through the Contact page or email support@buscandoamoreterno.com. Include the email address associated with your account and a brief description of the issue. Do not include your password or payment credentials.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">Contact us</Link>
            <a href="mailto:support@buscandoamoreterno.com" className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-card-subtle">Email support</a>
          </div>
        </section>

        <p className="mt-8 text-sm leading-6 text-muted-foreground">If you are in immediate danger, contact local emergency services. Online support and website reports are not emergency services.</p>
      </section>
      <Footer />
    </main>
  )
}
