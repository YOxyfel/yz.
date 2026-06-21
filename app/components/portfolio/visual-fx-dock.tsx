'use client'

import { Eye, Shield, Sparkles, ZapOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { StationLed } from './station-console'
import { useVisualFxPreferences } from './visual-fx-preferences'

const modeIcons = {
  full: Sparkles,
  reduced: Shield,
  off: ZapOff,
} as const

const modeTranslationKeys = {
  full: 'modeFull',
  reduced: 'modeReduced',
  off: 'modeOff',
} as const

function SiteFxPanel({ onClose }: { onClose: () => void }) {
  const { mode, setMode, screenFxLive, toggleScreenFxLive } = useVisualFxPreferences()
  const t = useTranslations('SiteFx')

  return (
    <div className="corner-vfx-dock-panel pointer-events-auto">
      <p className="corner-dock-panel-eyebrow">{t('eyebrow')}</p>

      <div className="mt-2 flex flex-col gap-1.5">
        {(['full', 'reduced', 'off'] as const).map((id) => {
          const Icon = modeIcons[id]
          return (
            <button
              key={id}
              type="button"
              data-no-constellation
              onClick={() => setMode(id)}
              className={`site-variant-picker-btn flex items-center gap-2 ${
                mode === id ? 'site-variant-picker-btn-active' : ''
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t(modeTranslationKeys[id])}
            </button>
          )
        })}
      </div>

      <p className="corner-dock-scroll-hint mt-3 font-mono text-xs leading-relaxed tracking-wide text-muted-foreground">
        {mode === 'full' && t('descFull')}
        {mode === 'reduced' && t('descReduced')}
        {mode === 'off' && t('descOff')}
      </p>

      <button
        type="button"
        data-no-constellation
        disabled={mode === 'off'}
        onClick={toggleScreenFxLive}
        className="station-button station-button-secondary mt-3 w-full justify-center !text-xs"
      >
        {screenFxLive ? t('ambientOn') : t('ambientOff')}
      </button>

      <button
        type="button"
        data-no-constellation
        className="feature-hint-dismiss mt-3 w-full"
        onClick={onClose}
      >
        {t('close')}
      </button>
    </div>
  )
}

export function VisualFxDock() {
  const [mounted, setMounted] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const { mode, screenFxLive } = useVisualFxPreferences()
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

      {panelOpen ? <SiteFxPanel onClose={() => setPanelOpen(false)} /> : null}
    </div>
  )

  if (!mounted) return null
  return createPortal(dock, document.body)
}
