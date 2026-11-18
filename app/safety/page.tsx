import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Heart, ShieldCheck } from 'lucide-react'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'

export const metadata: Metadata = {
  title: 'Safety Center | Buscando Amor Eterno',
  description: 'Explore safety tips and community guidelines for respectful, confident dating with Buscando Amor Eterno.',
  alternates: { canonical: '/safety' },
}

const safetyPages = [
  {
    href: '/safety/community-guidelines',
    icon: ShieldCheck,
    title: 'Community Guidelines',
    description: 'Learn about the standards that help keep Buscando Amor Eterno respectful, welcoming, and safe for everyone.',
    link: 'Read the guidelines',
  },
  {
    href: '/safety/safety-tips',
    icon: Heart,
    title: 'Safety Tips',
    description: 'Practical advice for getting to know people online, protecting your privacy, and planning a first meeting.',
    link: 'Explore safety tips',
  },
]

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-28 md:pb-20 md:pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Buscando Amor Eterno</p>
        <h1 className="mt-3 font-playfair text-4xl font-bold md:text-5xl">Safety Center</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Your safety and well-being matter. Find guidance for building respectful connections, recognizing concerning behavior, and looking after yourself online and in person.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {safetyPages.map(({ href, icon: Icon, title, description, link }) => (
            <Link key={href} href={href} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md md:p-8">
              <Icon className="text-primary" size={28} aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-medium text-primary">{link}<ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}
