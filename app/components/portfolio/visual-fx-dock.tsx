'use client'

import { Shield, Sparkles, ZapOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { useCompactNavLayout } from './device-profile'
import { useConstellations } from './constellation-context'
import { SiteFxControls } from './site-fx-controls'
import { StationLed } from './station-console'
import { useVisualFxPreferences } from './visual-fx-preferences'

const modeIcons = {
  full: Sparkles,
  reduced: Shield,
  off: ZapOff,
} as const

export function VisualFxDock() {
  const [mounted, setMounted] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const compactNav = useCompactNavLayout()
  const { mode, screenFxLive } = useVisualFxPreferences()
  const { cornerUiHidden } = useConstellations()
  const t = useTranslations('SiteFx')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!panelOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanelOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [panelOpen])

  useEffect(() => {
    if (cornerUiHidden) setPanelOpen(false)
  }, [cornerUiHidden])

  if (!mounted || compactNav || cornerUiHidden) return null

  const ModeIcon = modeIcons[mode]
  const dockLabel = mode === 'off' ? t('dockOff') : screenFxLive ? t('dockOn') : t('dockPaused')

  const dock = (
    <div
      data-portfolio-chrome
      data-sky-lab-keep
      className={`corner-vfx-dock-stack pointer-events-none ${
        panelOpen ? 'corner-vfx-dock-stack-open' : ''
      }`}
    >
      <button
        type="button"
        data-no-constellation
        data-sky-lab-keep
        aria-label={t('openPanel')}
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

      {panelOpen ? <SiteFxControls onClose={() => setPanelOpen(false)} /> : null}
    </div>
  )

  return createPortal(dock, document.body)
}
