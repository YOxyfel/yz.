'use client'

import dynamic from 'next/dynamic'
import { CosmicScrollFx } from './cosmic-scroll-fx'
import { ClickConstellations } from './click-constellations'
import { useConstellationChrome } from './constellation-context'
import { useDeviceProfile } from './device-profile'
import { useDeferredFxMount } from './use-deferred-fx-mount'
import { isCosmicScrollDegraded, resolveCosmicIdleMode, useFxRuntime } from './fx-runtime'
import { usePageVisible } from './use-page-visible'
import { useVisualFxPreferences } from './visual-fx-preferences'
import type { PerformanceTier } from './performance-tier'

const StarshipTraffic = dynamic(
  () => import('./starship-traffic').then((mod) => mod.StarshipTraffic),
  { ssr: false }
)

type BackgroundFxLayerProps = {
  fxLite: boolean
  isReduced: boolean
  fxMedium: boolean
  performanceTier: PerformanceTier
  mode: string
  userFullMode: boolean
  showHeavyFx: boolean
  enableHeavyBackgroundFx: boolean
  pageVisible: boolean
  showMobileSkyLabStarships: boolean
  showAmbientStarships: boolean
  mobileSkyLab: boolean
}

function BackgroundFxLayer({
  fxLite,
  isReduced,
  fxMedium,
  performanceTier,
  mode,
  userFullMode,
  showHeavyFx,
  enableHeavyBackgroundFx,
  pageVisible,
  showMobileSkyLabStarships,
  showAmbientStarships,
  mobileSkyLab,
}: BackgroundFxLayerProps) {
  const { scrollIdle, heroInView } = useFxRuntime()

  const idleCosmicMode = resolveCosmicIdleMode({
    hardwareLite: fxLite,
    isReduced,
    fxMedium,
    performanceTier,
    mode,
    userFullMode,
  })
  const scrollDegraded = isCosmicScrollDegraded(scrollIdle, heroInView)

  const cinematicCosmic = idleCosmicMode === 'cinematic' && !scrollDegraded
  const heavyExtrasReady = useDeferredFxMount(
    showHeavyFx && enableHeavyBackgroundFx && pageVisible && cinematicCosmic
  )
  const showHighTierExtras = showHeavyFx && enableHeavyBackgroundFx && heavyExtrasReady

  const showStarship =
    showMobileSkyLabStarships || (showAmbientStarships && heroInView)
  const pauseStarshipMotion =
    (!scrollIdle && !showMobileSkyLabStarships) || !heroInView

  return (
    <>
      <CosmicScrollFx
        idleMode={idleCosmicMode}
        scrollDegraded={scrollDegraded}
        tier={performanceTier}
      />

      {showHighTierExtras ? (
        <>
          <div className="bg-fx-soft-blob bg-fx-soft-blob-cyan animate-breathe absolute -left-32 top-1/4 h-[42rem] w-[42rem] max-md:hidden" />
          <div className="bg-fx-soft-blob bg-fx-soft-blob-violet animate-breathe-slow absolute -right-40 top-1/2 h-[40rem] w-[40rem] max-md:hidden" />
        </>
      ) : null}

      {showStarship ? (
        <StarshipTraffic
          enabled
          liteMode={performanceTier !== 'high' || mobileSkyLab}
          pauseSpawning={!pageVisible || pauseStarshipMotion}
          pauseMotion={pauseStarshipMotion}
        />
      ) : null}
    </>
  )
}

export function BackgroundFx() {
  const { constellationLabEnabled, mobileSkyLabMode } = useConstellationChrome()
  const deviceProfile = useDeviceProfile()
  const { fxLite, fxMedium, performanceTier, enableHeavyBackgroundFx, isDesktop, mobilePerfCut } =
    deviceProfile
  const { showScreenFx, isReduced, mode } = useVisualFxPreferences()
  const pageVisible = usePageVisible()

  const mobileSkyLab = mobileSkyLabMode
  const skyLabOpen = constellationLabEnabled || mobileSkyLab
  const skyLabLite = isReduced || fxLite
  const userFullMode = mode === 'full' && !isReduced

  const showHeavyFx = showScreenFx && pageVisible && userFullMode
  const showMobileSkyLabStarships = mobileSkyLab && skyLabOpen && showScreenFx && pageVisible && !isReduced
  const showAmbientStarships =
    showScreenFx &&
    pageVisible &&
    !isReduced &&
    !mobileSkyLab &&
    !skyLabOpen &&
    isDesktop &&
    performanceTier === 'high'
  const showClickConstellations = showScreenFx && (skyLabOpen || mobileSkyLab)
  const constellationLite = skyLabLite || mobileSkyLab
  const showFxLayer = !mobilePerfCut && showScreenFx

  return (
    <div
      aria-hidden
      className="device-profile-gated pointer-events-none fixed inset-0 z-[4] overflow-hidden"
    >
      {showFxLayer ? (
        <BackgroundFxLayer
          fxLite={fxLite}
          isReduced={isReduced}
          fxMedium={fxMedium}
          performanceTier={performanceTier}
          mode={mode}
          userFullMode={userFullMode}
          showHeavyFx={showHeavyFx}
          enableHeavyBackgroundFx={enableHeavyBackgroundFx}
          pageVisible={pageVisible}
          showMobileSkyLabStarships={showMobileSkyLabStarships}
          showAmbientStarships={showAmbientStarships}
          mobileSkyLab={mobileSkyLab}
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
