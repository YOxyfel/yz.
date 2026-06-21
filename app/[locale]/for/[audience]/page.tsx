import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AudiencePageContent } from '../../../components/portfolio/audience-page-content'
import { audienceSlugs, getAudiencePage } from '../../../components/portfolio/audience-pages-data'
import { PortfolioProviders } from '../../../components/portfolio/portfolio-providers'
import { PortfolioShell } from '../../../components/portfolio/portfolio-shell'
import { routing, type AppLocale } from '../../../../i18n/routing'

type Props = { params: Promise<{ locale: string; audience: string }> }

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    audienceSlugs.map((audience) => ({ locale, audience }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, audience } = await params
  const page = getAudiencePage(audience)
  if (!page) return {}

  const meta = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: `${page.title} — ${meta('title')}`,
    description: page.tagline,
  }
}

export default async function ForAudiencePage({ params }: Props) {
  const { locale, audience } = await params

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound()
  }

  const page = getAudiencePage(audience)
  if (!page) {
    notFound()
  }

  setRequestLocale(locale as AppLocale)

  return (
    <PortfolioProviders>
      <PortfolioShell>
        <AudiencePageContent page={page} />
      </PortfolioShell>
    </PortfolioProviders>
  )
}
