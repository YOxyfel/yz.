'use client'

import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { useConstellations } from './constellation-context'
import { isMobileSkyLabViewport, useCompactNavLayout, useDeviceProfile } from './device-profile'
import { FEATURE_HINT_KEYS, hasSeenHint, markHintSeen } from './feature-hints'
import { StationLed } from './station-console'

export function ConstellationLabToggle() {
  const [mounted, setMounted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const deviceProfile = useDeviceProfile()
  const compactNav = useCompactNavLayout()
  const { constellationLabEnabled, mobileSkyLabMode, toggleConstellationLab } = useConstellations()
  const t = useTranslations('SkyLab')
  const tNav = useTranslations('Nav')
  const touchViewport = isMobileSkyLabViewport(deviceProfile)

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

  const dismissHint = () => {
    markHintSeen(FEATURE_HINT_KEYS.skyLab)
    setShowHint(false)
  }

  const hintCopy = t('hintDesktop')

  const button = (
    <div
      className={`corner-sky-lab-stack pointer-events-none ${
        constellationLabEnabled ? 'corner-sky-lab-stack-active' : ''
      } ${mobileSkyLabMode ? 'sky-lab-minimal-stack' : ''} ${
        showHint && !constellationLabEnabled && !touchViewport ? 'corner-sky-lab-stack-hint' : ''
      }`}
    >
      <button
        type="button"
        data-no-constellation
        data-sky-lab-keep
        aria-label={constellationLabEnabled ? tNav('closeSkyLab') : tNav('openSkyLab')}
        aria-pressed={constellationLabEnabled}
        aria-describedby={
          showHint && !constellationLabEnabled && !touchViewport ? 'sky-lab-hint' : undefined
        }
        onClick={() => {
          dismissHint()
          toggleConstellationLab()
        }}
        className={`corner-dock corner-sky-lab-dock pointer-events-auto ${
          constellationLabEnabled
            ? mobileSkyLabMode
              ? 'sky-lab-minimal-toggle corner-dock-active'
              : 'corner-dock-active'
            : showHint && !touchViewport
              ? 'corner-dock-hint-pulse'
              : ''
        }`}
      >
        {!mobileSkyLabMode ? <span className="corner-dock-glow" aria-hidden /> : null}
        <span className="corner-dock-frame">
          <StationLed active pulse={constellationLabEnabled || (showHint && !touchViewport)} />
          <Sparkles className="corner-dock-icon h-4 w-4 shrink-0" aria-hidden />
          <span className="corner-dock-label">
            {constellationLabEnabled ? tNav('skyLabOn') : tNav('skyLab')}
          </span>
        </span>
      </button>

      {showHint && !constellationLabEnabled && !touchViewport ? (
        <div
          id="sky-lab-hint"
          data-no-constellation
          data-sky-lab-keep
          className="feature-hint-card sky-lab-hint-card pointer-events-auto"
        >
          <p className="leading-relaxed text-muted-foreground">{hintCopy}</p>
          <button type="button" className="feature-hint-dismiss" onClick={dismissHint}>
            {t('gotIt')}
          </button>
        </div>
      ) : null}
    </div>
  )

  if (!mounted) return null
  if (compactNav && !mobileSkyLabMode) return null

  return createPortal(button, document.body)
}
