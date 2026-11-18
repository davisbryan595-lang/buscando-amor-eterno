import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'

export const metadata: Metadata = {
  title: 'Community Guidelines | Buscando Amor Eterno Safety Center',
  description: 'Read the community rules for respectful, authentic, and safe connections on Buscando Amor Eterno.',
  alternates: { canonical: '/safety/community-guidelines' },
}

const communityRules = [
  {
    title: 'Respect Personal Boundaries',
    paragraphs: [
      'Every individual has different comfort levels, expectations, and personal boundaries.',
      'We encourage respectful conversations and interactions where both individuals feel comfortable and valued.',
      'Public profiles must not contain nudity, explicit sexual content, sexually graphic descriptions, or advertisements for sexual services.',
      'Private conversations should always respect mutual consent and personal boundaries.',
      'Unwanted sexual messages, repeated inappropriate requests, and any form of sexual harassment are strictly prohibited.',
    ],
    emphasis: 'Consent, respect, and personal comfort must always come first.',
  },
  {
    title: 'Protect Your Privacy and Personal Information',
    paragraphs: ['Your privacy and security are important to us.', 'We strongly encourage members to be thoughtful about the information they share with others.'],
    bullets: [
      'Personal phone numbers and email addresses', 'Home addresses or precise locations', 'Banking information and financial details',
      'Passwords or account credentials', 'Government identification numbers', 'Other confidential personal information',
    ],
    beforeBullets: 'Avoid publicly displaying sensitive personal information, including:',
    afterBullets: [
      'Do not pressure other members into sharing private information.',
      'Be cautious when someone requests money, financial assistance, investments, or sensitive information.',
      'Buscando Amor Eterno does not tolerate scams, financial exploitation, or fraudulent activity.',
    ],
  },
  {
    title: 'Keep the Community Free From Violence',
    paragraphs: [
      'Buscando Amor Eterno is committed to maintaining a peaceful and welcoming environment.',
      'Content that promotes, encourages, glorifies, or threatens violence is prohibited.',
    ],
    bullets: [
      'Graphic violence or disturbing imagery', 'Threats of physical harm', 'Content encouraging abuse toward people or animals',
      'Promotion of violent criminal activities', 'Content encouraging self-harm or suicide', 'Intimidation involving weapons or threats',
    ],
    beforeBullets: 'This includes:',
    afterBullets: ['Any behavior suggesting an immediate threat to another person’s safety may result in account restrictions or additional action when appropriate.'],
  },
  {
    title: 'Focus on Genuine Relationships, Not Business Promotions',
    paragraphs: [
      'Buscando Amor Eterno is designed for personal connections and meaningful relationships.',
      'Members must not use the platform primarily for commercial purposes, including:',
    ],
    bullets: [
      'Advertising products or services', 'Promoting businesses or websites', 'Soliciting customers or sales',
      'Fundraising or requesting donations', 'Recruiting people into investment opportunities',
      'Promoting social media accounts solely to gain followers', 'Offering escort services, sexual services, or compensated romantic relationships',
    ],
    afterBullets: ['Our community exists to help people connect personally, not to serve as an advertising marketplace.'],
  },
  {
    title: 'Be Authentic and Represent Yourself Honestly',
    paragraphs: [
      'Genuine relationships begin with honesty.',
      'Members must accurately represent themselves when creating profiles and communicating with others.',
      'The following activities are prohibited:',
    ],
    bullets: [
      'Creating fake profiles', 'Impersonating another individual', 'Using another person’s photographs without permission',
      'Misrepresenting your identity to deceive others', 'Creating accounts for fraudulent purposes',
      'Using misleading information to manipulate other members',
    ],
    afterBullets: ['You are encouraged to use recent, authentic photographs and provide truthful information about yourself.'],
    emphasis: 'Be yourself. Authenticity creates stronger connections.',
  },
  {
    title: 'Communicate With Respect',
    paragraphs: [
      'We welcome individuals from different cultures, backgrounds, beliefs, and experiences.',
      'Every member deserves to be treated with dignity and respect.',
      'The following behaviors are prohibited:',
    ],
    bullets: [
      'Harassment or bullying', 'Threats or intimidation', 'Hate speech or discriminatory language', 'Personal attacks and abusive messages',
      'Blackmail or extortion', 'Sharing private information without permission', 'Repeated unwanted communication',
      'Sexually threatening or coercive behavior',
    ],
    afterBullets: [
      'Discrimination or hateful behavior based on race, ethnicity, nationality, religion, gender, gender identity, sexual orientation, disability, age, or other protected characteristics is not permitted.',
      'If someone is not a suitable match for you, respectfully end the conversation or use the platform’s available blocking or unmatching features.',
    ],
  },
  {
    title: 'Prioritize Safety and Kindness',
    paragraphs: [
      'We want every member of Buscando Amor Eterno to feel safe while building connections.',
      'Any behavior intended to harm, exploit, manipulate, threaten, or intimidate another member is taken seriously.',
      'This applies to interactions occurring both on the platform and outside the platform when connected to relationships or communications established through our service.',
      'Prohibited behavior includes:',
    ],
    bullets: [
      'Stalking or persistent harassment', 'Emotional manipulation intended to exploit another person', 'Threats or physical violence',
      'Sexual coercion', 'Sharing intimate images without consent', 'Financial exploitation', 'Encouraging harmful or dangerous activities',
    ],
    afterBullets: [
      'If another member makes you feel unsafe, you may block or report their account.',
      'We encourage members to prioritize their personal safety when communicating online or meeting someone in person.',
    ],
  },
  {
    title: 'Adults Only — Minimum Age 18',
    paragraphs: [
      <>Buscando Amor Eterno is exclusively intended for adults aged <strong>18 years or older</strong>.</>,
      'Individuals under the age of 18 are not permitted to register or use the platform.',
      'Members must provide accurate age information during registration.',
      'We do not permit:',
    ],
    bullets: [
      'Accounts operated by minors', 'Misrepresentation of age to bypass restrictions', 'Sexualized images or content involving minors',
      'Exploitation or endangerment of children', 'Any illegal interaction involving minors',
    ],
    afterBullets: ['Accounts found to belong to underage individuals may be removed.'],
  },
  {
    title: 'Follow Applicable Laws',
    paragraphs: [
      'All members must comply with applicable local, national, and international laws.',
      'Illegal activities are strictly prohibited on Buscando Amor Eterno.',
      'This includes, but is not limited to:',
    ],
    bullets: [
      'Fraud and financial scams', 'Human trafficking', 'Child exploitation', 'Illegal drug distribution', 'Identity theft',
      'Extortion or blackmail', 'Distribution of illegal content', 'Other criminal activities',
    ],
    afterBullets: ['Where appropriate and legally required, serious violations may be reported to relevant authorities.'],
  },
  {
    title: 'One Person, One Account',
    paragraphs: [
      'Each Buscando Amor Eterno account must belong to one individual.',
      'Members are responsible for maintaining the security of their accounts.',
      'The following are not permitted:',
    ],
    bullets: [
      'Creating multiple active accounts for the same individual', 'Sharing accounts with other people', 'Selling or transferring accounts',
      'Creating accounts to bypass suspensions or bans', 'Using automated systems to generate fake accounts',
    ],
    afterBullets: ['Account activity must reflect genuine individual participation.'],
  },
  {
    title: 'Share Only Content You Have Permission to Use',
    paragraphs: [
      'Members are responsible for the content they upload or share.',
      'You must have the appropriate rights or permission to publish photographs, videos, messages, and other materials.',
      'Do not upload or distribute:',
    ],
    bullets: [
      'Photographs belonging to others without permission', 'Private conversations without appropriate consent',
      'Copyrighted materials used without authorization', 'Content that violates another person’s privacy',
      'Misleading or stolen identity information', 'Intimate images shared without consent',
    ],
    afterBullets: ['Buscando Amor Eterno reserves the right to remove content that violates these requirements.'],
  },
  {
    title: 'Use the Platform Responsibly',
    paragraphs: [
      'Members must use Buscando Amor Eterno fairly, responsibly, and in accordance with its intended purpose.',
      'The following activities are prohibited:',
    ],
    bullets: [
      'Sending spam or repetitive unsolicited messages', 'Sharing malicious links or harmful software',
      'Using bots or unauthorized automated tools', 'Manipulating platform features', 'Attempting to bypass security systems',
      'Creating fraudulent or mass-generated accounts', 'Submitting intentionally false or malicious reports',
      'Attempting to gain unauthorized access to another account', 'Using the platform to deceive or financially exploit others',
      'Interfering with the experience or safety of other members',
    ],
    afterBullets: ['We may investigate suspicious activity and take appropriate action to protect our community.'],
  },
  {
    title: 'Maintain an Active and Genuine Account',
    paragraphs: [
      'Buscando Amor Eterno is designed for active participation and meaningful communication.',
      'Accounts that remain inactive for an extended period may be subject to review, deactivation, or deletion in accordance with our Privacy Policy and applicable laws.',
      'We encourage members to keep their profiles accurate and return to the platform regularly.',
    ],
  },
]

