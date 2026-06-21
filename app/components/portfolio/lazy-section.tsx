'use client'

import { useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

type LazySectionProps = {
  children: ReactNode
  className?: string
  rootMargin?: string
  minHeight?: string
  placeholder?: ReactNode
}

export function LazySection({
  children,
  className,
  rootMargin = '240px 0px',
  minHeight = '1px',
  placeholder = null,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: rootMargin as `${number}px ${number}px` })

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {inView ? children : placeholder}
    </div>
  )
}
