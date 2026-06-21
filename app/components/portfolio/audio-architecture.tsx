'use client'

import { motion } from 'framer-motion'
import {
  Download,
  Eye,
  EyeOff,
  GitMerge,
  Layers,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AudioScreenFx } from './audio-screen-fx'
import {
  AudioFxControls,
  AudioFxPreferencesProvider,
  useAudioFxPreferences,
} from './audio-fx-preferences'
import { useDeviceProfile } from './device-profile'
import { getFxCues, getVoidVisualState, multiPeakPulse, peakPulse, resolveCues, segmentProgress } from './audio-fx-timing'
import {
  audioTracks,
  catalogLabels,
  catalogOrder,
  getTracksForCatalog,
  sourceTypeColors,
  sourceTypeLabels,
  type AudioSourceType,
  type AudioTrack,
  type CatalogId,
} from './audio-tracks'
import { CatalogStrip, LabShell, LabTransition } from './arsenal-lab-shell'

const sourceIcons: Record<AudioSourceType, typeof Mic> = {
  found: Download,
  ai: Wand2,
  recorded: Mic,
  hybrid: Layers,
}

const accentRing: Record<AudioTrack['accent'], string> = {
  cyan: 'ring-cyan/40 shadow-[0_0_60px_-12px_oklch(0.84_0.16_200/0.55)] border-cyan/30',
  violet:
    'ring-violet/40 shadow-[0_0_60px_-12px_oklch(0.55_0.24_295/0.55)] border-violet/30',
  emerald:
    'ring-emerald-400/40 shadow-[0_0_60px_-12px_oklch(0.72_0.17_155/0.5)] border-emerald-400/30',
  amber:
    'ring-amber-400/40 shadow-[0_0_60px_-12px_oklch(0.75_0.15_75/0.5)] border-amber-400/30',
  gold: 'ring-amber-300/40 shadow-[0_0_60px_-12px_oklch(0.84_0.14_85/0.5)] border-amber-300/30',
  rose: 'ring-rose-400/40 shadow-[0_0_60px_-12px_oklch(0.62_0.24_25/0.5)] border-rose-400/30',
}

const accentText: Record<AudioTrack['accent'], string> = {
  cyan: 'text-cyan',
  violet: 'text-violet',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  gold: 'text-amber-200',
  rose: 'text-rose-400',
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.floor(seconds % 60)
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

function makeBars(seed: string, count = 56) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Array.from({ length: count }, (_, index) => {
    const n = Math.abs((index + hash) * 2654435761) % 1000
    return Number((0.2 + (n / 1000) * 0.75).toFixed(4))
  })
}

