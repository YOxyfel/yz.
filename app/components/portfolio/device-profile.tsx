'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { CORNER_DOCK_MIN_PX, DEVICE_PROFILE_QUERIES, MEDIA_COARSE_POINTER, MOBILE_MAX_PX, TABLET_MAX_PX } from './breakpoints'
import { PerformanceAdaptiveMonitor } from './performance-adaptive'
import { ScrollPerformanceMonitor } from './use-scroll-performance'
import {
  getAdaptiveTier,
  getHardwareTier,
  resolvePerformanceTier,
  type PerformanceTier,
} from './performance-tier'

export type { PerformanceTier } from './performance-tier'

export type DeviceProfile = {
  isCoarsePointer: boolean
  isNarrow: boolean
  isTablet: boolean
  isDesktop: boolean
  prefersReducedMotion: boolean
  performanceTier: PerformanceTier
  hardwareTier: PerformanceTier
  fxLite: boolean
  fxMedium: boolean
  enableOrbitHitboxes: boolean
  enableHeavyBackgroundFx: boolean
  enablePropViewer3d: boolean
  enablePanelFlip: boolean
  maxSkyConstellations: number
  /** Phone, tablet, or coarse pointer — aggressive static UI + no screen FX. */
  mobilePerfCut: boolean
}

const DEFAULT_PROFILE: DeviceProfile = {
  isCoarsePointer: false,
  isNarrow: false,
  isTablet: false,
  isDesktop: true,
  prefersReducedMotion: false,
  performanceTier: 'mid',
  hardwareTier: 'mid',
  fxLite: false,
  fxMedium: true,
  enableOrbitHitboxes: true,
  enableHeavyBackgroundFx: false,
  enablePropViewer3d: true,
  enablePanelFlip: false,
  maxSkyConstellations: 10,
  mobilePerfCut: false,
}

type ViewportSnapshot = Pick<
  DeviceProfile,
  'isCoarsePointer' | 'isNarrow' | 'isTablet' | 'isDesktop' | 'prefersReducedMotion'
>

let cachedViewport: ViewportSnapshot = {
  isCoarsePointer: DEFAULT_PROFILE.isCoarsePointer,
  isNarrow: DEFAULT_PROFILE.isNarrow,
  isTablet: DEFAULT_PROFILE.isTablet,
  isDesktop: DEFAULT_PROFILE.isDesktop,
  prefersReducedMotion: DEFAULT_PROFILE.prefersReducedMotion,
}
let cachedViewportSignature = ''

const SERVER_VIEWPORT_SNAPSHOT: ViewportSnapshot = {
  isCoarsePointer: DEFAULT_PROFILE.isCoarsePointer,
  isNarrow: DEFAULT_PROFILE.isNarrow,
  isTablet: DEFAULT_PROFILE.isTablet,
  isDesktop: DEFAULT_PROFILE.isDesktop,
  prefersReducedMotion: DEFAULT_PROFILE.prefersReducedMotion,
}

function getServerViewportSnapshot() {
  return SERVER_VIEWPORT_SNAPSHOT
}

function readProfileFromDom(): Partial<ViewportSnapshot> | null {
  if (typeof document === 'undefined') return null
  const root = document.documentElement
  if (root.dataset.narrow === undefined) return null

  return {
    isNarrow: root.dataset.narrow === 'on',
    isTablet: root.dataset.tablet === 'on',
    isCoarsePointer: root.dataset.coarsePointer === 'on',
  }
}

function buildViewportSnapshot(): ViewportSnapshot {
  if (typeof window === 'undefined') {
    return {
      isCoarsePointer: DEFAULT_PROFILE.isCoarsePointer,
      isNarrow: DEFAULT_PROFILE.isNarrow,
      isTablet: DEFAULT_PROFILE.isTablet,
      isDesktop: DEFAULT_PROFILE.isDesktop,
      prefersReducedMotion: DEFAULT_PROFILE.prefersReducedMotion,
    }
  }

  const domHint = readProfileFromDom()
  const isCoarsePointer =
    domHint?.isCoarsePointer ?? window.matchMedia(DEVICE_PROFILE_QUERIES[0]).matches
  const isNarrow = domHint?.isNarrow ?? window.matchMedia(DEVICE_PROFILE_QUERIES[1]).matches
  const isTablet = domHint?.isTablet ?? window.matchMedia(DEVICE_PROFILE_QUERIES[2]).matches
  const prefersReducedMotion = window.matchMedia(DEVICE_PROFILE_QUERIES[3]).matches
  const isDesktop = !isNarrow && !isTablet
  const signature = [isCoarsePointer, isNarrow, isTablet, isDesktop, prefersReducedMotion].join(
    '|'
  )

  if (signature === cachedViewportSignature) {
    return cachedViewport
  }

  cachedViewportSignature = signature
  cachedViewport = {
    isCoarsePointer,
    isNarrow,
    isTablet,
    isDesktop,
    prefersReducedMotion,
  }

  return cachedViewport
}

function subscribeToProfileChanges(onStoreChange: () => void) {
  const media = DEVICE_PROFILE_QUERIES.map((query) => window.matchMedia(query))
  media.forEach((entry) => entry.addEventListener('change', onStoreChange))
  return () => media.forEach((entry) => entry.removeEventListener('change', onStoreChange))
}

