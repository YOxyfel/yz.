'use client'

import { Eye, EyeOff, Shield, Sparkles, ZapOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { useConstellations } from './constellation-context'
import { isMobileSkyLabViewport, useCompactNavLayout, useDeviceProfile } from './device-profile'
import { FEATURE_HINT_KEYS, hasSeenHint, markHintSeen } from './feature-hints'
import { SiteFxControls } from './site-fx-controls'
import { StationLed } from './station-console'
import { useVisualFxPreferences } from './visual-fx-preferences'

const modeIcons = {
  full: Sparkles,
  reduced: Shield,
  off: ZapOff,
} as const

export function CornerToolsDock() {
  const [mounted, setMounted] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const deviceProfile = useDeviceProfile()
  const compactNav = useCompactNavLayout()
  const touchViewport = isMobileSkyLabViewport(deviceProfile)
  const { mode, screenFxLive } = useVisualFxPreferences()
  const {
    constellationLabEnabled,
    mobileSkyLabMode,
    toggleConstellationLab,
    skyViewMode,
    toggleSkyViewMode,
  } = useConstellations()
  const tFx = useTranslations('SiteFx')
  const tSky = useTranslations('SkyLab')
  const tNav = useTranslations('Nav')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (constellationLabEnabled) {
      setShowHint(false)
      return
    }
    if (touchViewport) return
    if (hasSeenHint(FEATURE_HINT_KEYS.skyLab)) return
    setShowHint(true)
  }, [constellationLabEnabled, touchViewport])

  useEffect(() => {
    const active = showHint && !constellationLabEnabled && !touchViewport
    if (active) {
      document.documentElement.dataset.skyLabHint = 'on'
    } else {
      delete document.documentElement.dataset.skyLabHint
    }
    return () => {
      delete document.documentElement.dataset.skyLabHint
    }
  }, [constellationLabEnabled, showHint, touchViewport])

  useEffect(() => {
    if (!panelOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanelOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [panelOpen])

  useEffect(() => {
    if (skyViewMode) setPanelOpen(false)
  }, [skyViewMode])

  const dismissHint = () => {
    markHintSeen(FEATURE_HINT_KEYS.skyLab)
    setShowHint(false)
  }

  if (!mounted) return null
  if (compactNav && !mobileSkyLabMode) return null

  if (skyViewMode && !mobileSkyLabMode) {
    return createPortal(
      <button
        type="button"
        data-no-constellation
        data-crazy-sky-keep
        aria-label={tNav('showUi')}
        aria-pressed={skyViewMode}
        onClick={toggleSkyViewMode}
        className="sky-view-restore-toggle pointer-events-auto fixed left-1/2 z-[80] inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-cyan/55 bg-cyan/15 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan transition-colors backdrop-blur-sm"
      >
        <Eye className="h-3.5 w-3.5" aria-hidden />
        <span>{tNav('showUi')}</span>
      </button>,
      document.body
    )
  }

  if (mobileSkyLabMode) {
    return createPortal(
      <div className="corner-tools-dock corner-tools-dock-minimal pointer-events-none">
        <button
          type="button"
          data-no-constellation
          data-sky-lab-keep
          aria-label={tNav('closeSkyLab')}
          aria-pressed={constellationLabEnabled}
          onClick={toggleConstellationLab}
          className="corner-dock corner-sky-lab-dock sky-lab-minimal-toggle pointer-events-auto corner-dock-active"
        >
          <span className="corner-dock-frame">
            <StationLed active pulse={constellationLabEnabled} />
            <Sparkles className="corner-dock-icon h-4 w-4 shrink-0" aria-hidden />
            <span className="corner-dock-label">
              {constellationLabEnabled ? tNav('skyLabOn') : tNav('skyLab')}
            </span>
          </span>
        </button>
      </div>,
      document.body
    )
  }

  const ModeIcon = modeIcons[mode]
  const dockLabel = mode === 'off' ? tFx('dockOff') : screenFxLive ? tFx('dockOn') : tFx('dockPaused')
  const hintActive = showHint && !constellationLabEnabled && !touchViewport

  const dock = (
    <div
      data-portfolio-chrome
      data-sky-lab-keep
      className={`corner-tools-dock pointer-events-none ${
        constellationLabEnabled ? 'corner-tools-dock-lab-active' : ''
      } ${panelOpen ? 'corner-tools-dock-open' : ''} ${hintActive ? 'corner-tools-dock-hint' : ''}`}
    >
      <div className="corner-tools-dock-row pointer-events-none">
        <button
          type="button"
          data-no-constellation
          data-sky-lab-keep
          aria-label={tFx('openPanel')}
          aria-expanded={panelOpen}
          aria-haspopup="true"
          onClick={() => setPanelOpen((open) => !open)}
          className={`corner-dock corner-vfx-dock pointer-events-auto ${
            panelOpen || (mode !== 'off' && screenFxLive) ? 'corner-dock-active' : ''
          }`}
        >
          <span className="corner-dock-glow" aria-hidden />
          <span className="corner-dock-frame">
            <StationLed active={panelOpen} pulse={mode !== 'off' && screenFxLive} />
            <ModeIcon className="corner-dock-icon h-4 w-4 shrink-0" aria-hidden />
            <span className="corner-dock-label">{dockLabel}</span>
          </span>
        </button>

        <button
          type="button"
          data-no-constellation
          data-sky-lab-keep
          aria-label={constellationLabEnabled ? tNav('closeSkyLab') : tNav('openSkyLab')}
          aria-pressed={constellationLabEnabled}
          aria-describedby={hintActive ? 'sky-lab-hint' : undefined}
          onClick={() => {
            dismissHint()
            toggleConstellationLab()
          }}
          className={`corner-dock corner-sky-lab-dock pointer-events-auto ${
            constellationLabEnabled
              ? 'corner-dock-active'
              : hintActive
                ? 'corner-dock-hint-pulse'
                : ''
          }`}
        >
          <span className="corner-dock-glow" aria-hidden />
          <span className="corner-dock-frame">
            <StationLed active pulse={constellationLabEnabled || hintActive} />
            <Sparkles className="corner-dock-icon h-4 w-4 shrink-0" aria-hidden />
            <span className="corner-dock-label">
              {constellationLabEnabled ? tNav('skyLabOn') : tNav('skyLab')}
            </span>
          </span>
        </button>

        <button
          type="button"
          data-no-constellation
          data-sky-lab-keep
          aria-label={skyViewMode ? tNav('showUi') : tNav('skyView')}
          aria-pressed={skyViewMode}
          onClick={toggleSkyViewMode}
          className={`corner-dock corner-sky-view-dock pointer-events-auto ${
            skyViewMode ? 'corner-dock-active' : ''
          }`}
        >
          <span className="corner-dock-glow" aria-hidden />
          <span className="corner-dock-frame">
            <StationLed active={skyViewMode} pulse={skyViewMode} />
            {skyViewMode ? (
              <Eye className="corner-dock-icon h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <EyeOff className="corner-dock-icon h-4 w-4 shrink-0" aria-hidden />
            )}
            <span className="corner-dock-label">
              {skyViewMode ? tNav('showUi') : tNav('skyView')}
            </span>
          </span>
        </button>
      </div>

      {panelOpen ? <SiteFxControls onClose={() => setPanelOpen(false)} /> : null}

      {hintActive ? (
        <div
          id="sky-lab-hint"
          data-no-constellation
          data-sky-lab-keep
          className="feature-hint-card sky-lab-hint-card pointer-events-auto"
        >
          <p className="leading-relaxed text-muted-foreground">{tSky('hintDesktop')}</p>
          <button type="button" className="feature-hint-dismiss" onClick={dismissHint}>
            {tSky('gotIt')}
          </button>
        </div>
      ) : null}
    </div>
  )

  return createPortal(dock, document.body)
}
