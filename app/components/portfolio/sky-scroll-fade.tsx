'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const TOP_OPACITY = 1
const BOTTOM_OPACITY = 0.28
const TOP_BRIGHTNESS = 1.2

export type SkyVisualStyle = {
  opacity: number
  brightness: number
}

/** Opacity-only scroll fade — folds brightness into opacity to avoid filter repaints. */
export function getSkyLayerOpacity(y: number, viewportHeight: number) {
  const vh = viewportHeight || (typeof window !== 'undefined' ? window.innerHeight : 1) || 1
  const t = Math.min(1, Math.max(0, y / vh))
  const opacity = TOP_OPACITY - t * (TOP_OPACITY - BOTTOM_OPACITY)
  const brightness = TOP_BRIGHTNESS - t * (TOP_BRIGHTNESS - 1)
  return Math.min(1, opacity * (0.78 + brightness * 0.22))
}

type SkyScrollFadeValue = {
  getSkyVisual: (y: number) => SkyVisualStyle
  getOpacity: (y: number) => number
}

const SkyScrollFadeContext = createContext<SkyScrollFadeValue | null>(null)

export function SkyScrollFadeProvider({ children }: { children: ReactNode }) {
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 0
  )

  useEffect(() => {
    const update = () => setViewportHeight(window.innerHeight)
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  const getSkyVisual = useCallback(
    (y: number): SkyVisualStyle => {
      const vh = viewportHeight || window.innerHeight || 1
      const t = Math.min(1, Math.max(0, y / vh))
      return {
        opacity: getSkyLayerOpacity(y, vh),
        brightness: TOP_BRIGHTNESS - t * (TOP_BRIGHTNESS - 1),
      }
    },
    [viewportHeight]
  )

  const getOpacity = useCallback((y: number) => getSkyVisual(y).opacity, [getSkyVisual])

  const value = useMemo(() => ({ getSkyVisual, getOpacity }), [getSkyVisual, getOpacity])

  return (
    <SkyScrollFadeContext.Provider value={value}>{children}</SkyScrollFadeContext.Provider>
  )
}

function fallbackSkyVisual(y: number): SkyVisualStyle {
  const vh = typeof window !== 'undefined' ? window.innerHeight || 1 : 1
  const t = Math.min(1, Math.max(0, y / vh))
  return {
    opacity: getSkyLayerOpacity(y, vh),
    brightness: TOP_BRIGHTNESS - t * (TOP_BRIGHTNESS - 1),
  }
}

const FALLBACK_SKY_SCROLL_FADE: SkyScrollFadeValue = {
  getSkyVisual: fallbackSkyVisual,
  getOpacity: (y: number) => fallbackSkyVisual(y).opacity,
}

export function useSkyScrollFade() {
  const ctx = useContext(SkyScrollFadeContext)
  return ctx ?? FALLBACK_SKY_SCROLL_FADE
}

export function constellationCenterY(
  stars: { y: number }[],
  anchor?: { y: number }
) {
  if (stars.length === 0) return anchor?.y ?? (typeof window !== 'undefined' ? window.innerHeight * 0.35 : 0)
  return stars.reduce((sum, star) => sum + star.y, 0) / stars.length
}

/** Prefer getSkyLayerOpacity / style.opacity — avoids brightness filter repaints. */
export function skyVisualFilter(visual: SkyVisualStyle, extra = '') {
  return extra || undefined
}
