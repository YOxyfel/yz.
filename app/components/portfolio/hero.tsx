'use client'

import dynamic from 'next/dynamic'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDeviceProfile } from './device-profile'
import { scrollToHashTarget } from './hash-scroll-bridge'
import { StationButton, StationChip, StationLed } from './station-console'

const HeroAnimated = dynamic(
  () => import('./hero-animated').then((mod) => ({ default: mod.HeroAnimated })),
  { ssr: true }
)

function HeroStatic() {
  const t = useTranslations('Hero')

  return (
    <section
      id="top"
      data-station-tone="bridge"
      className="station-section station-section--bridge relative flex min-h-[calc(100svh-var(--site-nav-spacer-height))] scroll-mt-[5.5rem] flex-col items-center justify-center !py-0"
    >
      <div className="station-section-inner">
        <div className="hero-bridge relative z-[1]">
          <span className="mb-5 inline-flex items-center gap-2.5 station-chip station-chip-active px-4 py-2 text-[10px]">
            <StationLed active />
            {t('badge')}
          </span>

          <h1 className="mx-auto max-w-3xl text-balance font-heading text-3xl font-bold tracking-tight sm:text-5xl">
            {t('headline')}
          </h1>

          <p className="mt-4 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {t('name')}
            <span className="text-muted-foreground"> · </span>
            <span className="text-base font-medium text-muted-foreground sm:text-lg">{t('role')}</span>
          </p>

          <div className="hero-bridge-readout">
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t('positioning')}
            </p>
            <div className="hero-bridge-stack">
              <StationChip className="!text-[10px]">UE5</StationChip>
              <StationChip className="!text-[10px]">C++</StationChip>
              <StationChip className="!text-[10px]">{t('stackAi')}</StationChip>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <StationButton href="#engine" variant="primary">
              {t('ctaWork')}
            </StationButton>
            <StationButton href="#contact" variant="secondary">
              {t('ctaContact')}
            </StationButton>
          </div>

          <button
            type="button"
            aria-label={t('scrollLabel')}
            className="hero-bridge-scroll"
            onClick={() => scrollToHashTarget('explore', 'auto')}
          >
            {t('scrollLabel')}
            <ChevronDown className="h-3.5 w-3.5 text-cyan" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  )
}

export function Hero() {
  const { mobilePerfCut } = useDeviceProfile()
  if (mobilePerfCut) return <HeroStatic />
  return <HeroAnimated />
}
