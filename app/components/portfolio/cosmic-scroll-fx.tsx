'use client'

import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useMemo } from 'react'
import type { PerformanceTier } from './performance-tier'
import { COSMIC_STAR_COUNTS } from './performance-tier'
import { useDocumentScrollProgress } from './use-document-scroll-progress'
import { useViewportSize } from './use-viewport-size'

type StarSpec = {
  x: number
  y: number
  size: number
  delay: number
  duration: number
  cool: boolean
  drift: number
}

const DIMENSION_LAYERS = [
  { hue: 200, top: '12%' },
  { hue: 295, top: '42%' },
  { hue: 45, top: '72%' },
] as const

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
  opacity: MotionValue<number> | number
  reduced: boolean
}) {
  const style = typeof opacity === 'number' ? { opacity } : { opacity }

  return (
    <motion.div className="cosmic-scroll-layer-motion absolute inset-0" style={style}>
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

function MysticNebula({ opacity }: { opacity: MotionValue<number> | number }) {
  const style = typeof opacity === 'number' ? { opacity } : { opacity }

  return (
    <motion.div className="cosmic-scroll-nebula-layer absolute inset-0 overflow-hidden" style={style}>
      <div className="cosmic-nebula-a absolute -left-[8%] top-[2%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,oklch(0.55_0.24_295/0.14),transparent_70%)] blur-2xl md:blur-3xl" />
      <div className="cosmic-nebula-b absolute right-[4%] top-[8%] h-[22rem] w-[32rem] rounded-full bg-[radial-gradient(circle,oklch(0.84_0.16_200/0.1),transparent_72%)] blur-2xl md:blur-[80px]" />
    </motion.div>
  )
}

function DimensionRifts({
  opacity,
  shift1,
  shift2,
  shift3,
}: {
  opacity: MotionValue<number>
  shift1: MotionValue<number>
  shift2: MotionValue<number>
  shift3: MotionValue<number>
}) {
  const shifts = [shift1, shift2, shift3]

  return (
    <motion.div className="cosmic-scroll-layer-motion absolute inset-0" style={{ opacity }}>
      {DIMENSION_LAYERS.map((layer, index) => (
        <motion.div
          key={layer.hue}
          className="cosmic-scroll-rift absolute inset-x-[-8%] h-[32vh] opacity-70"
          style={{
            top: layer.top,
            y: shifts[index],
            background: `linear-gradient(105deg, transparent 0%, oklch(0.55 0.2 ${layer.hue} / 0.05) 40%, oklch(0.7 0.18 ${layer.hue} / 0.09) 50%, transparent 100%)`,
          }}
        />
      ))}
    </motion.div>
  )
}

function ScrollMeteor({
  x,
  y,
  scale,
  rotate,
  tailScale,
  opacity,
  crashOpacity,
  crashRing,
}: {
  x: MotionValue<number>
  y: MotionValue<number>
  scale: MotionValue<number>
  rotate: MotionValue<number>
  tailScale: MotionValue<number>
  opacity: MotionValue<number>
  crashOpacity: MotionValue<number>
  crashRing: MotionValue<number>
}) {
  return (
    <motion.div
      className="cosmic-scroll-meteor cosmic-scroll-layer-motion absolute left-0 top-0 z-[6] origin-center"
      style={{ x, y, scale, rotate, opacity }}
    >
      <motion.div
        className="cosmic-scroll-meteor-tail absolute right-[58%] top-1/2 h-[2px] origin-right -translate-y-1/2 rounded-full bg-gradient-to-l from-transparent via-cyan/50 to-white/80"
        style={{ width: 120, scaleX: tailScale }}
      />
      <motion.div
        className="cosmic-scroll-meteor-tail absolute right-[58%] top-1/2 h-[10px] w-[80px] origin-right -translate-y-1/2 rounded-full bg-gradient-to-l from-transparent via-cyan/20 to-cyan/35 opacity-70"
        style={{ scaleX: tailScale }}
      />
      <div className="relative h-7 w-7 sm:h-8 sm:w-8">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,white,oklch(0.84_0.16_200)_45%,oklch(0.45_0.2_280)_100%)] shadow-[0_0_18px_4px_oklch(0.84_0.16_200/0.45)]" />
        <motion.div
          className="cosmic-scroll-crash cosmic-scroll-layer-motion pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: crashOpacity, scale: crashRing }}
        >
          <div className="h-24 w-24 rounded-full bg-[radial-gradient(circle,oklch(0.84_0.16_200/0.28),transparent_68%)] blur-xl" />
          <div className="absolute inset-2 rounded-full border border-cyan/30 bg-[radial-gradient(circle,oklch(0.84_0.16_200/0.15),transparent_70%)]" />
        </motion.div>
      </div>
    </motion.div>
  )
}

