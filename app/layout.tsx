import type { Metadata } from 'next'
import Script from 'next/script'
import { Geist, Geist_Mono, Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { AdminAuthProvider } from '@/context/admin-auth-context'
import { I18nProvider } from '@/lib/i18n-context'
import { Preloader } from '@/components/preloader'
import CallManager from '@/components/call-manager'
import { Toaster } from '@/components/ui/sonner'
import { SessionManager } from '@/components/session-manager'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.buscandoamoreterno.com'),
  title: 'Buscando Amor Eterno | Find Your Soulmate',
  description: 'Meet singles and find meaningful connections with Buscando Amor Eterno. Explore profiles, connect through messages, and enjoy video chat.',
  openGraph: {
    type: 'website',
    siteName: 'Buscando Amor Eterno',
    title: 'Buscando Amor Eterno | Find Your Soulmate',
    description: 'Meet singles and find meaningful connections with Buscando Amor Eterno.',
    images: [{ url: '/romantic-couple-sunset-beach-luxury.jpg', alt: 'A couple together at sunset on the beach' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buscando Amor Eterno | Find Your Soulmate',
    description: 'Meet singles and find meaningful connections with Buscando Amor Eterno.',
    images: ['/romantic-couple-sunset-beach-luxury.jpg'],
  },
  icons: {
    icon: [{ url: '/favicon-48.png', type: 'image/png', sizes: '48x48' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

const siteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Buscando Amor Eterno',
  url: 'https://www.buscandoamoreterno.com/',
  description: 'A dating platform for finding meaningful connections.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-P5YZG84X74" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P5YZG84X74');
          `,
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Force light mode only
            try {
              document.documentElement.classList.remove('dark');
              document.documentElement.setAttribute('data-theme', 'light');
              localStorage.setItem('app-theme', 'light');
            } catch (e) {}
          `,
        }} />
        <script async src="https://cdn.onesignal.com/sdks/onesignal.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.OneSignal = window.OneSignal || [];
            if (typeof window !== 'undefined' && window.OneSignal) {
              OneSignal.push(function() {
                try {
                  OneSignal.init({
                    appId: "onesignal-app-id-12345678",
                  });
                } catch (err) {
                  console.warn('OneSignal initialization failed:', err);
                }
              });
            }
          `,
        }} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}>
        <Preloader />
        <AdminAuthProvider>
          <I18nProvider>
            <AuthProvider>
              <SessionManager />
              <CallManager>
                {children}
              </CallManager>
              <Toaster />
            </AuthProvider>
          </I18nProvider>
        </AdminAuthProvider>
      </body>
    </html>
  )
}
