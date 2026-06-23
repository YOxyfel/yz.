'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react'
import { useDeviceProfile } from './device-profile'
import { hashMatchesAnchor, hashTargetId, SITE_HASH_NAV_EVENT } from './hash-scroll'
import {
  resetStaggeredIdleMounts,
  scheduleStaggeredIdleMount,
} from './staggered-idle-mount'
import { getScrollIdle, subscribeScrollIdle } from './use-scroll-idle'

function useScrollIdleSnapshot() {
  return useSyncExternalStore(subscribeScrollIdle, getScrollIdle, () => true)
}

function useNativeInViewOnce(
  ref: RefObject<HTMLDivElement | null>,
  rootMargin: string
) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (inView) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [inView, ref, rootMargin])

  return inView
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
  const { mobilePerfCut, fxLite } = useDeviceProfile()
  const scrollIdle = useScrollIdleSnapshot()
  const deferMountWhileScrolling = mobilePerfCut || fxLite
  const effectiveRootMargin = deferMountWhileScrolling ? '120px 0px' : rootMargin

  const [hashForced, setHashForced] = useState(() => {
    if (typeof window === 'undefined' || !anchorId) return false
    return hashTargetId(window.location.hash) === anchorId
  })
  const [contentMounted, setContentMounted] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useNativeInViewOnce(ref, effectiveRootMargin)

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

  useEffect(() => {
    if (deferMountWhileScrolling && !scrollIdle) {
      resetStaggeredIdleMounts()
    }
  }, [deferMountWhileScrolling, scrollIdle])

  const pendingMount =
    hashForced || (inView && (!deferMountWhileScrolling || scrollIdle))

  useEffect(() => {
    if (!pendingMount) {
      setContentMounted(false)
      return
    }

    if (hashForced || !deferMountWhileScrolling) {
      setContentMounted(true)
      return
    }

    let cancelled = false
    scheduleStaggeredIdleMount().then(() => {
      if (!cancelled) setContentMounted(true)
    })

    return () => {
      cancelled = true
    }
  }, [pendingMount, hashForced, deferMountWhileScrolling])

  return (
    <div
      ref={ref}
      className={`perf-deferred-section content-deferred-section ${className ?? ''}`.trim()}
      style={{ minHeight, contentVisibility: 'auto' }}
    >
      {contentMounted ? children : placeholder}
    </div>
  )
}
