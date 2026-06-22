'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'

type Bounds = { left: number; top: number; width: number; height: number }

const EMPTY_BOUNDS: Bounds = { left: 0, top: 0, width: 1, height: 1 }

/** Cache element bounds via ResizeObserver; refresh once per pointer gesture start. */
export function usePointerBoundsCache<T extends HTMLElement>(ref: RefObject<T | null>) {
  const boundsRef = useRef<Bounds>(EMPTY_BOUNDS)

  const refreshBounds = useCallback(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    boundsRef.current = {
      left: rect.left,
      top: rect.top,
      width: Math.max(rect.width, 1),
      height: Math.max(rect.height, 1),
    }
  }, [ref])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const resizeObserver = new ResizeObserver(refreshBounds)
    resizeObserver.observe(el)
    refreshBounds()

    return () => resizeObserver.disconnect()
  }, [ref, refreshBounds])

  return { boundsRef, refreshBounds }
}
