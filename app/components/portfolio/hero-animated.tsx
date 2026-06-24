'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSyncExternalStore } from 'react'
import { MEDIA_HERO_VIDEO } from './breakpoints'
import { useDeviceProfile } from './device-profile'
import { scrollToHashTarget } from './hash-scroll-bridge'
import { StationButton, StationChip, StationLed } from './station-console'
import { HeroHeaderVideo } from './hero-header-video'

function useHeroVideoViewport() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia(MEDIA_HERO_VIDEO)
      media.addEventListener('change', onStoreChange)
      return () => media.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(MEDIA_HERO_VIDEO).matches,
    () => false
  )
}

export function HeroAnimated() {
  const { isNarrow, isTablet, prefersReducedMotion, performanceTier, isDesktop } = useDeviceProfile()
  const reducedMotion = useReducedMotion() || prefersReducedMotion || isNarrow
  const showHeroBlob = isDesktop && performanceTier === 'high' && !reducedMotion
  const heroVideoViewport = useHeroVideoViewport()
  const t = useTranslations('Hero')

  const showHeroVideo = heroVideoViewport && isDesktop && !reducedMotion
  const showHeroPoster = isTablet && !isNarrow && !reducedMotion
  const showHeroMedia = showHeroVideo || showHeroPoster
  const heroMediaVariant = showHeroVideo ? 'video' : showHeroPoster ? 'poster' : null

  return (
    <section
      id="top"
      data-station-tone="bridge"
      className="station-section station-section--bridge relative flex min-h-[calc(100dvh-var(--site-nav-spacer-height))] scroll-mt-[5.5rem] flex-col items-center justify-center !py-0"
    >
      {!isNarrow && showHeroBlob ? (
        <div
          aria-hidden
          className="hero-ambient-blob bg-fx-soft-blob bg-fx-soft-blob-cyan absolute left-1/3 top-1/3 -z-10 h-56 w-56 animate-breathe"
        />
      ) : null}

      <div className="station-section-inner">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
          }
          className={`hero-bridge relative z-[1]${showHeroMedia ? ' hero-bridge--with-media' : ''}${heroMediaVariant === 'video' ? ' hero-bridge--with-video' : ''}`}
        >
          <div className="hero-bridge-main">
            <motion.span
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2.5 station-chip station-chip-active px-4 py-2 text-[10px]"
            >
              <StationLed active pulse={!reducedMotion} />
              {t('badge')}
            </motion.span>

            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.75, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }
              }
              className="hero-bridge-headline mx-auto max-w-3xl text-balance font-heading text-3xl font-bold tracking-tight sm:text-5xl md:text-[3.25rem] md:leading-[1.08]"
            >
              {t('headline')}
            </motion.h1>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.18 }}
              className="mt-4 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
            >
              {t('name')}
              <span className="text-muted-foreground"> · </span>
              <span className="text-base font-medium text-muted-foreground sm:text-lg">{t('role')}</span>
            </motion.p>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.28 }}
              className="hero-bridge-readout"
            >
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t('positioning')}
              </p>
              <div className="hero-bridge-stack">
                <StationChip className="!text-[10px]">UE5</StationChip>
                <StationChip className="!text-[10px]">C++</StationChip>
                <StationChip className="!text-[10px]">{t('stackAi')}</StationChip>
              </div>
            </motion.div>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.38 }}
              className="hero-bridge-actions mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4"
            >
              <StationButton href="#engine" variant="primary">
                {t('ctaWork')}
              </StationButton>
              <StationButton href="#contact" variant="secondary">
                {t('ctaContact')}
              </StationButton>
            </motion.div>

            <motion.button
              type="button"
              aria-label={t('scrollLabel')}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.9 }}
              className="hero-bridge-scroll"
              onClick={() => scrollToHashTarget('explore', reducedMotion ? 'auto' : 'smooth')}
            >
              {t('scrollLabel')}
            <ChevronDown className="hero-bridge-scroll-icon h-3.5 w-3.5 text-cyan" aria-hidden />
          </motion.button>
          </div>

          {heroMediaVariant ? (
            <div className="hero-bridge-media">
              <HeroHeaderVideo variant={heroMediaVariant} />
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  )
}
