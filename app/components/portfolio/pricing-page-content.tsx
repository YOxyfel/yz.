'use client'

import { ArrowUpRight, ChevronDown, Lock, Plus } from 'lucide-react'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { KeyTakeaways } from './key-takeaways'
import { PageCtaPanel } from './page-cta-panel'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { StationButton, StationChip, StationPanel } from './station-console'

type PricingTier = {
  title: string
  price: string
  basePrice: string
  body: string
  includes: string[]
  addsOverPrev: string[]
  cta: string
}

export function PricingPageContent() {
  const t = useTranslations('PricingPage')
  const tSite = useTranslations('SitePages')
  const locale = useLocale()
  const tiers = t.raw('tiers') as PricingTier[]
  const takeaways = t.raw('takeaways') as string[]
  const [openCompare, setOpenCompare] = useState<number | null>(null)

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
        {tiers.map((tier, index) => {
          const prev = tiers[index - 1]
          const next = tiers[index + 1]
          const canCompare = Boolean(prev) || Boolean(next)
          const expanded = openCompare === index
          return (
            <StationPanel
              key={tier.title}
              variant="display"
              fill
              flipDelay={index * 0.06}
              backLabel={`T${String(index + 1).padStart(2, '0')}`}
              className="h-full"
            >
              <div className="station-screen-body flex h-full flex-col">
                <div className="pricing-tier-head">
                  <StationChip className="station-chip-active w-fit !text-[10px]">{tier.price}</StationChip>
                  <span className="pricing-base-price">
                    <span className="pricing-base-label">{t('baseLabel')}</span>
                    {tier.basePrice}
                  </span>
                </div>
                <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight">{tier.title}</h2>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{tier.body}</p>
                <ul className="mt-4 space-y-2">
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

                <div className="flex-1" />

                {canCompare ? (
                  <button
                    type="button"
                    className="pricing-compare-btn"
                    aria-expanded={expanded}
                    onClick={() => setOpenCompare(expanded ? null : index)}
                  >
                    {expanded ? t('compareHide') : t('compareLabel')}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden />
                  </button>
                ) : null}

                <div className="pricing-compare-panel" data-open={expanded ? 'true' : 'false'}>
                  <div className="pricing-compare-inner">
                    {prev && tier.addsOverPrev.length ? (
                      <div className="pricing-compare-group">
                        <p className="pricing-compare-title is-gain">
                          {t('compareGain')} <span>{prev.title}</span>
                        </p>
                        <ul className="pricing-compare-list">
                          {tier.addsOverPrev.map((item) => (
                            <li key={item}>
                              <Plus className="h-3.5 w-3.5" aria-hidden />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {next && next.addsOverPrev.length ? (
                      <div className="pricing-compare-group">
                        <p className="pricing-compare-title is-miss">
                          {t('compareMiss')} <span>{next.title}</span>
                        </p>
                        <ul className="pricing-compare-list is-miss">
                          {next.addsOverPrev.map((item) => (
                            <li key={item}>
                              <Lock className="h-3.5 w-3.5" aria-hidden />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>

                <StationButton href={`/${locale}#contact`} variant="secondary" className="mt-6 w-full justify-center">
                  {tier.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </StationButton>
              </div>
            </StationPanel>
          )
        })}
      </div>

      <p className="pricing-compare-note">{t('compareNote')}</p>

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
