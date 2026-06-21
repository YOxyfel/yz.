'use client'

import { useSyncExternalStore } from 'react'

function subscribe(onStoreChange: () => void) {
  document.addEventListener('visibilitychange', onStoreChange)
  return () => document.removeEventListener('visibilitychange', onStoreChange)
}

function getSnapshot() {
  return document.visibilityState === 'visible'
}

function getServerSnapshot() {
  return true
}

export function usePageVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