function TrackVisual({
  track,
  playing,
  currentTime,
  duration,
  showCardFx,
  reducedMotion,
}: {
  track: AudioTrack
  playing: boolean
  currentTime: number
  duration: number
  showCardFx: boolean
  reducedMotion: boolean
}) {
  const bars = useMemo(() => makeBars(track.id), [track.id])
  const progress = duration > 0 ? currentTime / duration : 0
  const trackCues = getFxCues(track.id)
  const refDuration = trackCues?.refDuration ?? duration
  const resolved = trackCues ? resolveCues(trackCues, duration || refDuration) : null
  const fxPlaying = playing && showCardFx

  const voidState =
    fxPlaying && resolved?.void
      ? getVoidVisualState(currentTime, resolved.void)
      : null

  const qiPulse =
    fxPlaying && !reducedMotion && trackCues?.cultivation
      ? multiPeakPulse(currentTime, trackCues.cultivation.breathPeaks, duration, refDuration, 0.045)
      : 0

  const ostSwell =
    fxPlaying && !reducedMotion && trackCues?.ost
      ? multiPeakPulse(currentTime, trackCues.ost.harmonySwells, duration, refDuration, 2.5)
      : 0

  const ascensionSurge =
    fxPlaying && !reducedMotion && resolved?.ascension
      ? Math.max(
          ...resolved.ascension.surgePeaks.map((p) => peakPulse(currentTime, p, 1.1)),
          peakPulse(currentTime, resolved.ascension.climaxPeak, 1.0),
        )
      : 0

  const collapseFracture =
    fxPlaying && !reducedMotion && resolved?.collapse
      ? Math.max(...resolved.collapse.fracturePeaks.map((p) => peakPulse(currentTime, p, 0.9)))
      : 0

  const impactFlash =
    fxPlaying && !reducedMotion && resolved?.impact
      ? peakPulse(currentTime, resolved.impact.hitPeak, resolved.impact.hitEnd - resolved.impact.hitStart)
      : 0

  return (
    <div className="station-screen relative aspect-[4/3] w-full sm:aspect-auto sm:min-h-[320px]">
      <div
        className={`absolute inset-0 opacity-80 ${
          track.theme === 'cultivation'
            ? 'bg-[radial-gradient(circle_at_50%_80%,oklch(0.84_0.16_200/0.35),transparent_55%)]'
            : track.theme === 'void'
              ? 'bg-[radial-gradient(circle_at_50%_50%,oklch(0.55_0.24_295/0.35),oklch(0.12_0.01_270/0.9))]'
              : track.theme === 'impact'
                ? 'bg-[radial-gradient(circle_at_40%_60%,oklch(0.72_0.17_155/0.35),transparent_60%)]'
                : track.theme === 'ost'
                  ? 'bg-[radial-gradient(ellipse_at_bottom,oklch(0.84_0.14_85/0.35),transparent_65%)]'
                  : track.theme === 'breakthrough-success'
                    ? 'bg-[radial-gradient(circle_at_50%_20%,oklch(0.84_0.16_200/0.4),transparent_60%)]'
                    : track.theme === 'breakthrough-fail'
                      ? 'bg-[radial-gradient(circle_at_50%_70%,oklch(0.62_0.24_25/0.35),transparent_60%)]'
                      : 'bg-[radial-gradient(circle_at_60%_50%,oklch(0.75_0.15_75/0.35),transparent_60%)]'
        }`}
      />

      {track.theme === 'cultivation' && fxPlaying && !reducedMotion ? (
        <>
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]"
              style={{
                bottom: `${15 + (i % 3) * 8}%`,
                opacity: qiPulse * 0.95,
                transform: `translateY(${-qiPulse * 120}px)`,
              }}
            />
          ))}
          <div
            className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/30"
            style={{ opacity: qiPulse * 0.7, transform: `scale(${0.8 + qiPulse * 0.7})` }}
          />
        </>
      ) : null}

      {track.theme === 'void' && fxPlaying && voidState ? (
        <>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"
            style={{
              width: `${Math.max(6, voidState.hole * voidState.size * 55)}%`,
              height: `${Math.max(6, voidState.hole * voidState.size * 55)}%`,
              boxShadow: '0 0 80px 30px oklch(0.55 0.24 295 / 0.35)',
              opacity: voidState.opacity,
            }}
          />
          {!reducedMotion ? (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: `${Math.max(12, voidState.size * 58)}%`,
                height: `${Math.max(12, voidState.size * 58)}%`,
                background:
                  'conic-gradient(from 0deg, transparent, oklch(0.55 0.24 295 / 0.55), transparent, oklch(0.45 0.2 280 / 0.35), transparent)',
                opacity: voidState.intensity * voidState.opacity,
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: voidState.spinDuration,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ) : (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet/30"
              style={{
                width: `${Math.max(12, voidState.size * 58)}%`,
                height: `${Math.max(12, voidState.size * 58)}%`,
                opacity: voidState.intensity * voidState.opacity * 0.7,
              }}
            />
          )}
          {voidState.storm > 0.1 && !reducedMotion ? (
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.35_0.14_285/0.2),transparent_65%)]"
              style={{ opacity: voidState.storm * voidState.opacity }}
            />
          ) : null}
        </>
      ) : null}

      {track.theme === 'ost' && fxPlaying && !reducedMotion ? (
        <>
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-amber-200/70"
              style={{
                left: `${8 + i * 9}%`,
                top: `${25 + (i % 4) * 12}%`,
                opacity: 0.2 + ostSwell * 0.8,
                transform: `translateY(${-ostSwell * 14}px)`,
              }}
            />
          ))}
        </>
      ) : null}

      {track.theme === 'breakthrough-success' && fxPlaying && !reducedMotion && ascensionSurge > 0.15 ? (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,oklch(0.84_0.16_200/0.45),transparent_55%)]"
          style={{ opacity: ascensionSurge }}
        />
      ) : null}

      {track.theme === 'breakthrough-fail' && fxPlaying && !reducedMotion && collapseFracture > 0.1 ? (
        <div
          className="absolute inset-0 bg-rose-600/20 mix-blend-screen"
          style={{ opacity: collapseFracture * 0.8 }}
        />
      ) : null}

      {track.theme === 'impact' && fxPlaying && !reducedMotion && impactFlash > 0.1 ? (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_45%_60%,oklch(0.72_0.17_155/0.5),transparent_50%)]"
          style={{ opacity: impactFlash }}
        />
      ) : null}

      <div className="absolute inset-0 flex items-end gap-[2px] px-4 pb-4 pt-16">
        {bars.map((height, index) => {
          const active = index / bars.length <= progress
          const pulse = fxPlaying && !reducedMotion ? 0.15 * Math.sin(currentTime * 8 + index * 0.4) : 0
          const barHeight = Number(Math.min(100, (height + pulse) * 100).toFixed(2))
          return (
            <span
              key={index}
              style={{ height: `${barHeight}%` }}
              className={`w-full flex-1 rounded-full transition-all duration-150 ${
                active
                  ? `${accentText[track.accent]} bg-current shadow-[0_0_8px_currentColor]`
                  : 'bg-white/10'
              }`}
            />
          )
        })}
      </div>

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <span className="station-chip !px-3 !py-1 !text-[10px] tracking-[0.25em] text-muted-foreground">
          {track.index}
        </span>
        {track.layerLabel ? (
          <span className="station-chip !px-3 !py-1 !text-[10px] tracking-widest text-muted-foreground">
            {track.layerLabel}
          </span>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  )
}

