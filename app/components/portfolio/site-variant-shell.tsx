'use client'

import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSiteVariant, SITE_VARIANTS } from './site-variant-context'
import { useDeviceProfile } from './device-profile'
import { FEATURE_HINT_KEYS, hasSeenHint, markHintSeen } from './feature-hints'
import { SiteVariantPicker, variantLabel } from './site-variant-picker'
import { StationLed } from './station-console'

function variantScrollHint(variant: 'minimal' | 'station' | 'futuristic') {
  if (variant === 'station') return 'Shift + scroll to switch themes'
  if (variant === 'minimal') return 'Shift + scroll right for Station'
  return 'Shift + scroll left for Station'
}

function SiteVariantShellInner({ children }: { children: ReactNode }) {
  const { variant, scrollProgress, isTransitioning, setVariant } = useSiteVariant()
  const { isCoarsePointer, isNarrow, isTablet } = useDeviceProfile()
  const [showHint, setShowHint] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const useTouchPicker = isCoarsePointer || isNarrow || isTablet
  const useFlatTransition = useTouchPicker

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.documentElement.dataset.deviceReady !== 'on') return

    if (useTouchPicker) {
      setPanelOpen(false)
      setShowHint(false)
      return
    }

    if (hasSeenHint(FEATURE_HINT_KEYS.siteVariant)) return
    setShowHint(true)
    setPanelOpen(true)
  }, [useTouchPicker])

  useEffect(() => {
    if (!panelOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanelOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [panelOpen])

  const dismissHint = () => {
    markHintSeen(FEATURE_HINT_KEYS.siteVariant)
    setShowHint(false)
  }

  const edgeGlow =
    scrollProgress !== 0 && !isTransitioning
      ? scrollProgress > 0
        ? 'site-variant-edge-glow-right'
        : 'site-variant-edge-glow-left'
      : ''

  const variantIndex = SITE_VARIANTS.indexOf(variant)

  const goPrevVariant = () => {
    const nextIndex = (variantIndex - 1 + SITE_VARIANTS.length) % SITE_VARIANTS.length
    setVariant(SITE_VARIANTS[nextIndex]!, -1)
  }

  const goNextVariant = () => {
    const nextIndex = (variantIndex + 1) % SITE_VARIANTS.length
    setVariant(SITE_VARIANTS[nextIndex]!, 1)
  }

  const panelVisible = !useTouchPicker && (panelOpen || showHint)

  return (
    <>
      <div className={`site-variant-viewport ${edgeGlow}`}>
        <div
          className="site-variant-root"
          data-site-variant={variant}
          data-variant-transition={useFlatTransition ? 'flat' : '3d'}
        >
          {children}
        </div>
      </div>

      {!useTouchPicker ? (
      <div
        data-portfolio-chrome
        data-site-variant={variant}
        className={`corner-station-dock-stack pointer-events-none ${
          panelVisible ? 'corner-station-dock-stack-open' : ''
        } ${showHint && !useTouchPicker ? 'corner-station-dock-stack-hint' : ''}`}
      >
        <button
          type="button"
          data-no-constellation
          aria-label={`Theme: ${variantLabel[variant]}. Open theme controls`}
          aria-expanded={panelVisible}
          aria-haspopup="true"
          onClick={() => setPanelOpen((open) => !open)}
          className={`corner-dock corner-station-dock pointer-events-auto ${
            panelVisible ? 'corner-dock-active' : ''
          }`}
        >
          <span className="corner-dock-glow" aria-hidden />
          <span className="corner-dock-frame">
            <StationLed active pulse={panelVisible} />
            <Layers className="corner-dock-icon h-4 w-4 shrink-0" aria-hidden />
            <span className="corner-dock-label">{variantLabel[variant]}</span>
          </span>
        </button>

        {panelVisible ? (
          <div className="corner-station-dock-panel pointer-events-auto">
            <p className="corner-dock-panel-eyebrow">Visual themes</p>

            <SiteVariantPicker className="corner-dock-picker flex flex-col gap-1.5" />

            {useTouchPicker ? (
              <div className="corner-dock-arrow-row mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  data-no-constellation
                  onClick={goPrevVariant}
                  aria-label="Previous theme"
                  className="station-button station-button-secondary !h-9 !w-9 !p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-mono text-xs tracking-[0.12em] text-foreground">
                  {String(variantIndex + 1).padStart(2, '0')} / {String(SITE_VARIANTS.length).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  data-no-constellation
                  onClick={goNextVariant}
                  aria-label="Next theme"
                  className="station-button station-button-secondary !h-9 !w-9 !p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="corner-dock-scroll-hint mt-3 font-mono text-xs leading-relaxed tracking-wide text-muted-foreground">
                Hold <span className="text-cyan">Shift</span> and scroll to cycle themes. Or pick one
                below.
              </p>
            )}

            {!useTouchPicker ? (
              <p className="mt-2 font-mono text-[11px] leading-relaxed tracking-wide text-muted-foreground/80">
                {variantScrollHint(variant)}
              </p>
            ) : null}

            {showHint && !useTouchPicker ? (
              <div className="feature-hint-card site-variant-hint-card mt-3">
                <p className="site-variant-hint-title">Station themes</p>
                <p className="font-mono text-muted-foreground">
                  {useTouchPicker
                    ? 'Use the buttons or arrows to switch Minimal, Station, and Futuristic.'
                    : 'Hold Shift and scroll, or use the buttons here to change how the site looks.'}
                </p>
                <button
                  type="button"
                  className="feature-hint-dismiss"
                  onClick={dismissHint}
                >
                  Got it
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      ) : null}
    </>
  )
}

export function SiteVariantShell({ children }: { children: ReactNode }) {
  const { mobilePerfCut } = useDeviceProfile()

  if (mobilePerfCut) {
    return (
      <div className="site-variant-viewport">
        <div
          className="site-variant-root"
          data-site-variant="station"
          data-variant-transition="flat"
        >
          {children}
        </div>
      </div>
    )
  }

  return <SiteVariantShellInner>{children}</SiteVariantShellInner>
}
