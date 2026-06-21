/** Matches Tailwind `md` — viewport below this is treated as mobile/narrow. */
export const MOBILE_MAX_PX = 767

/** Matches Tailwind `lg` — tablet range ends here. */
export const TABLET_MAX_PX = 1023

export const MEDIA_NARROW = `(max-width: ${MOBILE_MAX_PX}px)` as const
export const MEDIA_TABLET = `(min-width: ${MOBILE_MAX_PX + 1}px) and (max-width: ${TABLET_MAX_PX}px)` as const
export const MEDIA_COARSE_POINTER = '(pointer: coarse)' as const
export const MEDIA_REDUCED_MOTION = '(prefers-reduced-motion: reduce)' as const

export const DEVICE_PROFILE_QUERIES = [
  MEDIA_COARSE_POINTER,
  MEDIA_NARROW,
  MEDIA_TABLET,
  MEDIA_REDUCED_MOTION,
] as const

export const DEVICE_BOOTSTRAP_SCRIPT = `(function(){try{var n=window.matchMedia('${MEDIA_NARROW}').matches,c=window.matchMedia('${MEDIA_COARSE_POINTER}').matches,r=window.matchMedia('${MEDIA_REDUCED_MOTION}').matches,t=window.matchMedia('${MEDIA_TABLET}').matches,cores=navigator.hardwareConcurrency||4,mem=navigator.deviceMemory,d=document.documentElement,tier='mid';if(n||c||r)tier='low';else if(cores>=8&&(!mem||mem>=8))tier='high';d.dataset.narrow=n?'on':'off';d.dataset.tablet=t?'on':'off';d.dataset.coarsePointer=c?'on':'off';d.dataset.fxLite=n||c||r||tier==='low'?'on':'off';d.dataset.perfTier=tier;d.dataset.perfHardware=tier;}catch(e){}})();`
