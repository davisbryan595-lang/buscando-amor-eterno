import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.buscandoamoreterno.com'

  return [
    {
      url: `${baseUrl}/`,

      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/dating-in-usa`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,

      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nuestra-historia`,

      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,

      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms-of-service`,

      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community-guidelines`,

      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/delete-account`,

      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,

      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/signup`,

      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,

      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]
}
