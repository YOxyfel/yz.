'use client'

import { useInView } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { hashMatchesAnchor, hashTargetId, SITE_HASH_NAV_EVENT } from './hash-scroll'

type LazySectionProps = {
  children: ReactNode
  className?: string
  rootMargin?: string
  minHeight?: string
  placeholder?: ReactNode
  /** Section id — forces mount when nav hash targets this anchor. */
  anchorId?: string
}

export function LazySection({
  children,
  className,
  rootMargin = '420px 0px',
  minHeight = '1px',
  placeholder = null,
  anchorId,
}: LazySectionProps) {
  const [hashForced, setHashForced] = useState(() => {
    if (typeof window === 'undefined' || !anchorId) return false
    return hashTargetId(window.location.hash) === anchorId
  })
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: rootMargin as `${number}px ${number}px` })

  useEffect(() => {
    if (!anchorId) return

    const syncFromHash = () => {
      if (hashMatchesAnchor(window.location.hash, anchorId)) {
        setHashForced(true)
      }
    }

    const onHashNav = (event: Event) => {
      const id = (event as CustomEvent<{ id: string }>).detail?.id
      if (id === anchorId) setHashForced(true)
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener(SITE_HASH_NAV_EVENT, onHashNav)
    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      window.removeEventListener(SITE_HASH_NAV_EVENT, onHashNav)
    }
  }, [anchorId])

  const shouldMount = inView || hashForced

  return (
    <div
      ref={ref}
      className={`perf-deferred-section content-deferred-section ${className ?? ''}`.trim()}
      style={{ minHeight, contentVisibility: 'auto' }}
    >
      {shouldMount ? children : placeholder}
    </div>
  )
}
