'use client'

import { useEffect } from 'react'

let heroInView = true
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function syncDataset(intersecting: boolean) {
  document.documentElement.dataset.heroInView = intersecting ? 'on' : 'off'
  document.documentElement.dataset.animationsFrozen = intersecting ? 'off' : 'on'
}

function setHeroInView(next: boolean) {
  if (heroInView === next) return
  heroInView = next
  if (typeof document !== 'undefined') {
    syncDataset(next)
  }
  emit()
}

export function getHeroInView() {
  return heroInView
}

export function subscribeHeroInView(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** @deprecated Prefer `getHeroInView` — kept for non-React callers. */
export function isHeroInView() {
  return getHeroInView()
}

/** Freezes document-level ambient FX when the hero leaves the viewport. */
export function HeroVisibilityBridge() {
  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(Boolean(entry?.isIntersecting)),
      { threshold: 0, rootMargin: '0px 0px -35% 0px' }
    )

    observer.observe(hero)
    syncDataset(heroInView)

    return () => {
      observer.disconnect()
      heroInView = true
      delete document.documentElement.dataset.heroInView
      delete document.documentElement.dataset.animationsFrozen
      emit()
    }
  }, [])

  return null
}
