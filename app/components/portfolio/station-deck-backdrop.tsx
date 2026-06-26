'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDeviceProfile } from './device-profile'
import { SitePhotoBackdropLayers } from './site-photo-backdrop'
import { useVisualFxPreferences } from './visual-fx-preferences'

const CosmosPlanetCanvas = dynamic(
  () => import('./cosmos-planet-canvas').then((mod) => ({ default: mod.CosmosPlanetCanvas })),
  { ssr: false }
)

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
  const [ripples, setRipples] = useState<PondRipple[]>([])
  const rippleIdRef = useRef(0)
  const lastSpawnRef = useRef<{ x: number; y: number } | null>(null)
  const ripplesEnabled = useGridRipplesEnabled()
  const { mobilePerfCut, prefersReducedMotion, performanceTier } = useDeviceProfile()
  const { showScreenFx } = useVisualFxPreferences()
  const [planetReady, setPlanetReady] = useState(false)

  const parallaxOn = mounted && showScreenFx && !mobilePerfCut && !prefersReducedMotion
  const planetOn = parallaxOn && performanceTier !== 'low'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Defer the (WebGL) planet until the browser is idle so it never competes
  // with first paint or the hero.
  useEffect(() => {
    if (!planetOn) {
      setPlanetReady(false)
      return
    }
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setPlanetReady(true), { timeout: 2500 })
      return () => w.cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(() => setPlanetReady(true), 1200)
    return () => window.clearTimeout(t)
  }, [planetOn])

  // Single rAF drives scroll + pointer parallax via CSS vars on the backdrop.
  // The loop sleeps once values settle and re-arms on scroll / pointer move, so
  // it costs nothing while the visitor is reading.
  useEffect(() => {
    const root = backdropRef.current
    if (!root) return
    if (!parallaxOn) {
      root.style.setProperty('--cosmos-scroll', '0')
      root.style.setProperty('--cosmos-px', '0')
      root.style.setProperty('--cosmos-py', '0')
      return
    }

    let raf = 0
    let running = false
    const target = { px: 0, py: 0 }
    const cur = { px: 0, py: 0, scroll: window.scrollY }

    const tick = () => {
      const targetScroll = window.scrollY
      cur.scroll += (targetScroll - cur.scroll) * 0.12
      cur.px += (target.px - cur.px) * 0.05
      cur.py += (target.py - cur.py) * 0.05
      root.style.setProperty('--cosmos-scroll', cur.scroll.toFixed(1))
      root.style.setProperty('--cosmos-px', cur.px.toFixed(3))
      root.style.setProperty('--cosmos-py', cur.py.toFixed(3))

      const settled =
        Math.abs(targetScroll - cur.scroll) < 0.3 &&
        Math.abs(target.px - cur.px) < 0.002 &&
        Math.abs(target.py - cur.py) < 0.002
      if (settled) {
        running = false
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(tick)
    }

    const onPointer = (event: PointerEvent) => {
      target.px = (event.clientX / window.innerWidth) * 2 - 1
      target.py = (event.clientY / window.innerHeight) * 2 - 1
      wake()
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', wake, { passive: true })
    wake()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', wake)
    }
  }, [parallaxOn])

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

  if (!mounted) return null

  return createPortal(
    <div
      ref={backdropRef}
      className="station-sky-backdrop"
      data-station-sky-backdrop
      data-station-backdrop-active="on"
      aria-hidden
    >
      <SitePhotoBackdropLayers planet={planetReady ? <CosmosPlanetCanvas /> : null} />
      {ripplesEnabled ? (
        <div className="station-sky-backdrop-ripples">
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
    </div>,
    document.body
  )
}
