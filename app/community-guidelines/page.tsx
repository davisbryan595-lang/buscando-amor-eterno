import Link from 'next/link'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'

export default function CommunityGuidelinesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-28 md:pb-20 md:pt-32">
        <h1 className="font-playfair text-4xl font-bold md:text-5xl">Community Guidelines &amp; Safety</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Buscando Amor Eterno is a shared web and mobile community. These guidelines apply wherever you use the Service, including messages, lounge conversations, audio calls, and video calls with people on either platform.
        </p>

        <div className="mt-10 space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <section>
            <h2 className="text-2xl font-semibold">Be authentic and respectful</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Use your own identity and accurate photos and profile information.</li>
              <li>Treat everyone with respect. Harassment, hate, threats, stalking, and bullying are not allowed.</li>
              <li>Do not share another person&apos;s private information, images, or messages without their permission.</li>
              <li>Do not post sexually explicit, illegal, exploitative, or violent content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Keep financial and personal information safe</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Never send money, gift cards, cryptocurrency, passwords, banking details, or verification codes to another user.</li>
              <li>Be cautious of requests to move a conversation quickly off the Service or claims of an emergency.</li>
              <li>Do not solicit money, promote scams, or use the Service for commercial or fraudulent activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Use calls and meetups carefully</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Keep calls respectful and do not record or share them without permission.</li>
              <li>For an in-person first meeting, choose a public location, arrange your own transportation, and tell someone you trust about your plans.</li>
              <li>In an emergency or if you are in immediate danger, contact local emergency services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Report concerns</h2>
            <p className="mt-3 text-muted-foreground">
              Use the report tools in the Service for inappropriate profiles, messages, lounge activity, or calls. You may also <Link href="/contact" className="font-medium text-primary underline underline-offset-4">contact support</Link>. We review reports and may remove content, restrict features, suspend accounts, or report unlawful conduct to the appropriate authorities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Age requirement</h2>
            <p className="mt-3 text-muted-foreground">
              You must be at least 18 years old, or the age of majority where you live, to use Buscando Amor Eterno. Any suspected exploitation of a minor will result in immediate action and may be reported to law enforcement.
            </p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