function TrackConsole({
  track,
  isActive,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  onRestart,
  currentTime,
  duration,
  showCardFx,
  reducedMotion,
}: {
  track: AudioTrack
  isActive: boolean
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onSeek: (time: number) => void
  onRestart: () => void
  currentTime: number
  duration: number
  showCardFx: boolean
  reducedMotion: boolean
}) {
  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-[var(--station-bezel)]/35 bg-[var(--station-hull-dark)]/60 p-5 shadow-[inset_0_1px_0_oklch(0.5_0.04_245/0.15)] transition-all duration-500 sm:p-7 ${
        isPlaying ? `ring-1 ${accentRing[track.accent]}` : ''
      }`}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
        <TrackVisual
          track={track}
          playing={isPlaying}
          currentTime={currentTime}
          duration={duration}
          showCardFx={showCardFx}
          reducedMotion={reducedMotion}
        />
        <div className="flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={`station-readout-label ${accentText[track.accent]}`}>
                {track.subtitle}
              </p>
              <h3 className="font-heading mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {track.title}
              </h3>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isActive ? (
                <button
                  type="button"
                  onClick={onRestart}
                  aria-label={`Restart ${track.title}`}
                  className="station-button station-button-secondary !h-11 !w-11 !p-0 text-muted-foreground hover:!border-amber-400/40 hover:!text-amber-200"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={isPlaying ? onPause : onPlay}
                aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                className={`station-button !h-14 !w-14 !rounded-full !p-0 transition-all hover:scale-105 ${
                  isPlaying || isActive
                    ? `station-button-primary ${accentText[track.accent]} !border-current !shadow-[0_0_30px_-6px_currentColor]`
                    : 'station-button-secondary text-foreground'
                }`}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{track.gameContext}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {track.sources.map((source) => {
              const Icon = sourceIcons[source.type]
              return (
                <span
                  key={`${track.id}-${source.label}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${sourceTypeColors[source.type]}`}
                  title={source.label}
                >
                  <Icon className="h-3 w-3" />
                  {sourceTypeLabels[source.type]}
                </span>
              )
            })}
          </div>

          <div className="mt-6 rounded-xl border border-[var(--station-bezel)]/30 bg-[var(--station-hull-dark)]/50 p-4">
            <p className="station-readout-label flex items-center gap-2 text-muted-foreground">
              <GitMerge className="h-3.5 w-3.5 text-cyan" />
              Reaper Pipeline
            </p>
            <ol className="mt-3 space-y-2">
              {track.reaperPipeline.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                  <span className={`font-mono text-xs ${accentText[track.accent]}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-4 text-sm italic text-muted-foreground/90">{track.designNotes}</p>

          <div className="mt-auto pt-6">
            <div
              role="slider"
              aria-label={`Seek ${track.title}`}
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                onSeek(((event.clientX - rect.left) / rect.width) * duration)
              }}
              className="h-1.5 cursor-pointer overflow-hidden rounded-full bg-white/10"
            >
              <div
                className={`h-full rounded-full ${accentText[track.accent]} bg-current transition-all`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span className="uppercase tracking-widest">Mixed in Reaper</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function WoodSliceStack({
  onPlayLayer,
  onPlayCombined,
  pause,
}: {
  onPlayLayer: (track: AudioTrack) => void
  onPlayCombined: () => void
  pause: () => void
}) {
  const layers = getTracksForCatalog('wood-slice')

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[var(--station-bezel)]/35 border-amber-400/25 bg-[var(--station-hull-dark)]/60 p-6">
      <p className="station-readout-label text-amber-300">
        Combined Weapon Stack
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Layer A + B offset in Reaper — fire combined for the full in-game slice.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => onPlayLayer(layer)}
            className="station-chip !border-amber-400/30 !text-amber-200 hover:!border-amber-400/50"
          >
            Play {layer.layerLabel}
          </button>
        ))}
        <button
          type="button"
          onClick={onPlayCombined}
          className="station-button station-button-primary !border-amber-400/60 !from-amber-300 !to-amber-500 !text-black hover:scale-[1.03]"
        >
          Play Combined
        </button>
        <button
          type="button"
          onClick={pause}
          className="station-button station-button-secondary text-muted-foreground"
        >
          Stop
        </button>
      </div>
    </div>
  )
}

