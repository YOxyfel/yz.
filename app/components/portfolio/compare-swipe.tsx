'use client'

import { useCallback, useRef, useState } from 'react'

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

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const next = (clientX - rect.left) / rect.width
    setRatio(Math.min(0.98, Math.max(0.02, next)))
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden ${className}`}
      onPointerDown={(event) => {
        dragging.current = true
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
      <div
        className="absolute inset-0 [&>*]:relative [&>*]:h-full [&>*]:w-full"
        style={{ clipPath: `inset(0 ${(1 - ratio) * 100}% 0 0)` }}
      >
        {left}
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-cyan shadow-[0_0_16px_var(--cyan)]"
        style={{ left: `${ratio * 100}%` }}
      />
      <div
        className="absolute top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-cyan/50 bg-black/70 text-cyan shadow-[0_0_24px_-4px_var(--cyan)] backdrop-blur-md"
        style={{ left: `${ratio * 100}%` }}
        aria-hidden
      >
        <span className="font-mono text-[10px]">⟷</span>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/55 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground backdrop-blur-md">
        {labelLeft}
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/55 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground backdrop-blur-md">
        {labelRight}
      </div>
    </div>
  )
}
