import { DEVICE_PROFILE_QUERIES } from './breakpoints'

export function readMobileStaticFromDom(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.dataset.mobileStatic === 'on'
}

export function subscribeMobileStatic(onStoreChange: () => void) {
  const media = DEVICE_PROFILE_QUERIES.slice(0, 3).map((query) => window.matchMedia(query))
  media.forEach((entry) => entry.addEventListener('change', onStoreChange))
  return () => media.forEach((entry) => entry.removeEventListener('change', onStoreChange))
}
