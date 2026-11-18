import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, MessageCircle, ShieldCheck, UserRound, Video } from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

const title = 'Dating in the USA for Singles | Buscando Amor Eterno'
const description = 'Looking for dating in the USA? Meet singles, explore profiles, and start meaningful conversations on Buscando Amor Eterno.'
const path = '/dating-in-usa'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type: 'website',
    siteName: 'Buscando Amor Eterno',
    title,
    description,
    url: path,
    images: [{ url: '/romantic-couple-sunset-beach-luxury.jpg', alt: 'A couple together at sunset on the beach' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/romantic-couple-sunset-beach-luxury.jpg'],
  },
}

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url: `https://www.buscandoamoreterno.com${path}`,
  isPartOf: { '@type': 'WebSite', name: 'Buscando Amor Eterno', url: 'https://www.buscandoamoreterno.com/' },
  inLanguage: 'en-US',
}

export default function DatingInUsaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <Navigation />
      <main>
        <section className="relative overflow-hidden bg-[#251921] px-6 pb-20 pt-32 text-white sm:pb-28 sm:pt-40">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/romantic-couple-sunset-beach-luxury.jpg')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#25131e]/95 via-[#25131e]/75 to-[#25131e]/35" />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-rose-200">A meaningful connection starts here</p>
              <h1 className="font-playfair text-4xl font-bold leading-tight sm:text-6xl">Dating in the USA for singles ready for something real</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-rose-50 sm:text-lg">Whether you’re hoping to meet someone close to home or connect across the country, Buscando Amor Eterno gives you a place to start a genuine conversation.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="rounded-full bg-rose-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-700">Create your profile</Link>
                <Link href="/browse" className="rounded-full border border-white/70 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Explore profiles</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fff9f8] px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Meet with intention</p>
              <h2 className="mt-4 font-playfair text-3xl font-bold text-[#291d24] sm:text-4xl">A more personal way to meet singles</h2>
              <p className="mt-5 leading-7 text-stone-600">Finding a partner is about more than a first impression. Share who you are, discover people who interest you, and take the time to see where a conversation can lead.</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { icon: UserRound, title: 'Introduce yourself', text: 'Create a profile that reflects your personality, interests, and what you’re looking for.' },
                { icon: MessageCircle, title: 'Start a conversation', text: 'Explore profiles and get to know someone through messages at your own pace.' },
                { icon: Video, title: 'Connect face to face', text: 'Use video chat to make your conversations feel more personal, wherever you are.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-rose-100 bg-white p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-700"><Icon size={21} aria-hidden="true" /></div>
                  <h3 className="mt-5 font-playfair text-xl font-bold text-[#291d24]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Your journey, your pace</p>
              <h2 className="mt-4 font-playfair text-3xl font-bold text-[#291d24] sm:text-4xl">Make room for a meaningful connection</h2>
              <p className="mt-5 leading-7 text-stone-600">Online dating can help you meet people beyond your everyday routine. Be honest about your interests, ask thoughtful questions, and look for shared values as you get to know other singles in the USA and beyond.</p>
              <Link href="/signup" className="mt-7 inline-flex items-center gap-2 font-semibold text-rose-700 hover:text-rose-900">Get started <Heart size={17} aria-hidden="true" /></Link>
            </div>
            <div className="rounded-3xl bg-rose-50 p-8 sm:p-10">
              <ShieldCheck className="text-rose-700" size={28} aria-hidden="true" />
              <h2 className="mt-5 font-playfair text-2xl font-bold text-[#291d24]">Date with care</h2>
              <p className="mt-4 leading-7 text-stone-600">Take your time getting to know someone, protect your personal information, and choose a public place for a first meeting. Trust your instincts and review our community guidelines for more information.</p>
              <Link href="/community-guidelines" className="mt-5 inline-block text-sm font-semibold text-rose-700 hover:text-rose-900">Read community guidelines →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
