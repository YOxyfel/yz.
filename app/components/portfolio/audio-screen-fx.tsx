'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Square } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { AudioFxCues } from './audio-fx-timing'
import {
  breathPhaseSeconds,
  getVoidThunderFlash,
  getVoidThunderLevel,
  getVoidVisualState,
  isInWindow,
  multiPeakPulse,
  peakPulse,
  resolveCues,
  segmentProgress,
  type VoidVisualState,
} from './audio-fx-timing'
import type { AudioTheme } from './audio-tracks'

type AudioScreenFxProps = {
  theme: AudioTheme | null
  playing: boolean
  currentTime: number
  duration: number
  cues: AudioFxCues | null
  enabled: boolean
  reduced: boolean
  dismissOnTap?: boolean
  onStop?: () => void
}

function VoidVortexCore({
  size,
  spinDuration,
  intensity,
  animate,
}: {
  size: number
  spinDuration: number
  intensity: number
  animate: boolean
}) {
  const dim = `${Math.max(14, size * 88)}vmin`

  const ring = (
    className: string,
    style: CSSProperties,
    duration: number,
    reverse = false,
  ) =>
    animate ? (
      <motion.div
        className={className}
        style={style}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      />
    ) : (
      <div className={className} style={style} />
    )

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: dim, height: dim, opacity: intensity }}
    >
      {ring(
        'absolute inset-0 rounded-full',
        {
          background:
            'conic-gradient(from 0deg, transparent 0deg, oklch(0.55 0.28 295 / 0.85) 40deg, transparent 80deg, oklch(0.5 0.24 285 / 0.7) 130deg, transparent 180deg, oklch(0.55 0.28 295 / 0.85) 220deg, transparent 260deg, oklch(0.45 0.22 275 / 0.65) 310deg, transparent 360deg)',
        },
        spinDuration,
      )}
      {ring(
        'absolute inset-[10%] rounded-full',
        {
          background:
            'conic-gradient(from 120deg, transparent, oklch(0.6 0.26 300 / 0.75), transparent, oklch(0.42 0.2 270 / 0.55), transparent)',
        },
        spinDuration * 0.55,
        true,
      )}
      {[...Array(animate ? 8 : 4)].map((_, i) =>
        animate ? (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 h-[46%] w-[2px] origin-bottom bg-gradient-to-t from-violet via-violet/40 to-transparent"
            style={{ rotate: `${i * 45}deg`, opacity: 0.35 + intensity * 0.5 }}
            animate={{ rotate: `${i * 45 + 360}deg` }}
            transition={{ duration: spinDuration * 0.9, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-[46%] w-[2px] origin-bottom bg-gradient-to-t from-violet/50 to-transparent"
            style={{ rotate: `${i * 45}deg`, opacity: 0.25 + intensity * 0.3 }}
          />
        ),
      )}
      {animate
        ? [...Array(20)].map((_, i) => {
            const angle = (i / 20) * Math.PI * 2
            const radius = size * (12 + (i % 5) * 3)
            return (
              <motion.span
                key={`p-${i}`}
                className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-violet shadow-[0_0_8px_oklch(0.55_0.24_295/1)]"
                animate={{
                  x: [Math.cos(angle) * radius, Math.cos(angle + 3) * (radius * 0.15), 0],
                  y: [Math.sin(angle) * radius, Math.sin(angle + 3) * (radius * 0.15), 0],
                  opacity: [0, 0.95, 0],
                }}
                transition={{
                  duration: spinDuration * 0.45,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: 'easeIn',
                }}
              />
            )
          })
        : null}
    </div>
  )
}