function buildDeviceProfile(
  viewport: ViewportSnapshot,
  performanceTier: PerformanceTier,
  hardwareTier: PerformanceTier
): DeviceProfile {
  const mobilePerfCut =
    viewport.isNarrow || viewport.isTablet || viewport.isCoarsePointer
  const fxLite = mobilePerfCut || performanceTier === 'low' || viewport.prefersReducedMotion
  const fxMedium = performanceTier === 'mid' && !fxLite
  const enableOrbitHitboxes =
    !mobilePerfCut && !viewport.isCoarsePointer && performanceTier !== 'low'
  const enableHeavyBackgroundFx =
    !mobilePerfCut && performanceTier === 'high' && !viewport.prefersReducedMotion
  const enablePropViewer3d = !mobilePerfCut && performanceTier !== 'low'
  const enablePanelFlip =
    !mobilePerfCut &&
    performanceTier !== 'low' &&
    viewport.isDesktop &&
    !viewport.isCoarsePointer
  const maxSkyConstellations = mobilePerfCut ? 4 : 10

  return {
    ...viewport,
    performanceTier,
    hardwareTier,
    fxLite,
    fxMedium,
    enableOrbitHitboxes,
    enableHeavyBackgroundFx,
    enablePropViewer3d,
    enablePanelFlip,
    maxSkyConstellations,
    mobilePerfCut,
  }
}

const DeviceProfileContext = createContext<DeviceProfile>(DEFAULT_PROFILE)

export function DeviceProfileProvider({ children }: { children: ReactNode }) {
  const [adaptiveTier, setAdaptiveTierState] = useState<PerformanceTier | null>(null)
  const viewport = useSyncExternalStore(
    subscribeToProfileChanges,
    buildViewportSnapshot,
    getServerViewportSnapshot
  )

  useEffect(() => {
    setAdaptiveTierState(getAdaptiveTier())
  }, [])

  const profile = useMemo(() => {
    const hardwareTier = getHardwareTier()
    const performanceTier = resolvePerformanceTier(adaptiveTier)
    return buildDeviceProfile(viewport, performanceTier, hardwareTier)
  }, [adaptiveTier, viewport])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.narrow = profile.isNarrow ? 'on' : 'off'
    root.dataset.tablet = profile.isTablet ? 'on' : 'off'
    root.dataset.coarsePointer = profile.isCoarsePointer ? 'on' : 'off'
    root.dataset.fxLite = profile.fxLite ? 'on' : 'off'
    root.dataset.mobilePerfCut = profile.mobilePerfCut ? 'on' : 'off'
    root.dataset.perfTier = profile.performanceTier
    root.dataset.perfHardware = profile.hardwareTier
    root.dataset.deviceReady = 'on'
  }, [profile])

  const handleAdaptiveTier = useMemo(
    () => (tier: PerformanceTier) => {
      setAdaptiveTierState(tier)
    },
    []
  )

  return (
    <DeviceProfileContext.Provider value={profile}>
      <PerformanceAdaptiveMonitor
        performanceTier={profile.performanceTier}
        onAdaptiveTier={handleAdaptiveTier}
      />
      <ScrollPerformanceMonitor
        performanceTier={profile.performanceTier}
        onAdaptiveTier={handleAdaptiveTier}
      />
      {children}
    </DeviceProfileContext.Provider>
  )
}

export function useDeviceProfile() {
  return useContext(DeviceProfileContext)
}

function subscribeCompactNav(onStoreChange: () => void) {
  const media = window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function getCompactNavSnapshot() {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`).matches
}

function getServerCompactNavSnapshot() {
  return false
}

/** True at viewport widths that use the mobile hamburger nav (≤767px). */
export function useCompactNavLayout() {
  return useSyncExternalStore(
    subscribeCompactNav,
    getCompactNavSnapshot,
    getServerCompactNavSnapshot
  )
}

function subscribeCornerDockVisible(onStoreChange: () => void) {
  const media = window.matchMedia(`(min-width: ${CORNER_DOCK_MIN_PX}px)`)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function getCornerDockVisibleSnapshot() {
  return window.matchMedia(`(min-width: ${CORNER_DOCK_MIN_PX}px)`).matches
}

function getServerCornerDockVisibleSnapshot() {
  return true
}

/** True when Site FX / Sky Lab / Sky View render in the top-left dock (≥1720px). */
export function useCornerDockVisible() {
  return useSyncExternalStore(
    subscribeCornerDockVisible,
    getCornerDockVisibleSnapshot,
    getServerCornerDockVisibleSnapshot
  )
}

/** Synchronous runtime check — use when toggling Sky Lab (do not rely on React profile alone). */
export function detectMobileSkyLabViewport(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia(`(max-width: ${TABLET_MAX_PX}px)`).matches ||
    window.matchMedia(MEDIA_COARSE_POINTER).matches ||
    (typeof navigator !== 'undefined' &&
      navigator.maxTouchPoints > 0 &&
      window.innerWidth <= TABLET_MAX_PX)
  )
}

/** Phone, tablet, or coarse pointer — Sky Lab uses the minimal canvas (no page chrome). */
export function isMobileSkyLabViewport(
  profile: Pick<DeviceProfile, 'isCoarsePointer' | 'isNarrow' | 'isTablet'>
) {
  if (typeof window !== 'undefined' && detectMobileSkyLabViewport()) return true
  return profile.isNarrow || profile.isCoarsePointer || profile.isTablet
}
