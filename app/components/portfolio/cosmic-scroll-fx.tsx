'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'
import type { CosmicRenderMode } from './fx-runtime'
import type { PerformanceTier } from './performance-tier'
import { COSMIC_STAR_COUNTS } from './performance-tier'

type StarSpec = {
  x: number
  y: number
  size: number
  delay: number
  duration: number
  cool: boolean
  drift: number
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildStars(count: number): StarSpec[] {
  const rand = mulberry32(0x5f3759df)
  return Array.from({ length: count }, (_, index) => ({
    x: rand() * 100,
    y: rand() * 52,
    size: rand() > 0.85 ? 2.5 : 1.5,
    delay: rand() * 5,
    duration: 3 + rand() * 4,
    cool: index % 5 === 0,
    drift: 4 + rand() * 8,
  }))
}

function StarField({
  stars,
  opacity,
  reduced,
}: {
  stars: StarSpec[]
  opacity: number
  reduced: boolean
}) {
  return (
    <motion.div className="cosmic-scroll-layer-motion absolute inset-0" style={{ opacity }}>
      {stars.map((star, index) => (
        <span
          key={index}
          className={`cosmic-star cosmic-scroll-star absolute rounded-full ${
            star.cool
              ? 'bg-violet/90 shadow-[0_0_8px_var(--violet)]'
              : 'bg-white/80 shadow-[0_0_6px_var(--cyan)]'
          } ${reduced ? 'opacity-70' : 'cosmic-star-twinkle'}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            ['--cosmic-drift' as string]: `${star.drift}px`,
          }}
        />
      ))}
    </motion.div>
  )
}

function MysticNebula({
  opacity,
  drift = true,
}: {
  opacity: number
  drift?: boolean
}) {
  const nebulaA = drift ? 'cosmic-nebula-a' : 'cosmic-nebula-static'
  const nebulaB = drift ? 'cosmic-nebula-b' : 'cosmic-nebula-static cosmic-nebula-static-b'

  return (
    <div className="cosmic-scroll-nebula-layer absolute inset-0 overflow-hidden" style={{ opacity }}>
      <div
        className={`${nebulaA} absolute -left-[12%] top-[0%] h-[34rem] w-[40rem] rounded-full bg-[radial-gradient(ellipse,oklch(0.55_0.24_295/0.16),transparent_72%)]`}
      />
      <div
        className={`${nebulaB} absolute right-[0%] top-[6%] h-[28rem] w-[36rem] rounded-full bg-[radial-gradient(ellipse,oklch(0.84_0.16_200/0.12),transparent_74%)]`}
      />
    </div>
  )
}

type CosmicBodyProps = {
  mode: CosmicRenderMode
  tier: PerformanceTier
  nested?: boolean
}

function CosmicBody({ mode, tier, nested = false }: CosmicBodyProps) {
  const counts = COSMIC_STAR_COUNTS[tier]
  const starCount = mode === 'lite' ? counts.lite : mode === 'medium' ? counts.medium : counts.full
  const stars = useMemo(() => buildStars(starCount), [starCount])

  const rootClass = nested
    ? 'cosmic-scroll-fx-root cosmic-scroll-fx-root--nested absolute inset-0 overflow-hidden bg-[oklch(0.08_0.012_270)]'
    : 'cosmic-scroll-fx-root fixed inset-0 overflow-hidden bg-[oklch(0.08_0.012_270)]'

  if (mode === 'lite') {
    return (
      <div className={rootClass}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_0%,oklch(0.14_0.02_270/0.35),transparent_62%)]" />
        <MysticNebula opacity={0.38} drift={false} />
        <StarField stars={stars} opacity={0.75} reduced />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_72%,oklch(0.08_0.012_270/0.28)_100%)]" />
      </div>
    )
  }

  if (mode === 'medium') {
    return (
      <div className={rootClass}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_0%,oklch(0.14_0.02_270/0.35),transparent_62%)]" />
        <MysticNebula opacity={0.45} drift={false} />
        <StarField stars={stars} opacity={0.7} reduced />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_72%,oklch(0.08_0.012_270/0.28)_100%)]" />
      </div>
    )
  }

  return (
    <div className={rootClass}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_0%,oklch(0.14_0.02_270/0.35),transparent_62%)]" />
      <MysticNebula opacity={0.48} drift />
      <StarField stars={stars} opacity={0.78} reduced={false} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_72%,oklch(0.08_0.012_270/0.28)_100%)]" />
    </div>
  )
}

export function CosmicScrollFx({
  idleMode,
  scrollDegraded,
  tier = 'mid',
}: {
  idleMode: CosmicRenderMode
  scrollDegraded: boolean
  tier?: PerformanceTier
}) {
  const reduced = useReducedMotion()

  if (reduced || idleMode === 'lite') {
    const showLite = reduced || scrollDegraded || idleMode === 'lite'
    return <CosmicBody mode={showLite ? 'lite' : idleMode} tier={tier} />
  }

  return (
    <div
      className="cosmic-scroll-fx-stack pointer-events-none fixed inset-0 z-0 overflow-hidden"
      data-cosmic-idle={scrollDegraded ? 'off' : 'on'}
      data-cosmic-scroll={scrollDegraded ? 'on' : 'off'}
      aria-hidden
    >
      <div className="cosmic-scroll-fx-crossfade cosmic-scroll-fx-crossfade--idle">
        <CosmicBody mode={idleMode} tier={tier} nested />
      </div>
      <div className="cosmic-scroll-fx-crossfade cosmic-scroll-fx-crossfade--scroll">
        <CosmicBody mode="lite" tier={tier} nested />
      </div>
    </div>
  )
}
