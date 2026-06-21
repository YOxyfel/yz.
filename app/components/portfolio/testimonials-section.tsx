'use client'

import { ArrowUpRight, Quote } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { SectionHeading } from './section-heading'
import { StationButton, StationChip, StationPanel, StationSection } from './station-console'
import { testimonials } from './testimonials-data'

type TestimonialsSectionProps = {
  embedded?: boolean
  limit?: number
  showHeading?: boolean
  className?: string
}

export function TestimonialsSection({
  embedded = false,
  limit,
  showHeading = true,
  className,
}: TestimonialsSectionProps = {}) {
  const t = useTranslations('Testimonials')
  const locale = useLocale()
  const items = limit ? testimonials.slice(0, limit) : testimonials

  const content = (
    <>
      {showHeading ? (
        <SectionHeading
          tone="partner"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />
      ) : null}

      {items.length === 0 ? (
        <StationPanel variant="module" backLabel="SIG-00" className={showHeading ? 'mt-10' : ''}>
          <div className="relative z-[1] flex flex-col items-center py-4 text-center sm:py-6">
            <Quote className="h-6 w-6 text-cyan/70" aria-hidden />
            <h3 className="font-heading mt-4 text-xl font-bold tracking-tight">{t('emptyTitle')}</h3>
            <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
              {t('emptyBody')}
            </p>
            <StationButton href={`/${locale}#contact`} variant="primary" className="mt-6">
              {t('emptyCta')}
              <ArrowUpRight className="h-4 w-4" />
            </StationButton>
          </div>
        </StationPanel>
      ) : (
        <div className={`grid gap-6 ${showHeading ? 'mt-10' : ''} ${embedded ? '' : 'md:grid-cols-2'}`}>
          {items.map((item, index) => (
            <StationPanel
              key={item.id}
              variant="module"
              fill
              flipDelay={index * 0.06}
              backLabel={`SIG-${String(index + 1).padStart(2, '0')}`}
              className="h-full"
            >
              <div className="relative z-[1] flex h-full flex-col">
                <Quote className="h-5 w-5 text-cyan/80" aria-hidden />
                <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground sm:text-base">
                  “{item.quote}”
                </blockquote>
                <footer className="mt-6 border-t border-[var(--station-bezel)]/30 pt-4">
                  <p className="font-heading text-sm font-bold tracking-tight">{item.name}</p>
                  <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
                    {item.title} · {item.company}
                  </p>
                </footer>
              </div>
            </StationPanel>
          ))}
        </div>
      )}

      <p className={`text-pretty text-sm leading-relaxed text-muted-foreground ${showHeading ? 'mt-8' : 'mt-6'}`}>
        {t('honestyNote')}{' '}
        <Link href={`/${locale}/pricing`} className="text-cyan transition-colors hover:text-foreground">
          {t('pricingLink')}
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
      id="testimonials"
      tone="partner"
      className={className ?? 'perf-deferred-section'}
    >
      {content}
    </StationSection>
  )
}
