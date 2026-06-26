import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { YoutubeContent } from '../../components/portfolio/youtube-content'
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
    path: '/videos',
    title: `Video log — ${meta('title')}`,
    description:
      'Devlogs and breakdowns from the YouTube channel, laid out on a timeline with inline playback.',
  })
}

export default async function VideosPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as AppLocale)

  return (
    <PortfolioProviders>
      <PortfolioShell>
        <YoutubeContent />
      </PortfolioShell>
    </PortfolioProviders>
  )
}
