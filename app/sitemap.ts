import type { MetadataRoute } from 'next'
import { routing } from '../i18n/routing'
import { getSiteUrl } from '../lib/site-config'

const staticPaths = [
  '',
  '/about',
  '/services',
  '/pricing',
  '/case-studies',
  '/resources',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const now = new Date()

  return routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: path ? `${base}/${locale}${path}` : `${base}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }))
  )
}