function VoidStorm({
  size,
  spinDuration,
  storm,
  animate,
}: {
  size: number
  spinDuration: number
  storm: number
  animate: boolean
}) {
  if (storm <= 0.02) return null

  const funnelW = `${Math.max(40, size * 105)}vmin`
  const funnelH = `${Math.max(50, size * 115)}vmin`

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ opacity: storm, width: funnelW, height: funnelH }}
    >
      {animate ? (
        <motion.div
          className="absolute inset-0 rounded-[45%]"
          style={{
            background:
              'conic-gradient(from 0deg, transparent, oklch(0.35 0.12 280 / 0.35), transparent, oklch(0.25 0.08 270 / 0.45), transparent)',
            filter: 'blur(8px)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: spinDuration * 1.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <div
          className="absolute inset-0 rounded-[45%] opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at center, oklch(0.35 0.12 280 / 0.25), transparent 70%)',
          }}
        />
      )}
      {animate
        ? [0, 1, 2, 3, 4].map((ring) => (
            <motion.div
              key={ring}
              className="absolute left-1/2 rounded-full border border-violet/15 bg-violet/5"
              style={{
                top: `${8 + ring * 14}%`,
                width: `${55 + ring * 18}%`,
                height: `${8 + ring * 2}%`,
                x: '-50%',
                filter: 'blur(2px)',
              }}
              animate={{ rotate: ring % 2 === 0 ? 360 : -360, scaleX: [1, 1.08, 1] }}
              transition={{
                rotate: { duration: spinDuration * (1.2 + ring * 0.3), repeat: Infinity, ease: 'linear' },
                scaleX: { duration: 2 + ring * 0.4, repeat: Infinity },
              }}
            />
          ))
        : null}
      {animate
        ? [...Array(14)].map((_, i) => (
            <motion.span
              key={`debris-${i}`}
              className="absolute left-1/2 top-1/2 h-px w-[min(40vw,280px)] origin-left bg-gradient-to-r from-violet/40 via-white/10 to-transparent"
              style={{ rotate: `${(i / 14) * 360}deg`, top: `${20 + (i % 5) * 12}%` }}
              animate={{ opacity: [0.1, 0.45, 0.1], rotate: `${(i / 14) * 360 + 360}deg` }}
              transition={{
                opacity: { duration: 1.5 + i * 0.1, repeat: Infinity },
                rotate: { duration: spinDuration * 2.2, repeat: Infinity, ease: 'linear' },
              }}
            />
          ))
        : null}
      {!animate ? (
        <div className="absolute inset-x-[10%] top-[8%] h-[50%] rounded-[40%] bg-[radial-gradient(ellipse,oklch(0.55_0.24_295/0.12),transparent_72%)]" />
      ) : null}
    </div>
  )
}

function VoidThunder({
  time,
  r,
  state,
}: {
  time: number
  r: NonNullable<ReturnType<typeof resolveCues>['void']>
  state: VoidVisualState
}) {
  const level = getVoidThunderLevel(time, r, state)
  const flash = getVoidThunderFlash(time, level)
  if (flash <= 0) return null

  return (
    <>
      <div
        className="absolute inset-0 bg-white mix-blend-screen"
        style={{ opacity: flash * 0.55 }}
      />
      <div
        className="absolute inset-0 bg-violet-300/40 mix-blend-screen"
        style={{ opacity: flash * 0.35 }}
      />
      {level === 'heavy' ? (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,white,transparent_55%)]"
          style={{ opacity: flash * 0.25 }}
        />
      ) : null}
    </>
  )
}

function VoidFx({
  time,
  cues,
  duration,
  animate,
}: {
  time: number
  cues: AudioFxCues
  duration: number
  animate: boolean
}) {
  const r = resolveCues(cues, duration).void!
  const state = getVoidVisualState(time, r)

  return (
    <>
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: (0.25 + state.storm * 0.35 + state.intensity * 0.2) * state.opacity }}
      />
      {state.storm > 0.08 ? (
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.35_0.14_285/0.25),transparent_70%)]"
          style={{ opacity: state.storm * state.opacity }}
        />
      ) : null}
      {animate ? <VoidThunder time={time} r={r} state={state} /> : null}
      <VoidStorm
        size={state.size}
        spinDuration={state.spinDuration}
        storm={state.storm * state.opacity}
        animate={animate}
      />
      <VoidVortexCore
        size={state.size}
        spinDuration={state.spinDuration}
        intensity={state.intensity * state.opacity}
        animate={animate}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"
        style={{
          width: `${Math.max(4, state.hole * state.size * 92)}vmin`,
          height: `${Math.max(4, state.hole * state.size * 92)}vmin`,
          boxShadow: `0 0 ${20 + state.size * 100}px ${10 + state.size * 60}px oklch(0.55 0.24 295 / ${0.15 + state.intensity * 0.35})`,
          opacity: state.opacity,
        }}
      />
      {time >= r.collapseStart && state.opacity < 1 ? (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,black_75%)]"
          style={{ opacity: 1 - state.opacity }}
        />
      ) : null}
    </>
  )
}

