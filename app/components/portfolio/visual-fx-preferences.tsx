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
import { MEDIA_NARROW } from './breakpoints'

export type VisualFxMode = 'full' | 'reduced' | 'off'

const STORAGE_KEY = 'portfolio-visual-fx-mode'

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
  const [mode, setModeState] = useState<VisualFxMode>('full')
  const [screenFxLive, setScreenFxLive] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as VisualFxMode | null
    if (stored === 'full' || stored === 'reduced' || stored === 'off') {
      setModeState(stored)
    } else if (window.matchMedia(MEDIA_NARROW).matches) {
      setModeState('reduced')
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPrefersReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const setMode = useCallback((next: VisualFxMode) => {
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

type VisualFxControlsProps = {
  screenFxActive: boolean
  onToggleScreenFx: () => void
}

export function VisualFxControls({ screenFxActive, onToggleScreenFx }: VisualFxControlsProps) {
  const { mode, setMode } = useVisualFxPreferences()

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Visual FX
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
        {mode === 'full' && 'Ambient cultivation VFX, parallax, and motion synced to the showcase.'}
        {mode === 'reduced' &&
          'Epilepsy-safe mode — static gradients only, no flashes or rapid motion.'}
        {mode === 'off' && 'All visual effects disabled. Media and 3D viewers only.'}
      </p>

      <button
        type="button"
        disabled={mode === 'off'}
        onClick={onToggleScreenFx}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors hover:border-cyan/40 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-40"
      >
        {screenFxActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        Screen FX {screenFxActive ? 'On' : 'Off'}
      </button>
    </div>
  )
}
