'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { ClickConstellations } from './click-constellations'
import { CosmicScrollFx } from './cosmic-scroll-fx'
import { useConstellations } from './constellation-context'
import { useDeviceProfile } from './device-profile'
import { useDeferredFxMount } from './use-deferred-fx-mount'
import { usePageVisible } from './use-page-visible'
import { useScrollIdle } from './use-scroll-idle'
import { useVisualFxPreferences } from './visual-fx-preferences'

const StarshipTraffic = dynamic(
  () => import('./starship-traffic').then((mod) => mod.StarshipTraffic),
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
  const { constellationLabEnabled, mobileSkyLabMode } = useConstellations()
  const deviceProfile = useDeviceProfile()
  const {
    fxLite,
    fxMedium,
    performanceTier,
    enableHeavyBackgroundFx,
  } = deviceProfile
  const { showScreenFx, isReduced } = useVisualFxPreferences()
  const pageVisible = usePageVisible()
  const scrollIdle = useScrollIdle()

  const mobileSkyLab = mobileSkyLabMode
  const skyLabOpen = constellationLabEnabled || mobileSkyLab
  const skyLabLite = isReduced || fxLite

  const cosmicLite = (fxLite || isReduced || !pageVisible) && !fxMedium
  const cosmicMedium = !cosmicLite && fxMedium
  const showHeavyFx = showScreenFx && pageVisible && !isReduced && !fxLite
  const heavyExtrasReady = useDeferredFxMount(
    showHeavyFx && enableHeavyBackgroundFx && pageVisible
  )
  const showHighTierExtras = showHeavyFx && enableHeavyBackgroundFx && heavyExtrasReady
  const showMobileSkyLabStarships = mobileSkyLab && skyLabOpen && showScreenFx && pageVisible && !isReduced
  const showAmbientStarships =
    showScreenFx &&
    pageVisible &&
    !isReduced &&
    !mobileSkyLab &&
    !skyLabOpen &&
    performanceTier !== 'low' &&
    scrollIdle
  const showStarship = showMobileSkyLabStarships || showAmbientStarships
  const showClickConstellations =
    showScreenFx &&
    (skyLabOpen || mobileSkyLab || (showHeavyFx && !fxLite))
  const constellationLite = skyLabLite || mobileSkyLab
  const animateGrid = showHeavyFx && performanceTier === 'high' && !mobileSkyLab && !skyLabOpen

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
      <CosmicScrollFx lite={cosmicLite} medium={cosmicMedium} tier={performanceTier} />

      {showHighTierExtras ? (
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
              : animateGrid
                ? 'animate-grid-pan opacity-[0.28]'
                : 'opacity-[0.2]'
        }`}
      />

      {showStarship ? (
        <StarshipTraffic
          enabled
          liteMode={performanceTier !== 'high' || mobileSkyLab}
          pauseSpawning={!pageVisible || (!scrollIdle && !showMobileSkyLabStarships)}
        />
      ) : null}

      {showClickConstellations ? (
        <ClickConstellations
          lite={constellationLite}
          hideLabels={skyLabLite && skyLabOpen && !mobileSkyLab}
        />
      ) : null}
    </div>
  )
}