function CultivationFx({
  time,
  cues,
  duration,
}: {
  time: number
  cues: AudioFxCues
  duration: number
}) {
  const c = resolveCues(cues, duration).cultivation!
  const breath = breathPhaseSeconds(time, c.breathPeaks[0], c.loopPeriod)
  const qiPulse = multiPeakPulse(
    time,
    cues.cultivation!.breathPeaks,
    duration,
    cues.refDuration,
    0.045,
  )
  const ringScale = 0.6 + breath * 1.1 + qiPulse * 0.35

  return (
    <>
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.84_0.16_200/0.2),transparent_68%)]"
        style={{ opacity: 0.5 + qiPulse * 0.4 }}
      />
      {[...Array(18)].map((_, i) => {
        const stagger = (i * 0.17 + breath) % 1
        return (
          <span
            key={i}
            className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_14px_var(--cyan)]"
            style={{
              bottom: `${5 + (i % 5) * 5}%`,
              marginLeft: `${(i % 7) * 14 - 42}px`,
              opacity: stagger < 0.35 ? qiPulse * 0.95 : 0.12,
              transform: `translateY(${-stagger * 180}px) scale(${0.4 + qiPulse * 0.8})`,
            }}
          />
        )
      })}
      <div
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.84_0.16_200/0.12),transparent_70%)]"
        style={{ opacity: 0.35 + qiPulse * 0.5, transform: `scale(${0.9 + qiPulse * 0.3})` }}
      />
      {[0, 1, 2].map((ring) => (
        <div
          key={ring}
          className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/20"
          style={{
            width: 80 + ring * 40,
            height: 80 + ring * 40,
            opacity: Math.max(0, 0.65 - ring * 0.15) * qiPulse,
            transform: `scale(${ringScale - ring * 0.12})`,
          }}
        />
      ))}
    </>
  )
}

function OstFx({ time, cues, duration }: { time: number; cues: AudioFxCues; duration: number }) {
  const swells = cues.ost?.harmonySwells ?? []
  const swell = multiPeakPulse(time, swells, duration, cues.refDuration, 2.5)
  const gentle = 0.35 + swell * 0.55

  return (
    <>
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.84_0.14_85/0.18),transparent_72%)]"
        style={{ opacity: gentle }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-sky-300/8 via-transparent to-amber-200/12"
        style={{ opacity: gentle }}
      />
      {[...Array(24)].map((_, i) => {
        const phase = (time * 0.15 + i * 0.21) % 1
        return (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-amber-100/90 shadow-[0_0_12px_oklch(0.84_0.14_85/0.9)]"
            style={{
              left: `${8 + (i * 4.2) % 84}%`,
              top: `${15 + ((i * 13) % 70)}%`,
              opacity: (0.15 + phase * 0.8) * gentle,
              transform: `translateY(${-phase * 22}px) scale(${0.7 + swell * 0.8})`,
            }}
          />
        )
      })}
      <div
        className="absolute left-1/2 top-[38%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/15"
        style={{
          opacity: 0.2 + swell * 0.5,
          transform: `scale(${0.9 + swell * 0.25}) rotate(${time * 12}deg)`,
        }}
      />
    </>
  )
}

function AscensionFx({
  time,
  cues,
  duration,
}: {
  time: number
  cues: AudioFxCues
  duration: number
}) {
  const a = resolveCues(cues, duration).ascension!
  const build = segmentProgress(time, a.buildStart, a.climaxStart)
  const surge = Math.max(
    ...a.surgePeaks.map((p) => peakPulse(time, p, 1.1)),
    peakPulse(time, a.climaxPeak, 1.2),
  )
  const climax = isInWindow(time, a.climaxStart, a.climaxEnd)
  const climaxPeak = peakPulse(time, a.climaxPeak, 1.0)
  const burst = peakPulse(time, a.climaxPeak + 0.35, 0.55)
  const resolve = segmentProgress(time, a.resolveStart, duration)

  return (
    <>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,oklch(0.84_0.16_200/0.22),transparent_62%)]"
        style={{ opacity: 0.35 + build * 0.4 + surge * 0.5 }}
      />
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-[40%] h-24 w-px origin-bottom bg-gradient-to-t from-cyan/60 to-transparent"
          style={{
            rotate: `${i * 45}deg`,
            transform: `rotate(${i * 45}deg) scaleY(${0.3 + build * 0.5 + surge * 1.4})`,
            opacity: 0.3 + surge * 0.7,
          }}
        />
      ))}
      {(climax || climaxPeak > 0.2) && (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,oklch(0.84_0.16_200/0.45),oklch(0.55_0.24_295/0.2)_50%,transparent_72%)]"
          style={{ opacity: climaxPeak }}
        />
      )}
      {burst > 0.25 && (
        <>
          {[...Array(12)].map((_, i) => (
            <span
              key={`spark-${i}`}
              className="absolute left-1/2 top-[38%] h-2 w-2 rounded-full bg-cyan shadow-[0_0_16px_var(--cyan)]"
              style={{
                opacity: burst,
                transform: `translate(${Math.cos((i / 12) * Math.PI * 2) * burst * 180}px, ${Math.sin((i / 12) * Math.PI * 2) * burst * 120}px) scale(${burst})`,
              }}
            />
          ))}
        </>
      )}
      {resolve > 0 && (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,oklch(0.55_0.24_295/0.15),transparent_65%)]"
          style={{ opacity: resolve * 0.5 }}
        />
      )}
    </>
  )
}

