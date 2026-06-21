'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDeviceProfile } from './device-profile'
import {
  StationButton,
  StationLed,
  StationPanel,
  StationScreen,
} from './station-console'

export function Hero() {
  const { isNarrow, prefersReducedMotion } = useDeviceProfile()
  const reducedMotion = useReducedMotion() || prefersReducedMotion || isNarrow
  const t = useTranslations('Hero')

  return (
    <section
      id="top"
      data-station-tone="bridge"
      className="station-section station-section--bridge relative flex min-h-screen scroll-mt-[5.5rem] flex-col items-center justify-center overflow-hidden !py-0 px-6"
    >
      <div className="station-sector-backdrop" aria-hidden />
      <div className="station-sector-rail" aria-hidden />
      {!isNarrow ? (
        <motion.div
          aria-hidden
          className="bg-fx-blur-blob absolute left-1/3 top-1/3 -z-10 h-56 w-56 rounded-full bg-cyan/10 blur-[100px]"
          animate={reducedMotion ? { opacity: 0.3 } : { opacity: [0.25, 0.4, 0.25] }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 10, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="station-hero-bridge w-full max-w-4xl"
      >
        <StationPanel
          variant="module"
          backLabel="BRIDGE-CORE"
          className="station-panel-spacious w-full max-w-4xl"
        >
          <div className="relative z-[1] flex flex-col items-center text-center">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2.5 station-chip station-chip-active px-4 py-2 text-[10px]"
            >
              <StationLed active pulse />
              {t('badge')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24, filter: reducedMotion ? 'blur(0px)' : 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="max-w-3xl text-balance font-heading text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:leading-[1.05]"
            >
              {t('headline')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-5 font-heading text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl"
            >
              {t('name')}
            </motion.p>

            <StationScreen className="mt-6 w-full max-w-2xl px-5 py-4">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="relative z-[1] text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                {t('positioning')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="relative z-[1] mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[var(--station-bezel)]/30 pt-4 text-sm font-medium sm:text-base"
              >
                <span className="text-muted-foreground">{t('role')}</span>
                <span className="hidden text-white/20 sm:inline">|</span>
                <span className="text-glow-cyan font-mono text-cyan">UE5</span>
                <span className="text-white/20">•</span>
                <span className="font-mono text-foreground">C++</span>
                <span className="text-white/20">•</span>
                <span className="text-glow-violet font-mono text-violet">{t('stackAi')}</span>
              </motion.div>
            </StationScreen>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <StationButton href="#engine" variant="primary">
                {t('ctaWork')}
              </StationButton>
              <StationButton href="#contact" variant="secondary">
                {t('ctaContact')}
              </StationButton>
            </motion.div>
          </div>
        </StationPanel>
      </motion.div>

      <motion.a
        href="#explore"
        aria-label={t('scrollLabel')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="station-hud-scroll flex h-11 w-7 items-start justify-center p-1.5">
          <ChevronDown className="h-4 w-4 text-cyan" />
        </div>
      </motion.a>
    </section>
  )
}
