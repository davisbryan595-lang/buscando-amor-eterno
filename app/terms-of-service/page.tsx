import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import styles from '../policy.module.css'

export const metadata: Metadata = {
  title: 'Terms of Use | Buscando Amor Eterno',
  description: 'Read the terms that govern access to and use of Buscando Amor Eterno’s dating platform and services.',
  alternates: { canonical: '/terms-of-service' },
}

export default function TermsOfServicePage() {
  return (
    <main>
      <Navigation />
      <div className={styles.policyContainer}>
        <article className={styles.policyContent}>
          <h1>TERMS OF USE</h1>
          <h2>Buscando Amor Eterno</h2>
          <p className={styles.lastUpdated}><strong>Effective Date:</strong> [Insert Effective Date]<br /><strong>Last Updated:</strong> [Insert Last Updated Date]</p>

          <p>Welcome to <strong>Buscando Amor Eterno</strong>.</p>
          <p>These Terms of Use (&quot;Terms&quot;) govern your access to and use of https://buscandoamoreterno.com, including its website, features, services, and any associated functionality.</p>
          <p>Buscando Amor Eterno is an online dating platform designed to help adults discover meaningful connections, communicate with other members, and explore potential relationships.</p>
          <p>By accessing, registering for, or using our platform, you acknowledge that you have read, understood, and agree to these Terms, together with our <Link href="/privacy-policy">Privacy Policy</Link>, <Link href="/safety">Safety &amp; Community Policy</Link>, <Link href="/safety/safety-tips">Dating Safety Tips</Link>, and any additional terms applicable to specific services or purchases.</p>
          <p>If you do not agree with these Terms, you must discontinue using the platform.</p>
          <p>The operator’s full legal name and contact details are listed in Section 18 and must be completed before these Terms are finalized.</p>

          <section>
            <h2>1. About These Terms</h2>
            <p>These Terms establish the agreement between you and the legal entity operating Buscando Amor Eterno.</p>
            <p>Throughout this document:</p>
            <ul>
              <li>&quot;Buscando Amor Eterno,&quot; &quot;we,&quot; &quot;us,&quot; and &quot;our&quot; refer to the company or legal entity operating the website.</li>
              <li>&quot;You,&quot; &quot;your,&quot; and &quot;member&quot; refer to any individual accessing or using our platform.</li>
              <li>&quot;Platform&quot; refers to our website and associated services.</li>
              <li>&quot;Services&quot; refers to the dating features, communication tools, membership options, and other functionality made available through our platform.</li>
              <li>&quot;User Content&quot; refers to photographs, profile information, messages, descriptions, and other material submitted by members.</li>
            </ul>
            <p>These Terms apply to all visitors, registered members, and individuals who purchase or use our services.</p>
          </section>

          <section>
            <h2>2. Eligibility and Account Requirements</h2>
            <p>Buscando Amor Eterno is intended exclusively for adults aged 18 and older.</p>
            <p>By registering or using our services, you represent and confirm that:</p>
            <ol>
              <li>You are at least 18 years old.</li>
              <li>You have the legal capacity to enter into a binding agreement.</li>
              <li>The information you provide is accurate and not intentionally misleading.</li>
              <li>You will use the platform for lawful and permitted purposes.</li>
              <li>You will comply with these Terms and applicable laws.</li>
              <li>You are not prohibited from using the platform under applicable legal restrictions.</li>
              <li>You have not been permanently banned from our platform unless we have expressly authorized your return.</li>
            </ol>
            <p>We reserve the right to request reasonable information to verify account eligibility when permitted by law.</p>
            <p>Accounts that appear to belong to individuals under 18 may be restricted or removed.</p>
          </section>

          <section>
            <h2>3. Account Registration and Security</h2>
            <p>Certain features of Buscando Amor Eterno may require you to create a personal account.</p>
            <p>When registering, you agree to:</p>
            <ul>
              <li>Provide accurate and current registration information.</li>
              <li>Maintain the accuracy of your account details.</li>
              <li>Keep your login credentials confidential.</li>
              <li>Take reasonable steps to prevent unauthorized account access.</li>
              <li>Notify us if you suspect your account has been compromised.</li>
              <li>Avoid allowing another person to access or operate your account without authorization.</li>
            </ul>
            <p>Each account should represent an individual member.</p>
            <p>You are responsible for activities conducted through your account to the extent permitted by applicable law.</p>
            <p>We are not responsible for losses resulting from your failure to take reasonable steps to protect your login credentials, except where liability cannot lawfully be excluded.</p>
            <p>We reserve the right to restrict access or request additional verification where necessary to protect the platform and its members.</p>
          </section>

          <section>
            <h2>4. Your Responsibilities as a Member</h2>
            <p>By using Buscando Amor Eterno, you agree to behave honestly, respectfully, and responsibly.</p>
            <p>You agree to:</p>
            <ol>
              <li>Treat other members with dignity and respect.</li>
              <li>Provide truthful information about yourself.</li>
              <li>Respect personal boundaries and individual preferences.</li>
              <li>Avoid harassment, threats, intimidation, or abusive communication.</li>
              <li>Respect other members&apos; privacy.</li>
              <li>Avoid sharing another person&apos;s photographs or personal information without appropriate authorization.</li>
              <li>Refrain from using the platform for fraudulent or deceptive purposes.</li>
              <li>Follow our <Link href="/safety/safety-tips">Dating Safety Tips</Link> and <Link href="/safety">Community Policies</Link>.</li>
              <li>Respect intellectual property and other legal rights.</li>
              <li>Report suspicious activity or serious violations through available reporting channels.</li>
            </ol>
            <p>You are responsible for your interactions with other members, both through the platform and when meeting individuals offline.</p>
          </section>

          <section>
            <h2>5. Prohibited Activities</h2>
            <p>To maintain a respectful and trustworthy dating environment, certain activities are not permitted.</p>
            <p>You must not use Buscando Amor Eterno to:</p>

            <h3>A. Misrepresentation and Impersonation</h3>
            <ul>
              <li>Create fake accounts or misleading identities.</li>
              <li>Pretend to be another individual.</li>
              <li>Misrepresent your age, identity, relationship status, or other material personal details.</li>
              <li>Use photographs that intentionally misrepresent who you are.</li>
              <li>Create accounts on behalf of someone else without authorization.</li>
            </ul>

            <h3>B. Harassment and Abuse</h3>
            <ul>
              <li>Threaten, intimidate, stalk, or harass another person.</li>
              <li>Engage in bullying, discrimination, or targeted abuse.</li>
              <li>Repeatedly contact someone who has asked you to stop.</li>
              <li>Pressure individuals into unwanted conversations or activities.</li>
              <li>Share private information to embarrass, threaten, or intimidate someone.</li>
            </ul>

            <h3>C. Fraud and Financial Exploitation</h3>
            <ul>
              <li>Request money from members through deceptive or manipulative conduct.</li>
              <li>Promote investment scams or fraudulent financial opportunities.</li>
              <li>Use the platform for phishing, identity theft, or financial fraud.</li>
              <li>Request passwords, banking credentials, or sensitive payment information.</li>
              <li>Misuse the platform to operate pyramid schemes or other deceptive arrangements.</li>
            </ul>

            <h3>D. Sexual Exploitation and Inappropriate Conduct</h3>
            <ul>
              <li>Engage in sexual exploitation, coercion, or non-consensual conduct.</li>
              <li>Pressure or threaten another person to obtain intimate images or sexual activity.</li>
              <li>Share intimate images or sexually explicit content involving another person without their consent.</li>
              <li>Use the platform to solicit sexual services or exploit another person.</li>
              <li>Post content involving minors or attempt to use the platform to contact minors for sexual purposes.</li>
            </ul>

            <h3>E. Unauthorized or Harmful Use</h3>
            <ul>
              <li>Use the platform to send spam, unauthorized advertising, or repetitive unsolicited messages.</li>
              <li>Use bots or other unauthorized automated methods to access or interact with the Services.</li>
              <li>Attempt to access another member&apos;s account or interfere with the security or operation of the platform.</li>
              <li>Upload malicious code, harmful links, or content that violates another person&apos;s rights.</li>
              <li>Use the Services in violation of applicable law or these Terms.</li>
            </ul>
          </section>

          <section>
            <h2>6. User Content and License</h2>
            <p>You retain any ownership rights you have in User Content you submit. You are responsible for ensuring that you have the rights and permissions needed to submit it and that it does not violate law or another person&apos;s rights.</p>
            <p>When you submit User Content, you grant Buscando Amor Eterno a non-exclusive, worldwide, royalty-free license to host, store, reproduce, adapt as technically necessary, display, and distribute that content solely as needed to operate, provide, secure, and improve the Services and show the content to the audiences or recipients you select.</p>
            <p>This license continues only for as long as reasonably necessary for those purposes, including handling backups, legal obligations, safety investigations, and content already delivered to other members. This license does not grant us permission to use your profile content in unrelated advertising. Separate consent will be requested where required by law.</p>
            <p>You represent that you have the necessary rights and permissions for your User Content and for any identifiable person appearing in it. Do not upload content that is unlawful, infringing, deceptive, or shared without appropriate permission.</p>
            <p>We may remove, restrict, or disable access to User Content where reasonably necessary to enforce these Terms, respond to a report, protect members, comply with law, or maintain the Services. We do not guarantee that all content will be reviewed before it is visible.</p>
          </section>

          <section>
            <h2>7. Community Safety, Reports, and Moderation</h2>
            <p>Members must follow our <Link href="/safety/community-guidelines">Community Guidelines</Link> and <Link href="/safety">Safety &amp; Community Policy</Link>. Use in-service reporting tools where available, or <Link href="/contact">contact support</Link> to report a safety concern.</p>
            <p>We may review reports and relevant account or content information, remove content, restrict features, request verification, suspend an account, or terminate access when we reasonably believe it is necessary to enforce these Terms, protect members, or comply with law.</p>
            <p>We may take urgent or interim action while assessing a serious safety concern. We do not promise to investigate every report, identify every violation, or conduct background checks on members. We may cooperate with law enforcement where legally required or permitted.</p>
            <p>Online profiles and communications do not guarantee another member&apos;s identity, intentions, or conduct. Use the Services carefully and review our <Link href="/safety/safety-tips">Dating Safety Tips</Link>. If you are in immediate danger, contact local emergency services rather than relying on a website report.</p>
          </section>

          <section>
            <h2>8. Privacy and Personal Information</h2>
            <p>Our <Link href="/privacy-policy">Privacy Policy</Link> describes how personal information is handled. It should be read together with these Terms and any feature-specific notice or consent request shown to you.</p>
            <p>Do not share information through the Services that you do not want the recipient to receive or save. Messages and content sent to another member may be retained in that member&apos;s account or copied outside the platform. The Services should not be treated as a confidential or end-to-end encrypted communication channel unless a feature expressly states otherwise.</p>
          </section>

          <section>
            <h2>9. Communications, Calls, and Third-Party Services</h2>
            <p>The Services may provide messaging, lounge, audio, or video features. These features may rely on third-party providers, and related information may be processed as described in the Privacy Policy. Call recording or monitoring practices, if introduced, will be disclosed as required by law before use.</p>
            <p>The Services may link to or interoperate with third-party services. Those services are governed by their own terms and privacy practices. We are not responsible for third-party services except to the extent liability cannot be excluded under applicable law.</p>
          </section>

          <section>
            <h2>10. Availability, Changes, and Purchases</h2>
            <p>Core platform features are currently offered at no cost. Features, availability, and eligibility may change. If a paid feature or subscription is offered, the price, billing interval, renewal, cancellation, and refund terms will be presented before you complete the purchase and will apply in addition to these Terms.</p>
            <p>We may update, suspend, or discontinue a feature for operational, safety, legal, or business reasons. Where required by law, we will provide notice or other protections for material changes.</p>
          </section>

          <section>
            <h2>11. Intellectual Property</h2>
            <p>The Services, including their software, branding, design, and materials other than User Content, are owned by or licensed to Buscando Amor Eterno and are protected by intellectual property laws. These Terms give you a limited, personal, non-exclusive, non-transferable, revocable right to use the Services for their intended purpose while you comply with these Terms.</p>
            <p>You may not copy, modify, distribute, sell, reverse engineer, or create derivative works from the Services except where applicable law permits or we authorize it in writing. No ownership is transferred to you.</p>
          </section>

          <section>
            <h2>12. Account Suspension, Termination, and Deletion</h2>
            <p>You may stop using the Services at any time and request account deletion through our <Link href="/delete-account">account deletion page</Link>.</p>
            <p>We may restrict, suspend, or terminate your access where we reasonably believe you have violated these Terms, created a safety or legal risk, or where necessary to protect the Services, members, or our rights. Where appropriate and legally permitted, we may provide notice and an opportunity to address the issue. Serious or urgent situations may require immediate action.</p>
            <p>When an account is closed or terminated, access to the Services ends. Handling of account information, User Content, and information retained for legal, safety, dispute, or backup purposes is described in the Privacy Policy and account deletion information.</p>
            <p>Provisions that by their nature should continue after termination—including provisions about intellectual property, disclaimers, liability, disputes, and accrued obligations—will continue to the extent permitted by law.</p>
          </section>

          <section>
            <h2>13. Disclaimers</h2>
            <p>The Services are provided on an “as available” basis. To the extent permitted by law, we do not warrant uninterrupted availability, error-free operation, or that the Services will result in a relationship or match.</p>
            <p>We do not control and are not responsible for members&apos; identity, statements, conduct, or offline interactions. We do not guarantee that profiles or information provided by members are accurate or verified. You are responsible for using appropriate care when communicating or meeting another member.</p>
            <p>Nothing in these Terms excludes a warranty, guarantee, or right that cannot lawfully be excluded in your jurisdiction.</p>
          </section>

          <section>
            <h2>14. Limitation of Liability</h2>
            <p>To the extent permitted by applicable law, Buscando Amor Eterno will not be liable for indirect, incidental, special, consequential, exemplary, or punitive loss, or for loss of profits, data, goodwill, or opportunity arising from or related to use of the Services.</p>
            <p>To the extent permitted by law, our total liability for claims arising from the Services will be limited to the amount you paid to us for the Services during the 12 months before the event giving rise to the claim, or [INSERT A REASONABLE FIXED AMOUNT OR OTHER LOCALLY VALID LIMIT] if you paid nothing. This limitation does not apply where prohibited by law and does not limit liability that cannot legally be limited, including any applicable liability for fraud, willful misconduct, or personal injury caused by negligence.</p>
            <p>The limitations in this section apply only to the extent lawful in your jurisdiction. Some jurisdictions do not permit certain exclusions or limits, so parts of this section may not apply to you.</p>
          </section>

          <section>
            <h2>15. Indemnification</h2>
            <p>To the extent permitted by law, you are responsible for losses and claims arising from your unlawful use of the Services, your User Content, or your material violation of these Terms. We will provide notice of a claim where legally required and will not settle a claim in a way that imposes a non-monetary obligation on you without your consent. This section does not apply where prohibited by applicable law.</p>
          </section>

          <section>
            <h2>16. Disputes and Governing Law</h2>
            <p>Before starting a formal proceeding, you and we are encouraged to contact one another and attempt in good faith to resolve a dispute, except where urgent relief or another legal remedy is needed.</p>
            <p>These Terms and any dispute relating to them are governed by the laws of [INSERT GOVERNING JURISDICTION], without regard to conflict-of-law rules, subject to any mandatory consumer protections that apply where you live. Courts located in [INSERT VENUE, IF LEGALLY APPROPRIATE] will have jurisdiction to the extent permitted by law.</p>
            <p>No binding arbitration requirement, class-action waiver, or limitation on statutory rights is created by this section. Any such term must be separately reviewed and clearly presented where legally permitted.</p>
          </section>

          <section>
            <h2>17. Changes to These Terms</h2>
            <p>We may update these Terms to reflect changes to the Services, our practices, or applicable law. We will post the revised Terms with an updated date and provide additional notice for material changes where required by law. Changes take effect on the stated effective date. If you do not agree to a change, stop using the Services and, if applicable, close your account.</p>
          </section>

          <section>
            <h2>18. General Provisions and Contact</h2>
            <p>If a provision of these Terms is found unenforceable, the remaining provisions will remain in effect to the extent permitted by law. A failure to enforce a provision is not a waiver. You may not transfer your rights under these Terms without our consent; we may transfer them as part of a lawful business reorganization or transfer, subject to applicable law.</p>
            <p>These Terms, together with the policies and additional terms referenced here, form the agreement concerning your use of the Services, subject to mandatory rights under applicable law.</p>
            <p>Questions about these Terms may be sent to:</p>
            <ul>
              <li><strong>Legal business name:</strong> [Insert Registered Business Name]</li>
              <li><strong>Platform:</strong> Buscando Amor Eterno</li>
              <li><strong>Website:</strong> https://buscandoamoreterno.com</li>
              <li><strong>Email:</strong> support@buscandoamoreterno.com</li>
              <li><strong>Registered business address:</strong> [Insert Registered Business Address]</li>
            </ul>
            <p>Complete the bracketed effective date, last updated date, legal business name, registered address, governing jurisdiction, venue, and liability limit after qualified legal review.</p>
          </section>
        </article>
      </div>
      <Footer />
    </main>
  )
}
