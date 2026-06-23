const STAGGER_MS = 280
const STAGGER_MS_MOBILE = 0

let slot = 0

function staggerMs() {
  if (typeof document === 'undefined') return STAGGER_MS
  return document.documentElement.dataset.mobilePerfCut === 'on' ? STAGGER_MS_MOBILE : STAGGER_MS
}

export function resetStaggeredIdleMounts() {
  slot = 0
}

/** Spread deferred section mounts across idle frames on mobile. */
export function scheduleStaggeredIdleMount(): Promise<void> {
  const index = slot++
  const waitMs = index * staggerMs()
  return new Promise((resolve) => {
    if (waitMs <= 0) {
      resolve()
      return
    }
    window.setTimeout(() => resolve(), waitMs)
  })
}
