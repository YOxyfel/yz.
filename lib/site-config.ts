const FALLBACK_SITE_URL = 'https://yanezhekov.dev'

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return fromEnv || FALLBACK_SITE_URL
}

export function absoluteUrl(path: string, locale = 'en') {
  const base = getSiteUrl()
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (normalized === '/' || normalized === `/${locale}`) {
    return `${base}/${locale}`
  }
  return `${base}/${locale}${normalized.startsWith(`/${locale}`) ? normalized.slice(locale.length + 1) : normalized}`
}
