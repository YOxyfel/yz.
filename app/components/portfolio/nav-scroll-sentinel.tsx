'use client'

import { useEffect, useRef } from 'react'
import { registerNavScrollSentinel } from './use-nav-scrolled'

/** In-flow sentinel — place once at the top of scrollable page content. */
export function NavScrollSentinel() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerNavScrollSentinel(el)
  }, [])

  return <div ref={ref} aria-hidden className="nav-scroll-sentinel" />
}
