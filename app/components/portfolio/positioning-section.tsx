'use client'

import { Cpu, Palette, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SectionHeading } from './section-heading'
import { StationChip, StationPanel, StationSection } from './station-console'

const problemIcons = [Cpu, Palette, Sparkles] as const

type PositioningSectionProps = {
  sectionId?: string
  className?: string
  embedded?: boolean
}

export function PositioningSection({
  sectionId = 'mission',
  className,
  embedded = false,
}: PositioningSectionProps = {}) {
  const t = useTranslations('Positioning')
  const problems = t.raw('problems') as Array<{ title: string; body: string }>

  const content = (
    <>
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {problems.map((problem, index) => {
          const Icon = problemIcons[index] ?? Cpu
          return (
            <StationPanel
              key={problem.title}
              variant="module"
              fill
              flipDelay={index * 0.08}
              backLabel={`SYS-${String(index + 1).padStart(2, '0')}`}
              className="h-full"
            >
              <div className="relative z-[1] flex h-full flex-col">
                <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan/35 bg-cyan/10 text-cyan">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <StationChip className="station-chip-active mb-3 w-fit !text-[10px]">
                  {t(`problemLabels.${index}`)}
                </StationChip>
                <h3 className="font-heading text-xl font-bold tracking-tight">{problem.title}</h3>
                <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {problem.body}
                </p>
              </div>
            </StationPanel>
          )
        })}
      </div>

      <p className="mx-auto mt-10 max-w-3xl text-pretty text-center leading-relaxed text-muted-foreground">
        {t('summary')}
      </p>

      <StationPanel variant="module" backLabel="PAIN-MAP" className="mx-auto mt-10 max-w-4xl">
        <p className="station-readout-label mb-4">{t('painPointsTitle')}</p>
        <ul className="relative z-[1] grid gap-3 sm:grid-cols-2">
          {(t.raw('painPoints') as string[]).map((point) => (
            <li
              key={point}
              className="flex gap-3 rounded-md border border-[var(--station-bezel)]/30 bg-[var(--station-hull-dark)]/40 px-3 py-2.5 text-pretty text-sm leading-relaxed text-muted-foreground"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400/90" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </StationPanel>
    </>
  )

  if (embedded) {
    return <div className={className ?? 'mb-12'}>{content}</div>
  }

  return (
    <StationSection id={sectionId} className={className ?? 'perf-deferred-section'}>
      {content}
    </StationSection>
  )
}
