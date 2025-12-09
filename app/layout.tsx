import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { IncomingCallProvider } from '@/context/incoming-call-context'
import { I18nProvider } from '@/lib/i18n-context'
import { Preloader } from '@/components/preloader'
import { IncomingCallNotification } from '@/components/incoming-call-notification'

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
  title: 'Buscando Amor Eterno | Soulmate Dating Worldwide | $12/month',
  description: 'Nearly 50% of the world is single. You deserve eternal love. Join our premium soulmate dating platform with profiles, messaging, and video chat.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/placeholder-logo.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
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
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-slate-900`}>
        <Preloader />
        <I18nProvider>
          <AuthProvider>
            <IncomingCallProvider>
              {children}
              <IncomingCallNotification />
            </IncomingCallProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
