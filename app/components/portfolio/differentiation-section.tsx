'use client'

import { Bot, Layers, Radio, Target } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SectionHeading } from './section-heading'
import { StationChip, StationPanel, StationSection } from './station-console'

const differentiatorIcons = [Layers, Bot, Radio, Target] as const

type DifferentiationSectionProps = {
  showMissionVision?: boolean
  sectionId?: string
  className?: string
  embedded?: boolean
}

export function DifferentiationSection({
  showMissionVision = true,
  sectionId = 'differentiation',
  className,
  embedded = false,
}: DifferentiationSectionProps = {}) {
  const t = useTranslations('Differentiation')
  const differentiators = t.raw('differentiators') as Array<{ title: string; body: string }>
  const matrix = t.raw('valueMatrix') as {
    title: string
    headers: string[]
    rows: Array<{ label: string; values: string[] }>
  }

  const content = (
    <>
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      {showMissionVision ? (
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <StationPanel variant="module" fill backLabel="MIS-01" className="h-full">
            <StationChip className="station-chip-active mb-3 w-fit !text-[10px]">
              {t('missionLabel')}
            </StationChip>
            <h3 className="font-heading text-2xl font-bold tracking-tight">{t('missionTitle')}</h3>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t('missionBody')}</p>
          </StationPanel>

          <StationPanel variant="module" fill backLabel="VIS-01" className="h-full">
            <StationChip className="mb-3 w-fit !text-[10px]">{t('visionLabel')}</StationChip>
            <h3 className="font-heading text-2xl font-bold tracking-tight">{t('visionTitle')}</h3>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t('visionBody')}</p>
          </StationPanel>
        </div>
      ) : null}

      <div className={showMissionVision ? 'mt-14' : 'mt-12'}>
        <p className="station-readout-label mb-6">{t('differentiatorsTitle')}</p>
        <div className="grid gap-6 sm:grid-cols-2">
          {differentiators.map((item, index) => {
            const Icon = differentiatorIcons[index] ?? Layers
            return (
              <StationPanel
                key={item.title}
                variant="module"
                fill
                flipDelay={index * 0.06}
                backLabel={`DIF-${String(index + 1).padStart(2, '0')}`}
                className="h-full"
              >
                <div className="relative z-[1] flex gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet/35 bg-violet/10 text-violet">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-bold tracking-tight">{item.title}</h3>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </div>
              </StationPanel>
            )
          })}
        </div>
      </div>

      <StationPanel variant="module" backLabel="VAL-MAT" className="mt-14">
        <h3 className="font-heading text-2xl font-bold tracking-tight">{matrix.title}</h3>
        <div className="station-value-matrix relative z-[1] mt-6 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="station-value-matrix-corner pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t('matrixRowLabel')}
                </th>
                {matrix.headers.map((header, index) => (
                  <th
                    key={header}
                    className={`pb-3 px-3 font-mono text-[10px] uppercase tracking-[0.14em] ${
                      index === 0 ? 'text-cyan' : 'text-muted-foreground'
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row.label} className="border-t border-[var(--station-bezel)]/30">
                  <th className="py-3 pr-4 align-top font-medium text-foreground">{row.label}</th>
                  {row.values.map((value, index) => (
                    <td
                      key={`${row.label}-${index}`}
                      className={`py-3 px-3 align-top leading-relaxed ${
                        index === 0 ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StationPanel>
    </>
  )

  if (embedded) {
    return <div className={className ?? 'mb-12'}>{content}</div>
  }

  return (
    <StationSection
      id={sectionId}
      className={className ?? 'perf-deferred-section border-t border-[var(--station-bezel)]/20'}
    >
      {content}
    </StationSection>
  )
}
