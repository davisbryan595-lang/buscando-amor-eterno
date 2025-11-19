import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

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
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/672c5e7a4308e9193c899eXX/1i0v5b47r';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />

        <script async src="https://cdn.onesignal.com/sdks/onesignal.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.OneSignal = window.OneSignal || [];
            OneSignal.push(function() {
              OneSignal.init({
                appId: "onesignal-app-id-12345678",
              });
            });
          `,
        }} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-slate-900`}>
        {children}
      </body>
    </html>
  )
}