export default function CommunityGuidelinesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-28 md:pb-20 md:pt-32">
        <h1 className="font-playfair text-4xl font-bold md:text-5xl">Community Guidelines</h1>

        <div className="mt-10 space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <section>
            <h2 className="text-2xl font-semibold">Welcome to Buscando Amor Eterno!</h2>
            <p className="mt-3 text-muted-foreground"><strong>Buscando Amor Eterno is a place where genuine connections begin, meaningful conversations grow, and lasting relationships become possible.</strong></p>
            <p className="mt-3 text-muted-foreground">We believe everyone deserves the opportunity to find love, companionship, and meaningful relationships in a safe, respectful, and welcoming environment.</p>
            <p className="mt-3 text-muted-foreground">Our mission is to bring people together through authentic interactions, mutual respect, honesty, and shared intentions.</p>
            <p className="mt-3 text-muted-foreground">Whether you&apos;re looking for a serious relationship, a lifelong partner, or simply hoping to meet someone special, Buscando Amor Eterno welcomes adults from all backgrounds.</p>
            <p className="mt-3 text-muted-foreground">To maintain a positive experience for everyone, we&apos;ve established these Community Guidelines. They explain what we expect from our members and what behaviors are not permitted.</p>
            <p className="mt-3 text-muted-foreground">By using Buscando Amor Eterno, you agree to follow these guidelines. Violations may result in warnings, account restrictions, suspension, or permanent removal from the platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Our Community Rules</h2>
            <ol className="mt-5 space-y-8">
              {communityRules.map((rule, index) => (
                <li key={rule.title}>
                  <h3 className="text-xl font-semibold">{index + 1}. {rule.title}</h3>
                  {rule.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className="mt-3 text-muted-foreground">{paragraph}</p>
                  ))}
                  {rule.beforeBullets && <p className="mt-3 text-muted-foreground">{rule.beforeBullets}</p>}
                  {rule.bullets && (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                      {rule.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  )}
                  {rule.afterBullets?.map((paragraph) => <p key={paragraph} className="mt-3 text-muted-foreground">{paragraph}</p>)}
                  {rule.emphasis && <p className="mt-3 text-muted-foreground"><strong>{rule.emphasis}</strong></p>}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Reporting Violations</h2>
            <h3 className="mt-4 text-lg font-semibold">Help Us Keep Buscando Amor Eterno Safe</h3>
            <p className="mt-3 text-muted-foreground">The safety and well-being of our community depend on everyone treating others responsibly.</p>
            <p className="mt-3 text-muted-foreground">If you encounter inappropriate behavior, harassment, fraudulent activity, or content that violates these Community Guidelines, we encourage you to report it.</p>
            <p className="mt-3 text-muted-foreground">You can report concerns through the reporting features available on the platform or by contacting our support team through official support channels. You may also <Link href="/contact" className="font-medium text-primary underline underline-offset-4">contact support</Link>.</p>
            <p className="mt-3 text-muted-foreground">Reports will be handled with appropriate confidentiality, subject to legal obligations and the requirements of investigating reported conduct.</p>
            <p className="mt-3 text-muted-foreground">Our team may review reported accounts, messages, and other relevant information as permitted by applicable law and our Privacy Policy.</p>
            <p className="mt-3 text-muted-foreground">Submitting a report does not automatically result in account suspension. Each situation may be reviewed based on the available information and severity of the reported behavior.</p>
            <p className="mt-3 text-muted-foreground">Knowingly submitting false or malicious reports is also prohibited.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Enforcement and Consequences</h2>
            <h3 className="mt-4 text-lg font-semibold">What Happens When Guidelines Are Violated?</h3>
            <p className="mt-3 text-muted-foreground">Buscando Amor Eterno takes violations of these Community Guidelines seriously.</p>
            <p className="mt-3 text-muted-foreground">Depending on the nature, severity, and frequency of the violation, we may take one or more of the following actions:</p>
            <ol className="mt-3 list-decimal space-y-3 pl-5 text-muted-foreground">
              <li><strong>Warning:</strong> Notify the member about inappropriate behavior and explain the applicable rule.</li>
              <li><strong>Content Removal:</strong> Remove photographs, messages, profile information, or other content that violates our guidelines.</li>
              <li><strong>Feature Restrictions:</strong> Temporarily restrict access to certain platform features.</li>
              <li><strong>Account Suspension:</strong> Temporarily suspend an account while reviewing violations or safety concerns.</li>
              <li><strong>Permanent Account Ban:</strong> Permanently remove accounts involved in serious or repeated violations.</li>
              <li><strong>Legal Action:</strong> Cooperate with relevant authorities when required by law or appropriate in response to serious unlawful activity.</li>
            </ol>
            <p className="mt-3 text-muted-foreground">Severe violations may result in immediate account suspension or permanent removal without a prior warning.</p>
            <p className="mt-3 text-muted-foreground">Where permitted by applicable law and our Terms of Service, account termination may affect access to paid subscriptions or purchases.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Your Responsibility as a Member</h2>
            <p className="mt-3 text-muted-foreground">By joining Buscando Amor Eterno, you agree to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Treat other members with kindness and respect.</li>
              <li>Communicate honestly and authentically.</li>
              <li>Respect personal boundaries and consent.</li>
              <li>Protect your own privacy and the privacy of others.</li>
              <li>Avoid fraudulent, abusive, or harmful activities.</li>
              <li>Report serious violations when appropriate.</li>
              <li>Follow these Community Guidelines and our Terms of Service.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">We believe meaningful relationships grow through honesty, trust, respect, and understanding.</p>
            <p className="mt-3 text-muted-foreground">Every member plays an important role in making Buscando Amor Eterno a welcoming environment.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Updates to These Guidelines</h2>
            <p className="mt-3 text-muted-foreground">Buscando Amor Eterno may update these Community Guidelines periodically to reflect changes in our services, safety practices, legal requirements, or community needs.</p>
            <p className="mt-3 text-muted-foreground">When significant changes occur, we may notify members through the platform or other appropriate communication channels.</p>
            <p className="mt-3 text-muted-foreground">Continued use of the platform after updated guidelines take effect constitutes acceptance where permitted by applicable law.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Building Meaningful Connections Together</h2>
            <p className="mt-3 text-muted-foreground"><strong>At Buscando Amor Eterno, we believe love begins with respect, grows through honesty, and becomes meaningful through genuine connection.</strong></p>
            <p className="mt-3 text-muted-foreground">Our goal is to create a community where individuals can confidently meet new people, build trust, and explore the possibility of lasting relationships.</p>
            <p className="mt-3 text-muted-foreground">Thank you for being part of Buscando Amor Eterno and helping us create a safe, respectful, and welcoming space for everyone.</p>
            <p className="mt-3 text-muted-foreground"><strong>Buscando Amor Eterno — Where Meaningful Connections Begin.</strong></p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
