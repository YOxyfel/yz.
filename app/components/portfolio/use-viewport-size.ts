'use client'

import { useEffect, useState } from 'react'

type ViewportSize = { width: number; height: number }

const INITIAL: ViewportSize = { width: 0, height: 0 }

/** Viewport dimensions via ResizeObserver — no scroll/layout reads on the hot path. */
export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(INITIAL)

  useEffect(() => {
    const measure = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(document.documentElement)
    measure()

    return () => resizeObserver.disconnect()
  }, [])

  return size
}
