import styles from '../policy.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyContent}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: May 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Buscando Amor Eterno (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or &quot;Company&quot;) respects your privacy and is committed to protecting
            your personal information. This Privacy Policy explains what information we collect, how we use it, who we
            share it with, and your rights regarding your data.
          </p>
          <p>
            By using our website and mobile application (the &quot;Service&quot;), you consent to our collection and use of personal
            information as outlined in this Privacy Policy.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>

          <h3>2.1 Information You Provide Directly</h3>
          <ul>
            <li><strong>Account Information:</strong> Email address, password (hashed)</li>
            <li><strong>Profile Information:</strong> Full name, date of birth, gender, sexual orientation, relationship goals</li>
            <li><strong>Preferences:</strong> Age range, distance radius, interests, values, love language, religion</li>
            <li><strong>Life Details:</strong> Height, smoking/drinking habits, relationship type, number of children desired, dealbreakers</li>
            <li><strong>Location Data:</strong> City, country, latitude, longitude (used for proximity matching)</li>
            <li><strong>Media:</strong> Profile photos, video chat recordings (temporary), call logs</li>
            <li><strong>Communication:</strong> Messages, lounge chat messages, feedback, and support requests</li>
            <li><strong>Payment Information:</strong> Email and payment method (processed by Stripe, not stored on our servers)</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Device Information:</strong> Operating system, browser type, device model, unique identifiers</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on Service, clicks, swipes, likes, dislikes</li>
            <li><strong>IP Address:</strong> Used for security, fraud prevention, and analytics</li>
            <li><strong>Cookies and Tracking:</strong> Session cookies, analytics cookies (via Google Analytics)</li>
            <li><strong>Call Metadata:</strong> Call duration, call timestamps, participant IDs (from Agora and LiveKit)</li>
            <li><strong>Presence Data:</strong> Online/offline status, typing indicators, last seen timestamps</li>
          </ul>

          <h3>2.3 Information from Third Parties</h3>
          <ul>
            <li><strong>OAuth Providers:</strong> Google and Apple provide email, name, and profile picture if you sign up via social login</li>
            <li><strong>Reverse Geocoding:</strong> We use OpenStreetMap Nominatim to convert coordinates to city/country names</li>
            <li><strong>NMI:</strong> Subscription and payment status information</li>
            <li><strong>Reports from Other Users:</strong> Users may submit reports about your account, profile, or conduct</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li><strong>Service Delivery:</strong> Creating and maintaining your account, matching you with compatible users, enabling messaging and video calls</li>
            <li><strong>Personalization:</strong> Tailoring recommendations, feed content, and user experience based on preferences</li>
            <li><strong>Safety and Moderation:</strong> Investigating reports, detecting fraud, preventing harassment, and enforcing our Terms of Service</li>
            <li><strong>Communication:</strong> Sending notifications, service updates, and support responses</li>
            <li><strong>Analytics and Improvement:</strong> Understanding how users interact with the Service to improve features and fix bugs</li>
            <li><strong>Marketing:</strong> Sending promotional emails and push notifications (you can opt-out)</li>
            <li><strong>Legal Compliance:</strong> Complying with laws, court orders, and regulatory requirements</li>
            <li><strong>Age Verification:</strong> Using date of birth to ensure users are 18+ (we do not perform third-party age verification)</li>
            <li><strong>Payment Processing:</strong> Managing subscriptions and billing through NMI</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Sharing and Disclosure</h2>

          <h3>4.1 With Other Users</h3>
          <p>The following information is visible to other users on the Service:</p>
          <ul>
            <li>Profile photo(s)</li>
            <li>Age (calculated from birthday)</li>
            <li>Gender and sexual orientation</li>
            <li>Location (city and country, or proximity based on distance radius)</li>
            <li>Bio and prompts (written content)</li>
            <li>Interests and values</li>
            <li>Height, drinking/smoking habits (if disclosed)</li>
            <li>Online/offline status</li>
            <li>Match percentage and compatibility information</li>
            <li>Messages sent to matched users</li>
          </ul>

          <h3>4.2 With Service Providers and Partners</h3>
          <p>We share information with third-party service providers who assist in operating the Service:</p>
          <ul>
            <li><strong>Supabase:</strong> Cloud hosting, authentication, and database services</li>
            <li><strong>NMI:</strong> Payment processing and subscription management</li>
            <li><strong>Agora &amp; LiveKit:</strong> Video and audio calling infrastructure</li>
            <li><strong>OpenStreetMap:</strong> Reverse geocoding for location names</li>
            <li><strong>Google Analytics:</strong> Usage analytics and engagement tracking</li>
            <li><strong>OneSignal:</strong> Push notifications</li>
          </ul>
          <p>
            These service providers are contractually bound to use your information only as necessary to provide services
            and to maintain the confidentiality of your data.
          </p>

          <h3>4.3 Legal Requirements and Safety</h3>
          <p>
            We may disclose your information if required by law or if we believe in good faith that such disclosure is
            necessary to:
          </p>
          <ul>
            <li>Comply with legal obligations, court orders, or government requests</li>
            <li>Protect and defend our rights and property</li>
            <li>Prevent or investigate possible wrongdoing, fraud, or safety violations</li>
            <li>Protect the personal safety of our users and the public</li>
            <li>Report child exploitation to NCMEC (National Center for Missing &amp; Exploited Children) and law enforcement</li>
          </ul>

          <h3>4.4 Business Transfers</h3>
          <p>
            If Buscando Amor Eterno is involved in a merger, acquisition, bankruptcy, or sale of assets, your information
            may be transferred as part of that transaction. We will notify you of any change in ownership or control of
            your personal information.
          </p>

          <h3>4.5 With Your Consent</h3>
          <p>We will not share your information with third parties outside the above contexts without your explicit consent.</p>
        </section>

        <section>
          <h2>5. Data Storage and Retention</h2>
          <ul>
            <li><strong>Messages:</strong> Stored indefinitely unless you delete them; we may retain copies for safety investigations</li>
            <li><strong>Profile Data:</strong> Retained as long as your account is active; deleted upon account deletion (with some exceptions for legal or safety purposes)</li>
            <li><strong>Call Logs:</strong> Stored for 90 days for quality and troubleshooting purposes</li>
            <li><strong>Analytics Data:</strong> Aggregated and anonymized data retained for 24 months</li>
            <li><strong>Support Tickets:</strong> Retained for 1 year for reference and dispute resolution</li>
            <li><strong>Admin Logs:</strong> Moderation and admin activity logs retained for 2 years for auditing purposes</li>
          </ul>
          <p>
            All data is stored on encrypted servers maintained by Supabase (Google Cloud infrastructure). Even if you delete
            your account, we may retain some information for legal compliance, fraud prevention, and safety purposes.
          </p>
        </section>

        <section>
          <h2>6. Security and Data Protection</h2>
          <p>Buscando Amor Eterno implements industry-standard security measures to protect your information:</p>
          <ul>
            <li>HTTPS/TLS encryption for all data in transit</li>
            <li>Password hashing using secure algorithms</li>
            <li>Database encryption at rest</li>
            <li>Regular security audits and vulnerability testing</li>
            <li>Access controls limiting employee access to personal data</li>
            <li>Two-factor authentication available for account security</li>
          </ul>
          <p>
            However, no security system is impenetrable. We cannot guarantee absolute security of your information.
            You are responsible for maintaining the confidentiality of your password.
          </p>
        </section>

        <section>
          <h2>7. Your Rights and Choices</h2>

          <h3>7.1 Access and Portability</h3>
          <p>
            You have the right to access your personal information and receive a copy of your data in a portable format.
            Visit your profile settings or contact us to request this.
          </p>

          <h3>7.2 Modification</h3>
          <p>You can update, correct, or modify your profile information at any time through the Service.</p>

          <h3>7.3 Deletion</h3>
          <p>
            You can request deletion of your account and associated personal data. Upon verification, we will delete your
            profile, photos, and messages (except where legally required to retain them). However, note:
          </p>
          <ul>
            <li>We may retain hashed identifiers for fraud prevention</li>
            <li>Messages you sent to other users may remain on their accounts</li>
            <li>Backup and archival data may persist for a limited time</li>
            <li>We may retain data to comply with legal obligations</li>
          </ul>

          <h3>7.4 Marketing Communications</h3>
          <p>You can opt-out of promotional emails, newsletters, and push notifications by:</p>
          <ul>
            <li>Clicking the &quot;unsubscribe&quot; link in emails</li>
            <li>Adjusting notification preferences in app settings</li>
            <li>Contacting support to request removal from marketing lists</li>
          </ul>

          <h3>7.5 Cookie Management</h3>
          <p>
            You can disable cookies in your browser settings. However, some features of the Service may not function properly
            if cookies are disabled.
          </p>

          <h3>7.6 GDPR Rights (European Users)</h3>
          <p>If you are located in the European Union or United Kingdom, you have additional rights under the GDPR:</p>
          <ul>
            <li>Right to be forgotten (erasure)</li>
            <li>Right to restrict processing</li>
            <li>Right to object to processing</li>
            <li>Right to data portability</li>
            <li>Right to lodge a complaint with a supervisory authority</li>
          </ul>
          <p>To exercise these rights, contact us at the address provided in Section 13.</p>

          <h3>7.7 CCPA Rights (California Users)</h3>
          <p>If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):</p>
          <ul>
            <li>Right to know what personal information is collected</li>
            <li>Right to delete personal information collected from you</li>
            <li>Right to opt-out of the sale of your personal information</li>
            <li>Right to non-discrimination for exercising your CCPA rights</li>
          </ul>
          <p>
            Note: We do not sell personal information to third parties for monetary consideration. We do share information
            with service providers as described in this policy, which may constitute a &quot;sale&quot; under CCPA. To opt-out, contact us.
          </p>
        </section>

        <section>
          <h2>8. Children&apos;s Privacy</h2>
          <p>
            The Service is not intended for users under 18 years of age (21 in some jurisdictions). We do not knowingly
            collect personal information from minors. If we become aware that a minor has registered, we will terminate
            their account and delete their information immediately.
          </p>
          <p>
            If you believe a minor is using the Service, please report them immediately through the report function or
            contact support.
          </p>
        </section>

        <section>
          <h2>9. Third-Party Links and Services</h2>
          <p>
            The Service may contain links to third-party websites and services. This Privacy Policy does not apply to
            third-party services, and we are not responsible for their privacy practices. We encourage you to review
            their privacy policies before sharing your information.
          </p>
        </section>

        <section>
          <h2>10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than where you reside. By using the
            Service, you consent to the transfer of your information to countries outside your country of residence,
            which may have different data protection laws than your home country.
          </p>
          <p>
            For EU/UK users: We rely on Standard Contractual Clauses (SCCs) and adequacy decisions to ensure appropriate
            safeguards for international transfers. Supabase is certified under the Data Privacy Framework (formerly Privacy Shield).
          </p>
        </section>

        <section>
          <h2>11. Video Chat and Call Recording Disclosure</h2>
          <p>When you engage in video dates or voice calls through the Service:</p>
          <ul>
            <li>Sessions are processed by Agora and LiveKit, who may retain metadata</li>
            <li>Call logs include participant IDs, timestamps, and duration</li>
            <li>We do not record video/audio by default, but may do so for quality assurance and safety investigations if violations are reported</li>
            <li>You have the right to decline video or voice communication</li>
          </ul>
        </section>

        <section>
          <h2>12. Analytics and Tracking</h2>
          <p>We use Google Analytics to understand how users interact with the Service. Google Analytics collects:</p>
          <ul>
            <li>Pages visited</li>
            <li>Time on page</li>
            <li>Click events</li>
            <li>Approximate location (city/country level)</li>
            <li>Device and browser information</li>
          </ul>
          <p>
            This data is used to improve the Service and is not connected to personally identifiable information.
            You can opt-out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on.
          </p>
        </section>

        <section>
          <h2>13. Contact Us and Data Requests</h2>
          <p>
            If you have questions about this Privacy Policy, wish to exercise your rights, or want to submit a data
            access request, please contact:
          </p>
          <p>
            <strong>Email:</strong> support@buscandoamoreterno.com<br />
            <strong>Address:</strong> [YOUR COMPANY ADDRESS]<br />
            <strong>Website:</strong> https://www.buscandoamoreterno.com/contact
          </p>
          <p>We will respond to your request within 30 days (or as required by applicable law).</p>
        </section>

        <section>
          <h2>14. Changes to This Privacy Policy</h2>
          <p>
            Buscando Amor Eterno may update this Privacy Policy from time to time. We will notify you of material changes
            by posting the updated policy on this page with an updated &quot;Last Updated&quot; date. Your continued use of the Service
            following changes constitutes your acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section>
          <h2>15. Dispute Resolution</h2>
          <p>
            If you believe we have violated your privacy rights, we encourage you to contact us first to attempt resolution.
            If we are unable to resolve your concern, you may file a complaint with the relevant data protection authority
            in your jurisdiction or pursue legal remedies available under applicable law.
          </p>
        </section>
      </div>
    </div>
  );
}
