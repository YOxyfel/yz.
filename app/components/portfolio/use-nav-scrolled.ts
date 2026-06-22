'use client'

import { useSyncExternalStore } from 'react'

const NAV_SCROLL_THRESHOLD_PX = 40

let navScrolled = false
let observer: IntersectionObserver | null = null
let sentinelEl: HTMLElement | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function setNavScrolled(next: boolean) {
  if (navScrolled === next) return
  navScrolled = next
  emit()
}

function bindSentinel(el: HTMLElement) {
  if (observer && sentinelEl === el) return

  observer?.disconnect()
  sentinelEl = el

  observer = new IntersectionObserver(
    ([entry]) => {
      setNavScrolled(!entry?.isIntersecting)
    },
    {
      threshold: 0,
      rootMargin: `-${NAV_SCROLL_THRESHOLD_PX}px 0px 0px 0px`,
    }
  )
  observer.observe(el)
}

function unbindSentinel(el: HTMLElement) {
  if (sentinelEl !== el) return
  observer?.disconnect()
  observer = null
  sentinelEl = null
  navScrolled = false
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && sentinelEl) {
      unbindSentinel(sentinelEl)
    }
  }
}

function getSnapshot() {
  return navScrolled
}

function getServerSnapshot() {
  return false
}

export function useNavScrolled() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function registerNavScrollSentinel(el: HTMLElement) {
  bindSentinel(el)
  return () => unbindSentinel(el)
}
