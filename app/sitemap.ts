import type { MetadataRoute } from 'next'
import { audiencePages } from './components/portfolio/audience-pages-data'
import { useCaseSlugs } from './components/portfolio/use-cases-data'
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

  const entries = routing.locales.flatMap((locale) => {
    const localeEntries = staticPaths.map((path) => ({
      url: path ? `${base}/${locale}${path}` : `${base}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : path === '/resources' ? 0.85 : 0.8,
    }))

    const useCaseEntries = useCaseSlugs.map((slug) => ({
      url: `${base}/${locale}/use-cases/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    const audienceEntries = audiencePages.map((page) => ({
      url: `${base}/${locale}/for/${page.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...localeEntries, ...useCaseEntries, ...audienceEntries]
  })

  return entries
}
