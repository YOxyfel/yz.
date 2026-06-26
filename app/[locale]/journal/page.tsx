import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JournalContent } from '../../components/portfolio/journal-content'
import { PortfolioProviders } from '../../components/portfolio/portfolio-providers'
import { PortfolioShell } from '../../components/portfolio/portfolio-shell'
import { routing, type AppLocale } from '../../../i18n/routing'
import { buildPageMetadata } from '../../../lib/page-metadata'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const meta = await getTranslations({ locale, namespace: 'Metadata' })
  return buildPageMetadata({
    locale,
    path: '/journal',
    title: `Journal — ${meta('title')}`,
    description:
      'A flip-through journal of build notes from the station — each entry opens with tags and an expandable summary.',
  })
}

export default async function JournalPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as AppLocale)

  return (
    <PortfolioProviders>
      <PortfolioShell>
        <JournalContent />
      </PortfolioShell>
    </PortfolioProviders>
  )
}
