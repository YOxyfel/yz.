import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type AppLocale } from '../../../../i18n/routing'
import { PortfolioProviders } from '../../../components/portfolio/portfolio-providers'
import { PortfolioShell } from '../../../components/portfolio/portfolio-shell'
import { UseCaseDetail } from '../../../components/portfolio/use-case-detail'
import { getUseCase, useCaseSlugs } from '../../../components/portfolio/use-cases-data'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    useCaseSlugs.map((slug) => ({ locale, slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const useCase = getUseCase(slug)
  if (!useCase) return {}

  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: `${useCase.title} — ${t('title')}`,
    description: useCase.tagline,
  }
}

export default async function UseCasePage({ params }: Props) {
  const { locale, slug } = await params

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound()
  }

  const useCase = getUseCase(slug)
  if (!useCase) {
    notFound()
  }

  setRequestLocale(locale as AppLocale)

  return (
    <PortfolioProviders>
      <PortfolioShell>
        <UseCaseDetail useCase={useCase} />
      </PortfolioShell>
    </PortfolioProviders>
  )
}
