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

export type LabFxMode = 'full' | 'reduced' | 'off'

const STORAGE_KEY = 'portfolio-lab-fx-mode'

type LabFxPreferencesValue = {
  mode: LabFxMode
  screenFxLive: boolean
  setMode: (mode: LabFxMode) => void
  toggleScreenFxLive: () => void
  showLabFx: boolean
  showLabCardFx: boolean
  isReduced: boolean
}

const LabFxPreferencesContext = createContext<LabFxPreferencesValue | null>(null)

export function LabFxPreferencesProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LabFxMode>('full')
  const [screenFxLive, setScreenFxLive] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LabFxMode | null
    if (stored === 'full' || stored === 'reduced' || stored === 'off') {
      setModeState(stored)
    }
    setHydrated(true)
  }, [])

  const setMode = useCallback((next: LabFxMode) => {
    setModeState(next)
    localStorage.setItem(STORAGE_KEY, next)
    if (next === 'off') setScreenFxLive(false)
    if (next !== 'off') setScreenFxLive(true)
  }, [])

  const toggleScreenFxLive = useCallback(() => {
    setScreenFxLive((live) => !live)
  }, [])

  const value = useMemo<LabFxPreferencesValue>(() => {
    const showLabFx = hydrated && mode !== 'off' && screenFxLive
    return {
      mode,
      screenFxLive,
      setMode,
      toggleScreenFxLive,
      showLabFx,
      showLabCardFx: showLabFx,
      isReduced: mode === 'reduced',
    }
  }, [hydrated, mode, screenFxLive, setMode, toggleScreenFxLive])

  return (
    <LabFxPreferencesContext.Provider value={value}>{children}</LabFxPreferencesContext.Provider>
  )
}

export function useLabFxPreferences() {
  const ctx = useContext(LabFxPreferencesContext)
  if (!ctx) {
    throw new Error('useLabFxPreferences must be used within LabFxPreferencesProvider')
  }
  return ctx
}

type LabFxControlsProps = {
  labName: 'art' | 'props'
}

export function LabFxControls({ labName }: LabFxControlsProps) {
  const { mode, setMode, screenFxLive, toggleScreenFxLive } = useLabFxPreferences()

  const description =
    labName === 'art'
      ? {
          full: 'POV parallax, qi overlays, and ambient gallery motion in this chamber only.',
          reduced: 'Static art reads — no parallax pulses or rapid POV transitions.',
          off: 'Lab stage effects off. Images and controls stay usable.',
        }
      : {
          full: 'Forge stage lighting and presentation polish in this chamber only.',
          reduced: 'Cleaner prop reads with lighter stage treatment.',
          off: 'Lab stage effects off. The 3D viewer and stills stay available.',
        }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Lab FX
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

      <p className="text-xs text-muted-foreground">{description[mode]}</p>

      <button
        type="button"
        disabled={mode === 'off'}
        onClick={toggleScreenFxLive}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors hover:border-cyan/40 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-40"
      >
        {screenFxLive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        Chamber FX {screenFxLive ? 'On' : 'Off'}
      </button>
    </div>
  )
}
