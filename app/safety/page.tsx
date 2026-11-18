import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'

export const metadata: Metadata = {
  title: 'Safety & Community Policy | Buscando Amor Eterno',
  description: 'Read Buscando Amor Eterno’s safety and community policy, including reporting guidance, scam prevention, privacy, and emergency support resources.',
  alternates: { canonical: '/safety' },
}

const sectionClass = 'text-muted-foreground'
const listClass = 'mt-3 list-disc space-y-2 pl-5 text-muted-foreground'

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-28 md:pb-20 md:pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Safety Center</p>
        <h1 className="mt-3 font-playfair text-4xl font-bold md:text-5xl">Safety &amp; Community Policy</h1>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-primary">
          <Link href="/safety/community-guidelines" className="underline underline-offset-4">Community Guidelines</Link>
          <Link href="/safety/safety-tips" className="underline underline-offset-4">Safety Tips</Link>
        </div>

        <div className="mt-8 space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <section>
            <h2 className="text-2xl font-semibold">Our Commitment to Your Safety</h2>
            <p className={`mt-3 ${sectionClass}`}>At <strong>Buscando Amor Eterno</strong>, our mission is to help people build genuine connections in a welcoming, respectful, and trustworthy environment.</p>
            <p className={`mt-3 ${sectionClass}`}>We understand that online dating involves interacting with people you may not have met before. That&apos;s why safety, privacy, honesty, and mutual respect are important parts of our community.</p>
            <p className={`mt-3 ${sectionClass}`}>We encourage all members to make responsible choices, treat others with consideration, and report behavior that may put someone at risk.</p>
            <p className={`mt-3 ${sectionClass}`}>While no online platform can eliminate every potential risk, we are committed to maintaining clear community standards and taking appropriate action when violations are brought to our attention.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">1. Safety Measures and Community Monitoring</h2>
            <p className={`mt-3 ${sectionClass}`}>We believe a healthy dating community requires clear rules and responsible moderation.</p>
            <p className={`mt-3 ${sectionClass}`}>Buscando Amor Eterno aims to address inappropriate activity and behavior that may compromise the experience or safety of its members.</p>
            <p className={`mt-3 ${sectionClass}`}>Depending on the features and moderation systems available on our platform, safety measures may include:</p>
            <ul className={listClass}>
              <li>Reviewing reports submitted by members.</li>
              <li>Investigating profiles suspected of impersonation or fraudulent activity.</li>
              <li>Reviewing reported messages, photographs, and other content.</li>
              <li>Removing content that violates our community standards.</li>
              <li>Restricting or suspending accounts involved in serious or repeated violations.</li>
              <li>Cooperating with appropriate authorities when legally required or otherwise appropriate.</li>
            </ul>
            <p className={`mt-3 ${sectionClass}`}>We encourage members to report suspicious behavior rather than attempting to investigate or confront potentially dangerous individuals themselves.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Reporting Inappropriate Behavior</h2>
            <p className={`mt-3 ${sectionClass}`}>Every member deserves to communicate without experiencing harassment, intimidation, threats, or abuse.</p>
            <p className={`mt-3 ${sectionClass}`}>If another member behaves inappropriately, you are encouraged to report the incident through the reporting options available on our website or by <Link href="/contact" className="font-medium text-primary underline underline-offset-4">contacting our support team</Link>.</p>
            <p className={`mt-3 ${sectionClass}`}>Examples of reportable behavior include:</p>
            <ul className={listClass}>
              <li>Fake or misleading profiles.</li>
              <li>Harassment, bullying, or intimidation.</li>
              <li>Threatening or abusive messages.</li>
              <li>Unwanted sexual content or inappropriate requests.</li>
              <li>Financial scams or suspicious payment requests.</li>
              <li>Impersonation of another individual.</li>
              <li>Attempts to exploit or manipulate other members.</li>
              <li>Sharing someone&apos;s private information without permission.</li>
            </ul>
            <p className={`mt-3 ${sectionClass}`}>When submitting a report, provide as much relevant information as possible, including the account details and any supporting messages or screenshots.</p>
            <p className={`mt-3 ${sectionClass}`}>Our team may review the information and determine appropriate action based on the circumstances, available evidence, and applicable policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. How We Handle Reports of Abuse or Assault</h2>
            <p className={`mt-3 ${sectionClass}`}>Reports involving sexual assault, physical violence, exploitation, or other serious misconduct are treated with particular concern.</p>
            <p className={`mt-3 ${sectionClass}`}>If you believe you have experienced a crime or are in immediate danger, contact local emergency services or law enforcement. Do not rely solely on a website report to obtain emergency assistance.</p>
            <p className={`mt-3 ${sectionClass}`}>When a serious incident is reported to us, we may:</p>
            <ul className={listClass}>
              <li>Review the information and evidence provided.</li>
              <li>Take appropriate steps concerning the reported account.</li>
              <li>Restrict or suspend access where a violation is established or an interim safety measure is warranted.</li>
              <li>Preserve relevant information where appropriate and legally permitted.</li>
              <li>Cooperate with lawful requests from relevant authorities.</li>
            </ul>
            <p className={`mt-3 ${sectionClass}`}>We encourage anyone affected by abuse or assault to seek professional support and report criminal conduct to the appropriate authorities.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Fraud Prevention and Financial Scams</h2>
            <p className={`mt-3 ${sectionClass}`}>Protecting members from fraudulent activity is an important part of maintaining a trustworthy dating environment.</p>
            <p className={`mt-3 ${sectionClass}`}>Some individuals use online relationships to gain someone&apos;s confidence before requesting money, financial assistance, or sensitive information.</p>
            <p className={`mt-3 ${sectionClass}`}>Be cautious of anyone who:</p>
            <ul className={listClass}>
              <li>Requests money for emergencies, medical expenses, or travel.</li>
              <li>Asks for gift cards, cryptocurrency, or bank transfers.</li>
              <li>Promotes suspicious investment opportunities.</li>
              <li>Requests banking details, passwords, or payment credentials.</li>
              <li>Attempts to create emotional pressure to obtain financial assistance.</li>
              <li>Makes promises of financial returns or business opportunities that seem unrealistic.</li>
            </ul>
            <p className={`mt-3 ${sectionClass}`}><strong>Our recommendation is simple: Never send money to someone you have only met online, regardless of how long you have been communicating.</strong></p>
            <p className={`mt-3 ${sectionClass}`}>If you encounter a suspected scam, discontinue communication, preserve relevant evidence, and report the account to us.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Privacy and Data Protection</h2>
            <p className={`mt-3 ${sectionClass}`}>Your personal information deserves careful protection.</p>
            <p className={`mt-3 ${sectionClass}`}>At Buscando Amor Eterno, we recognize the importance of handling member information responsibly and maintaining appropriate safeguards for personal data.</p>
            <p className={`mt-3 ${sectionClass}`}>Our approach to privacy includes:</p>
            <ul className={listClass}>
              <li>Explaining how personal information is collected and used through our <Link href="/privacy-policy" className="font-medium text-primary underline underline-offset-4">Privacy Policy</Link>.</li>
              <li>Limiting access to personal information to authorized individuals where appropriate.</li>
              <li>Applying reasonable technical and organizational security measures.</li>
              <li>Handling personal information in accordance with applicable privacy requirements.</li>
              <li>Providing information about available privacy rights and account-related data requests.</li>
            </ul>
            <p className={`mt-3 ${sectionClass}`}>Members should also take responsibility for protecting their own information by using strong passwords, avoiding suspicious links, and being careful about what they share with other users.</p>
            <p className={`mt-3 ${sectionClass}`}>For further information, please review our <Link href="/privacy-policy" className="font-medium text-primary underline underline-offset-4">Privacy Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Inclusion and Equal Treatment</h2>
            <p className={`mt-3 ${sectionClass}`}>We believe everyone deserves to be treated with dignity and respect.</p>
            <p className={`mt-3 ${sectionClass}`}>Buscando Amor Eterno welcomes individuals from different backgrounds and encourages a community where people can interact without discrimination, hostility, or intimidation.</p>
            <p className={`mt-3 ${sectionClass}`}>We expect members to:</p>
            <ul className={listClass}>
              <li>Treat others with courtesy and consideration.</li>
              <li>Respect individual differences and personal identities.</li>
              <li>Avoid discriminatory language and behavior.</li>
              <li>Respect other members&apos; boundaries and preferences.</li>
              <li>Communicate honestly and responsibly.</li>
            </ul>
            <p className={`mt-3 ${sectionClass}`}>Discrimination, hateful conduct, and targeted harassment have no place in our community.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Harassment and Abuse</h2>
            <p className={`mt-3 ${sectionClass}`}>Harassment can take many forms, including unwanted messages, intimidation, threats, repeated unwanted contact, and inappropriate sexual behavior.</p>
            <p className={`mt-3 ${sectionClass}`}>We expect all members to respect one another&apos;s personal boundaries.</p>
            <p className={`mt-3 ${sectionClass}`}>The following conduct is not acceptable:</p>
            <ul className={listClass}>
              <li>Sending threatening or abusive messages.</li>
              <li>Repeatedly contacting someone who has asked you to stop.</li>
              <li>Pressuring someone into unwanted conversations or activities.</li>
              <li>Making unwanted sexual requests.</li>
              <li>Using personal information to intimidate or embarrass another member.</li>
              <li>Sharing private conversations or photographs without appropriate permission.</li>
              <li>Attempting to control, threaten, or manipulate another member.</li>
            </ul>
            <p className={`mt-3 ${sectionClass}`}>Members who engage in such behavior may face account restrictions, suspension, or removal in accordance with our policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Age Restrictions and Protection of Minors</h2>
            <p className={`mt-3 ${sectionClass}`}>Buscando Amor Eterno is intended exclusively for adults aged 18 and older.</p>
            <p className={`mt-3 ${sectionClass}`}>Individuals under the age of 18 are not permitted to create accounts, use our dating services, or participate in member interactions.</p>
            <p className={`mt-3 ${sectionClass}`}>We reserve the right to review accounts where there is reason to believe that a member does not meet our minimum age requirement.</p>
            <p className={`mt-3 ${sectionClass}`}>If you encounter a profile that appears to belong to someone under 18, please report it immediately through our available reporting channels.</p>
            <p className={`mt-3 ${sectionClass}`}>Protecting minors from inappropriate interactions and exploitation is a serious responsibility.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">9. Prohibited Activities</h2>
            <p className={`mt-3 ${sectionClass}`}>To maintain a safe and respectful environment, members must not use Buscando Amor Eterno for illegal, deceptive, exploitative, or abusive purposes.</p>
            <p className={`mt-3 ${sectionClass}`}><strong>Fraud and impersonation:</strong> Creating fake identities, pretending to be another person, or misleading members for financial or personal gain.</p>
            <p className={`mt-3 ${sectionClass}`}><strong>Harassment and threats:</strong> Engaging in intimidation, stalking, bullying, threats, or repeated unwanted contact.</p>
            <p className={`mt-3 ${sectionClass}`}><strong>Sexual exploitation:</strong> Using the platform to exploit, coerce, threaten, or abuse another individual.</p>
            <p className={`mt-3 ${sectionClass}`}><strong>Commercial solicitation:</strong> Using dating profiles or conversations for unauthorized advertising, spam, deceptive promotions, or prohibited commercial services.</p>
            <p className={`mt-3 ${sectionClass}`}><strong>Illegal activities:</strong> Promoting, arranging, or facilitating illegal transactions or activities.</p>
            <p className={`mt-3 ${sectionClass}`}><strong>Harmful content:</strong> Sharing content that threatens, exploits, targets, or violates the rights and safety of others.</p>
            <p className={`mt-3 ${sectionClass}`}><strong>Privacy violations:</strong> Publishing or distributing another member&apos;s personal information or private content without authorization.</p>
            <p className={`mt-3 ${sectionClass}`}>Violations may result in content removal, account restrictions, suspension, or permanent termination, depending on the seriousness and circumstances of the conduct.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">10. Safety Resources and Emergency Assistance</h2>
            <p className={`mt-3 ${sectionClass}`}>Your safety and well-being should always come first.</p>
            <p className={`mt-3 ${sectionClass}`}>If you are experiencing abuse, harassment, threats, or exploitation, consider reaching out to trusted individuals and appropriate professional organizations.</p>
            <p className={`mt-3 ${sectionClass}`}>For members in the United States, the following organizations may provide support:</p>
            <ul className={listClass}>
              <li><strong>Immediate emergencies:</strong> Call <a href="tel:911" className="font-medium text-primary underline underline-offset-4">911</a>.</li>
              <li><strong>RAINN – Sexual Assault Support:</strong> <a href="tel:18006564673" className="font-medium text-primary underline underline-offset-4">1-800-656-4673</a>. Website: <a href="https://www.rainn.org/" target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-4">rainn.org</a>.</li>
              <li><strong>National Domestic Violence Hotline:</strong> <a href="tel:18007997233" className="font-medium text-primary underline underline-offset-4">1-800-799-7233</a>. Website: <a href="https://www.thehotline.org/" target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-4">thehotline.org</a>.</li>
              <li><strong>National Human Trafficking Hotline:</strong> <a href="tel:18883737888" className="font-medium text-primary underline underline-offset-4">1-888-373-7888</a>. Website: <a href="https://humantraffickinghotline.org/" target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-4">humantraffickinghotline.org</a>.</li>
              <li><strong>FBI Internet Crime Complaint Center:</strong> <a href="https://www.ic3.gov/" target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-4">ic3.gov</a>.</li>
              <li><strong>Cyber Civil Rights Initiative:</strong> <a href="tel:18448782274" className="font-medium text-primary underline underline-offset-4">1-844-878-2274</a>. Website: <a href="https://cybercivilrights.org/" target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-4">cybercivilrights.org</a>.</li>
            </ul>
            <p className={`mt-3 ${sectionClass}`}>If you live outside the United States, contact the appropriate emergency services or support organizations in your country.</p>
            <p className={`mt-3 ${sectionClass}`}>These resources are independent organizations and are not operated by or affiliated with Buscando Amor Eterno.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">11. Our Responsibility to the Community</h2>
            <p className={`mt-3 ${sectionClass}`}>Building a respectful dating environment requires cooperation between the platform and its members.</p>
            <p className={`mt-3 ${sectionClass}`}>We encourage everyone to follow our community standards, make responsible decisions, and speak up when they encounter behavior that may put others at risk.</p>
            <p className={`mt-3 ${sectionClass}`}>Buscando Amor Eterno reserves the right to review reported violations and take appropriate action in accordance with its Terms of Service, applicable policies, and legal obligations.</p>
            <p className={`mt-3 ${sectionClass}`}>We may update these safety standards as our platform develops and as we identify new ways to improve the experience of our members.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Our Commitment</h2>
            <p className={`mt-3 ${sectionClass}`}>At Buscando Amor Eterno, we believe meaningful relationships should be built on honesty, trust, respect, and mutual understanding.</p>
            <p className={`mt-3 ${sectionClass}`}>We want every member to feel encouraged to make genuine connections while remaining informed about their personal safety and responsibilities.</p>
            <p className={`mt-5 ${sectionClass}`}><strong>Connect with honesty. Treat others with respect. Put safety first.</strong></p>
            <p className={`mt-3 ${sectionClass}`}>For questions or concerns regarding these policies, please <Link href="/contact" className="font-medium text-primary underline underline-offset-4">contact our support team</Link> through the available contact channels on our website.</p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
