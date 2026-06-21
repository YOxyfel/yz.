'use client'

import { useEffect, useState } from 'react'

/** Defer expensive FX until after first paint (double rAF). */
export function useDeferredFxMount(enabled: boolean) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setReady(false)
      return
    }

    let cancelled = false
    let outer = 0
    let inner = 0

    outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => {
        if (!cancelled) setReady(true)
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [enabled])

  return ready
}
