'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type OffscreenAnimationFreezeProps = {
  children: ReactNode
  className?: string
  rootMargin?: string
}

/** Pauses CSS infinite animations in this subtree when off-screen. */
export function OffscreenAnimationFreeze({
  children,
  className,
  rootMargin = '120px 0px',
}: OffscreenAnimationFreezeProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [frozen, setFrozen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setFrozen(!entry?.isIntersecting),
      { threshold: 0, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} className={className} data-animation-frozen={frozen ? 'true' : 'false'}>
      {children}
    </div>
  )
}
