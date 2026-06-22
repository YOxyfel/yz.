'use client'

import { ArrowUpRight, Play, Users } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { SectionHeading } from './section-heading'
import { StationButton, StationChip, StationPanel, StationSection } from './station-console'

type SocialProofSectionProps = {
  embedded?: boolean
  showHeading?: boolean
  className?: string
}

export function SocialProofSection({
  embedded = false,
  showHeading = true,
  className,
}: SocialProofSectionProps = {}) {
  const t = useTranslations('SocialProof')
  const locale = useLocale()

  const content = (
    <>
      {showHeading ? (
        <SectionHeading
          tone="signal"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />
      ) : null}

      <StationPanel
        variant="module"
        backLabel="PRT-00"
        className={showHeading ? 'mt-10' : ''}
      >
        <div className="relative z-[1] flex flex-col items-center py-4 text-center sm:py-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-cyan/35 bg-cyan/5 text-cyan">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="font-heading mt-4 text-xl font-bold tracking-tight">{t('emptyPartnersTitle')}</h3>
          <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
            {t('emptyPartnersBody')}
          </p>
          <StationButton href={`/${locale}#contact`} variant="primary" className="mt-6">
            {t('emptyPartnersCta')}
            <ArrowUpRight className="h-4 w-4" />
          </StationButton>
        </div>
      </StationPanel>

      <StationPanel variant="module" backLabel="REEL" flip flipOnView className={showHeading ? 'mt-8' : 'mt-8'}>
        <div className="relative z-[1] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-violet/35 bg-violet/10 text-violet">
              <Play className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-lg font-bold tracking-tight">{t('videoTitle')}</h3>
                <StationChip className="!text-[9px]">{t('videoSoonLabel')}</StationChip>
              </div>
              <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
                {t('videoBody')}
              </p>
            </div>
          </div>
          <span
            className="station-button station-button-secondary inline-flex shrink-0 cursor-not-allowed items-center gap-2 opacity-60"
            aria-disabled="true"
          >
            {t('videoSoonLabel')}
          </span>
        </div>
      </StationPanel>

      <p className={`text-pretty text-xs leading-relaxed text-muted-foreground ${showHeading ? 'mt-6' : 'mt-4'}`}>
        {t('caseStudyNote')}{' '}
        <Link href={`/${locale}/case-studies`} className="text-cyan transition-colors hover:text-foreground">
          {t('caseStudyLink')}
        </Link>
        .
      </p>
    </>
  )

  if (embedded) {
    return <div className={className ?? 'mb-12'}>{content}</div>
  }

  return (
    <StationSection
      id="proof"
      tone="signal"
      className={className ?? 'perf-deferred-section'}
    >
      {content}
    </StationSection>
  )
}