function CollapseFx({
  time,
  cues,
  duration,
}: {
  time: number
  cues: AudioFxCues
  duration: number
}) {
  const c = resolveCues(cues, duration).collapse!
  const agony = segmentProgress(time, c.failStart, c.fracturePeaks[c.fracturePeaks.length - 1])
  const fracture = Math.max(...c.fracturePeaks.map((p) => peakPulse(time, p, 0.9)))
  const tail = segmentProgress(time, c.tailStart, duration)
  const unrest = isInWindow(time, c.buildStart, c.failStart)
    ? segmentProgress(time, c.buildStart, c.failStart) * 0.5
    : 0

  return (
    <>
      <div
        className="absolute inset-0 bg-rose-950/35"
        style={{ opacity: 0.2 + agony * 0.45 + fracture * 0.25 + unrest }}
      />
      <div
        className="absolute inset-0 bg-violet-950/20 mix-blend-screen"
        style={{ opacity: 0.1 + agony * 0.35 + fracture * 0.3 }}
      />
      {agony > 0.05 &&
        [...Array(10)].map((_, i) => (
          <span
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-rose-500/70 to-transparent"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i * 17) % 60}%`,
              width: `${20 + (i % 3) * 15}%`,
              rotate: `${-30 + i * 12}deg`,
              opacity: agony * (0.4 + fracture * 0.6),
            }}
          />
        ))}
      {fracture > 0.2 && (
        <>
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,oklch(0.62_0.24_25/0.5),oklch(0.55_0.24_295/0.25)_40%,transparent_70%)]"
            style={{ opacity: fracture }}
          />
          {[...Array(6)].map((_, i) => (
            <div
              key={`crack-${i}`}
              className="absolute left-1/2 top-1/2 h-[60vh] w-px origin-top bg-gradient-to-b from-rose-500/80 via-violet/50 to-transparent"
              style={{
                opacity: fracture,
                transform: `rotate(${i * 60 + 15}deg) scaleY(${fracture})`,
              }}
            />
          ))}
        </>
      )}
      {tail > 0 && <div className="absolute inset-0 bg-black/30" style={{ opacity: tail * 0.6 }} />}
    </>
  )
}

function ImpactFx({ time, cues, duration }: { time: number; cues: AudioFxCues; duration: number }) {
  const hit = resolveCues(cues, duration).impact!
  const flash = peakPulse(time, hit.hitPeak, hit.hitEnd - hit.hitStart)

  return (
    <>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_45%_65%,oklch(0.72_0.17_155/0.35),transparent_55%)]"
        style={{ opacity: flash }}
      />
      {flash > 0.15 && (
        <div
          className="absolute left-[45%] top-[60%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/40"
          style={{ opacity: flash, transform: `scale(${1 + flash * 2})` }}
        />
      )}
    </>
  )
}

function SliceFx({ time, cues, duration }: { time: number; cues: AudioFxCues; duration: number }) {
  const s = resolveCues(cues, duration).slice!
  const slash = peakPulse(time, s.slashPeak, (s.slashEnd - s.slashPeak) * 0.45)
  const layerB = s.layerBOffset ? peakPulse(time, s.slashPeak + s.layerBOffset, 0.06) : 0

  return (
    <>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_55%_50%,oklch(0.75_0.15_75/0.25),transparent_50%)]"
        style={{ opacity: slash + layerB * 0.7 }}
      />
      <div
        className="absolute left-[20%] top-[48%] h-px w-[60%] origin-left bg-gradient-to-r from-amber-200/80 to-transparent"
        style={{
          opacity: slash,
          transform: `rotate(-12deg) scaleX(${0.5 + slash * 1.5})`,
        }}
      />
    </>
  )
}

