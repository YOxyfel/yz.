'use client'

import { useInView } from 'framer-motion'
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useDeviceProfile } from './device-profile'
import { hashMatchesAnchor, hashTargetId, SITE_HASH_NAV_EVENT } from './hash-scroll'
import { getScrollIdle, subscribeScrollIdle } from './use-scroll-idle'

function useScrollIdleSnapshot() {
  return useSyncExternalStore(subscribeScrollIdle, getScrollIdle, () => true)
}

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
  const { isNarrow, isTablet, isCoarsePointer, fxLite } = useDeviceProfile()
  const scrollIdle = useScrollIdleSnapshot()
  const deferMountWhileScrolling = isNarrow || isTablet || isCoarsePointer || fxLite
  const effectiveRootMargin = deferMountWhileScrolling ? '160px 0px' : rootMargin

  const [hashForced, setHashForced] = useState(() => {
    if (typeof window === 'undefined' || !anchorId) return false
    return hashTargetId(window.location.hash) === anchorId
  })
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, {
    once: true,
    margin: effectiveRootMargin as `${number}px ${number}px`,
  })

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

  const shouldMount = hashForced || (inView && (!deferMountWhileScrolling || scrollIdle))

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
