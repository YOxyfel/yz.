'use client'

import { useLocale, useTranslations } from 'next-intl'
import { PageCtaPanel } from './page-cta-panel'
import type { AudiencePage } from './audience-pages-data'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { StationPanel } from './station-console'

export function AudiencePageContent({ page }: { page: AudiencePage }) {
  const t = useTranslations('AudiencePage')
  const locale = useLocale()

  return (
    <SitePageLayout backHref={`/${locale}/services`}>
      <SitePageHero
        eyebrow={t('eyebrow')}
        title={page.title}
        description={page.tagline}
      />

      <div className="space-y-8">
        <ListPanel title={t('painTitle')} items={page.painPoints} label="PAIN" />
        <ListPanel title={t('offerTitle')} items={page.offerings} label="SRV" accent />
        <ListPanel title={t('outcomeTitle')} items={page.outcomes} label="OUT" />
      </div>

      <PageCtaPanel className="mt-12" body={t('ctaBody')} primaryLabel={t('cta')} />
    </SitePageLayout>
  )
}

function ListPanel({
  title,
  items,
  label,
  accent = false,
}: {
  title: string
  items: string[]
  label: string
  accent?: boolean
}) {
  return (
    <StationPanel variant="module" backLabel={label}>
      <h2 className="relative z-[1] font-heading text-2xl font-bold tracking-tight">{title}</h2>
      <ul className="relative z-[1] mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-pretty text-sm leading-relaxed text-muted-foreground"
          >
            <span
              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${accent ? 'bg-cyan' : 'bg-violet/80'}`}
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </StationPanel>
  )
}
