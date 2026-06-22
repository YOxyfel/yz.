'use client'

import dynamic from 'next/dynamic'
import { ClickConstellations } from './click-constellations'
import { CosmicScrollFx } from './cosmic-scroll-fx'
import { useConstellationChrome } from './constellation-context'
import { useDeviceProfile } from './device-profile'
import { useDeferredFxMount } from './use-deferred-fx-mount'
import { usePageVisible } from './use-page-visible'
import { useScrollIdle } from './use-scroll-idle'
import { useVisualFxPreferences } from './visual-fx-preferences'
import type { PerformanceTier } from './performance-tier'

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

type CosmicScrollRouterProps = {
  cosmicLite: boolean
  fxMedium: boolean
  performanceTier: PerformanceTier
  mode: string
}

function CosmicScrollRouter({ cosmicLite, fxMedium, performanceTier, mode }: CosmicScrollRouterProps) {
  const scrollIdle = useScrollIdle()
  const cinematicCosmic =
    !cosmicLite && !fxMedium && performanceTier === 'high' && mode === 'full' && scrollIdle
  const cosmicMedium = !cosmicLite && !cinematicCosmic

  return <CosmicScrollFx lite={cosmicLite} medium={cosmicMedium} tier={performanceTier} />
}
type ScrollGatedBlurBlobsProps = {
  enabled: boolean
}

function ScrollGatedBlurBlobs({ enabled }: ScrollGatedBlurBlobsProps) {
  const scrollIdle = useScrollIdle()
  if (!enabled || !scrollIdle) return null

  return (
    <>
      <div className="bg-fx-blur-blob animate-breathe absolute -left-32 top-1/4 h-[42rem] w-[42rem] rounded-full bg-cyan/[0.04] blur-3xl max-md:hidden" />
      <div className="bg-fx-blur-blob animate-breathe-slow absolute -right-40 top-1/2 h-[40rem] w-[40rem] rounded-full bg-violet/[0.04] blur-3xl max-md:hidden" />
    </>
  )
}

type ScrollGatedStarshipsProps = {
  showMobileSkyLabStarships: boolean
  showAmbientStarships: boolean
  performanceTier: PerformanceTier
  mobileSkyLab: boolean
  pageVisible: boolean
}

function ScrollGatedStarships({
  showMobileSkyLabStarships,
  showAmbientStarships,
  performanceTier,
  mobileSkyLab,
  pageVisible,
}: ScrollGatedStarshipsProps) {
  const scrollIdle = useScrollIdle()
  const showStarship = showMobileSkyLabStarships || showAmbientStarships
  const pauseStarshipMotion = !scrollIdle && !showMobileSkyLabStarships

  if (!showStarship) return null

  return (
    <StarshipTraffic
      enabled
      liteMode={performanceTier !== 'high' || mobileSkyLab}
      pauseSpawning={!pageVisible || pauseStarshipMotion}
      pauseMotion={pauseStarshipMotion}
    />
  )
}

type ScrollGatedHeavyExtrasProps = {
  showHeavyFx: boolean
  enableHeavyBackgroundFx: boolean
  pageVisible: boolean
  performanceTier: PerformanceTier
  mode: string
  cosmicLite: boolean
  fxMedium: boolean
}

function ScrollGatedHeavyExtras({
  showHeavyFx,
  enableHeavyBackgroundFx,
  pageVisible,
  performanceTier,
  mode,
  cosmicLite,
  fxMedium,
}: ScrollGatedHeavyExtrasProps) {
  const scrollIdle = useScrollIdle()
  const cinematicCosmic =
    !cosmicLite &&
    !fxMedium &&
    performanceTier === 'high' &&
    mode === 'full' &&
    scrollIdle
  const heavyExtrasReady = useDeferredFxMount(
    showHeavyFx && enableHeavyBackgroundFx && pageVisible && cinematicCosmic
  )
  const showHighTierExtras = showHeavyFx && enableHeavyBackgroundFx && heavyExtrasReady

  return <ScrollGatedBlurBlobs enabled={showHighTierExtras} />
}

export function BackgroundFx() {
  const { constellationLabEnabled, mobileSkyLabMode } = useConstellationChrome()
  const deviceProfile = useDeviceProfile()
  const { fxLite, fxMedium, performanceTier, enableHeavyBackgroundFx } = deviceProfile
  const { showScreenFx, isReduced, mode } = useVisualFxPreferences()
  const pageVisible = usePageVisible()

  const mobileSkyLab = mobileSkyLabMode
  const skyLabOpen = constellationLabEnabled || mobileSkyLab
  const skyLabLite = isReduced || fxLite

  const cosmicLite = fxLite || isReduced || !pageVisible || !showScreenFx
  const showHeavyFx = showScreenFx && pageVisible && !isReduced && !fxLite && mode === 'full'
  const showMobileSkyLabStarships = mobileSkyLab && skyLabOpen && showScreenFx && pageVisible && !isReduced
  const showAmbientStarships =
    showScreenFx &&
    pageVisible &&
    !isReduced &&
    !mobileSkyLab &&
    !skyLabOpen &&
    performanceTier !== 'low'
  const showClickConstellations = showScreenFx && (skyLabOpen || mobileSkyLab)
  const constellationLite = skyLabLite || mobileSkyLab

  if (!showScreenFx) {
    return <StaticBackdrop />
  }

  return (
    <div
      aria-hidden
      className="device-profile-gated pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <CosmicScrollRouter
        cosmicLite={cosmicLite}
        fxMedium={fxMedium}
        performanceTier={performanceTier}
        mode={mode}
      />

      <ScrollGatedHeavyExtras
        showHeavyFx={showHeavyFx}
        enableHeavyBackgroundFx={enableHeavyBackgroundFx}
        pageVisible={pageVisible}
        performanceTier={performanceTier}
        mode={mode}
        cosmicLite={cosmicLite}
        fxMedium={fxMedium}
      />

      <ScrollGatedStarships
        showMobileSkyLabStarships={showMobileSkyLabStarships}
        showAmbientStarships={showAmbientStarships}
        performanceTier={performanceTier}
        mobileSkyLab={mobileSkyLab}
        pageVisible={pageVisible}
      />

      {showClickConstellations ? (
        <ClickConstellations
          lite={constellationLite}
          hideLabels={skyLabLite && skyLabOpen && !mobileSkyLab}
        />
      ) : null}
    </div>
  )
}
