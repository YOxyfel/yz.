'use client'

import { ArrowUpRight, BookOpen, Briefcase, Radio } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { SectionHeading } from './section-heading'
import { StationChip, StationPanel, StationSection } from './station-console'

const cardIcons = [BookOpen, Briefcase, Radio] as const
const cardHrefs = ['/about', '/services', '/case-studies'] as const

export function HomeHubSection() {
  const t = useTranslations('HomeHub')
  const locale = useLocale()
  const cards = t.raw('cards') as Array<{ title: string; body: string; cta: string }>

  return (
    <StationSection id="explore" tone="nav">
      <SectionHeading
        tone="nav"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = cardIcons[index] ?? BookOpen
          const href = `/${locale}${cardHrefs[index] ?? '/about'}`

          return (
            <Link key={card.title} href={href} className="station-card-link group h-full">
              <StationPanel
                variant="module"
                interactive
                fill
                flipDelay={index * 0.08}
                backLabel={`LNK-${String(index + 1).padStart(2, '0')}`}
                className="h-full"
              >
                <div className="relative z-[1] flex h-full flex-col">
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan/35 bg-cyan/10 text-cyan">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <StationChip className="station-chip-active mb-3 w-fit !text-[10px]">
                    {t(`cardLabels.${index}`)}
                  </StationChip>
                  <h3 className="font-heading text-xl font-bold tracking-tight">{card.title}</h3>
                  <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {card.body}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors group-hover:text-cyan">
                    {card.cta}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </StationPanel>
            </Link>
          )
        })}
      </div>
    </StationSection>
  )
}
