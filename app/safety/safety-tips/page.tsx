import type { Metadata } from 'next'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'

export const metadata: Metadata = {
  title: 'Dating Safety Tips | Buscando Amor Eterno',
  description: 'Practical online dating safety tips for protecting your privacy, spotting suspicious behavior, and planning a first date.',
  alternates: { canonical: '/safety/safety-tips' },
}

const safetyTips = [
  {
    title: 'Get to Know Someone Before Meeting',
    paragraphs: ['Take your time getting familiar with someone before deciding to meet in person.'],
    bullets: [
      'Have meaningful conversations and ask questions to understand the other person’s intentions.',
      'Pay attention to inconsistencies in their stories or information.',
      'Be cautious if someone immediately pressures you to communicate outside the platform.',
      'Consider having a video call before arranging your first meeting.',
      'Never feel obligated to meet someone before you’re comfortable.',
    ],
    after: ['A genuine connection should never require you to rush.'],
  },
  {
    title: 'Protect Your Personal Information',
    paragraphs: ['Your privacy deserves protection, especially when interacting with people you have recently met online.'],
    bullets: [
      'Avoid sharing your home address, workplace location, or daily routine with strangers.',
      'Keep financial information, passwords, and account credentials private.',
      'Think carefully before sharing personal photographs or sensitive information.',
      'Review your social media privacy settings.',
      'Only share personal contact information when you feel comfortable doing so.',
    ],
    after: ['Remember, once information or photographs are shared, you may lose control over how they are used.'],
  },
  {
    title: 'Recognize Fake Profiles and Suspicious Behavior',
    paragraphs: [
      'Not everyone online has genuine intentions. Some individuals may create misleading profiles or pretend to be someone they are not.',
      'Be cautious when someone:',
    ],
    bullets: [
      'Provides inconsistent personal information.',
      'Avoids reasonable attempts to verify their identity.',
      'Uses suspicious or unusual photographs.',
      'Makes unrealistic promises or declarations very early.',
      'Frequently changes their story.',
      'Attempts to manipulate you emotionally or create a sense of urgency.',
    ],
    after: ['If something doesn’t seem right, take a step back. You do not need to continue a conversation that makes you uncomfortable.'],
  },
  {
    title: 'Never Send Money to Someone You Meet Online',
    paragraphs: [
      'Financial scams can happen in online dating environments. Scammers may build emotional connections to gain someone’s trust before requesting money.',
      'Be particularly careful if someone:',
    ],
    bullets: [
      'Requests money for an emergency or unexpected expense.',
      'Asks for financial assistance to travel and meet you.',
      'Requests gift cards, cryptocurrency, or bank transfers.',
      'Offers investment opportunities or promises guaranteed returns.',
      'Asks for your banking information or payment credentials.',
    ],
    after: [
      'Never send money or share financial information with someone simply because you have developed an online connection.',
      'If you suspect a financial scam, discontinue communication and report the individual through the available reporting channels.',
    ],
  },
  {
    title: 'Plan Your First Meeting Carefully',
    paragraphs: ['When you decide to meet someone in person, make your safety a priority.'],
    labeled: [
      { label: 'Choose a public location:', text: 'Arrange your first meeting at a familiar restaurant, coffee shop, or other busy public venue.' },
      { label: 'Tell someone you trust:', text: 'Share the person’s name, meeting location, and expected time with a friend or family member.' },
      { label: 'Arrange your own transportation:', text: 'Avoid depending on someone you have just met for transportation. Make sure you can leave independently.' },
      { label: 'Keep your phone available:', text: 'Ensure your phone is charged and that you have access to communication and navigation.' },
      { label: 'Stay aware of your surroundings:', text: 'Pay attention to your environment and avoid situations where you feel isolated or uncomfortable.' },
    ],
    after: ['You can always end a meeting if you no longer feel comfortable.'],
  },
  {
    title: 'Respect, Boundaries, and Consent',
    paragraphs: [
      'Healthy relationships are built on mutual respect and understanding.',
      'Every individual has the right to establish personal boundaries and make their own decisions.',
    ],
    bullets: [
      'Respect another person’s comfort level and personal choices.',
      'Never pressure someone into physical intimacy or sharing private photographs.',
      'Understand that consent must be freely given and can be withdrawn at any time.',
      'Communicate openly and respectfully.',
      'Do not tolerate threatening, abusive, discriminatory, or harassing behavior.',
    ],
    after: ['A meaningful connection should always be based on mutual respect.'],
  },
  {
    title: 'Be Careful When Sharing Photographs',
    paragraphs: ['Photographs can help people become familiar with one another, but sharing private images comes with risks.'],
    bullets: [
      'Avoid sharing intimate or compromising photographs with people you do not fully trust.',
      'Never allow anyone to pressure or threaten you into sending personal images.',
      'Be cautious if someone attempts to use your photographs to manipulate or blackmail you.',
      'Do not share or distribute another person’s private photographs without their permission.',
    ],
    after: ['If someone threatens to expose your private content, preserve relevant evidence and seek assistance from the appropriate authorities.'],
  },
  {
    title: 'Recognize Emotional Manipulation',
    paragraphs: [
      'Not all unsafe interactions involve financial scams or direct threats. Some individuals may use emotional pressure to influence your decisions.',
      'Watch out for behavior such as:',
    ],
    bullets: [
      'Excessive affection or unrealistic commitments very early in communication.',
      'Attempts to isolate you from friends or family.',
      'Repeated pressure to ignore your personal boundaries.',
      'Guilt, intimidation, or threats when you disagree.',
      'Attempts to control your decisions or activities.',
    ],
    after: ['Take your time building trust. A healthy relationship allows both individuals to maintain their independence.'],
  },
  {
    title: 'Report Inappropriate or Suspicious Activity',
    paragraphs: [
      'A respectful dating community depends on everyone doing their part.',
      'If you encounter suspicious profiles, harassment, inappropriate messages, threats, or potentially fraudulent activity, take appropriate action.',
    ],
    bullets: [
      'Stop communicating with anyone who makes you feel unsafe.',
      'Use available blocking and reporting options where provided.',
      'Keep relevant messages or other evidence if you experience harassment or threats.',
      'Contact our support team through the available website contact channels.',
      'Contact local law enforcement or emergency services if you face an immediate threat.',
    ],
    after: ['Your concerns deserve attention, and reporting suspicious behavior can help protect other members of the community.'],
  },
  {
    title: 'Trust Your Instincts',
    paragraphs: [
      'You are never obligated to continue a conversation, share personal information, or attend a meeting that makes you uncomfortable.',
      'If something feels wrong, take it seriously.',
      'You have every right to:',
    ],
    bullets: [
      'End a conversation.',
      'Decline an invitation.',
      'Leave an uncomfortable situation.',
      'Stop communicating with someone.',
      'Seek help from people you trust.',
    ],
    after: ['Your comfort and personal safety should always come first.'],
  },
]

