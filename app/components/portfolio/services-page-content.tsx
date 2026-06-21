'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { audiencePages } from './audience-pages-data'
import { KeyTakeaways } from './key-takeaways'
import { PageCtaPanel } from './page-cta-panel'
import { PositioningSection } from './positioning-section'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { SocialProofSection } from './social-proof-section'
import { TestimonialsSection } from './testimonials-section'
import { StationChip, StationPanel } from './station-console'
import { useCases } from './use-cases-data'

export function ServicesPageContent() {
  const t = useTranslations('ServicesPage')
  const tSite = useTranslations('SitePages')
  const locale = useLocale()
  const services = t.raw('services') as Array<{ title: string; body: string; slug: string }>
  const takeaways = t.raw('takeaways') as string[]

  return (
    <SitePageLayout
      breadcrumbs={[
        { name: tSite('bridgeCrumb'), path: '' },
        { name: t('title'), path: '/services' },
      ]}
    >
      <SitePageHero eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

      <PositioningSection embedded className="mb-12" />

      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service, index) => {
          const useCase = useCases.find((item) => item.slug === service.slug)
          return (
            <StationPanel
              key={service.slug}
              variant="display"
              fill
              flipDelay={index * 0.06}
              backLabel={`SRV-${String(index + 1).padStart(2, '0')}`}
              className="h-full"
            >
              <div className="station-screen-body flex h-full flex-col">
                <StationChip className="w-fit !text-[10px]">{useCase?.stack[0] ?? 'UE5'}</StationChip>
                <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight">{service.title}</h2>
                <p className="mt-3 flex-1 text-pretty leading-relaxed text-muted-foreground">{service.body}</p>
                <Link
                  href={`/${locale}/use-cases/${service.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-cyan"
                >
                  {t('readBrief')}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </StationPanel>
          )
        })}
      </div>

      <StationPanel variant="module" backLabel="AUD-01" className="mt-12">
        <h2 className="relative z-[1] font-heading text-2xl font-bold tracking-tight">{t('audiencesTitle')}</h2>
        <p className="relative z-[1] mt-3 text-pretty leading-relaxed text-muted-foreground">
          {t('audiencesDescription')}
        </p>
        <div className="relative z-[1] mt-6 grid gap-4 sm:grid-cols-3">
          {audiencePages.map((page) => (
            <Link
              key={page.slug}
              href={`/${locale}/for/${page.slug}`}
              className="station-card-link group rounded-lg border border-[var(--station-bezel)]/35 bg-[var(--station-hull-dark)]/40 p-4 transition-colors hover:border-cyan/35"
            >
              <h3 className="font-heading text-lg font-bold tracking-tight group-hover:text-cyan">
                {page.title}
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{page.tagline}</p>
            </Link>
          ))}
        </div>
      </StationPanel>

      <TestimonialsSection embedded className="mt-12" />

      <SocialProofSection embedded className="mt-12" />

      <KeyTakeaways title={t('takeawaysTitle')} items={takeaways} />

      <PageCtaPanel className="mt-8" body={t('ctaBody')} primaryLabel={t('cta')} />
    </SitePageLayout>
  )
}
