'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDeviceProfile } from './device-profile'
import { generateSkyBackdropFx, type SkyBackdropFx } from './station-sky-backdrop-fx'
import { useVisualFxPreferences } from './visual-fx-preferences'

type PondRipple = {
  id: number
  x: number
  y: number
}

const MAX_RIPPLES = 10
const MIN_SPAWN_PX = 10

function useGridRipplesEnabled() {
  const { mode } = useVisualFxPreferences()
  const { isNarrow, prefersReducedMotion, performanceTier } = useDeviceProfile()

  return (
    !isNarrow &&
    !prefersReducedMotion &&
    performanceTier === 'high' &&
    (mode === 'full' || mode === 'reduced')
  )
}

function isScrollBusy() {
  if (typeof document === 'undefined') return false
  return document.documentElement.dataset.scrollBusy === 'on'
}

export function StationDeckBackdrop() {
  const backdropRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [fx, setFx] = useState<SkyBackdropFx | null>(null)
  const [ripples, setRipples] = useState<PondRipple[]>([])
  const rippleIdRef = useRef(0)
  const lastSpawnRef = useRef<{ x: number; y: number } | null>(null)
  const ripplesEnabled = useGridRipplesEnabled()

  useEffect(() => {
    setMounted(true)
    setFx(generateSkyBackdropFx())
  }, [])

  /** Single IO on the page shell — never per particle/layer. */
  useEffect(() => {
    if (!mounted) return

    const deck = document.querySelector('.station-deck')
    const root = backdropRef.current
    if (!deck || !root) return

    const syncActive = (intersecting: boolean) => {
      root.dataset.stationBackdropActive = intersecting ? 'on' : 'off'
    }

    const observer = new IntersectionObserver(
      ([entry]) => syncActive(Boolean(entry?.isIntersecting)),
      { threshold: 0, rootMargin: '0px' }
    )

    observer.observe(deck)
    syncActive(true)

    return () => {
      observer.disconnect()
      delete root.dataset.stationBackdropActive
    }
  }, [mounted])

  useEffect(() => {
    document.documentElement.dataset.gridRipples = ripplesEnabled ? 'on' : 'off'
    return () => {
      delete document.documentElement.dataset.gridRipples
    }
  }, [ripplesEnabled])

  useEffect(() => {
    if (!ripplesEnabled) {
      setRipples([])
      lastSpawnRef.current = null
    }
  }, [ripplesEnabled])

  const removeRipple = useCallback((id: number) => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id))
  }, [])

  useEffect(() => {
    if (!mounted || !ripplesEnabled) return

    let raf = 0

    const spawnRipple = (x: number, y: number) => {
      const id = ++rippleIdRef.current
      setRipples((current) => [...current.slice(-(MAX_RIPPLES - 1)), { id, x, y }])
    }

    const onMove = (event: MouseEvent) => {
      if (isScrollBusy()) return
      if (backdropRef.current?.dataset.stationBackdropActive === 'off') return

      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const { clientX: x, clientY: y } = event
        const last = lastSpawnRef.current

        if (last) {
          const dx = x - last.x
          const dy = y - last.y
          if (dx * dx + dy * dy < MIN_SPAWN_PX * MIN_SPAWN_PX) return
        }

        lastSpawnRef.current = { x, y }
        spawnRipple(x, y)
      })
    }

    const onLeave = () => {
      lastSpawnRef.current = null
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [mounted, ripplesEnabled])

  if (!mounted || !fx) return null

  return createPortal(
    <div
      ref={backdropRef}
      className="station-sky-backdrop"
      data-station-sky-backdrop
      data-station-backdrop-active="on"
      aria-hidden
    >
      <div className="station-sky-backdrop-grid" />
      {ripplesEnabled ? (
        <div className="station-sky-backdrop-ripples" aria-hidden>
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="station-grid-pond-ripple"
              style={{ transform: `translate3d(${ripple.x}px, ${ripple.y}px, 0)` }}
              onAnimationEnd={() => removeRipple(ripple.id)}
            />
          ))}
        </div>
      ) : null}
      <div className="station-sky-backdrop-nebula" style={{ backgroundImage: fx.nebula }} />
      <div className="station-sky-backdrop-particles" style={{ backgroundImage: fx.particles }} />
    </div>,
    document.body
  )
}