export default function SafetyTipsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-28 md:pb-20 md:pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Safety Center</p>
        <h1 className="mt-3 font-playfair text-4xl font-bold md:text-5xl">Your Safety Matters to Us</h1>
        <div className="mt-10 space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <section>
            <p className="text-muted-foreground">At <strong>Buscando Amor Eterno</strong>, we believe that meeting someone new should be an exciting, positive, and respectful experience. Building meaningful connections starts with trust, but protecting yourself along the way is equally important.</p>
            <p className="mt-3 text-muted-foreground">Whether you’re getting to know someone through messages or preparing for your first in-person meeting, taking a few precautions can help you enjoy your dating experience with greater confidence.</p>
            <p className="mt-3 text-muted-foreground">Your safety is a shared responsibility. Here are some important guidelines to keep in mind.</p>
          </section>

          {safetyTips.map((tip, index) => (
            <section key={tip.title}>
              <h2 className="text-2xl font-semibold">{index + 1}. {tip.title}</h2>
              {tip.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="mt-3 text-muted-foreground">{paragraph}</p>)}
              {tip.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                  {tip.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              )}
              {tip.labeled?.map(({ label, text }) => <p key={label} className="mt-3 text-muted-foreground"><strong>{label}</strong> {text}</p>)}
              {tip.after.map((paragraph) => <p key={paragraph} className="mt-3 text-muted-foreground">{paragraph}</p>)}
            </section>
          ))}

          <section>
            <h2 className="text-2xl font-semibold">Our Commitment to a Respectful Dating Community</h2>
            <p className="mt-3 text-muted-foreground">At <strong>Buscando Amor Eterno</strong>, we believe meaningful connections should begin with honesty, respect, and consideration for others.</p>
            <p className="mt-3 text-muted-foreground">We encourage every member to follow these safety recommendations and contribute to an environment where people can communicate and connect responsibly.</p>
            <p className="mt-3 text-muted-foreground">Although following these guidelines can help reduce potential risks, no online platform can guarantee the identity, intentions, or behavior of every individual. Please remain cautious both online and when meeting someone in person.</p>
            <p className="mt-5 text-muted-foreground"><strong>Looking for love should be a positive experience. Take your time, protect yourself, and build connections with confidence.</strong></p>
            <p className="mt-3 text-muted-foreground"><em>Your safety matters. Your boundaries matter. And your experience matters.</em></p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
