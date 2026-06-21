'use client'

import { Eye, EyeOff, RotateCcw, Shield, Sparkles, Zap, ZapOff } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type AudioFxMode = 'full' | 'reduced' | 'off'

const STORAGE_KEY = 'portfolio-audio-fx-mode'

type AudioFxPreferencesValue = {
  mode: AudioFxMode
  screenFxLive: boolean
  setMode: (mode: AudioFxMode) => void
  setScreenFxLive: (live: boolean) => void
  toggleScreenFxLive: () => void
  showScreenFx: boolean
  showCardFx: boolean
  isReduced: boolean
}

const AudioFxPreferencesContext = createContext<AudioFxPreferencesValue | null>(null)

export function AudioFxPreferencesProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AudioFxMode>('full')
  const [screenFxLive, setScreenFxLive] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as AudioFxMode | null
    if (stored === 'full' || stored === 'reduced' || stored === 'off') {
      setModeState(stored)
    }
    setHydrated(true)
  }, [])

  const setMode = useCallback((next: AudioFxMode) => {
    setModeState(next)
    localStorage.setItem(STORAGE_KEY, next)
    if (next === 'off') setScreenFxLive(false)
    if (next !== 'off') setScreenFxLive(true)
  }, [])

  const toggleScreenFxLive = useCallback(() => {
    setScreenFxLive((live) => !live)
  }, [])

  const value = useMemo<AudioFxPreferencesValue>(() => {
    const showScreenFx = hydrated && mode !== 'off' && screenFxLive
    return {
      mode,
      screenFxLive,
      setMode,
      setScreenFxLive,
      toggleScreenFxLive,
      showScreenFx,
      showCardFx: hydrated && mode !== 'off' && screenFxLive,
      isReduced: mode === 'reduced',
    }
  }, [hydrated, mode, screenFxLive, setMode, toggleScreenFxLive])

  return (
    <AudioFxPreferencesContext.Provider value={value}>
      {children}
    </AudioFxPreferencesContext.Provider>
  )
}

export function useAudioFxPreferences() {
  const ctx = useContext(AudioFxPreferencesContext)
  if (!ctx) {
    throw new Error('useAudioFxPreferences must be used within AudioFxPreferencesProvider')
  }
  return ctx
}

type AudioFxControlsProps = {
  playing: boolean
  hasActiveTrack: boolean
  screenFxActive: boolean
  onToggleScreenFx: () => void
  onRestart: () => void
  onStopAll: () => void
}

export function AudioFxControls({
  playing,
  hasActiveTrack,
  screenFxActive,
  onToggleScreenFx,
  onRestart,
  onStopAll,
}: AudioFxControlsProps) {
  const { mode, setMode } = useAudioFxPreferences()

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
        {mode === 'full' && 'Full screen and card animations synced to audio.'}
        {mode === 'reduced' &&
          'Epilepsy-safe mode — static visuals only, no flashes or rapid motion.'}
        {mode === 'off' && 'All visual effects disabled. Audio playback only.'}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={mode === 'off'}
          onClick={onToggleScreenFx}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors hover:border-cyan/40 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-40"
        >
          {screenFxActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          Screen FX {screenFxActive ? 'On' : 'Off'}
        </button>

        <button
          type="button"
          disabled={!hasActiveTrack}
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors hover:border-amber-400/40 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </button>

        <button
          type="button"
          disabled={!playing && !hasActiveTrack}
          onClick={onStopAll}
          className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-950/20 px-4 py-2 font-mono text-xs uppercase tracking-wider text-rose-200/90 transition-colors hover:border-rose-400/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Zap className="h-4 w-4" />
          Stop
        </button>
      </div>
    </div>
  )
}
