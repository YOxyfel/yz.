export const SITE_HASH_NAV_EVENT = 'site-hash-nav'
export const SITE_HASH_MOUNT_ALL_EVENT = 'site-hash-mount-all'
export const INTRO_ONLY_HASH = '#explore'

export function hashTargetId(hash: string) {
  return decodeURIComponent(hash.replace(/^#/, ''))
}

export function requestHashSectionMount(id: string) {
  if (typeof window === 'undefined' || !id) return
  window.dispatchEvent(new CustomEvent(SITE_HASH_NAV_EVENT, { detail: { id } }))
}

/**
 * Force every lazy section to mount so the document height is final before we
 * scroll to a hash target. Without this, sections between the viewport and the
 * target expand past their placeholder heights mid-scroll and the target drifts.
 */
export function requestAllSectionsMount() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SITE_HASH_MOUNT_ALL_EVENT))
}

/** A hash that points at a real section (not empty and not the intro). */
export function isSectionHash(hash: string | null | undefined) {
  return !!hash && hash.length > 1 && hash !== INTRO_ONLY_HASH
}

export function hashMatchesAnchor(hash: string, anchorId: string) {
  return hashTargetId(hash) === anchorId
}
