'use client'

import { useEffect } from 'react'

/** Freezes document-level ambient FX when the hero leaves the viewport. */
export function HeroVisibilityBridge() {
  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return

    const sync = (intersecting: boolean) => {
      document.documentElement.dataset.heroInView = intersecting ? 'on' : 'off'
      document.documentElement.dataset.animationsFrozen = intersecting ? 'off' : 'on'
    }

    const observer = new IntersectionObserver(
      ([entry]) => sync(Boolean(entry?.isIntersecting)),
      { threshold: 0, rootMargin: '0px 0px -35% 0px' }
    )

    observer.observe(hero)
    return () => {
      observer.disconnect()
      delete document.documentElement.dataset.heroInView
      delete document.documentElement.dataset.animationsFrozen
    }
  }, [])

  return null
}

export function isHeroInView() {
  if (typeof document === 'undefined') return true
  return document.documentElement.dataset.heroInView !== 'off'
}
