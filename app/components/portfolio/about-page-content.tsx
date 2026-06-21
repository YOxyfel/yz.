'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { KeyTakeaways } from './key-takeaways'
import { PageCtaPanel } from './page-cta-panel'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { DifferentiationSection } from './differentiation-section'
import { SocialProofSection } from './social-proof-section'
import { TestimonialsSection } from './testimonials-section'
import { StationButton, StationChip, StationPanel } from './station-console'

export function AboutPageContent() {
  const t = useTranslations('AboutPage')
  const tSite = useTranslations('SitePages')
  const locale = useLocale()
  const values = t.raw('values') as Array<{ title: string; body: string }>
  const eeatItems = t.raw('eeatItems') as string[]
  const takeaways = t.raw('takeaways') as string[]

  return (
    <SitePageLayout
      breadcrumbs={[
        { name: tSite('bridgeCrumb'), path: '' },
        { name: t('title'), path: '/about' },
      ]}
    >
      <SitePageHero eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

      <StationPanel variant="module" backLabel="BIO-01" className="mb-8">
        <p className="relative z-[1] text-pretty leading-relaxed text-muted-foreground">{t('bio')}</p>
      </StationPanel>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <StationPanel variant="module" backLabel="MIS-01" className="h-full">
          <StationChip className="station-chip-active mb-3 w-fit !text-[10px]">{t('missionLabel')}</StationChip>
          <p className="relative z-[1] text-pretty leading-relaxed text-muted-foreground">{t('mission')}</p>
        </StationPanel>
        <StationPanel variant="module" backLabel="VIS-01" className="h-full">
          <StationChip className="mb-3 w-fit !text-[10px]">{t('visionLabel')}</StationChip>
          <p className="relative z-[1] text-pretty leading-relaxed text-muted-foreground">{t('vision')}</p>
        </StationPanel>
      </div>

      <StationPanel variant="module" backLabel="VAL-01" className="mb-8">
        <h2 className="relative z-[1] font-heading text-2xl font-bold tracking-tight">{t('valuesTitle')}</h2>
        <div className="relative z-[1] mt-6 grid gap-4 sm:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-lg border border-[var(--station-bezel)]/35 bg-[var(--station-hull-dark)]/40 p-4"
            >
              <h3 className="font-heading text-base font-bold tracking-tight">{value.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </StationPanel>

      <DifferentiationSection showMissionVision={false} embedded className="mb-8" />

      <StationPanel variant="module" backLabel="EEAT" className="mb-8">
        <h2 className="relative z-[1] font-heading text-2xl font-bold tracking-tight">{t('eeatTitle')}</h2>
        <p className="relative z-[1] mt-3 text-pretty leading-relaxed text-muted-foreground">{t('eeatBody')}</p>
        <ul className="relative z-[1] mt-4 space-y-2.5">
          {eeatItems.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-pretty text-sm leading-relaxed text-muted-foreground"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet/80" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </StationPanel>

      <TestimonialsSection embedded showHeading={false} className="mb-8" />

      <StationPanel variant="module" backLabel="NOW-01">
        <h2 className="relative z-[1] font-heading text-2xl font-bold tracking-tight">{t('nowTitle')}</h2>
        <p className="relative z-[1] mt-3 text-pretty leading-relaxed text-muted-foreground">{t('nowBody')}</p>
        <div className="relative z-[1] mt-6 flex flex-wrap gap-3">
          <StationButton href={`/${locale}/case-studies`} variant="secondary">
            {t('caseStudiesCta')}
            <ArrowUpRight className="h-4 w-4" />
          </StationButton>
          <Link
            href={`/${locale}/services`}
            className="station-button station-button-ghost inline-flex items-center gap-2 !text-[11px]"
          >
            {t('servicesCta')}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </StationPanel>

      <KeyTakeaways title={t('takeawaysTitle')} items={takeaways} />

      <PageCtaPanel className="mt-8" body={t('ctaBody')} primaryLabel={t('cta')} />
    </SitePageLayout>
  )
}
