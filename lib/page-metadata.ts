import type { Metadata } from 'next'
import { absoluteUrl } from './site-config'

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string
  path: string
  title: string
  description: string
}): Metadata {
  const canonical = absoluteUrl(path, locale)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
  }
}
