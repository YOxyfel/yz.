'use client'

import { useSyncExternalStore } from 'react'
import type { PerformanceTier } from './performance-tier'
import { getHeroInView, subscribeHeroInView } from './hero-visibility-bridge'
import { useScrollIdle } from './use-scroll-idle'

export type CosmicRenderMode = 'lite' | 'medium' | 'cinematic'

export function useFxRuntime() {
  const scrollIdle = useScrollIdle()
  const heroInView = useSyncExternalStore(subscribeHeroInView, getHeroInView, () => true)

  return {
    scrollIdle,
    heroInView,
    scrollBusy: !scrollIdle,
  }
}

/** Idle cosmic quality (scroll does not change this — crossfade handles scroll degrade). */
export function resolveCosmicIdleMode(input: {
  hardwareLite: boolean
  isReduced: boolean
  fxMedium: boolean
  performanceTier: PerformanceTier
  mode: string
  userFullMode: boolean
}): CosmicRenderMode {
  const { hardwareLite, isReduced, fxMedium, performanceTier, mode, userFullMode } = input

  const forceLite = isReduced || (hardwareLite && !userFullMode) || mode === 'off'

  if (forceLite) return 'lite'

  const cinematic = !fxMedium && performanceTier === 'high' && mode === 'full'

  if (cinematic) return 'cinematic'

  return 'medium'
}

export function isCosmicScrollDegraded(scrollIdle: boolean, heroInView: boolean) {
  return !scrollIdle || !heroInView
}

/** @deprecated Use resolveCosmicIdleMode + isCosmicScrollDegraded */
export function resolveCosmicRenderMode(input: {
  hardwareLite: boolean
  isReduced: boolean
  fxMedium: boolean
  performanceTier: PerformanceTier
  mode: string
  scrollIdle: boolean
  heroInView: boolean
  userFullMode: boolean
}): CosmicRenderMode {
  const idle = resolveCosmicIdleMode(input)
  if (isCosmicScrollDegraded(input.scrollIdle, input.heroInView) && idle !== 'lite') {
    return 'lite'
  }
  return idle
}
