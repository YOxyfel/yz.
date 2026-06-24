/** Shared photo + scrim + star field + grid for the station sky backdrop. */

import type { SkyBackdropFx } from './station-sky-backdrop-fx'

type SitePhotoBackdropLayersProps = {
  fx?: SkyBackdropFx | null
}

export function SitePhotoBackdropLayers({ fx = null }: SitePhotoBackdropLayersProps) {
  return (
    <>
      <picture className="station-sky-backdrop-photo">
        <source
          type="image/webp"
          srcSet="/Background/Background.webp 1x, /Background/Background-2x.webp 2x"
        />
        <img
          src="/Background/Background.png"
          alt=""
          decoding="async"
          fetchPriority="high"
          className="station-sky-backdrop-photo-img"
        />
      </picture>

      {fx ? (
        <div
          className="station-sky-backdrop-nebula"
          style={{ backgroundImage: fx.nebula }}
          aria-hidden
        />
      ) : null}

      <div className="station-sky-backdrop-scrim" aria-hidden />

      {fx ? (
        <div
          className="station-sky-backdrop-particles"
          style={{ backgroundImage: fx.particles }}
          aria-hidden
        />
      ) : null}

      <div className="station-sky-backdrop-grid" />
    </>
  )
}
