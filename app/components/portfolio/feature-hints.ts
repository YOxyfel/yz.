export const FEATURE_HINT_KEYS = {
  skyLab: 'feature-hint-sky-lab',
  siteVariant: 'feature-hint-site-variant',
} as const

export function hasSeenHint(key: string): boolean {
  if (typeof window === 'undefined') return true
  return sessionStorage.getItem(key) === '1'
}

export function markHintSeen(key: string): void {
  sessionStorage.setItem(key, '1')
}
