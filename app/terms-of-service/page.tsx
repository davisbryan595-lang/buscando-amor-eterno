import styles from '../policy.module.css';

export default function TermsOfServicePage() {
  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyContent}>
        <h1>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: May 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Buscando Amor Eterno website and mobile application (collectively, the &quot;Service&quot;),
            you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide
            by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Buscando
            Amor Eterno&apos;s Service for personal, non-commercial transitory viewing only. This is the grant of a license,
            not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software on the Service</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or &quot;mirroring&quot; the materials on any other server</li>
            <li>Transmitting automated queries, spam, or any other unsolicited communication</li>
          </ul>
        </section>

        <section>
          <h2>3. Account Registration and Responsibilities</h2>
          <p>To use the Service, you must:</p>
          <ul>
            <li>Be at least 18 years old (21 in some jurisdictions)</li>
            <li>Provide accurate, truthful information during registration and profile creation</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Accept full responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
          <p>
            You are responsible for maintaining the confidentiality of your password and account. You agree to accept
            responsibility for all activities that occur under your account. You must not represent yourself as another
            person, use a misleading profile picture, or provide false information.
          </p>
        </section>

        <section>
          <h2>4. User Conduct and Community Standards</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Harass, threaten, embarrass, or cause distress or discomfort to any person</li>
            <li>Engage in any form of discrimination based on race, ethnicity, religion, gender, sexual orientation, or disability</li>
            <li>Post or transmit sexually explicit, obscene, or offensive content</li>
            <li>Engage in or encourage illegal activity</li>
            <li>Share the personal information of others without consent</li>
            <li>Solicit or exchange money, gifts, or sexual services</li>
            <li>Impersonate another person or entity</li>
            <li>Use the Service to meet minors for any sexual purpose (illegal behavior will be reported)</li>
            <li>Engage in predatory behavior, grooming, or human trafficking</li>
            <li>Stalk, cyberbully, or intimidate other users</li>
            <li>Use the Service for commercial purposes without authorization</li>
            <li>Facilitate fraud, scams, or financial manipulation</li>
          </ul>
        </section>

        <section>
          <h2>5. Content and Media</h2>
          <p>
            By uploading photos, videos, or any other content to the Service, you grant Buscando Amor Eterno a
            non-exclusive, royalty-free, perpetual, and worldwide right to use, display, and distribute your content
            for operational and promotional purposes. You represent and warrant that:
          </p>
          <ul>
            <li>You own or have rights to all content you upload</li>
            <li>Content does not infringe upon any third-party rights</li>
            <li>All persons appearing in photos have consented to their use on the Service</li>
            <li>Content is not sexually explicit, obscene, or illegal</li>
            <li>Profile photos accurately represent your appearance</li>
          </ul>
          <p>We reserve the right to remove any content that violates these terms or our community guidelines at any time.</p>
        </section>

        <section>
          <h2>6. Age Verification and Safety</h2>
          <p>
            The Service is only available to users who are at least 18 years old (or the age of majority in your jurisdiction).
            By using the Service, you represent and warrant that you meet this age requirement. We do not knowingly collect
            personal information from minors. If we become aware of any minor using the Service, we will terminate their account immediately.
          </p>
          <p>
            Users attempting to solicit sexual content from or meet minors will be permanently banned, and Buscando Amor
            Eterno will report such activity to the National Center for Missing &amp; Exploited Children (NCMEC) and law
            enforcement as required by law.
          </p>
        </section>

        <section>
          <h2>7. Payment and Subscription Terms</h2>
          <p>Premium subscription costs $12 per month. By initiating a subscription:</p>
          <ul>
            <li>You authorize us to charge your payment method</li>
            <li>Charges occur monthly on the same date until cancellation</li>
            <li>You can cancel at any time; cancellation takes effect at the end of your current billing period</li>
            <li>No refunds are provided for partial months</li>
            <li>We reserve the right to change pricing with 30 days&apos; notice</li>
            <li>Failed payments may result in account suspension</li>
          </ul>
          <p>All payments are processed securely through Stripe. We do not store your credit card information on our servers.</p>
        </section>

        <section>
          <h2>8. Video Chat and Communication Safety</h2>
          <p>
            Video dates and real-time communication are provided through third-party services (Agora, LiveKit). When you
            use these features:
          </p>
          <ul>
            <li>Your audio/video may be recorded for quality and safety purposes</li>
            <li>You consent to the collection of call logs and session metadata</li>
            <li>Do not share sensitive personal or financial information during calls</li>
            <li>Block or report users who engage in threatening, harassing, or inappropriate behavior immediately</li>
            <li>Meet in public places and inform a trusted friend of your plans</li>
          </ul>
        </section>

        <section>
          <h2>9. User-Generated Messages and Privacy</h2>
          <p>
            Messages and communications between users are stored on our servers for a limited period. We may access messages
            to investigate reports of abuse, harassment, or illegal activity. By using messaging:
          </p>
          <ul>
            <li>You understand messages are not truly private and may be accessed by our support or safety teams</li>
            <li>Do not share passwords, financial information, or sensitive personal data via messages</li>
            <li>Use message encryption and secure communication practices when discussing sensitive topics</li>
          </ul>
        </section>

        <section>
          <h2>10. Reporting and Moderation</h2>
          <p>We take violations of these terms seriously. If you encounter a user who:</p>
          <ul>
            <li>Is engaging in harassment or threatening behavior</li>
            <li>Has a misleading or inappropriate profile</li>
            <li>Is attempting to scam or financially manipulate you</li>
            <li>Has shared your information without consent</li>
            <li>May be a minor</li>
          </ul>
          <p>
            Please use the &quot;Report&quot; feature on the Service. Our moderation team will review and take appropriate action,
            which may include account suspension or permanent banning.
          </p>
        </section>

        <section>
          <h2>11. Account Termination</h2>
          <p>Buscando Amor Eterno reserves the right to suspend or permanently terminate your account if you:</p>
          <ul>
            <li>Violate these Terms of Service</li>
            <li>Engage in harassment, fraud, or illegal activity</li>
            <li>Create a safety risk to other users</li>
            <li>Violate our community guidelines repeatedly</li>
          </ul>
          <p>
            Upon termination, your access to the Service will be immediately revoked. Your profile and messages may be
            deleted, though we may retain certain information as required by law or for safety purposes.
          </p>
        </section>

        <section>
          <h2>12. Limitation of Liability</h2>
          <p>
            Buscando Amor Eterno is provided &quot;as-is&quot; without any warranties. To the fullest extent permitted by law, we
            are not liable for:
          </p>
          <ul>
            <li>Any indirect, incidental, special, or consequential damages</li>
            <li>Loss of data, revenue, or profits</li>
            <li>Emotional distress or harm resulting from interactions with other users</li>
            <li>Service interruptions, bugs, or technical failures</li>
            <li>Actions of other users or third parties</li>
            <li>Unauthorized access to or alteration of your transmissions or data</li>
          </ul>
          <p>This limitation applies even if we have been advised of the possibility of such damages.</p>
        </section>

        <section>
          <h2>13. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless Buscando Amor Eterno and its officers, directors, employees,
            and agents from any claim, damage, loss, liability, or expense (including reasonable attorneys&apos; fees) arising from:
          </p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms of Service</li>
            <li>Your content or communications</li>
            <li>Infringement of third-party rights by your conduct</li>
          </ul>
        </section>

        <section>
          <h2>14. Third-Party Services</h2>
          <p>
            The Service integrates with third-party providers including but not limited to Supabase, Stripe, Agora,
            LiveKit, and OpenStreetMap. Your use of these services is subject to their terms and privacy policies.
            Buscando Amor Eterno is not responsible for the actions, policies, or content of third-party services.
          </p>
        </section>

        <section>
          <h2>15. Modifications to Terms</h2>
          <p>
            Buscando Amor Eterno reserves the right to modify these Terms of Service at any time. Changes will be posted
            on this page with an updated &quot;Last Updated&quot; date. Your continued use of the Service following the posting of
            revised terms means that you accept and agree to the changes.
          </p>
        </section>

        <section>
          <h2>16. Governing Law and Jurisdiction</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of [YOUR JURISDICTION],
            and you irrevocably submit to the exclusive jurisdiction of the courts in that location. If any provision
            of these terms is found to be invalid, the remaining provisions will continue in full force and effect.
          </p>
        </section>

        <section>
          <h2>17. Contact Information</h2>
          <p>If you have questions about these Terms of Service, please contact us at:</p>
          <p>
            Email: support@buscandoamoreterno.com<br />
            Address: [YOUR COMPANY ADDRESS]
          </p>
        </section>
      </div>
    </div>
  );
}
