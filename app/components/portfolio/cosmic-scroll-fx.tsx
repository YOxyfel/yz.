'use client'

import { useReducedMotion } from 'framer-motion'
import type { CosmicRenderMode } from './fx-runtime'
import type { PerformanceTier } from './performance-tier'

type CosmicBodyProps = {
  nested?: boolean
}

/** Transparent shell — site photo backdrop lives in StationDeckBackdrop. */
function CosmicBody({ nested = false }: CosmicBodyProps) {
  const rootClass = nested
    ? 'cosmic-scroll-fx-root cosmic-scroll-fx-root--nested absolute inset-0 overflow-hidden pointer-events-none'
    : 'cosmic-scroll-fx-root fixed inset-0 overflow-hidden pointer-events-none'

  return <div className={rootClass} aria-hidden />
}

export function CosmicScrollFx({
  idleMode,
  scrollDegraded,
  tier: _tier = 'mid',
}: {
  idleMode: CosmicRenderMode
  scrollDegraded: boolean
  tier?: PerformanceTier
}) {
  const reduced = useReducedMotion()

  if (reduced || idleMode === 'lite') {
    return <CosmicBody nested={false} />
  }

  return (
    <div
      className="cosmic-scroll-fx-stack pointer-events-none fixed inset-0 z-0 overflow-hidden"
      data-cosmic-idle={scrollDegraded ? 'off' : 'on'}
      data-cosmic-scroll={scrollDegraded ? 'on' : 'off'}
      aria-hidden
    >
      <div className="cosmic-scroll-fx-crossfade cosmic-scroll-fx-crossfade--idle">
        <CosmicBody nested />
      </div>
      <div className="cosmic-scroll-fx-crossfade cosmic-scroll-fx-crossfade--scroll">
        <CosmicBody nested />
      </div>
    </div>
  )
}
