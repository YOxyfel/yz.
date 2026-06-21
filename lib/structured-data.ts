import { getSiteUrl } from './site-config'

export type FaqItem = { question: string; answer: string }

export type BreadcrumbItem = { name: string; path: string }

export function buildPersonSchema(locale: string) {
  const url = `${getSiteUrl()}/${locale}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Yane Zhekov',
    jobTitle: 'Technical Game Developer',
    url,
    email: 'mailto:yane.zhekov@proton.me',
    knowsAbout: [
      'Unreal Engine 5',
      'Gameplay Ability System',
      'C++ gameplay programming',
      'Modular game architecture',
    ],
    sameAs: ['https://github.com/yanezhekov', 'https://linkedin.com/in/yanezhekov'],
  }
}

export function buildWebSiteSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Yane Zhekov — UE5 Gameplay Systems',
    url: `${getSiteUrl()}/${locale}`,
    inLanguage: locale === 'bg' ? 'bg-BG' : 'en-US',
    publisher: {
      '@type': 'Person',
      name: 'Yane Zhekov',
    },
  }
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function buildBreadcrumbSchema(locale: string, items: BreadcrumbItem[]) {
  const base = `${getSiteUrl()}/${locale}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path === '' ? base : `${base}${item.path}`,
    })),
  }
}

export function buildArticleSchema({
  locale,
  title,
  description,
  path,
  datePublished,
}: {
  locale: string
  title: string
  description: string
  path: string
  datePublished?: string
}) {
  const url = `${getSiteUrl()}/${locale}${path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: 'Yane Zhekov',
    },
    publisher: {
      '@type': 'Person',
      name: 'Yane Zhekov',
    },
    url,
    mainEntityOfPage: url,
    inLanguage: locale === 'bg' ? 'bg-BG' : 'en-US',
    ...(datePublished ? { datePublished } : {}),
  }
}

export function buildVideoSchema({
  locale,
  title,
  description,
  path,
  thumbnailUrl,
  uploadDate,
}: {
  locale: string
  title: string
  description: string
  path: string
  thumbnailUrl?: string
  uploadDate?: string
}) {
  const url = `${getSiteUrl()}/${locale}${path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    url,
    uploadDate: uploadDate ?? '2026-01-01',
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    publisher: {
      '@type': 'Person',
      name: 'Yane Zhekov',
    },
    inLanguage: locale === 'bg' ? 'bg-BG' : 'en-US',
  }
}
