'use client'

import { useSyncExternalStore } from 'react'

const DEFAULT_IDLE_MS = 220
const MOBILE_IDLE_MS = 480

function isMobilePerfCutDom() {
  if (typeof document === 'undefined') return false
  return document.documentElement.dataset.mobilePerfCut === 'on'
}

function activeIdleMs() {
  return isMobilePerfCutDom() ? MOBILE_IDLE_MS : idleMs
}

let scrollIdle = true
let idleMs = DEFAULT_IDLE_MS
let idleTimer: number | undefined
let listenerBound = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function setScrollIdle(next: boolean) {
  if (scrollIdle === next) return
  scrollIdle = next
  if (typeof document !== 'undefined' && !isMobilePerfCutDom()) {
    document.documentElement.dataset.scrollBusy = next ? 'off' : 'on'
  }
  emit()
}

function onScroll() {
  if (isMobilePerfCutDom()) return
  setScrollIdle(false)
  if (idleTimer) window.clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => setScrollIdle(true), activeIdleMs())
}

function ensureScrollListener() {
  if (listenerBound || typeof window === 'undefined' || isMobilePerfCutDom()) return
  listenerBound = true
  window.addEventListener('scroll', onScroll, { passive: true })
}

function subscribe(listener: () => void) {
  ensureScrollListener()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && listenerBound && typeof window !== 'undefined') {
      window.removeEventListener('scroll', onScroll)
      listenerBound = false
      if (idleTimer) window.clearTimeout(idleTimer)
      idleTimer = undefined
      scrollIdle = true
      document.documentElement.dataset.scrollBusy = 'off'
    }
  }
}

function getSnapshot() {
  return scrollIdle
}

function getServerSnapshot() {
  return true
}

export function getScrollIdle() {
  return scrollIdle
}

/** Subscribe without React — for heavy providers that must not re-render on scroll. */
export function subscribeScrollIdle(listener: () => void) {
  return subscribe(listener)
}

/** Shared scroll-idle signal — only notifies subscribers when idle/active flips. */
export function useScrollIdle(nextIdleMs = DEFAULT_IDLE_MS) {
  if (idleMs !== nextIdleMs) {
    idleMs = nextIdleMs
  }
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
