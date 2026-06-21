import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PortfolioProviders } from '../../components/portfolio/portfolio-providers'
import { PortfolioShell } from '../../components/portfolio/portfolio-shell'
import { PricingPageContent } from '../../components/portfolio/pricing-page-content'
import { routing, type AppLocale } from '../../../i18n/routing'
import { buildPageMetadata } from '../../../lib/page-metadata'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PricingPage' })
  const meta = await getTranslations({ locale, namespace: 'Metadata' })
  return buildPageMetadata({
    locale,
    path: '/pricing',
    title: `${t('title')} — ${meta('title')}`,
    description: t('description'),
  })
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as AppLocale)

  return (
    <PortfolioProviders>
      <PortfolioShell>
        <PricingPageContent />
      </PortfolioShell>
    </PortfolioProviders>
  )
}
