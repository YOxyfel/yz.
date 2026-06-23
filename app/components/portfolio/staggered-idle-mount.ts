const STAGGER_MS = 160

let slot = 0

export function resetStaggeredIdleMounts() {
  slot = 0
}

/** Spread deferred section mounts across idle frames on mobile. */
export function scheduleStaggeredIdleMount(): Promise<void> {
  const index = slot++
  const waitMs = index * STAGGER_MS
  return new Promise((resolve) => {
    if (waitMs <= 0) {
      requestAnimationFrame(() => resolve())
      return
    }
    window.setTimeout(() => resolve(), waitMs)
  })
}
