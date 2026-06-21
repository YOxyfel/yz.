'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { useDeviceProfile } from './device-profile'
import type { NebulaBurst } from './orbit-decor-logic'

type NebulaBurstLayerProps = {
  burst: NebulaBurst | null
  onComplete: (id: string) => void
}

function buildParticles(count: number, hue: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 5,
    delay: Math.random() * 0.4,
    hue: hue + (Math.random() - 0.5) * 40,
    drift: (Math.random() - 0.5) * 30,
  }))
}

export function NebulaBurstLayer({ burst, onComplete }: NebulaBurstLayerProps) {
  const { fxLite } = useDeviceProfile()
  const particles = useMemo(() => {
    if (!burst) return []
    const count = fxLite ? Math.min(28, burst.particleCount) : burst.particleCount
    return buildParticles(count, burst.hue)
  }, [burst, fxLite])

  useEffect(() => {
    if (!burst) return

    const expandDuration = 1350
    const collapseDuration = 1600
    const totalDuration = expandDuration + burst.holdMs + collapseDuration

    const timer = window.setTimeout(() => onComplete(burst.id), totalDuration)
    return () => window.clearTimeout(timer)
  }, [burst, onComplete])

  if (!burst) return null

  const expandDuration = 1.35
  const collapseDuration = 1.6
  const holdDuration = burst.holdMs / 1000
  const totalDuration = expandDuration + holdDuration + collapseDuration

  return (
    <div
      key={burst.id}
      className="nebula-burst-layer pointer-events-none fixed inset-0 z-[2] flex items-center justify-center"
      aria-hidden
    >
      <motion.div
        className="nebula-burst-core rounded-full"
        initial={{ width: 0, height: 0, opacity: 0, rotate: 0 }}
        animate={{
          width: ['0vw', '140vmax', '140vmax', '0px'],
          height: ['0vh', '140vmax', '140vmax', '0px'],
          opacity: [0, 0.92, 0.88, 0],
          rotate: [0, 8, -4, 0],
        }}
        transition={{
          duration: totalDuration,
          times: [
            0,
            expandDuration / totalDuration,
            (expandDuration + holdDuration) / totalDuration,
            1,
          ],
          ease: ['easeOut', 'linear', 'easeIn'],
        }}
        style={{
          background: `radial-gradient(circle at 40% 38%, oklch(0.75 0.18 ${burst.hue} / 0.55), oklch(0.55 0.22 ${burst.hue + 25} / 0.35) 42%, oklch(0.35 0.16 ${burst.hue - 20} / 0.2) 68%, transparent 78%)`,
          boxShadow: `0 0 120px 40px oklch(0.65 0.2 ${burst.hue} / 0.35), inset 0 0 80px oklch(0.8 0.16 ${burst.hue} / 0.25)`,
        }}
      />

      <motion.div
        className="nebula-burst-particles absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: totalDuration,
          times: [0, 0.15, 0.82, 1],
        }}
      >
        {particles.map((particle) => (
          <motion.span
            key={`${burst.id}-${particle.id}`}
            className="nebula-burst-particle absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              background: `oklch(0.82 0.16 ${particle.hue})`,
              boxShadow: `0 0 12px oklch(0.75 0.18 ${particle.hue})`,
            }}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1.8, 1.2, 0],
              opacity: [0, 1, 0.85, 0],
              x: [0, particle.drift, particle.drift * 0.4, 0],
              y: [0, -particle.drift * 0.6, particle.drift * 0.2, 0],
            }}
            transition={{
              duration: totalDuration,
              delay: particle.delay,
              times: [0, 0.2, 0.78, 1],
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
