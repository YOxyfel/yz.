/** Matches Tailwind `md` — viewport below this is treated as mobile/narrow. */
export const MOBILE_MAX_PX = 767

/** Matches Tailwind `lg` — tablet range ends here. */
export const TABLET_MAX_PX = 1023

/** Min width for the labeled corner tools dock on the nav row (below → hamburger menu). */
export const CORNER_DOCK_MIN_PX = 1720

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

export const DEVICE_BOOTSTRAP_SCRIPT = `(function(){try{var mqN='${MEDIA_NARROW}',mqT='${MEDIA_TABLET}',mqC='${MEDIA_COARSE_POINTER}',mqR='${MEDIA_REDUCED_MOTION}';function snap(){var n=window.matchMedia(mqN).matches,c=window.matchMedia(mqC).matches,r=window.matchMedia(mqR).matches,t=window.matchMedia(mqT).matches,cores=navigator.hardwareConcurrency||4,mem=navigator.deviceMemory,d=document.documentElement,tier='mid';if(n||c||r)tier='low';else if(cores>=8&&(!mem||mem>=8))tier='high';d.dataset.narrow=n?'on':'off';d.dataset.tablet=t?'on':'off';d.dataset.coarsePointer=c?'on':'off';d.dataset.fxLite=n||c||r||tier==='low'?'on':'off';d.dataset.perfTier=tier;d.dataset.perfHardware=tier;var lockZoom=n||t||c;d.dataset.mobileZoomLock=lockZoom?'on':'off';var vp=document.querySelector('meta[name="viewport"]');if(vp){vp.setAttribute('content',lockZoom?'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover':'width=device-width, initial-scale=1, viewport-fit=cover');}}snap();window.addEventListener('resize',snap,{passive:true});document.addEventListener('gesturestart',function(e){if(document.documentElement.dataset.mobileZoomLock==='on')e.preventDefault();},{passive:false});}catch(e){}})();`

/** Runs before paint on the home route — prevents #explore and scroll restoration from skipping the intro. */
export const HOME_SCROLL_BOOTSTRAP_SCRIPT = `(function(){try{var path=location.pathname;var isHome=path==='/'||/^\\/[a-z]{2}$/.test(path);if(!isHome)return;if('scrollRestoration' in history)history.scrollRestoration='manual';var hash=location.hash;if(hash&&hash!=='#explore')return;if(hash==='#explore'){history.replaceState(null,'',path+location.search);}window.scrollTo(0,0);}catch(e){}})();`
