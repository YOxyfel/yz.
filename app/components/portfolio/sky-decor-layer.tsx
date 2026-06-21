'use client'

import { useMemo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { OrbitDecorLayer, OrbitDecorSelectionHud } from './crazy-orbit-decor'
import { NebulaBurstLayer } from './nebula-burst'
import { useConstellations } from './constellation-context'
import { useDeviceProfile } from './device-profile'
import { resolveSkyLabFx } from './sky-lab-fx'
import { usePageVisible } from './use-page-visible'
import { useVisualFxPreferences } from './visual-fx-preferences'
import { OrbitDecorInteractionProvider } from './orbit-decor-interaction'

export function SkyDecorLayer() {
  const [mounted, setMounted] = useState(false)
  const pageVisible = usePageVisible()
  const { enableOrbitHitboxes, isCoarsePointer, fxLite } = useDeviceProfile()
  const { showScreenFx, isReduced } = useVisualFxPreferences()
  const { skyLabFxEnabled, skyLabLite } = resolveSkyLabFx(showScreenFx, isReduced, fxLite)
  const {
    constellationLabEnabled,
    orbitDecors,
    selectedOrbitDecorId,
    nebulaBurst,
    dismissNebulaBurst,
  } = useConstellations()

  const backDecors = useMemo(
    () => orbitDecors.filter((decor) => (decor.stackLayer ?? 'back') !== 'front'),
    [orbitDecors]
  )
  const frontDecors = useMemo(
    () => orbitDecors.filter((decor) => (decor.stackLayer ?? 'back') === 'front'),
    [orbitDecors]
  )

  const backHitboxDecors = useMemo(() => {
    if (enableOrbitHitboxes) return backDecors
    if (!selectedOrbitDecorId) return []
    return backDecors.filter((decor) => decor.id === selectedOrbitDecorId)
  }, [backDecors, enableOrbitHitboxes, selectedOrbitDecorId])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!constellationLabEnabled || !pageVisible || !skyLabFxEnabled) return null

  const decorLayoutKey = isCoarsePointer ? 'coarse' : enableOrbitHitboxes ? 'hitbox' : 'selected'
  const showInteraction = !skyLabLite
  const showNebula = !skyLabLite

  const visualBackLayer =
    backDecors.length > 0 ? (
      <div
        className={`sky-decor-stack sky-decor-stack-back pointer-events-none fixed inset-0 z-[6] ${
          skyLabLite ? 'sky-decor-stack-reduced' : ''
        }`}
      >
        <OrbitDecorLayer decors={backDecors} renderMode="visual" reduced={skyLabLite} />
      </div>
    ) : null

  const interactionLayer = showInteraction ? (
    <OrbitDecorInteractionProvider decors={orbitDecors}>
      <div
        key={decorLayoutKey}
        className="sky-decor-stack sky-decor-stack-front pointer-events-none fixed inset-0 z-[38]"
      >
        {isCoarsePointer && orbitDecors.length > 0 ? (
          <OrbitDecorLayer decors={orbitDecors} renderMode="hitbox" />
        ) : (
          <>
            {backHitboxDecors.length > 0 ? (
              <OrbitDecorLayer decors={backHitboxDecors} renderMode="hitbox" />
            ) : null}
            {frontDecors.length > 0 ? (
              <OrbitDecorLayer decors={frontDecors} renderMode="full" />
            ) : null}
          </>
        )}
        <OrbitDecorSelectionHud />
      </div>
    </OrbitDecorInteractionProvider>
  ) : null

  return (
    <>
      {mounted && visualBackLayer ? createPortal(visualBackLayer, document.body) : null}

      {!isCoarsePointer && showNebula && nebulaBurst ? (
        <div className="sky-decor-stack sky-decor-stack-mid pointer-events-none fixed inset-0 z-[6]">
          <NebulaBurstLayer burst={nebulaBurst} onComplete={dismissNebulaBurst} />
        </div>
      ) : null}

      {mounted && interactionLayer ? createPortal(interactionLayer, document.body) : null}
    </>
  )
}
