'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo } from 'react'
import { ClickConstellations } from './click-constellations'
import { CosmicScrollFx } from './cosmic-scroll-fx'
import { useConstellations } from './constellation-context'
import { useDeviceProfile } from './device-profile'
import { usePageVisible } from './use-page-visible'
import { useScrollIdle } from './use-scroll-idle'
import { useVisualFxPreferences } from './visual-fx-preferences'

const StarshipTraffic = dynamic(
  () => import('./starship-traffic').then((mod) => mod.StarshipTraffic),
  { ssr: false }
)

const OrbitDecorLayer = dynamic(
  () => import('./crazy-orbit-decor').then((mod) => mod.OrbitDecorLayer),
  { ssr: false }
)

function StaticBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[oklch(0.08_0.012_270)]"
    />
  )
}

export function BackgroundFx() {
  const { constellationLabEnabled, mobileSkyLabMode, orbitDecors } = useConstellations()
  const deviceProfile = useDeviceProfile()
  const { fxLite, fxMedium, isCoarsePointer, isNarrow } = deviceProfile
  const { showScreenFx, isReduced } = useVisualFxPreferences()
  const pageVisible = usePageVisible()
  const scrollIdle = useScrollIdle()

  const mobileSkyLab = mobileSkyLabMode

  const backDecors = useMemo(
    () =>
      isCoarsePointer || mobileSkyLab
        ? []
        : orbitDecors.filter((decor) => (decor.stackLayer ?? 'back') !== 'front'),
    [isCoarsePointer, mobileSkyLab, orbitDecors]
  )

  const cosmicLite = (fxLite || isReduced || !pageVisible) && !fxMedium
  const cosmicMedium = !cosmicLite && fxMedium
  const starshipLite = fxLite || fxMedium
  const showHeavyFx = showScreenFx && pageVisible && !isReduced && !fxLite
  const showStarship =
    showScreenFx && pageVisible && !isReduced && !mobileSkyLab && (starshipLite || scrollIdle)
  const showClickConstellations = (showHeavyFx && !fxLite) || mobileSkyLab

  useEffect(() => {
    document.documentElement.dataset.bgFxActive = showHeavyFx ? 'on' : 'off'
    return () => {
      delete document.documentElement.dataset.bgFxActive
    }
  }, [showHeavyFx])

  if (!showScreenFx) {
    return <StaticBackdrop />
  }

  return (
    <div
      aria-hidden
      className="device-profile-gated pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <CosmicScrollFx lite={cosmicLite} medium={cosmicMedium} />

      {showHeavyFx && !fxLite ? (
        <>
          <div className="bg-fx-blur-blob animate-breathe absolute -left-32 top-1/4 h-[42rem] w-[42rem] rounded-full bg-cyan/[0.04] blur-3xl max-md:hidden" />
          <div className="bg-fx-blur-blob animate-breathe-slow absolute -right-40 top-1/2 h-[40rem] w-[40rem] rounded-full bg-violet/[0.04] blur-3xl max-md:hidden" />
        </>
      ) : null}

      <div
        className={`bg-grid absolute inset-0 ${
          mobileSkyLab
            ? 'opacity-0'
            : cosmicLite
              ? 'opacity-[0.14]'
              : 'animate-grid-pan opacity-[0.28]'
        }`}
      />

      {showStarship ? <StarshipTraffic enabled liteMode={starshipLite} /> : null}

      {showClickConstellations ? (
        <ClickConstellations lite={fxLite || mobileSkyLab} />
      ) : null}

      {backDecors.length > 0 && showHeavyFx ? (
        <div className="bg-fx-heavy sky-decor-stack sky-decor-stack-back background-fx-decor-layer pointer-events-none absolute inset-0">
          <OrbitDecorLayer decors={backDecors} renderMode="visual" />
        </div>
      ) : null}
    </div>
  )
}
