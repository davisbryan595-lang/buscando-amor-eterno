import type { Metadata } from 'next'
import HomePage from '@/components/home-page'

const title = 'Online Dating for Singles | Buscando Amor Eterno'
const description = 'Meet singles, create a dating profile, and build meaningful connections through messaging and video chat on Buscando Amor Eterno.'

export const metadata: Metadata = {
  title,
  description,
  keywords: ['online dating', 'dating site for singles', 'meet singles online', 'meaningful connections'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Buscando Amor Eterno',
    title,
    description,
    images: [{ url: '/romantic-couple-sunset-beach-luxury.jpg', alt: 'Couple together at sunset on a beach' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/romantic-couple-sunset-beach-luxury.jpg'],
  },
}

const homepageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://www.buscandoamoreterno.com/#homepage',
  url: 'https://www.buscandoamoreterno.com/',
  name: title,
  description,
  isPartOf: { '@id': 'https://www.buscandoamoreterno.com/#website' },
  about: { '@id': 'https://www.buscandoamoreterno.com/#organization' },
  inLanguage: 'en-US',
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://www.buscandoamoreterno.com/romantic-couple-sunset-beach-luxury.jpg',
  },
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />
      <HomePage />
    </>
  )
}