export function AudioArchitecture({ embedded = false }: { embedded?: boolean }) {
  return (
    <AudioFxPreferencesProvider>
      <AudioArchitectureInner embedded={embedded} />
    </AudioFxPreferencesProvider>
  )
}

function AudioArchitectureInner({ embedded = false }: { embedded?: boolean }) {
  const { showScreenFx, showCardFx, isReduced, screenFxLive, toggleScreenFxLive, mode } =
    useAudioFxPreferences()
  const { isCoarsePointer, isNarrow, isTablet } = useDeviceProfile()
  const mobileAudioStop = isCoarsePointer || isNarrow || isTablet
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stackRef = useRef<HTMLAudioElement[]>([])
  const [selectedCatalogId, setSelectedCatalogId] = useState<CatalogId>('cultivation')
  const [woodSliceLayer, setWoodSliceLayer] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const playingRef = useRef(false)
  const activeIdRef = useRef<string | null>(null)

  const catalogTracks = getTracksForCatalog(selectedCatalogId)
  const displayedTrack =
    selectedCatalogId === 'wood-slice'
      ? catalogTracks[woodSliceLayer] ?? catalogTracks[0]
      : catalogTracks[0]

  const activeTrack =
    activeId === 'wood-slice-combined'
      ? audioTracks.find((t) => t.id === 'wood-slice-1') ?? null
      : audioTracks.find((t) => t.id === activeId) ?? null

  const activeFxId = activeId === 'wood-slice-combined' ? 'wood-slice-combined' : activeId
  const activeCues = getFxCues(activeFxId)

  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  useEffect(() => {
    if (!playing) return

    let frame = 0
    const tick = () => {
      if (!playingRef.current) return

      if (activeIdRef.current === 'wood-slice-combined') {
        const primary = stackRef.current[0]
        if (primary) {
          setCurrentTime(primary.currentTime)
          if (primary.duration && Number.isFinite(primary.duration)) {
            setDuration(primary.duration)
          }
        }
      } else {
        const audio = audioRef.current
        if (audio) {
          setCurrentTime(audio.currentTime)
          if (audio.duration && Number.isFinite(audio.duration)) {
            setDuration(audio.duration)
          }
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    stackRef.current.forEach((clip) => clip.pause())
    stackRef.current = []
    setPlaying(false)
  }, [])

  const selectCatalog = useCallback(
    (id: CatalogId) => {
      pause()
      setActiveId(null)
      setCurrentTime(0)
      setDuration(0)
      setSelectedCatalogId(id)
      setWoodSliceLayer(0)
    },
    [pause]
  )

  const goPrev = () => {
    const idx = catalogOrder.indexOf(selectedCatalogId)
    const next = catalogOrder[(idx - 1 + catalogOrder.length) % catalogOrder.length]
    selectCatalog(next)
  }

  const goNext = () => {
    const idx = catalogOrder.indexOf(selectedCatalogId)
    const next = catalogOrder[(idx + 1) % catalogOrder.length]
    selectCatalog(next)
  }

  const playTrack = useCallback(
    async (track: AudioTrack) => {
      let audio = audioRef.current
      if (!audio) {
        audio = new Audio()
        audioRef.current = audio
        audio.addEventListener('timeupdate', () => setCurrentTime(audio?.currentTime ?? 0))
        audio.addEventListener('loadedmetadata', () => setDuration(audio?.duration ?? 0))
        audio.addEventListener('ended', () => {
          setPlaying(false)
          setCurrentTime(0)
        })
      }

      if (activeId !== track.id) {
        audio.src = track.src
        setActiveId(track.id)
        setCurrentTime(0)
        setDuration(0)
      }

      setSelectedCatalogId(track.catalogId)
      if (track.catalogId === 'wood-slice') {
        setWoodSliceLayer(track.id === 'wood-slice-2' ? 1 : 0)
      }

      try {
        await audio.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    },
    [activeId]
  )

  const seek = useCallback(
    (time: number) => {
      if (!audioRef.current || !activeId) return
      audioRef.current.currentTime = time
      setCurrentTime(time)
    },
    [activeId]
  )

  const playCombinedWoodSlice = useCallback(async () => {
    const layers = getTracksForCatalog('wood-slice')
    if (layers.length < 2) return

    audioRef.current?.pause()
    stackRef.current.forEach((clip) => clip.pause())
    stackRef.current = []

    const primary = new Audio(layers[0].src)
    const secondary = new Audio(layers[1].src)
    stackRef.current = [primary, secondary]

    setSelectedCatalogId('wood-slice')
    setActiveId('wood-slice-combined')
    setCurrentTime(0)
    setDuration(getFxCues('wood-slice-combined')?.refDuration ?? 0.504)
    setPlaying(true)

    primary.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(primary.duration)) setDuration(primary.duration)
    })

    const finish = () => {
      setPlaying(false)
      setActiveId(null)
      stackRef.current = []
    }

    primary.addEventListener('ended', finish, { once: true })

    try {
      await primary.play()
      window.setTimeout(() => void secondary.play(), 35)
    } catch {
      finish()
    }
  }, [])

  const restartTrack = useCallback(() => {
    if (activeId === 'wood-slice-combined') {
      void playCombinedWoodSlice()
      return
    }
    if (!activeId) {
      void playTrack(displayedTrack)
      return
    }
    const track = audioTracks.find((t) => t.id === activeId)
    if (!track) return
    seek(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
    setCurrentTime(0)
    if (!playing) void playTrack(track)
    else void audioRef.current?.play()
  }, [activeId, displayedTrack, playCombinedWoodSlice, playTrack, playing, seek])

  const catalogItems = useMemo(
    () => catalogOrder.map((id) => ({ id, title: catalogLabels[id] })),
    []
  )

  const stopAll = useCallback(() => {
    pause()
  }, [pause])

  return (
    <div className="relative">
      <AudioScreenFx
        theme={activeTrack?.theme ?? null}
        playing={playing}
        currentTime={currentTime}
        duration={duration}
        cues={activeCues}
        enabled={showScreenFx}
        reduced={isReduced}
        dismissOnTap={mobileAudioStop}
        onStop={stopAll}
      />

      {playing && mode !== 'off' ? (
        <div
          className={`pointer-events-auto fixed left-1/2 z-[60] flex -translate-x-1/2 gap-2 rounded-full border border-[var(--station-bezel)]/45 bg-[var(--station-hull-dark)]/90 p-1.5 shadow-xl backdrop-blur-md ${
            mobileAudioStop
              ? 'bottom-[max(1rem,env(safe-area-inset-bottom))]'
              : 'bottom-6'
          }`}
        >
          <button
            type="button"
            onClick={toggleScreenFxLive}
            className="station-button station-button-ghost !rounded-full !px-3 !py-2 !text-[10px] !uppercase !tracking-wider"
          >
            {screenFxLive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            FX {screenFxLive ? 'Off' : 'On'}
          </button>
          <button
            type="button"
            onClick={restartTrack}
            className="station-button station-button-ghost !rounded-full !px-3 !py-2 !text-[10px] !uppercase !tracking-wider"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart
          </button>
          <button
            type="button"
            onClick={stopAll}
            className="station-button station-button-ghost !rounded-full !border-rose-400/25 !px-3 !py-2 !text-[10px] !uppercase !tracking-wider !text-rose-200 hover:!border-rose-400/50 hover:!bg-rose-950/40"
          >
            <Pause className="h-3.5 w-3.5" />
            Stop
          </button>
        </div>
      ) : null}

      <LabShell
        embedded={embedded}
        eyebrow="Audio Architecture · Reaper DAW"
        title="Sound Design Lab"
        description="Raw material — found online, recorded by hand, or AI-generated (OST only) — then layered, overlapped, mixed, and developed in Reaper. Select a cue below to inspect the pipeline and hear it."
        icon={Sparkles}
        controls={
          <AudioFxControls
            playing={playing}
            hasActiveTrack={Boolean(activeId)}
            screenFxActive={screenFxLive}
            onToggleScreenFx={toggleScreenFxLive}
            onRestart={restartTrack}
            onStopAll={stopAll}
          />
        }
      >
        <CatalogStrip
          items={catalogItems}
          selectedId={selectedCatalogId}
          onSelect={(id) => selectCatalog(id as CatalogId)}
          onPrev={goPrev}
          onNext={goNext}
        />

        {displayedTrack ? (
          <LabTransition itemKey={`${selectedCatalogId}-${woodSliceLayer}`}>
            <div className="relative min-h-[480px]">
              <TrackConsole
                track={displayedTrack}
                isActive={activeId === displayedTrack.id}
                isPlaying={activeId === displayedTrack.id && playing}
                onPlay={() => void playTrack(displayedTrack)}
                onPause={pause}
                onSeek={seek}
                onRestart={restartTrack}
                currentTime={activeId === displayedTrack.id ? currentTime : 0}
                duration={activeId === displayedTrack.id ? duration : 0}
                showCardFx={showCardFx}
                reducedMotion={isReduced}
              />

              {selectedCatalogId === 'wood-slice' ? (
                <>
                  <div className="mt-4 flex gap-2">
                    {catalogTracks.map((layer, index) => (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => {
                          pause()
                          setWoodSliceLayer(index)
                          setActiveId(null)
                        }}
                        className={`station-chip transition-all ${
                          woodSliceLayer === index
                            ? 'station-chip-active !border-amber-400/40 !text-amber-200'
                            : ''
                        }`}
                      >
                        {layer.layerLabel}
                      </button>
                    ))}
                  </div>
                  <WoodSliceStack
                    onPlayLayer={(track) => void playTrack(track)}
                    onPlayCombined={() => void playCombinedWoodSlice()}
                    pause={pause}
                  />
                </>
              ) : null}
            </div>
          </LabTransition>
        ) : null}
      </LabShell>
    </div>
  )
}
