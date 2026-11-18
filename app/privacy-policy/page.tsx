import type { Metadata } from 'next'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import styles from '../policy.module.css'

export const metadata: Metadata = {
  title: 'Consumer Health Data Privacy Policy | Buscando Amor Eterno',
  description: 'Learn how Buscando Amor Eterno may collect, use, disclose, and protect consumer health data under applicable privacy laws.',
  alternates: { canonical: '/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Navigation />
      <div className={styles.policyContainer}>
        <article className={styles.policyContent}>
          <h1>Consumer Health Data Privacy Policy</h1>
          <p><strong>Buscando Amor Eterno</strong></p>
          <p className={styles.lastUpdated}><strong>Effective Date:</strong> [Insert Effective Date]<br /><strong>Last Updated:</strong> [Insert Last Updated Date]</p>

          <section>
            <h2>1. Introduction</h2>
            <p>At <strong>Buscando Amor Eterno</strong>, we respect the privacy of our members and understand that certain personal information shared through an online dating platform may be particularly sensitive.</p>
            <p>This Consumer Health Data Privacy Policy explains how we collect, use, process, and disclose information that may qualify as consumer health data under applicable privacy laws.</p>
            <p>This policy supplements our main Privacy Policy and should be read together with it.</p>
            <p>This policy applies to individuals whose consumer health data is subject to applicable consumer health data privacy laws, including residents of Washington State and other jurisdictions where similar protections apply.</p>
            <p>We aim to handle sensitive information responsibly, transparently, and in accordance with applicable legal requirements.</p>
          </section>

          <section>
            <h2>2. Consumer Health Data We Collect and Use</h2>
            <p>Buscando Amor Eterno is a dating and relationship platform. We do not provide medical services, healthcare treatment, or medical diagnoses.</p>
            <p>However, depending on the information members choose to provide, certain profile details, preferences, communications, or other information may potentially qualify as consumer health data under applicable privacy laws.</p>
            <p>Depending on the platform&apos;s actual features and the information members voluntarily provide, potentially relevant categories may include:</p>
            <ul>
              <li>Information concerning sexual orientation or intimate personal preferences.</li>
              <li>Information relating to reproductive or sexual health voluntarily disclosed by members.</li>
              <li>Information concerning physical or mental health conditions voluntarily included in profile descriptions or communications.</li>
              <li>Health-related information that may be inferred from information provided by members, where such inferences are actually made.</li>
              <li>Other personal information that applicable law defines as consumer health data.</li>
            </ul>
            <p>We do not intend to collect medical records or diagnose, evaluate, or determine the health status of our members through our dating services.</p>
            <p>The actual categories of consumer health data collected will depend on the features available on the platform and the information members choose to provide.</p>
          </section>

          <section>
            <h2>3. Sources of Consumer Health Data</h2>
            <p><strong>Directly from members:</strong> Information voluntarily entered into dating profiles, personal descriptions, preferences, forms, or communications.</p>
            <p><strong>Member interactions:</strong> Information voluntarily disclosed during conversations or other interactions available through the platform.</p>
            <p><strong>Platform activity:</strong> Information generated through the use of website features, but only where such information qualifies as consumer health data under applicable law.</p>
            <p><strong>Authorized third-party services:</strong> Information received from external services or integrations, if the platform uses them and the relevant information is lawfully provided.</p>
            <p>We do not claim to obtain medical records or healthcare information from hospitals, healthcare providers, or insurance companies unless a specific lawful integration is established.</p>
          </section>

          <section>
            <h2>4. Purposes for Collecting and Using Consumer Health Data</h2>
            <p>Where consumer health data is collected, it may be used only for purposes that have been appropriately disclosed and are permitted under applicable law.</p>
            <p>Depending on the information and platform functionality, these purposes may include:</p>
            <ul>
              <li>Providing and maintaining dating platform services.</li>
              <li>Displaying information that members voluntarily choose to include in their profiles.</li>
              <li>Supporting communication and interactions between members.</li>
              <li>Allowing members to manage their personal profiles and preferences.</li>
              <li>Responding to support inquiries and privacy requests.</li>
              <li>Maintaining platform security and preventing misuse.</li>
              <li>Investigating reported violations, fraudulent activities, and suspicious behavior.</li>
              <li>Meeting applicable legal obligations.</li>
            </ul>
            <p>We do not use consumer health data to provide medical diagnoses, prescribe treatments, or make healthcare recommendations.</p>
            <p>We will not introduce additional categories of consumer health data collection or new purposes for processing such information without providing the required disclosures and obtaining any legally required consent or authorization.</p>
          </section>

          <section>
            <h2>5. How We Disclose Consumer Health Data</h2>
            <p>We do not disclose consumer health data indiscriminately.</p>
            <p>Depending on the platform&apos;s actual operations and applicable legal requirements, information may be disclosed to the following categories of recipients:</p>
            <h3>Other Members</h3>
            <p>Information that members voluntarily include in visible dating profiles or intentionally share with other members may be accessible to those individuals.</p>
            <p>Members should carefully consider the sensitive nature of information before choosing to make it visible to others.</p>
            <h3>Service Providers</h3>
            <p>We may use authorized service providers to support the operation and maintenance of our website.</p>
            <p>These may include:</p>
            <ul>
              <li>Website hosting and infrastructure providers.</li>
              <li>Technical maintenance and support providers.</li>
              <li>Customer service providers.</li>
              <li>Information security providers.</li>
              <li>Other vendors providing necessary operational services.</li>
            </ul>
            <p>Such providers may process information on our behalf only for authorized business purposes and subject to applicable contractual and legal requirements.</p>
            <h3>Payment and Transaction Providers</h3>
            <p>Where applicable, payment service providers may receive information necessary to process transactions and subscriptions.</p>
            <p>Consumer health data will not be provided to payment processors merely because a member makes a payment.</p>
            <h3>Legal Authorities and Regulatory Bodies</h3>
            <p>Information may be disclosed when required by applicable law or valid legal process, or when disclosure is otherwise legally permitted to protect individuals, investigate unlawful conduct, or establish, exercise, or defend legal claims.</p>
            <h3>Business Transactions</h3>
            <p>In connection with a merger, acquisition, restructuring, or other change in business ownership, relevant information may be disclosed where legally permitted and subject to applicable privacy protections.</p>
            <p>We do not claim to share consumer health data with advertising partners or for targeted advertising unless such processing actually occurs and is separately disclosed and authorized as required by law.</p>
          </section>

          <section>
            <h2>6. Sale of Consumer Health Data</h2>
            <p>Buscando Amor Eterno does not intend to sell consumer health data as part of its ordinary dating platform operations.</p>
            <p>We will not sell consumer health data without obtaining the specific consent or authorization required by applicable law.</p>
            <p>If our data practices change, we will update the relevant disclosures and obtain any required authorization before engaging in such activities.</p>
          </section>

          <section>
            <h2>7. Your Consumer Health Data Privacy Rights</h2>
            <p>Depending on your location and applicable privacy laws, you may have certain rights concerning your consumer health data.</p>
            <p>These rights may include:</p>
            <p><strong>Right to Know and Access:</strong> Request information about the consumer health data collected about you and obtain access to that information where required by law.</p>
            <p><strong>Right to Withdraw Consent:</strong> Withdraw consent previously provided for the collection or processing of consumer health data, subject to applicable legal requirements.</p>
            <p><strong>Right to Delete:</strong> Request deletion of consumer health data collected about you, subject to applicable legal exceptions.</p>
            <p><strong>Right to Information About Sharing:</strong> Request information about the categories of third parties and specific affiliates with whom your consumer health data has been shared, where required by law.</p>
            <p><strong>Right to Appeal:</strong> Where applicable, request a review of a decision denying your privacy request.</p>
            <p>We will handle privacy requests in accordance with the procedures, verification requirements, and response periods established by applicable law.</p>
          </section>

          <section>
            <h2>8. How to Submit a Consumer Health Data Request</h2>
            <p>If you would like to exercise your consumer health data privacy rights, you may contact us using the privacy contact information provided below.</p>
            <p>Please include:</p>
            <ul>
              <li>Your name or account identification information.</li>
              <li>The email address associated with your account.</li>
              <li>The type of privacy request you wish to submit.</li>
              <li>Any additional information reasonably necessary to help us process your request.</li>
            </ul>
            <p>We may take reasonable steps to verify your identity before responding to certain requests.</p>
            <p>Where required by applicable law, you may also designate an authorized agent to submit a request on your behalf.</p>
            <p>If your request is denied, we will provide information about any applicable appeal process and how you can pursue further review.</p>
          </section>

          <section>
            <h2>9. Data Security and Protection</h2>
            <p>We recognize that consumer health data may be particularly sensitive.</p>
            <p>We aim to maintain appropriate technical, organizational, and administrative safeguards to protect personal information against unauthorized access, disclosure, alteration, or destruction.</p>
            <p>Depending on the systems and security measures implemented by our platform, these safeguards may include access restrictions, secure communications, account protection procedures, and security monitoring.</p>
            <p>We also expect service providers that process sensitive information on our behalf to maintain appropriate privacy and security protections.</p>
            <p>No website or electronic storage system can guarantee absolute security. However, we are committed to addressing security risks responsibly and responding to incidents in accordance with applicable legal requirements.</p>
          </section>

          <section>
            <h2>10. Data Retention and Deletion</h2>
            <p>We retain consumer health data only for as long as reasonably necessary to fulfill the purposes for which it was collected, subject to applicable legal obligations.</p>
            <p>Retention may depend on:</p>
            <ul>
              <li>Whether a member maintains an active account.</li>
              <li>The purpose for which information was collected.</li>
              <li>Whether a member requests deletion.</li>
              <li>Applicable financial, legal, and regulatory requirements.</li>
              <li>The need to preserve information for legitimate security or legal purposes.</li>
            </ul>
            <p>When information is no longer necessary and no legal retention requirement applies, we will take appropriate steps to delete or de-identify it in accordance with applicable requirements.</p>
          </section>

          <section>
            <h2>11. Children&apos;s Privacy</h2>
            <p>Buscando Amor Eterno is intended exclusively for individuals aged 18 and older.</p>
            <p>Individuals under the age of 18 are not permitted to register for or use our dating services.</p>
            <p>We do not knowingly intend to collect consumer health data from minors.</p>
            <p>If we become aware that an underage individual has provided personal information through the platform, we will take appropriate steps to address the situation in accordance with applicable law.</p>
          </section>

          <section>
            <h2>12. Changes to This Policy</h2>
            <p>We may update this Consumer Health Data Privacy Policy from time to time to reflect changes in our website functionality, information-handling practices, or applicable privacy laws.</p>
            <p>Any updated version will be published on our website with a revised effective date or last updated date.</p>
            <p>Where legally required, we will provide additional notice and obtain appropriate consent before introducing new categories of consumer health data collection, additional processing purposes, or new disclosures.</p>
            <p>We encourage members to review this policy periodically.</p>
          </section>

          <section>
            <h2>13. Contact Us</h2>
            <p>If you have questions, concerns, or requests regarding this Consumer Health Data Privacy Policy, please contact us through the following channels:</p>
            <p><strong>Website:</strong> https://buscandoamoreterno.com</p>
            <p><strong>Platform:</strong> Buscando Amor Eterno</p>
            <p><strong>Privacy Contact Email:</strong> [Insert Privacy Contact Email]</p>
            <p><strong>General Support Email:</strong> [Insert Support Email]</p>
            <p><strong>Legal Business Name:</strong> [Insert Registered Business Name]</p>
            <p><strong>Business Address:</strong> [Insert Registered Business Address]</p>
            <p>We are committed to addressing privacy-related inquiries in accordance with applicable laws and our published policies.</p>
          </section>

          <p><strong>Buscando Amor Eterno</strong></p>
          <p>Your privacy deserves respect. Your information deserves protection. Your trust matters to us.</p>
        </article>
      </div>
      <Footer />
    </main>
  )
}
