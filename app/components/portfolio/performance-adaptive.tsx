'use client'

import { useEffect, useRef } from 'react'
import {
  getAdaptiveTier,
  getHardwareTier,
  isPerfBenchmarkDone,
  markPerfBenchmarkDone,
  minTier,
  PERF_BENCHMARK_MS,
  PERF_DOWNGRADE_FPS,
  PERF_UPGRADE_FPS,
  PERF_UPGRADE_HOLD_MS,
  resolvePerformanceTier,
  sampleFrameRate,
  setAdaptiveTier,
  tierRank,
  upgradeTier,
  type PerformanceTier,
} from './performance-tier'
import { usePageVisible } from './use-page-visible'

type PerformanceAdaptiveMonitorProps = {
  performanceTier: PerformanceTier
  onAdaptiveTier: (tier: PerformanceTier) => void
}

function downgradeTier(tier: PerformanceTier): PerformanceTier {
  if (tier === 'high') return 'mid'
  return 'low'
}

export function PerformanceAdaptiveMonitor({
  performanceTier,
  onAdaptiveTier,
}: PerformanceAdaptiveMonitorProps) {
  const pageVisible = usePageVisible()
  const upgradeHoldStartRef = useRef<number | null>(null)

  useEffect(() => {
    if (!pageVisible || isPerfBenchmarkDone()) return
    if (typeof window !== 'undefined') {
      const mobile =
        window.matchMedia('(max-width: 767px)').matches ||
        window.matchMedia('(pointer: coarse)').matches
      if (mobile) {
        markPerfBenchmarkDone()
        return
      }
    }

    let cancelled = false

    const runBenchmark = async () => {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()))
      })

      if (cancelled || document.visibilityState !== 'visible') return

      const fps = await sampleFrameRate(PERF_BENCHMARK_MS)
      if (cancelled) return

      markPerfBenchmarkDone()

      if (fps < PERF_DOWNGRADE_FPS && tierRank(performanceTier) > tierRank('low')) {
        const next = minTier(getHardwareTier(), downgradeTier(performanceTier))
        if (next !== performanceTier) {
          setAdaptiveTier(next)
          onAdaptiveTier(next)
        }
      } else if (fps >= PERF_UPGRADE_FPS) {
        upgradeHoldStartRef.current = performance.now()
      }
    }

    void runBenchmark()

    return () => {
      cancelled = true
    }
  }, [onAdaptiveTier, pageVisible, performanceTier])

  useEffect(() => {
    if (!pageVisible || !isPerfBenchmarkDone()) return

    const hardware = getHardwareTier()
    if (tierRank(performanceTier) >= tierRank(hardware)) return

    let cancelled = false
    upgradeHoldStartRef.current = performance.now()

    const monitor = async () => {
      while (!cancelled && document.visibilityState === 'visible') {
        const fps = await sampleFrameRate(1200)
        if (cancelled) return

        const effective = resolvePerformanceTier(getAdaptiveTier())

        if (fps >= PERF_UPGRADE_FPS) {
          const holdStart = upgradeHoldStartRef.current ?? performance.now()
          if (performance.now() - holdStart >= PERF_UPGRADE_HOLD_MS) {
            const upgraded = minTier(hardware, upgradeTier(effective))
            if (tierRank(upgraded) > tierRank(effective)) {
              setAdaptiveTier(upgraded)
              onAdaptiveTier(upgraded)
              upgradeHoldStartRef.current = performance.now()
            }
          }
        } else {
          upgradeHoldStartRef.current = performance.now()
        }

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 1000)
        })
      }
    }

    void monitor()

    return () => {
      cancelled = true
    }
  }, [onAdaptiveTier, pageVisible, performanceTier])

  return null
}
