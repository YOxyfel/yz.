import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { headers } from 'next/headers'
import { MobileStaticHome } from '../components/portfolio/mobile-static-home'
import { setRequestLocale } from 'next-intl/server'
import { routing, type AppLocale } from '../../i18n/routing'
import { buildPageMetadata } from '../../lib/page-metadata'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return buildPageMetadata({
    locale,
    path: '',
    title: t('title'),
    description: t('description'),
  })
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as AppLocale)

  const headerStore = await headers()
  const serverMobile = headerStore.get('x-mobile-static') === '1'

  if (serverMobile) {
    return <MobileStaticHome locale={locale as AppLocale} />
  }

  const { DesktopHome } = await import('../components/portfolio/desktop-home')
  return <DesktopHome serverMobile={serverMobile} />
}
