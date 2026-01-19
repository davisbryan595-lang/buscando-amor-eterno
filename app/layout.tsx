import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { I18nProvider } from '@/lib/i18n-context'
import { Preloader } from '@/components/preloader'
import CallManager from '@/components/call-manager'
import { Toaster } from '@/components/ui/sonner'
import { SessionManager } from '@/components/session-manager'
import { ReconnectHandler } from '@/components/reconnect-handler'

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
    icon: 'https://cdn.builder.io/api/v1/image/assets%2F5517f718aa7348e88214250292563028%2F09ca0588ac3741678f0d49e142dede0b?format=webp&width=800',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
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
        <ReconnectHandler />
        <I18nProvider>
          <AuthProvider>
            <SessionManager />
            <CallManager>
              {children}
            </CallManager>
            <Toaster />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
