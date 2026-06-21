'use client'

import { Eye, Shield, Sparkles, ZapOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
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

export function SiteFxControls({
  embedded = false,
  onClose,
}: {
  embedded?: boolean
  onClose?: () => void
}) {
  const { mode, setMode, screenFxLive, toggleScreenFxLive } = useVisualFxPreferences()
  const t = useTranslations('SiteFx')

  return (
    <div className={embedded ? 'site-nav-mobile-fx' : 'corner-vfx-dock-panel pointer-events-auto'}>
      <p className={embedded ? 'site-nav-mobile-section-label' : 'corner-dock-panel-eyebrow'}>
        {t('eyebrow')}
      </p>

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

      <p
        className={
          embedded
            ? 'mt-2 font-mono text-[11px] leading-relaxed tracking-wide text-muted-foreground'
            : 'corner-dock-scroll-hint mt-3 font-mono text-xs leading-relaxed tracking-wide text-muted-foreground'
        }
      >
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

      {!embedded && onClose ? (
        <button
          type="button"
          data-no-constellation
          className="feature-hint-dismiss mt-3 w-full"
          onClick={onClose}
        >
          {t('close')}
        </button>
      ) : null}
    </div>
  )
}
