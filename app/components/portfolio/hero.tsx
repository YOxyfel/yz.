'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
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

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
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
              Bridge online — available for technical roles
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24, filter: reducedMotion ? 'blur(0px)' : 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="hero-title-scale font-heading text-balance font-bold tracking-tight sm:text-7xl md:text-8xl lg:leading-[0.9]"
            >
              YANE{' '}
              <span className="text-glow-cyan bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text">
                ZHEKOV
              </span>
            </motion.h1>

            <StationScreen className="mt-6 w-full max-w-xl px-5 py-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="relative z-[1] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium sm:text-base"
              >
                <span className="text-muted-foreground">Technical Game Developer</span>
                <span className="hidden text-white/20 sm:inline">|</span>
                <span className="text-glow-cyan font-mono text-cyan">UE5</span>
                <span className="text-white/20">•</span>
                <span className="font-mono text-foreground">C++</span>
                <span className="text-white/20">•</span>
                <span className="text-glow-violet font-mono text-violet">Lua</span>
              </motion.div>
            </StationScreen>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <StationButton href="#engine" variant="primary">
                View My Work
              </StationButton>
              <StationButton href="#contact" variant="secondary">
                Get in Touch
              </StationButton>
            </motion.div>
          </div>
        </StationPanel>
      </motion.div>

      <motion.a
        href="#engine"
        aria-label="Scroll down"
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
