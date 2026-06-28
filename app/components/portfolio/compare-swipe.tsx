'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { usePointerBoundsCache } from './use-pointer-bounds-cache'

type CompareSwipeProps = {
  left: React.ReactNode
  right: React.ReactNode
  className?: string
  initial?: number
  labelLeft?: string
  labelRight?: string
}

export function CompareSwipe({
  left,
  right,
  className = '',
  initial = 0.5,
  labelLeft = 'Wireframe',
  labelRight = 'Rendered',
}: CompareSwipeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ratio, setRatio] = useState(initial)
  const dragging = useRef(false)
  const writeRaf = useRef(0)
  const pendingRatio = useRef(initial)
  const { boundsRef, refreshBounds } = usePointerBoundsCache(containerRef)

  const commitRatio = useCallback((next: number) => {
    const clamped = Math.min(0.98, Math.max(0.02, next))
    pendingRatio.current = clamped
    if (writeRaf.current) return
    writeRaf.current = requestAnimationFrame(() => {
      writeRaf.current = 0
      setRatio(pendingRatio.current)
    })
  }, [])

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const { left: boundLeft, width } = boundsRef.current
      commitRatio((clientX - boundLeft) / width)
    },
    [boundsRef, commitRatio]
  )

  useEffect(() => {
    return () => {
      if (writeRaf.current) cancelAnimationFrame(writeRaf.current)
    }
  }, [])

  const rootStyle = { '--compare-ratio': ratio } as CSSProperties

  return (
    <div
      ref={containerRef}
      className={`compare-swipe-root relative select-none overflow-hidden ${className}`}
      style={rootStyle}
      onPointerDown={(event) => {
        dragging.current = true
        refreshBounds()
        containerRef.current?.setPointerCapture(event.pointerId)
        updateFromClientX(event.clientX)
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return
        updateFromClientX(event.clientX)
      }}
      onPointerUp={(event) => {
        dragging.current = false
        containerRef.current?.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={() => {
        dragging.current = false
      }}
    >
      <div className="absolute inset-0">{right}</div>
      <div className="compare-swipe-clip absolute inset-0 [&>*]:relative [&>*]:h-full [&>*]:w-full">
        {left}
      </div>

      <div className="compare-swipe-divider pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-cyan shadow-[0_0_16px_var(--cyan)]" />
      <div
        className="compare-swipe-handle absolute top-1/2 z-20 flex h-10 w-10 cursor-ew-resize items-center justify-center rounded-full border border-cyan/50 bg-[oklch(0.12_0.04_285/0.92)] text-cyan shadow-[0_0_24px_-4px_var(--cyan)]"
        aria-hidden
      >
        <span className="font-mono text-[10px]">⟷</span>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-[oklch(0.12_0.04_285/0.9)] px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {labelLeft}
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/10 bg-[oklch(0.12_0.04_285/0.9)] px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {labelRight}
      </div>
    </div>
  )
}
