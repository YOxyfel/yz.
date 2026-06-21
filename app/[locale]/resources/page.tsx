import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PortfolioProviders } from '../../components/portfolio/portfolio-providers'
import { PortfolioShell } from '../../components/portfolio/portfolio-shell'
import { ResourcesPageContent } from '../../components/portfolio/resources-page-content'
import { routing, type AppLocale } from '../../../i18n/routing'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ResourcesPage' })
  const meta = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: `${t('title')} — ${meta('title')}`,
    description: t('description'),
  }
}

export default async function ResourcesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as AppLocale)

  return (
    <PortfolioProviders>
      <PortfolioShell>
        <ResourcesPageContent />
      </PortfolioShell>
    </PortfolioProviders>
  )
}
