/** Parallax cosmos backdrop — layered star/nebula/particle art on solid black,
 *  composited additively (mix-blend-mode: screen). Each layer parallaxes on its
 *  own depth via CSS vars (--cosmos-scroll / --cosmos-px / --cosmos-py) set by
 *  StationDeckBackdrop. Black pixels vanish under screen blend, so the layers
 *  never show hard edges. */

type SitePhotoBackdropLayersProps = {
  /** Optional 3D planet layer (mounted only on high-tier desktops). */
  planet?: React.ReactNode
}

export function SitePhotoBackdropLayers({ planet = null }: SitePhotoBackdropLayersProps) {
  return (
    <>
      <div className="cosmos-layer cosmos-starfield" aria-hidden />
      <div className="cosmos-layer cosmos-nebula cosmos-nebula-blue" aria-hidden />
      <div className="cosmos-layer cosmos-nebula cosmos-nebula-purple" aria-hidden />
      <div className="cosmos-layer cosmos-nebula cosmos-nebula-red" aria-hidden />

      {/* Dark dust clouds (multiply) punch holes in the nebula so it doesn't
          flood the whole screen. Sits below the planet so the planet stays bright. */}
      <div className="cosmos-layer cosmos-darkspots" aria-hidden />

      {planet}

      <div className="station-sky-backdrop-scrim" aria-hidden />

      <div className="cosmos-layer cosmos-particles" aria-hidden />

      <div className="station-sky-backdrop-grid" />

      {/* Edge vignette + fine film grain (CSS only) */}
      <div className="cosmos-vignette" aria-hidden />
    </>
  )
}
