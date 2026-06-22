export const SITE_HASH_NAV_EVENT = 'site-hash-nav'

export function hashTargetId(hash: string) {
  return decodeURIComponent(hash.replace(/^#/, ''))
}

export function requestHashSectionMount(id: string) {
  if (typeof window === 'undefined' || !id) return
  window.dispatchEvent(new CustomEvent(SITE_HASH_NAV_EVENT, { detail: { id } }))
}

export function hashMatchesAnchor(hash: string, anchorId: string) {
  return hashTargetId(hash) === anchorId
}
