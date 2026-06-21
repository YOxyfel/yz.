'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useDeviceProfile } from './device-profile'

export const SITE_VARIANTS = ['minimal', 'station', 'futuristic'] as const
export type SiteVariant = (typeof SITE_VARIANTS)[number]

const SCROLL_THRESHOLD = 520
const ACCUMULATOR_DECAY_MS = 1600
const TRANSITION_LOCK_MS = 420

type SiteVariantContextValue = {
  variant: SiteVariant
  transitionDirection: number
  isTransitioning: boolean
  scrollProgress: number
  setVariant: (variant: SiteVariant, direction?: number) => void
  panelUsesFlip: boolean
}

const SiteVariantContext = createContext<SiteVariantContextValue | null>(null)

function normalizeVariant(value: string | null): SiteVariant {
  if (value === 'minimal' || value === 'futuristic') return value
  return 'station'
}

export function SiteVariantProvider({ children }: { children: ReactNode }) {
  const { isCoarsePointer, isDesktop } = useDeviceProfile()
  const [variant, setVariantState] = useState<SiteVariant>('station')
  const [transitionDirection, setTransitionDirection] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const accumulatorRef = useRef(0)
  const variantRef = useRef<SiteVariant>('station')
  const isTransitioningRef = useRef(false)
  const decayTimerRef = useRef<number | null>(null)
  const transitionTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('site-variant')
    if (stored) {
      const next = normalizeVariant(stored)
      variantRef.current = next
      setVariantState(next)
    }
  }, [])

  const setVariant = useCallback((next: SiteVariant, direction = 0) => {
    if (variantRef.current === next) return

    variantRef.current = next
    setVariantState(next)
    sessionStorage.setItem('site-variant', next)
    setTransitionDirection(direction)
    setIsTransitioning(true)
    isTransitioningRef.current = true
    setScrollProgress(0)
    accumulatorRef.current = 0

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current)
    }
    transitionTimerRef.current = window.setTimeout(() => {
      isTransitioningRef.current = false
      setIsTransitioning(false)
      setTransitionDirection(0)
    }, TRANSITION_LOCK_MS)
  }, [])

  const shiftVariant = useCallback(
    (step: 1 | -1) => {
      const index = SITE_VARIANTS.indexOf(variantRef.current)
      const nextIndex = Math.min(SITE_VARIANTS.length - 1, Math.max(0, index + step))
      if (nextIndex === index) {
        accumulatorRef.current = 0
        setScrollProgress(0)
        return
      }
      setVariant(SITE_VARIANTS[nextIndex], step)
    },
    [setVariant]
  )

  useEffect(() => {
    if (isCoarsePointer) return

    const scheduleDecay = () => {
      if (decayTimerRef.current) {
        window.clearTimeout(decayTimerRef.current)
      }
      decayTimerRef.current = window.setTimeout(() => {
        accumulatorRef.current = 0
        setScrollProgress(0)
      }, ACCUMULATOR_DECAY_MS)
    }

    const onWheel = (event: WheelEvent) => {
      if (!event.shiftKey || isTransitioningRef.current) return

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (Math.abs(delta) < 0.5) return

      event.preventDefault()

      accumulatorRef.current += delta
      const progress = Math.min(1, Math.abs(accumulatorRef.current) / SCROLL_THRESHOLD)
      setScrollProgress(progress * Math.sign(accumulatorRef.current || 1))
      scheduleDecay()

      if (accumulatorRef.current >= SCROLL_THRESHOLD) {
        accumulatorRef.current = 0
        setScrollProgress(0)
        shiftVariant(1)
      } else if (accumulatorRef.current <= -SCROLL_THRESHOLD) {
        accumulatorRef.current = 0
        setScrollProgress(0)
        shiftVariant(-1)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      if (decayTimerRef.current) window.clearTimeout(decayTimerRef.current)
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
    }
  }, [isCoarsePointer, shiftVariant])

  const value = useMemo(
    () => ({
      variant,
      transitionDirection,
      isTransitioning,
      scrollProgress,
      setVariant,
      panelUsesFlip: variant === 'station' && isDesktop,
    }),
    [isTransitioning, isDesktop, scrollProgress, setVariant, transitionDirection, variant]
  )

  return (
    <SiteVariantContext.Provider value={value}>{children}</SiteVariantContext.Provider>
  )
}

export function useSiteVariant() {
  const context = useContext(SiteVariantContext)
  if (!context) {
    throw new Error('useSiteVariant must be used within SiteVariantProvider')
  }
  return context
}
