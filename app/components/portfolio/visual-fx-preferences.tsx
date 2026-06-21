'use client'

import { Eye, EyeOff, Shield, Sparkles, ZapOff } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOBILE_MAX_PX } from './breakpoints'

export type VisualFxMode = 'full' | 'reduced' | 'off'

const STORAGE_KEY = 'portfolio-visual-fx-mode'
const STORAGE_EXPLICIT_KEY = 'portfolio-visual-fx-mode-explicit'
const MEDIA_MOBILE = `(max-width: ${MOBILE_MAX_PX}px)` as const

/** Phone-width viewports — default site FX off unless the user picks otherwise. */
function isMobileFxViewport() {
  return window.matchMedia(MEDIA_MOBILE).matches
}

function readExplicitFxChoice() {
  return localStorage.getItem(STORAGE_EXPLICIT_KEY) === '1'
}

function markExplicitFxChoice() {
  localStorage.setItem(STORAGE_EXPLICIT_KEY, '1')
}

/** Default site FX mode when the user has not picked one explicitly. */
function defaultFxModeForViewport(): VisualFxMode {
  return isMobileFxViewport() ? 'off' : 'full'
}

function resolveInitialFxMode(): VisualFxMode {
  const stored = localStorage.getItem(STORAGE_KEY) as VisualFxMode | null
  const explicit = readExplicitFxChoice()

  if (explicit && (stored === 'full' || stored === 'reduced' || stored === 'off')) {
    return stored
  }

  return defaultFxModeForViewport()
}

type VisualFxPreferencesValue = {
  mode: VisualFxMode
  screenFxLive: boolean
  setMode: (mode: VisualFxMode) => void
  setScreenFxLive: (live: boolean) => void
  toggleScreenFxLive: () => void
  showScreenFx: boolean
  showCardFx: boolean
  isReduced: boolean
  prefersReducedMotion: boolean
}

const DEFAULT_VISUAL_FX: VisualFxPreferencesValue = {
  mode: 'full',
  screenFxLive: true,
  setMode: () => undefined,
  setScreenFxLive: () => undefined,
  toggleScreenFxLive: () => undefined,
  showScreenFx: true,
  showCardFx: true,
  isReduced: false,
  prefersReducedMotion: false,
}

const VisualFxPreferencesContext = createContext<VisualFxPreferencesValue>(DEFAULT_VISUAL_FX)

export function VisualFxPreferencesProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<VisualFxMode>(() => {
    if (typeof window === 'undefined') return 'full'
    return resolveInitialFxMode()
  })
  const [screenFxLive, setScreenFxLive] = useState(() => {
    if (typeof window === 'undefined') return true
    return resolveInitialFxMode() !== 'off'
  })
  const [hydrated, setHydrated] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const syncMode = () => {
      if (readExplicitFxChoice()) return
      const next = defaultFxModeForViewport()
      setModeState(next)
      setScreenFxLive(next !== 'off')
    }

    syncMode()
    setHydrated(true)

    const mobileMedia = window.matchMedia(MEDIA_MOBILE)
    mobileMedia.addEventListener('change', syncMode)
    return () => {
      mobileMedia.removeEventListener('change', syncMode)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPrefersReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const setMode = useCallback((next: VisualFxMode) => {
    markExplicitFxChoice()
    setModeState(next)
    localStorage.setItem(STORAGE_KEY, next)
    if (next === 'off') setScreenFxLive(false)
    if (next !== 'off') setScreenFxLive(true)
  }, [])

  const toggleScreenFxLive = useCallback(() => {
    setScreenFxLive((live) => !live)
  }, [])

  const value = useMemo<VisualFxPreferencesValue>(() => {
    const reduced = mode === 'reduced' || prefersReducedMotion
    const showScreenFx = hydrated && mode !== 'off' && screenFxLive
    return {
      mode,
      screenFxLive,
      setMode,
      setScreenFxLive,
      toggleScreenFxLive,
      showScreenFx,
      showCardFx: showScreenFx,
      isReduced: reduced,
      prefersReducedMotion,
    }
  }, [hydrated, mode, prefersReducedMotion, screenFxLive, setMode, toggleScreenFxLive])

  return (
    <VisualFxPreferencesContext.Provider value={value}>
      {children}
    </VisualFxPreferencesContext.Provider>
  )
}

export function useVisualFxPreferences() {
  return useContext(VisualFxPreferencesContext)
}

/** Inline site-wide FX controls (Arsenal labs should use LabFxControls instead). */
export function SiteVisualFxControls({
  screenFxActive,
  onToggleScreenFx,
  compact = false,
}: {
  screenFxActive: boolean
  onToggleScreenFx: () => void
  compact?: boolean
}) {
  const { mode, setMode } = useVisualFxPreferences()

  return (
    <div className={compact ? 'space-y-3' : 'mt-6 space-y-3'}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Site FX
        </span>
        {(
          [
            { id: 'full' as const, label: 'Full', icon: Sparkles },
            { id: 'reduced' as const, label: 'Reduced', icon: Shield },
            { id: 'off' as const, label: 'Off', icon: ZapOff },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
              mode === id
                ? 'border-cyan/40 bg-cyan/15 text-cyan'
                : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {mode === 'full' &&
          'Sky backgrounds, cosmic motion, and full Sky Lab VFX (constellations, planets, crazy mode).'}
        {mode === 'reduced' &&
          'Epilepsy-safe site mode — lite backgrounds and lite Sky Lab (no planets or crazy mode).'}
        {mode === 'off' && 'All site visual effects disabled. Sky Lab chart still works; sky drawing is off.'}
      </p>

      <button
        type="button"
        disabled={mode === 'off'}
        onClick={onToggleScreenFx}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors hover:border-cyan/40 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-40"
      >
        {screenFxActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        Ambient FX {screenFxActive ? 'On' : 'Off'}
      </button>
    </div>
  )
}

/** @deprecated Use SiteFxControls or CornerToolsDock */
export function VisualFxControls(props: {
  screenFxActive: boolean
  onToggleScreenFx: () => void
}) {
  return <SiteVisualFxControls {...props} />
}
