import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { DevTimelineContent } from '../../components/portfolio/dev-timeline-content'
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
    path: '/timeline',
    title: `Development timeline — ${meta('title')}`,
    description:
      'The build history of this site, tied to its git version tags. Scroll the log and the matching iteration rotates into view.',
  })
}

export default async function TimelinePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as AppLocale)

  return (
    <PortfolioProviders>
      <PortfolioShell>
        <DevTimelineContent />
      </PortfolioShell>
    </PortfolioProviders>
  )
}
