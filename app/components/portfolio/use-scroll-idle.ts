'use client'

import { useEffect, useState } from 'react'

export function useScrollIdle(idleMs = 180) {
  const [idle, setIdle] = useState(true)

  useEffect(() => {
    let timer: number | undefined

    const onScroll = () => {
      setIdle(false)
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => setIdle(true), idleMs)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timer) window.clearTimeout(timer)
    }
  }, [idleMs])

  return idle
}
