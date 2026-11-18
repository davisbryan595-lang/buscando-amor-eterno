import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Online Dating FAQs | Buscando Amor Eterno',
  description: 'Find answers about joining Buscando Amor Eterno, creating a dating profile, messaging singles, staying safe, privacy, and account support.',
  alternates: { canonical: '/faq' },
}

const faqs = [
  {
    question: 'What is Buscando Amor Eterno?',
    answer: 'Buscando Amor Eterno is an online dating platform for adults who want to meet people, have meaningful conversations, and explore potential relationships.',
  },
  {
    question: 'Who can join Buscando Amor Eterno?',
    answer: 'The dating platform is intended for adults aged 18 and older. Members should provide accurate information when registering and creating a profile.',
  },
  {
    question: 'Is Buscando Amor Eterno free to use?',
    answer: 'Core features are currently available at no cost. If a paid feature is introduced, its price and terms will be shown before you make a purchase.',
  },
  {
    question: 'How do I create a dating profile?',
    answer: 'Create an account, then add profile details and photos you want to share. Keep your information accurate and only include details you are comfortable showing to other members.',
  },
  {
    question: 'How can I discover and connect with other singles?',
    answer: 'You can browse member profiles and use available communication features such as messaging. Feature access may depend on your account and the current availability of the service.',
  },
  {
    question: 'How can I stay safe while online dating?',
    answer: 'Take time to get to know someone, protect your personal and financial information, never send money to someone you have only met online, and choose a public place for a first meeting. Trust your instincts and report behavior that makes you feel unsafe.',
  },
  {
    question: 'How do I report a profile or inappropriate behavior?',
    answer: 'Use the reporting options available on the platform or contact the support team. If there is an immediate threat or emergency, contact local emergency services rather than relying on a website report.',
  },
  {
    question: 'What profile information can other members see?',
    answer: 'Information you choose to include in a visible dating profile may be shown to other members. Review your profile before publishing and avoid posting sensitive information you do not want to share.',
  },
  {
    question: 'How do I delete my account?',
    answer: 'Use the account deletion page to request deletion. If you cannot access your account, contact support for assistance.',
  },
  {
    question: 'How do I contact Buscando Amor Eterno support?',
    answer: 'Visit the Support or Contact page to find help and send a message to the team.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-28 md:pb-20 md:pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Help and information</p>
        <h1 className="mt-3 font-playfair text-4xl font-bold md:text-5xl">Online Dating FAQs</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Answers to common questions about dating on Buscando Amor Eterno, profile setup, connecting with members, privacy, and safety.</p>

        <div className="mt-10 space-y-4">
          {faqs.map(({ question, answer }, index) => (
            <section key={question} className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
              <h2 className="text-lg font-semibold">{question}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{answer}</p>
              {index === 3 && <Link href="/signup" className="mt-3 inline-block font-medium text-primary underline underline-offset-4">Create an account</Link>}
              {index === 5 && <Link href="/safety/safety-tips" className="mt-3 inline-block font-medium text-primary underline underline-offset-4">Read our dating safety tips</Link>}
              {index === 6 && <Link href="/safety/community-guidelines" className="mt-3 inline-block font-medium text-primary underline underline-offset-4">Review the Community Guidelines</Link>}
              {index === 8 && <Link href="/delete-account" className="mt-3 inline-block font-medium text-primary underline underline-offset-4">Go to account deletion</Link>}
              {index === 9 && <Link href="/support" className="mt-3 inline-block font-medium text-primary underline underline-offset-4">Visit Support</Link>}
            </section>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Footer />
    </main>
  )
}
