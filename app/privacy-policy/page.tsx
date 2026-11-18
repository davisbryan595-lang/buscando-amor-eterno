import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import styles from '../policy.module.css'

export const metadata: Metadata = {
  title: 'Privacy Policy | Buscando Amor Eterno',
  description: 'Learn how Buscando Amor Eterno collects, uses, shares, and protects personal information across its dating website and services.',
  alternates: { canonical: '/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Navigation />
      <div className={styles.policyContainer}>
        <article className={styles.policyContent}>
          <h1>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Effective date: [INSERT EFFECTIVE DATE] · Last updated: [INSERT LAST UPDATED DATE]</p>
          <p>
            This draft contains bracketed business details and practices that must be confirmed before publication. It describes the website features and integrations identified during a review of the current site; the operator should verify that it matches production behavior.
          </p>

          <section>
            <h2>1. Introduction and Scope</h2>
            <p>
              Buscando Amor Eterno (“we,” “us,” or “our”) provides an online dating and relationship platform intended to help adults discover connections and communicate with other members. This Privacy Policy explains how personal information may be collected, used, stored, disclosed, and otherwise processed when you visit https://buscandoamoreterno.com, create or use an account, interact with profiles or content, contact support, or use related website services.
            </p>
            <p>
              This policy applies to visitors, registered members, people who contact us, and individuals whose information is included in a report or other communication. The website shares accounts and community features with its mobile service; information associated with an account may therefore be used across supported web and mobile experiences.
            </p>
            <p>
              Using the service involves processing some information about you. The information involved depends on the features you choose, what you provide, your device and settings, and applicable law. This policy is not a substitute for any separate notice shown when a particular feature collects information.
            </p>
            <p>
              Please review this policy with our <Link href="/terms-of-service">Terms of Service</Link> and <Link href="/community-guidelines">Community Guidelines</Link>. Where local law requires consent for a particular use, we will request that consent through the applicable feature or control; simply visiting the website is not a substitute for consent where consent is legally required.
            </p>
          </section>

          <section>
            <h2>2. Who We Are</h2>
            <p>
              The operator responsible for this service and for deciding why and how personal information is processed is: <strong>[INSERT FULL LEGAL BUSINESS NAME]</strong>, doing business as Buscando Amor Eterno, with its registered address at <strong>[INSERT REGISTERED BUSINESS ADDRESS]</strong>.
            </p>
            <p>
              Website: <a href="https://buscandoamoreterno.com">https://buscandoamoreterno.com</a>. Privacy contact: <strong>[INSERT PRIVACY CONTACT EMAIL OR PRIVACY REQUEST FORM]</strong>. General support: <a href="mailto:support@buscandoamoreterno.com">support@buscandoamoreterno.com</a> or our <Link href="/contact">contact page</Link>.
            </p>
            <p>
              If a Data Protection Officer or other formal privacy representative is required for the operator, their contact details are: <strong>[INSERT NAME AND CONTACT DETAILS, OR CONFIRM NOT APPLICABLE]</strong>. The legal entity, controller identity, establishment, and applicable representative details must be confirmed before this policy is finalized.
            </p>
          </section>

          <section>
            <h2>3. Information We Collect</h2>
            <h3>3.1 Account information</h3>
            <p>
              When you register or sign in, the service processes account identifiers such as your email address, authentication details, account ID, and registration or sign-in information. Depending on your sign-in method, an identity provider may return information such as your name, email address, or profile image. We do not receive your Google or Apple password when you use their sign-in services.
            </p>

            <h3>3.2 Dating profile and preference information</h3>
            <p>
              Information you enter in a profile or onboarding flow may include your name or display name, date of birth, gender, dating preferences, biography, interests, photographs, city or country, and location coordinates if you choose a location feature. Depending on the fields offered and completed, it may also include relationship preferences, lifestyle details, values, and other information you choose to provide. Profile details are used to display your profile and support browsing or compatibility features.
            </p>

            <h3>3.3 Sensitive or special-category information</h3>
            <p>
              Dating preferences, gender, sexual orientation, intimate details, photographs, or information you include in messages may reveal sensitive information under some privacy laws. The platform may process information of this nature when you choose to provide it or when it is apparent from content you share. Do not provide sensitive details you do not want processed or shown to other members.
            </p>
            <p>
              We will only request or process sensitive or special-category information where the feature and applicable law permit it. If a law requires explicit consent or another specific condition, the operator must implement and document that condition before collecting or using the information. <strong>[CONFIRM WHICH PROFILE FIELDS ARE ENABLED AND HOW ANY REQUIRED CONSENT IS OBTAINED.]</strong>
            </p>

            <h3>3.4 Messages, content, reports, and support</h3>
            <p>
              If you use communication features, the service processes messages and lounge chat content, related participant and timestamp information, and any photographs or other material you upload. We also process the information you include in support requests, complaints, feedback, surveys, and user reports, including the reported account and the description or evidence supplied.
            </p>

            <h3>3.5 Payment and transaction information</h3>
            <p>
              The site currently presents its core features as free, and a review did not confirm an active payment checkout. If paid subscriptions or purchases are introduced or available to you, a payment provider may process card or bank details directly. We may receive limited transaction details such as a payment or subscription status, amount, currency, transaction identifier, and billing contact information. We do not claim that a particular provider processes current payments until the live payment configuration is confirmed. <strong>[CONFIRM WHETHER PAYMENTS ARE ENABLED AND IDENTIFY EACH LIVE PAYMENT PROVIDER.]</strong>
            </p>

            <h3>3.6 Device, technical, and usage information</h3>
            <p>
              When you access the website, the hosting, security, authentication, analytics, and communications services used to deliver it may process technical data such as IP address, browser and operating system details, device or session identifiers, access times, pages or features requested, diagnostic events, and security logs. The exact data collected depends on the service and configuration. <strong>[VERIFY SERVER LOGGING, ANALYTICS EVENTS, RETENTION, AND WHETHER PRECISE DEVICE IDENTIFIERS ARE COLLECTED.]</strong>
            </p>

            <h3>3.7 Location information</h3>
            <p>
              You may enter a city or country in your profile. If you choose the location detection feature, your browser can request permission to provide device coordinates; the site can use those coordinates to identify a location, and coordinates may be stored with profile information for distance-based browsing. The site also uses OpenStreetMap Nominatim for reverse geocoding in the location flow. Approximate location inferred from an IP address, if used by analytics or infrastructure providers, is distinct from profile location and precise GPS coordinates. We do not state that background GPS tracking occurs.
            </p>

            <h3>3.8 Information from other sources</h3>
            <p>
              Where you choose an external sign-in method, the relevant authentication provider may provide account information such as your name, email address, and profile image. We may receive payment or delivery status from an applicable processor, analytics or technical events from service providers, and reports or information submitted by other members. We do not add advertising-partner data sources unless and until such partners are confirmed as active.
            </p>
          </section>

          <section>
            <h2>4. How We Collect Information</h2>
            <ul>
              <li><strong>Directly from you:</strong> During registration, sign-in, profile creation or editing, messaging, calls, location entry, content uploads, purchases if available, and when you contact support or submit a report.</li>
              <li><strong>Automatically or through the service:</strong> Through browser and device requests, authentication and session processes, website logs, analytics and push-notification tools that are enabled, and call or messaging features.</li>
              <li><strong>From third parties:</strong> From Google or Apple when you select their sign-in option, and from vendors such as payment, analytics, infrastructure, or communications providers when you use a feature they support.</li>
              <li><strong>From other members:</strong> Through reports, messages, or content that refers to you.</li>
            </ul>
            <p>
              Information you actively submit is different from technical information generated as the service operates. Browser permissions, cookie settings, and feature choices may affect what is collected. The website currently stores authentication session information in browser storage; confirm the exact storage mechanisms and associated lifetimes before publication.
            </p>
          </section>

          <section>
            <h2>5. How We Use Personal Information</h2>
            <p>We use personal information for the purposes below, subject to the feature being used and applicable law.</p>
            <ul>
              <li><strong>Create and manage accounts:</strong> Use account identifiers, authentication information, and profile data to register you, authenticate sign-ins, maintain your account, and provide account controls. Where GDPR or similar rules apply, the usual basis is taking steps at your request or performing the service contract.</li>
              <li><strong>Display profiles and support discovery:</strong> Use profile details, preferences, and location information you provide to show your profile, filter or recommend profiles, calculate compatibility information, and enable members to discover each other. The usual basis is providing requested service functionality; any optional sensitive-data processing may require consent or another lawful condition.</li>
              <li><strong>Enable communication and calls:</strong> Process messages, lounge activity, call participant identifiers, and call session metadata to deliver communication features. The usual basis is providing the service you choose to use.</li>
              <li><strong>Operate and improve the website:</strong> Use diagnostic, performance, and usage data to keep the service functioning, troubleshoot errors, and improve features. Analytics-based processing may require consent depending on location and configuration.</li>
              <li><strong>Provide support:</strong> Use contact details and the information in your support request to respond, troubleshoot, and maintain a record of the request. The basis may be fulfilling your request, our legitimate interests in operating support, or legal obligations.</li>
              <li><strong>Protect members and the service:</strong> Use reports, profile information, communications, technical events, and account activity as appropriate to investigate reported conduct, identify suspicious activity, prevent abuse, secure accounts, and apply our Terms and Community Guidelines. The basis may be legitimate interests in safety and security, legal obligations, or another basis permitted by law.</li>
              <li><strong>Manage transactions:</strong> If payments are enabled, use transaction and billing status information to provide purchases, handle refunds, and maintain financial records. The basis may be performing a contract and complying with legal obligations.</li>
              <li><strong>Send service communications:</strong> Use account contact details and notification tokens to send sign-in, security, service, call, and account messages. Promotional messages are treated separately and sent only where permitted by law and any required consent or choice.</li>
              <li><strong>Meet legal requirements:</strong> Use and disclose information when needed to comply with applicable law, respond to valid legal process, establish or defend legal claims, and protect people or our rights.</li>
            </ul>
            <p>
              The precise legal basis depends on the country, the feature, and the data involved. Where we rely on legitimate interests under applicable law, those interests may include service safety, fraud prevention, and basic operational security, balanced against your rights.
            </p>
          </section>

          <section>
            <h2>6. Cookies and Similar Technologies</h2>
            <p>
              Cookies are small files stored by a browser. Websites and their providers may also use local storage, pixels, SDKs, or similar technologies. The website uses browser storage for authentication/session functionality and includes Google Analytics and OneSignal scripts. The exact cookies, SDK identifiers, purposes, vendors, and lifetimes must be documented from a production scan before this section is finalized. No advertising-cookie partner has been confirmed in the reviewed site code.
            </p>
            <ul>
              <li><strong>Essential storage:</strong> May support sign-in, security, session continuity, and core functions. Disabling it may prevent parts of the service from working.</li>
              <li><strong>Functional storage:</strong> May remember a preference or feature setting. Confirm which preference technologies are active.</li>
              <li><strong>Analytics technologies:</strong> Google Analytics is loaded by the site to measure usage and events. Confirm the exact configuration, identifiers, retention, and whether consent is required before analytics runs in each region.</li>
              <li><strong>Communications technologies:</strong> OneSignal is loaded for push-notification features. Confirm the data it receives and any browser or device storage used.</li>
              <li><strong>Advertising technologies:</strong> No advertising or marketing cookie provider was verified in the reviewed code. If advertising technologies are added, update this policy and provide legally required notice and opt-out or consent controls.</li>
              <li><strong>Session and persistent technologies:</strong> Session storage generally ends when a session ends; persistent storage remains until its configured expiry or deletion. Confirm actual lifetimes for every active technology.</li>
            </ul>
            <p>
              You can control cookies through browser settings, which can block or delete some browser cookies. Browser controls may not control every SDK or local-storage mechanism. The site currently has no verified cookie preference center; do not describe consent controls as available until they have been implemented. Where consent is required, non-essential technologies should not run before a valid choice and users should be able to change that choice later.
            </p>
          </section>

          <section>
            <h2>7. How We Share Personal Information</h2>
            <p>We share information only as needed for the purposes described here, subject to the choices and protections applicable to the information.</p>
            <h3>7.1 With other members</h3>
            <p>
              Profile information you choose to publish—such as photos, age derived from your date of birth, gender or dating preferences, biography, interests, and profile location—may be shown to other members. Your messages are delivered to their intended recipients; lounge messages may be visible to participants in that space. Presence and call details may be exposed as needed for those features. Do not include information in a profile or message that you do not want another member to see or save.
            </p>
            <h3>7.2 With service providers</h3>
            <p>
              Providers may process information on our behalf to supply infrastructure, authentication and database services (Supabase), Google Analytics, OneSignal push notifications, Google or Apple sign-in, OpenStreetMap Nominatim reverse geocoding, and Agora or LiveKit real-time communications where those features are enabled. We will identify the current providers and use appropriate contracts and access restrictions where required. This list must be checked against production configuration before publication.
            </p>
            <h3>7.3 Payments, advertising, and other partners</h3>
            <p>
              If a payment service is enabled, the payment provider receives information needed to process a transaction and may provide us with transaction status. No live payment provider or advertising partner was confirmed in the reviewed configuration. We do not make a blanket statement that personal information is or is not “sold” or “shared” under a particular law; the operator must assess actual data flows and applicable legal definitions and provide any required notices and opt-outs.
            </p>
            <h3>7.4 Legal, safety, and business disclosures</h3>
            <p>
              We may disclose information when required by law or valid legal process, or when reasonably necessary to investigate fraud or serious safety concerns, protect members or the public, enforce our terms, or establish, exercise, or defend legal claims. Information may also be transferred as part of a merger, financing, reorganization, or sale of all or part of the business, subject to applicable legal requirements and appropriate notice.
            </p>
            <p>We do not share personal information indiscriminately. We do not claim corporate affiliation with another dating service or corporate group.</p>
          </section>

          <section>
            <h2>8. Third-Party Services and Integrations</h2>
            <p>
              The site relies on external providers for some functions. The code review identified Supabase for authentication, database and file storage; Google Analytics; OneSignal; Google and Apple authentication options; OpenStreetMap Nominatim for reverse geocoding; and Agora and LiveKit-related calling or communications features. Different providers may receive different information depending on the feature you use. Please review the applicable provider privacy notices when you use those features.
            </p>
            <p>
              The site code includes references to Stripe and NMI, but active payment processing was not verified; some NMI payment endpoints are disabled. A provider must not be described as a current payment recipient unless its live integration is confirmed. External websites linked from the service are governed by their own privacy terms.
            </p>
            <p>
              Providers may process information under their own terms and, where applicable, our instructions and contractual obligations. Confirm each provider’s legal entity, processing role, data locations, retention, subprocessors, and current contract before publication.
            </p>
          </section>

          <section>
            <h2>9. International Data Transfers</h2>
            <p>
              The countries in which the production database, backups, analytics, notification, authentication, and call services process information have not been confirmed for this draft. If a provider processes information outside your country, local laws may differ. Before publication, identify the relevant locations and disclose transfers that actually occur.
            </p>
            <p>
              Where required, the operator will use a legally recognized transfer mechanism, which may include an adequacy decision, standard contractual clauses, or another applicable safeguard, and provide information about how to obtain a copy or summary of relevant safeguards. This policy does not assert that a particular transfer mechanism is currently in place.
            </p>
          </section>

          <section>
            <h2>10. Data Security</h2>
            <p>
              We take steps intended to protect personal information from unauthorized access, loss, misuse, or alteration. The service uses third-party hosting, authentication, and communications infrastructure. Specific safeguards—such as encryption at rest, staff access controls, security testing, incident response procedures, and vendor security commitments—must be confirmed against the operator’s actual configuration before they are represented as implemented.
            </p>
            <p>
              No website, transmission, or storage system can be guaranteed completely secure. Use a unique password, protect your sign-in credentials, and contact us if you suspect unauthorized use of your account. The operator should maintain an incident response process and notify affected people or authorities where legally required.
            </p>
          </section>

          <section>
            <h2>11. Data Retention and Deletion</h2>
            <p>
              We keep personal information only for as long as reasonably needed for the purposes described in this policy, including providing the service, maintaining an account, resolving support issues, protecting safety, and meeting legal or financial obligations. Actual retention periods depend on the information type and applicable requirements.
            </p>
            <ul>
              <li><strong>Active profiles and account data:</strong> Generally associated with your account until it is closed or deleted, subject to limited retention permitted by law.</li>
              <li><strong>Messages and user content:</strong> Retention and deletion depend on the feature, recipient copies, safety reports, and the account-deletion process. Specify when and how recipient-visible copies are removed.</li>
              <li><strong>Photos and uploaded media:</strong> The account deletion flow attempts to remove profile photos from storage; the storage and backup deletion schedule must be verified.</li>
              <li><strong>Support requests and reports:</strong> May be retained as long as needed to respond, investigate, preserve evidence, resolve disputes, and meet legal requirements. Set a documented period before publication.</li>
              <li><strong>Call and security records:</strong> Retention depends on the enabled provider, feature, and legitimate safety or operational need. No verified retention period is stated here.</li>
              <li><strong>Payment and legal records:</strong> If collected, may be kept for the period required by tax, accounting, payment, dispute, or other applicable law.</li>
              <li><strong>Backups:</strong> Deleted information may remain in protected backups until the applicable backup rotation expires. Confirm and disclose the actual schedule.</li>
            </ul>
            <p>
              The site currently offers a self-service account-deletion flow. Its public account-deletion page states that active account data is deleted after confirmation and that backup copies are purged within 30 days, but the database deletion routine and storage behavior must be verified before this policy can guarantee those outcomes. <strong>[CONFIRM EACH RETENTION PERIOD, DELETION EFFECT, AND BACKUP ROTATION.]</strong>
            </p>
          </section>

          <section>
            <h2>12. Your Privacy Rights and Choices</h2>
            <p>
              Depending on where you live and the laws that apply, you may have rights to request access to, correction of, or deletion of your personal information; obtain a portable copy; restrict or object to certain processing; withdraw consent where processing relies on consent; or complain to a privacy regulator. Some rights are limited by exceptions, and they do not apply identically everywhere.
            </p>
            <p>
              You can edit profile information through the service and request account deletion at <Link href="/delete-account">Delete Your Account</Link>. For other privacy requests, contact <strong>[INSERT PRIVACY CONTACT EMAIL]</strong> or use our <Link href="/contact">contact form</Link> and mark the request “Privacy Request.” We may ask for information reasonably necessary to verify your identity and authority before acting. We will respond within the period required by applicable law and explain if an exception applies.
            </p>
            <p>
              If you disagree with a decision on a request, you may have a right to appeal or complain to a regulator, depending on your location. We will provide an appeal process where required by law. Do not send passwords or payment credentials when making a request.
            </p>
          </section>

          <section>
            <h2>13. United States Privacy Rights</h2>
            <p>
              Several U.S. states provide privacy rights, including rights to know or access, correct, delete, or obtain a copy of certain personal information. Depending on the state law and whether it applies to the operator, residents may also have rights to opt out of targeted advertising, certain profiling, or the sale or sharing of personal information as those terms are legally defined.
            </p>
            <p>
              The California Consumer Privacy Act, as amended by the California Privacy Rights Act, the Virginia Consumer Data Protection Act, and other state laws apply only when their legal scope and thresholds are met. Whether Buscando Amor Eterno is subject to a particular law, and whether a specific disclosure qualifies as a sale, sharing, or targeted advertising, must be determined from the operator’s actual business and data flows. We do not make an unsupported claim that we sell or do not sell personal information.
            </p>
            <p>
              Submit a request using <strong>[INSERT PRIVACY REQUEST METHOD]</strong> or the contact form. If a law grants an appeal right, include “Privacy Appeal” in your request; we will provide instructions and any regulator complaint options required by that law. We will not unlawfully discriminate against you for exercising a privacy right.
            </p>
          </section>

          <section>
            <h2>14. European, UK, and Other International Privacy Rights</h2>
            <p>
              If the GDPR, UK GDPR, or another privacy law applies, you may have rights to access, rectify, erase, restrict, or port personal information, object to certain processing, withdraw consent, and complain to a competent supervisory authority. These rights are subject to legal conditions and exceptions.
            </p>
            <p>Where applicable, processing may rely on one or more of these legal bases:</p>
            <ul>
              <li><strong>Contract:</strong> To create and administer your account and deliver features you request.</li>
              <li><strong>Consent:</strong> For optional processing where you have been asked to agree, including sensitive information or non-essential tracking when consent is legally required. You may withdraw consent for future processing.</li>
              <li><strong>Legitimate interests:</strong> For proportionate service security, abuse prevention, and operational needs, after considering your rights and expectations.</li>
              <li><strong>Legal obligation:</strong> To comply with laws and valid legal requirements.</li>
            </ul>
            <p>
              The applicable basis depends on the processing and location. You may contact <strong>[INSERT PRIVACY CONTACT OR EU/UK REPRESENTATIVE, IF REQUIRED]</strong>. The controller, establishment, representative requirements, and supervisory authority information must be confirmed for the operator’s circumstances. Mentioning these laws does not itself establish compliance.
            </p>
          </section>

          <section>
            <h2>15. Children’s Privacy and Minimum Age</h2>
            <p>
              Buscando Amor Eterno is intended exclusively for adults aged 18 and older. People under 18 may not register or use the dating service. We do not knowingly intend to collect personal information from children under 18. If we learn that an account belongs to someone under 18, we will take appropriate steps to restrict or remove the account and handle related information as required by law.
            </p>
            <p>
              If you believe someone under 18 has created an account, report it through available in-service reporting options or <Link href="/contact">contact support</Link>. Information about a suspected minor will be handled carefully and may be retained or disclosed when necessary to protect a child or comply with law.
            </p>
          </section>

          <section>
            <h2>16. Marketing and Service Communications</h2>
            <p>
              We may send service communications needed to operate your account, such as sign-in, security, support, or feature notifications. The site includes OneSignal push-notification functionality; device permission and notification settings affect whether browser notifications can be delivered. Essential service communications may continue even if you opt out of promotional messages.
            </p>
            <p>
              Promotional email or push marketing should be sent only where permitted by law and any required consent has been obtained. If marketing is enabled, you can opt out using the unsubscribe option in the message or the applicable preference control. <strong>[CONFIRM WHETHER PROMOTIONAL MESSAGES ARE CURRENTLY SENT AND HOW OPT-OUTS ARE HONORED.]</strong>
            </p>
          </section>

          <section>
            <h2>17. Recommendations and Automated Processing</h2>
            <p>
              The service uses profile details and dating preferences to filter or recommend profiles and calculate compatibility information. These recommendations help members discover possible connections; they are not represented as decisions that determine a person’s legal rights or similarly significant interests. The platform may also use technical or account information to identify suspicious activity, but the extent of automated fraud or moderation tools must be confirmed.
            </p>
            <p>
              If the service introduces automated decisions with legal or similarly significant effects, or profiling subject to special rights, we will provide the explanations and controls required by applicable law. <strong>[CONFIRM ALL LIVE RECOMMENDATION, PROFILING, FRAUD, AND MODERATION SYSTEMS.]</strong>
            </p>
          </section>

          <section>
            <h2>18. Account Closure and Privacy Requests</h2>
            <p>
              You can close your account through the <Link href="/delete-account">account deletion page</Link>. If you cannot access your account, use our <Link href="/contact">contact form</Link> or email <a href="mailto:support@buscandoamoreterno.com">support@buscandoamoreterno.com</a> from the address associated with the account and ask for account-deletion assistance. We may verify your identity before processing a request.
            </p>
            <p>
              Account closure is intended to remove or de-identify profile and account information from active systems, subject to lawful retention, recipient copies, safety records, and backup rotation. The exact deletion scope and timing must be confirmed against the production database routine, storage buckets, call and message systems, support tickets, reports, and backups before publication. Closing an account does not automatically withdraw any separate consent that applicable law requires you to manage directly with a third-party provider.
            </p>
          </section>

          <section>
            <h2>19. Changes to This Privacy Policy</h2>
            <p>
              We may update this policy when the service, data practices, or legal requirements change. The current version will be posted on this page with a revised effective or last-updated date. If a change is material, we will provide additional notice where required by law. Where a new use requires consent, we will request it rather than treating continued use as consent when the law does not permit that approach.
            </p>
          </section>

          <section>
            <h2>20. Contact Information</h2>
            <p>For privacy questions, requests, or concerns, contact:</p>
            <ul>
              <li><strong>Legal business name:</strong> [INSERT FULL LEGAL BUSINESS NAME]</li>
              <li><strong>Platform:</strong> Buscando Amor Eterno</li>
              <li><strong>Website:</strong> <a href="https://buscandoamoreterno.com">https://buscandoamoreterno.com</a></li>
              <li><strong>Privacy contact:</strong> [INSERT PRIVACY EMAIL OR REQUEST FORM]</li>
              <li><strong>General support:</strong> <a href="mailto:support@buscandoamoreterno.com">support@buscandoamoreterno.com</a> · <Link href="/contact">Contact form</Link></li>
              <li><strong>Registered business address:</strong> [INSERT REGISTERED BUSINESS ADDRESS]</li>
              <li><strong>Data Protection Officer or representative, if applicable:</strong> [INSERT DETAILS OR CONFIRM NOT APPLICABLE]</li>
            </ul>
            <p>
              Replace every bracketed item, verify each processing description, and obtain legal review based on the operator’s location and audience before treating this draft as final.
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </main>
  )
}