function ReducedThemeFx({
  theme,
  progress,
}: {
  theme: AudioTheme
  progress: number
}) {
  const soft = 0.12 + progress * 0.18
  const gradients: Record<AudioTheme, string> = {
    cultivation: 'radial-gradient(circle at 50% 80%, oklch(0.84 0.16 200 / 0.2), transparent 60%)',
    void: 'radial-gradient(circle at 50% 50%, oklch(0.55 0.24 295 / 0.2), oklch(0.12 0.01 270 / 0.5))',
    impact: 'radial-gradient(circle at 45% 60%, oklch(0.72 0.17 155 / 0.2), transparent 55%)',
    ost: 'radial-gradient(ellipse at bottom, oklch(0.84 0.14 85 / 0.15), transparent 65%)',
    'breakthrough-success':
      'radial-gradient(circle at 50% 35%, oklch(0.84 0.16 200 / 0.18), transparent 60%)',
    'breakthrough-fail':
      'radial-gradient(circle at 50% 60%, oklch(0.62 0.24 25 / 0.15), transparent 60%)',
    slice: 'radial-gradient(circle at 55% 50%, oklch(0.75 0.15 75 / 0.15), transparent 55%)',
  }

  return (
    <div
      className="absolute inset-0"
      style={{ background: gradients[theme], opacity: soft }}
    />
  )
}

function renderThemeFx(
  theme: AudioTheme,
  time: number,
  duration: number,
  cues: AudioFxCues,
  animate: boolean,
) {
  switch (theme) {
    case 'cultivation':
      return animate ? (
        <CultivationFx time={time} cues={cues} duration={duration} />
      ) : null
    case 'void':
      return <VoidFx time={time} cues={cues} duration={duration} animate={animate} />
    case 'ost':
      return animate ? <OstFx time={time} cues={cues} duration={duration} /> : null
    case 'breakthrough-success':
      return animate ? <AscensionFx time={time} cues={cues} duration={duration} /> : null
    case 'breakthrough-fail':
      return animate ? <CollapseFx time={time} cues={cues} duration={duration} /> : null
    case 'impact':
      return animate ? <ImpactFx time={time} cues={cues} duration={duration} /> : null
    case 'slice':
      return animate ? <SliceFx time={time} cues={cues} duration={duration} /> : null
  }
}

export function AudioScreenFx({
  theme,
  playing,
  currentTime,
  duration,
  cues,
  enabled,
  reduced,
  dismissOnTap = false,
  onStop,
}: AudioScreenFxProps) {
  const effectiveDuration =
    duration > 0 && Number.isFinite(duration) ? duration : (cues?.refDuration ?? 0)
  const progress = effectiveDuration > 0 ? currentTime / effectiveDuration : 0
  const animate = !reduced
  const mobileStop = dismissOnTap && Boolean(onStop)

  return (
    <AnimatePresence>
      {enabled && playing && theme && cues && effectiveDuration > 0 ? (
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.5 : 0.25 }}
          className={`audio-screen-fx-layer fixed inset-0 z-[35] ${
            mobileStop ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
          }`}
          onClick={mobileStop ? onStop : undefined}
          onKeyDown={
            mobileStop
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onStop?.()
                  }
                }
              : undefined
          }
          role={mobileStop ? 'button' : undefined}
          tabIndex={mobileStop ? 0 : undefined}
          aria-label={mobileStop ? 'Stop audio and visual effects' : undefined}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {reduced ? (
              theme === 'void' ? (
                <VoidFx
                  time={currentTime}
                  cues={cues}
                  duration={effectiveDuration}
                  animate={false}
                />
              ) : (
                <ReducedThemeFx theme={theme} progress={progress} />
              )
            ) : (
              renderThemeFx(theme, currentTime, effectiveDuration, cues, animate)
            )}

            <div className="absolute inset-0 bg-background/18" />
            <div className="absolute inset-0 [box-shadow:inset_0_0_140px_50px_oklch(0.12_0.01_270/0.88)]" />
          </div>

          {mobileStop ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onStop?.()
                }}
                className="audio-screen-fx-stop-btn absolute left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-[2] inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-rose-400/45 bg-[oklch(0.08_0.012_270/0.94)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-rose-100 shadow-[0_8px_32px_-8px_oklch(0_0_0/0.85)]"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop
              </button>
              <p className="audio-screen-fx-stop-hint pointer-events-none absolute bottom-[max(5.75rem,calc(env(safe-area-inset-bottom)+4.75rem))] left-1/2 z-[2] -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                Tap anywhere to stop
              </p>
            </>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
