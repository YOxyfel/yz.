'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { DEVICE_PROFILE_QUERIES, MEDIA_COARSE_POINTER, TABLET_MAX_PX } from './breakpoints'

export type DeviceProfile = {
  isCoarsePointer: boolean
  isNarrow: boolean
  isTablet: boolean
  isDesktop: boolean
  prefersReducedMotion: boolean
  fxLite: boolean
  fxMedium: boolean
  enableOrbitHitboxes: boolean
}

const DEFAULT_PROFILE: DeviceProfile = {
  isCoarsePointer: false,
  isNarrow: false,
  isTablet: false,
  isDesktop: true,
  prefersReducedMotion: false,
  fxLite: false,
  fxMedium: false,
  enableOrbitHitboxes: true,
}

let cachedSnapshot: DeviceProfile = DEFAULT_PROFILE
let cachedSignature = ''

function readProfileFromDom(): Partial<DeviceProfile> | null {
  if (typeof document === 'undefined') return null
  const root = document.documentElement
  if (root.dataset.narrow === undefined) return null

  return {
    isNarrow: root.dataset.narrow === 'on',
    isTablet: root.dataset.tablet === 'on',
    isCoarsePointer: root.dataset.coarsePointer === 'on',
    fxLite: root.dataset.fxLite === 'on',
  }
}

function buildProfileSnapshot(): DeviceProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE

  const domHint = readProfileFromDom()
  const isCoarsePointer =
    domHint?.isCoarsePointer ?? window.matchMedia(DEVICE_PROFILE_QUERIES[0]).matches
  const isNarrow = domHint?.isNarrow ?? window.matchMedia(DEVICE_PROFILE_QUERIES[1]).matches
  const isTablet = domHint?.isTablet ?? window.matchMedia(DEVICE_PROFILE_QUERIES[2]).matches
  const prefersReducedMotion = window.matchMedia(DEVICE_PROFILE_QUERIES[3]).matches
  const isDesktop = !isNarrow && !isTablet
  const fxLite = isCoarsePointer || isNarrow || prefersReducedMotion
  const fxMedium = isTablet && !isCoarsePointer && !prefersReducedMotion
  const enableOrbitHitboxes = !isCoarsePointer
  const signature = [
    isCoarsePointer,
    isNarrow,
    isTablet,
    isDesktop,
    prefersReducedMotion,
    fxLite,
    fxMedium,
    enableOrbitHitboxes,
  ].join('|')

  if (signature === cachedSignature) {
    return cachedSnapshot
  }

  cachedSignature = signature
  cachedSnapshot = {
    isCoarsePointer,
    isNarrow,
    isTablet,
    isDesktop,
    prefersReducedMotion,
    fxLite,
    fxMedium,
    enableOrbitHitboxes,
  }

  return cachedSnapshot
}

function subscribeToProfileChanges(onStoreChange: () => void) {
  const media = DEVICE_PROFILE_QUERIES.map((query) => window.matchMedia(query))
  media.forEach((entry) => entry.addEventListener('change', onStoreChange))
  return () => media.forEach((entry) => entry.removeEventListener('change', onStoreChange))
}

const DeviceProfileContext = createContext<DeviceProfile>(DEFAULT_PROFILE)

export function DeviceProfileProvider({ children }: { children: ReactNode }) {
  const profile = useSyncExternalStore(
    subscribeToProfileChanges,
    buildProfileSnapshot,
    () => DEFAULT_PROFILE
  )

  useEffect(() => {
    const root = document.documentElement
    root.dataset.narrow = profile.isNarrow ? 'on' : 'off'
    root.dataset.tablet = profile.isTablet ? 'on' : 'off'
    root.dataset.coarsePointer = profile.isCoarsePointer ? 'on' : 'off'
    root.dataset.fxLite = profile.fxLite ? 'on' : 'off'
    root.dataset.deviceReady = 'on'
  }, [profile])

  const value = useMemo(() => profile, [profile])

  return (
    <DeviceProfileContext.Provider value={value}>{children}</DeviceProfileContext.Provider>
  )
}

export function useDeviceProfile() {
  return useContext(DeviceProfileContext)
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
