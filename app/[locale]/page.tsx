import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PortfolioPage } from '../components/portfolio/portfolio-page'
import { PortfolioProviders } from '../components/portfolio/portfolio-providers'
import { setRequestLocale } from 'next-intl/server'
import { routing, type AppLocale } from '../../i18n/routing'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as AppLocale)

  return (
    <PortfolioProviders>
      <PortfolioPage />
    </PortfolioProviders>
  )
}
