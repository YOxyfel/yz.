/** Site FX tier as applied to Sky Lab (constellations, planets, decor). */
export type SkyLabFxTier = 'off' | 'reduced' | 'full'

export function resolveSkyLabFx(
  showScreenFx: boolean,
  isReduced: boolean,
  fxLite: boolean
): {
  skyLabFxEnabled: boolean
  skyLabLite: boolean
  skyLabFxTier: SkyLabFxTier
} {
  const skyLabFxEnabled = showScreenFx
  const skyLabLite = isReduced || fxLite
  const skyLabFxTier: SkyLabFxTier = !skyLabFxEnabled
    ? 'off'
    : skyLabLite
      ? 'reduced'
      : 'full'

  return { skyLabFxEnabled, skyLabLite, skyLabFxTier }
}
