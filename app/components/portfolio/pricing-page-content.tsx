'use client'

import { ArrowUpRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { KeyTakeaways } from './key-takeaways'
import { PageCtaPanel } from './page-cta-panel'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { StationButton, StationChip, StationPanel } from './station-console'

export function PricingPageContent() {
  const t = useTranslations('PricingPage')
  const tSite = useTranslations('SitePages')
  const locale = useLocale()
  const tiers = t.raw('tiers') as Array<{
    title: string
    price: string
    body: string
    includes: string[]
    cta: string
  }>
  const takeaways = t.raw('takeaways') as string[]

  return (
    <SitePageLayout
      breadcrumbs={[
        { name: tSite('bridgeCrumb'), path: '' },
        { name: t('title'), path: '/pricing' },
      ]}
    >
      <SitePageHero eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

      <StationPanel variant="module" backLabel="NOTE" className="mb-8">
        <p className="relative z-[1] text-pretty leading-relaxed text-muted-foreground">{t('intro')}</p>
      </StationPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        {tiers.map((tier, index) => (
          <StationPanel
            key={tier.title}
            variant="display"
            fill
            flipDelay={index * 0.06}
            backLabel={`T${String(index + 1).padStart(2, '0')}`}
            className="h-full"
          >
            <div className="station-screen-body flex h-full flex-col">
              <StationChip className="station-chip-active w-fit !text-[10px]">{tier.price}</StationChip>
              <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight">{tier.title}</h2>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{tier.body}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {tier.includes.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-pretty text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <StationButton href={`/${locale}#contact`} variant="secondary" className="mt-6 w-full justify-center">
                {tier.cta}
                <ArrowUpRight className="h-4 w-4" />
              </StationButton>
            </div>
          </StationPanel>
        ))}
      </div>

      <KeyTakeaways title={t('takeawaysTitle')} items={takeaways} />

      <PageCtaPanel
        className="mt-10"
        body={t('footerBody')}
        primaryLabel={t('footerPrimary')}
        secondaryLabel={t('footerSecondary')}
        secondaryHref="/services"
        backLabel="SCOPE"
      />
    </SitePageLayout>
  )
}
