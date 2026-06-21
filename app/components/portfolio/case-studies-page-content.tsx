'use client'

import { useTranslations } from 'next-intl'
import { PageCtaPanel } from './page-cta-panel'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { StationChip, StationPanel } from './station-console'

export function CaseStudiesPageContent() {
  const t = useTranslations('CaseStudiesPage')
  const tCase = useTranslations('CaseStudy')
  const tSite = useTranslations('SitePages')
  const sections = tCase.raw('sections') as Array<{ title: string; body: string }>
  const outcomes = tCase.raw('outcomes') as string[]

  return (
    <SitePageLayout
      breadcrumbs={[
        { name: tSite('bridgeCrumb'), path: '' },
        { name: t('title'), path: '/case-studies' },
      ]}
    >
      <SitePageHero eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

      <StationPanel variant="display" backLabel="CS-MAIN" className="mb-8">
        <div className="station-screen-body">
          <div className="flex flex-wrap items-center gap-2">
            <StationChip className="station-chip-active !text-[10px]">{tCase('status')}</StationChip>
            <StationChip className="!text-[10px]">UE5 · C++ · GAS</StationChip>
          </div>
          <h2 className="font-heading mt-4 text-3xl font-bold tracking-tight">{tCase('projectName')}</h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {tCase('projectSubtitle')}
          </p>
          <p className="mt-5 max-w-3xl text-pretty leading-relaxed text-muted-foreground">{tCase('summary')}</p>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {sections.map((section, index) => (
              <div
                key={section.title}
                className="rounded-lg border border-[var(--station-bezel)]/35 bg-[var(--station-hull-dark)]/50 p-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="font-heading mt-2 text-lg font-bold tracking-tight">{section.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p className="station-readout-label mb-3">{tCase('outcomesTitle')}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="flex gap-2 text-pretty text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-pretty text-sm leading-relaxed text-muted-foreground">{tCase('honesty')}</p>
        </div>
      </StationPanel>

      <PageCtaPanel className="mt-8" body={t('ctaBody')} secondaryLabel={t('projectsCta')} secondaryHref="#engine" />
    </SitePageLayout>
  )
}
