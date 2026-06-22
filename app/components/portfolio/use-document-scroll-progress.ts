'use client'

import { useMotionValue, type MotionValue } from 'framer-motion'
import { useEffect } from 'react'

/** Scroll progress 0–1 with layout reads and style writes split across rAF frames. */
export function useDocumentScrollProgress(): MotionValue<number> {
  const progress = useMotionValue(0)

  useEffect(() => {
    let maxScroll = 0
    let readRaf = 0
    let writeRaf = 0
    let pendingY = 0

    const measureMaxScroll = () => {
      maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    }

    const writeProgress = () => {
      writeRaf = 0
      const next = maxScroll > 0 ? Math.min(1, Math.max(0, pendingY / maxScroll)) : 0
      progress.set(next)
    }

    const readScrollY = () => {
      readRaf = 0
      pendingY = window.scrollY
      if (!writeRaf) {
        writeRaf = requestAnimationFrame(writeProgress)
      }
    }

    const scheduleRead = () => {
      if (!readRaf) readRaf = requestAnimationFrame(readScrollY)
    }

    measureMaxScroll()
    scheduleRead()

    const resizeObserver = new ResizeObserver(() => {
      measureMaxScroll()
      scheduleRead()
    })
    resizeObserver.observe(document.documentElement)

    window.addEventListener('scroll', scheduleRead, { passive: true })

    return () => {
      window.removeEventListener('scroll', scheduleRead)
      resizeObserver.disconnect()
      if (readRaf) cancelAnimationFrame(readRaf)
      if (writeRaf) cancelAnimationFrame(writeRaf)
    }
  }, [progress])

  return progress
}
