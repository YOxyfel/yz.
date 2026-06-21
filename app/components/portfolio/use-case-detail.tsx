'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { UseCase } from './use-cases-data'
import { PageCtaPanel } from './page-cta-panel'
import {
  StationChip,
  StationLed,
  StationPanel,
  StationSection,
} from './station-console'

export function UseCaseDetail({ useCase }: { useCase: UseCase }) {
  const t = useTranslations('UseCases')
  const locale = useLocale()

  return (
    <StationSection className="!pt-28">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/${locale}/services`}
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-cyan"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t('backToBriefs')}
        </Link>

        <StationPanel variant="module" backLabel="USE-CASE" className="mb-10">
          <p className="station-readout-label flex items-center gap-2">
            <StationLed active pulse />
            {t('detailEyebrow')}
          </p>
          <h1 className="font-heading mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {useCase.title}
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            {useCase.tagline}
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{useCase.audience}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {useCase.stack.map((item) => (
              <StationChip key={item}>{item}</StationChip>
            ))}
          </div>
        </StationPanel>

        <div className="space-y-8">
          <DetailBlock title={t('challengesTitle')} items={useCase.challenges} />
          <DetailBlock title={t('approachTitle')} items={useCase.approach} />
          <DetailBlock title={t('outcomesTitle')} items={useCase.outcomes} />
        </div>

        <PageCtaPanel body={t('detailCtaBody')} primaryLabel={t('detailCta')} className="mt-12" />
      </div>
    </StationSection>
  )
}

function DetailBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <StationPanel variant="module" backLabel="BRIEF">
      <h2 className="font-heading text-2xl font-bold tracking-tight">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-pretty text-sm leading-relaxed text-muted-foreground"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </StationPanel>
  )
}
