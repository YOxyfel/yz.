'use client'

import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { JsonLd } from './json-ld'
import { buildFaqSchema } from '../../../lib/structured-data'
import { SectionHeading } from './section-heading'
import { StationPanel, StationSection } from './station-console'

export function FaqSection() {
  const t = useTranslations('Faq')
  const items = t.raw('items') as Array<{ question: string; answer: string }>
  const schema = buildFaqSchema(items)

  return (
    <StationSection id="faq" tone="faq" className="perf-deferred-section">
      <JsonLd data={schema} />
      <SectionHeading
        tone="faq"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <div className="station-faq-list mt-12">
        {items.map((item, index) => (
          <StationPanel
            key={item.question}
            variant="module"
            backLabel={`FAQ-${String(index + 1).padStart(2, '0')}`}
            className="station-faq-item"
          >
            <details className="station-faq-details relative z-[1] group">
              <summary className="station-faq-summary">
                <span className="font-heading text-base font-bold tracking-tight sm:text-lg">
                  {item.question}
                </span>
                <ChevronDown className="station-faq-chevron h-5 w-5 shrink-0 text-cyan" aria-hidden />
              </summary>
              <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.answer}
              </p>
            </details>
          </StationPanel>
        ))}
      </div>
    </StationSection>
  )
}
