'use client'

import { useEffect } from 'react'
import {
  getAdaptiveTier,
  getHardwareTier,
  minTier,
  PERF_DOWNGRADE_FPS,
  resolvePerformanceTier,
  sampleFrameRate,
  setAdaptiveTier,
  tierRank,
  type PerformanceTier,
} from './performance-tier'
import { usePageVisible } from './use-page-visible'
import { useScrollIdle } from './use-scroll-idle'

function downgradeTier(tier: PerformanceTier): PerformanceTier {
  if (tier === 'high') return 'mid'
  return 'low'
}

type ScrollPerformanceMonitorProps = {
  performanceTier: PerformanceTier
  onAdaptiveTier: (tier: PerformanceTier) => void
}

/** Downgrades adaptive tier when scroll interaction sustains low FPS. */
export function ScrollPerformanceMonitor({
  performanceTier,
  onAdaptiveTier,
}: ScrollPerformanceMonitorProps) {
  const pageVisible = usePageVisible()
  const scrollIdle = useScrollIdle()

  useEffect(() => {
    if (!pageVisible || scrollIdle || tierRank(performanceTier) <= tierRank('low')) return

    let cancelled = false
    let sampleTimer: number | undefined

    sampleTimer = window.setTimeout(() => {
      void (async () => {
        const fps = await sampleFrameRate(900)
        if (cancelled || document.documentElement.dataset.scrollBusy !== 'on') return
        if (fps >= PERF_DOWNGRADE_FPS) return

        const effective = resolvePerformanceTier(getAdaptiveTier())
        const next = minTier(getHardwareTier(), downgradeTier(effective))
        if (tierRank(next) < tierRank(effective)) {
          setAdaptiveTier(next)
          onAdaptiveTier(next)
        }
      })()
    }, 450)

    return () => {
      cancelled = true
      if (sampleTimer) window.clearTimeout(sampleTimer)
    }
  }, [onAdaptiveTier, pageVisible, performanceTier, scrollIdle])

  return null
}