function CosmicScrollFxLite({ starCount = 10 }: { starCount?: number }) {
  const stars = useMemo(() => buildStars(starCount), [starCount])

  return (
    <div className="cosmic-scroll-fx-root fixed inset-0 overflow-hidden bg-[oklch(0.08_0.012_270)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_0%,oklch(0.14_0.02_270/0.35),transparent_62%)]" />
      <MysticNebula opacity={0.38} />
      <StarField stars={stars} opacity={0.75} reduced />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_72%,oklch(0.08_0.012_270/0.28)_100%)]" />
    </div>
  )
}

function CosmicScrollFxMedium({ starCount }: { starCount: number }) {
  const stars = useMemo(() => buildStars(starCount), [starCount])

  return (
    <div className="cosmic-scroll-fx-root fixed inset-0 overflow-hidden bg-[oklch(0.08_0.012_270)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_0%,oklch(0.14_0.02_270/0.35),transparent_62%)]" />
      <MysticNebula opacity={0.45} />
      <StarField stars={stars} opacity={0.7} reduced />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_72%,oklch(0.08_0.012_270/0.28)_100%)]" />
    </div>
  )
}

function CosmicScrollFxFull({ starCount }: { starCount: number }) {
  const scrollYProgress = useDocumentScrollProgress()
  const { width: viewportWidth, height: viewportHeight } = useViewportSize()
  const stars = useMemo(() => buildStars(starCount), [starCount])

  const starOpacity = useTransform(scrollYProgress, [0, 0.35, 0.65], [1, 0.65, 0.2])
  const cosmicTopOpacity = useTransform(scrollYProgress, [0, 0.4, 0.7], [1, 0.5, 0])
  const dimensionOpacity = useTransform(scrollYProgress, [0, 0.2, 0.75], [0, 0.45, 0.7])
  const meteorOpacity = useTransform(scrollYProgress, [0, 0.05, 0.97, 1], [0.5, 0.85, 0.85, 0.35])

  const meteorX = useTransform(scrollYProgress, [0, 1], [viewportWidth * 0.1, viewportWidth * 0.72])
  const meteorY = useTransform(scrollYProgress, [0, 1], [viewportHeight * 0.02, viewportHeight * 0.86])
  const meteorScale = useTransform(scrollYProgress, [0, 0.6, 1], [0.45, 0.95, 1.35])
  const meteorRotate = useTransform(scrollYProgress, [0, 1], [32, 38])
  const meteorTail = useTransform(scrollYProgress, [0, 1], [0.5, 1.25])

  const crashOpacity = useTransform(scrollYProgress, [0, 0.94, 0.99, 1], [0, 0, 1, 0.55])
  const crashRing = useTransform(scrollYProgress, [0.94, 1], [0.2, 1.15])

  const layerShift1 = useTransform(scrollYProgress, [0, 1], [0, 90])
  const layerShift2 = useTransform(scrollYProgress, [0, 1], [0, 160])
  const layerShift3 = useTransform(scrollYProgress, [0, 1], [0, 240])

  return (
    <div className="cosmic-scroll-fx-root fixed inset-0 overflow-hidden bg-[oklch(0.08_0.012_270)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_0%,oklch(0.14_0.02_270/0.35),transparent_62%)]" />

      <DimensionRifts
        opacity={dimensionOpacity}
        shift1={layerShift1}
        shift2={layerShift2}
        shift3={layerShift3}
      />

      <MysticNebula opacity={cosmicTopOpacity} />
      <StarField stars={stars} opacity={starOpacity} reduced={false} />

      <ScrollMeteor
        x={meteorX}
        y={meteorY}
        scale={meteorScale}
        rotate={meteorRotate}
        tailScale={meteorTail}
        opacity={meteorOpacity}
        crashOpacity={crashOpacity}
        crashRing={crashRing}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_72%,oklch(0.08_0.012_270/0.28)_100%)]" />
    </div>
  )
}

export function CosmicScrollFx({
  lite = false,
  medium = false,
  tier = 'mid',
}: {
  lite?: boolean
  medium?: boolean
  tier?: PerformanceTier
}) {
  const reduced = useReducedMotion()
  const counts = COSMIC_STAR_COUNTS[tier]

  if (lite || reduced) {
    return <CosmicScrollFxLite starCount={counts.lite} />
  }

  if (medium) {
    return <CosmicScrollFxMedium starCount={counts.medium} />
  }

  return <CosmicScrollFxFull starCount={counts.full} />
}
