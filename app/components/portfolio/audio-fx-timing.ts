export type AudioFxCues = {
  refDuration: number
  void?: {
    /** Normalized — end of small fast vortex (≈5s) */
    intenseEnd: number
    /** Normalized — end of rapid expansion into storm (≈6s) */
    expandEnd: number
    /** Normalized — storm ends / collapse begins (≈17s) */
    collapseStart: number
    collapseEnd: number
  }
  cultivation?: {
    breathPeaks: number[]
    loopPeriod: number
  }
  impact?: {
    hitStart: number
    hitPeak: number
    hitEnd: number
  }
  ost?: {
    harmonySwells: number[]
  }
  ascension?: {
    riseStart: number
    buildStart: number
    surgePeaks: number[]
    climaxStart: number
    climaxPeak: number
    climaxEnd: number
    resolveStart: number
  }
  collapse?: {
    tensionStart: number
    buildStart: number
    failStart: number
    fracturePeaks: number[]
    agonyEnd: number
    tailStart: number
  }
  slice?: {
    slashPeak: number
    slashEnd: number
    layerBOffset?: number
  }
}

/** Map normalized cue → seconds using live duration when available */
export function cueAt(normalized: number, duration: number, refDuration: number) {
  const d = duration > 0 && Number.isFinite(duration) ? duration : refDuration
  return normalized * d
}

/** 0→1 progress through [start, end] in seconds */
export function segmentProgress(time: number, start: number, end: number) {
  if (end <= start) return time >= start ? 1 : 0
  return Math.min(1, Math.max(0, (time - start) / (end - start)))
}

export function isInWindow(time: number, start: number, end: number) {
  return time >= start && time <= end
}

export function peakPulse(time: number, peak: number, spread = 0.35) {
  const d = (time - peak) / spread
  return Math.exp(-d * d)
}

export function multiPeakPulse(
  time: number,
  peaks: number[],
  duration: number,
  refDuration: number,
  spread = 0.4,
) {
  if (peaks.length === 0) return 0
  return Math.max(
    ...peaks.map((p) => peakPulse(time, cueAt(p, duration, refDuration), spread)),
  )
}

export function breathPhaseSeconds(time: number, firstPeak: number, period: number) {
  if (period <= 0) return 0
  const t = ((time - firstPeak) % period + period) % period
  return t / period
}

/** Resolve normalized cue map to seconds for a track */
export function resolveCues(cues: AudioFxCues, duration: number) {
  const d = duration > 0 && Number.isFinite(duration) ? duration : cues.refDuration
  const at = (n: number) => n * d

  return {
    duration: d,
    void: cues.void
      ? {
          intenseEnd: at(cues.void.intenseEnd),
          expandEnd: at(cues.void.expandEnd),
          collapseStart: at(cues.void.collapseStart),
          collapseEnd: at(cues.void.collapseEnd),
        }
      : null,
    cultivation: cues.cultivation
      ? {
          breathPeaks: cues.cultivation.breathPeaks.map((p) => at(p)),
          loopPeriod: at(cues.cultivation.loopPeriod),
        }
      : null,
    impact: cues.impact
      ? {
          hitStart: at(cues.impact.hitStart),
          hitPeak: at(cues.impact.hitPeak),
          hitEnd: at(cues.impact.hitEnd),
        }
      : null,
    ost: cues.ost
      ? { harmonySwells: cues.ost.harmonySwells.map((p) => at(p)) }
      : null,
    ascension: cues.ascension
      ? {
          riseStart: at(cues.ascension.riseStart),
          buildStart: at(cues.ascension.buildStart),
          surgePeaks: cues.ascension.surgePeaks.map((p) => at(p)),
          climaxStart: at(cues.ascension.climaxStart),
          climaxPeak: at(cues.ascension.climaxPeak),
          climaxEnd: at(cues.ascension.climaxEnd),
          resolveStart: at(cues.ascension.resolveStart),
        }
      : null,
    collapse: cues.collapse
      ? {
          tensionStart: at(cues.collapse.tensionStart),
          buildStart: at(cues.collapse.buildStart),
          failStart: at(cues.collapse.failStart),
          fracturePeaks: cues.collapse.fracturePeaks.map((p) => at(p)),
          agonyEnd: at(cues.collapse.agonyEnd),
          tailStart: at(cues.collapse.tailStart),
        }
      : null,
    slice: cues.slice
      ? {
          slashPeak: at(cues.slice.slashPeak),
          slashEnd: at(cues.slice.slashEnd),
          layerBOffset: cues.slice.layerBOffset
            ? at(cues.slice.layerBOffset)
            : undefined,
        }
      : null,
  }
}

export type ResolvedFxCues = ReturnType<typeof resolveCues>

// ─── Void VFX tuning ─────────────────────────────────────────────────────────
// Edit seconds below to match the audio. Values are converted to 0–1 cues using
// refDuration. After changing, reload the page and play "The Void".
export const VOID_TIMELINE = {
  refDuration: 19.5,
  /** Small fast vortex until this second */
  intenseEnd: 6,
  /** Storm fully open by this second (keep close to intenseEnd for a snap) */
  expandEnd: 6.35,
  /** Reverse collapse begins — storm snaps back to small vortex */
  collapseStart: 16.5,
  /** Track end — vortex fades out */
  collapseEnd: 19.5,
} as const

/** Visual size / spin — optional polish */
export const VOID_LOOK = {
  intenseSize: 0.2,
  stormSize: 1,
  fastSpinSeconds: 0.7,
  slowSpinSeconds: 5.5,
} as const

/** Collapse pacing as fractions of (collapseStart → collapseEnd) */
export const VOID_COLLAPSE = {
  /** Portion spent snapping storm → small vortex (lower = faster close) */
  implodeFraction: 0.1,
  /** Portion spent on small intense vortex before fade (0–1) */
  intenseHoldFraction: 0.45,
} as const

// Normalized cues from 10ms envelope + transient analysis of source files
export const audioFxCues: Record<string, AudioFxCues> = {
  cultivation: {
    refDuration: 17.5,
    cultivation: {
      breathPeaks: [
        0.166, 0.189, 0.246, 0.274, 0.451, 0.474, 0.526, 0.737, 0.76, 0.84,
      ],
      loopPeriod: 0.14,
    },
  },
  void: {
    refDuration: VOID_TIMELINE.refDuration,
    void: {
      intenseEnd: VOID_TIMELINE.intenseEnd / VOID_TIMELINE.refDuration,
      expandEnd: VOID_TIMELINE.expandEnd / VOID_TIMELINE.refDuration,
      collapseStart: VOID_TIMELINE.collapseStart / VOID_TIMELINE.refDuration,
      collapseEnd: VOID_TIMELINE.collapseEnd / VOID_TIMELINE.refDuration,
    },
  },
  aha: {
    refDuration: 0.5,
    impact: {
      hitStart: 0.1,
      hitPeak: 0.3,
      hitEnd: 0.42,
    },
  },
  ost: {
    refDuration: 306.965,
    ost: {
      harmonySwells: [
        0.033, 0.049, 0.228, 0.244, 0.261, 0.309, 0.472, 0.521, 0.586, 0.716,
        0.733, 0.814,
      ],
    },
  },
  'breakthrough-success': {
    refDuration: 76.414,
    ascension: {
      riseStart: 0.251,
      buildStart: 0.26,
      surgePeaks: [0.379, 0.6, 0.717, 0.722],
      climaxStart: 0.712,
      climaxPeak: 0.722,
      climaxEnd: 0.749,
      resolveStart: 0.919,
    },
  },
  'breakthrough-fail': {
    refDuration: 102.5,
    collapse: {
      tensionStart: 0.097,
      buildStart: 0.194,
      failStart: 0.568,
      fracturePeaks: [0.568, 0.574, 0.617, 0.632],
      agonyEnd: 0.643,
      tailStart: 0.847,
    },
  },
  'wood-slice-1': {
    refDuration: 0.36,
    slice: { slashPeak: 0.12, slashEnd: 0.75 },
  },
  'wood-slice-2': {
    refDuration: 0.504,
    slice: { slashPeak: 0.14, slashEnd: 0.8 },
  },
  'wood-slice-combined': {
    refDuration: 0.504,
    slice: { slashPeak: 0.1, slashEnd: 0.72, layerBOffset: 0.069 },
  },
}

export function getFxCues(trackId: string | null | undefined): AudioFxCues | null {
  if (!trackId) return null
  return audioFxCues[trackId] ?? null
}

export type VoidVisualState = {
  size: number
  spinDuration: number
  storm: number
  intensity: number
  hole: number
  opacity: number
}

function easeInSharp(t: number) {
  return t * t * t
}

/** Three-act void: intense vortex → storm expansion → reverse collapse */
export function getVoidVisualState(
  time: number,
  r: NonNullable<ReturnType<typeof resolveCues>['void']>,
): VoidVisualState {
  if (time >= r.collapseStart) {
    const p = segmentProgress(time, r.collapseStart, r.collapseEnd)
    const { implodeFraction, intenseHoldFraction } = VOID_COLLAPSE
    const fadeStart = intenseHoldFraction

    if (p < implodeFraction) {
      const t = easeInSharp(p / implodeFraction)
      return {
        size:
          VOID_LOOK.stormSize +
          (VOID_LOOK.intenseSize - VOID_LOOK.stormSize) * t,
        spinDuration:
          VOID_LOOK.slowSpinSeconds +
          (VOID_LOOK.fastSpinSeconds - VOID_LOOK.slowSpinSeconds) * t,
        storm: 1 - t,
        intensity: 0.55 + t * 0.45,
        hole: 0.38 + (0.1 - 0.38) * t,
        opacity: 1,
      }
    }

    if (p < fadeStart) {
      return {
        size: VOID_LOOK.intenseSize,
        spinDuration: VOID_LOOK.fastSpinSeconds,
        storm: 0,
        intensity: 1,
        hole: 0.1,
        opacity: 1,
      }
    }

    const t = (p - fadeStart) / (1 - fadeStart)
    return {
      size: VOID_LOOK.intenseSize * (1 - t * 0.6),
      spinDuration: VOID_LOOK.fastSpinSeconds * 0.85,
      storm: 0,
      intensity: 1 - t,
      hole: 0.1 * (1 - t),
      opacity: 1 - t,
    }
  }

  if (time >= r.expandEnd) {
    return {
      size: VOID_LOOK.stormSize,
      spinDuration: VOID_LOOK.slowSpinSeconds,
      storm: 1,
      intensity: 0.6,
      hole: 0.4,
      opacity: 1,
    }
  }

  if (time >= r.intenseEnd) {
    const t = easeInSharp(segmentProgress(time, r.intenseEnd, r.expandEnd))
    return {
      size: VOID_LOOK.intenseSize + (VOID_LOOK.stormSize - VOID_LOOK.intenseSize) * t,
      spinDuration:
        VOID_LOOK.fastSpinSeconds +
        (VOID_LOOK.slowSpinSeconds - VOID_LOOK.fastSpinSeconds) * t,
      storm: t * 0.95,
      intensity: 1 - t * 0.35,
      hole: 0.1 + t * 0.3,
      opacity: 1,
    }
  }

  const t = segmentProgress(time, 0, r.intenseEnd)
  return {
    size: VOID_LOOK.intenseSize * (0.82 + t * 0.18),
    spinDuration: VOID_LOOK.fastSpinSeconds,
    storm: 0,
    intensity: 0.9 + t * 0.1,
    hole: 0.06 + t * 0.04,
    opacity: Math.min(1, time / 0.25),
  }
}

export type VoidThunderLevel = 'none' | 'weak' | 'heavy'

export function getVoidThunderLevel(
  time: number,
  r: NonNullable<ReturnType<typeof resolveCues>['void']>,
  state: VoidVisualState,
): VoidThunderLevel {
  if (time >= r.intenseEnd && time < r.expandEnd) return 'weak'
  if (time >= r.expandEnd && time < r.collapseStart && state.storm > 0.35) return 'heavy'
  if (time >= r.collapseStart) {
    const p = segmentProgress(time, r.collapseStart, r.collapseEnd)
    if (p < VOID_COLLAPSE.implodeFraction * 1.2) return 'weak'
  }
  if (time > 0.4 && time < r.intenseEnd) return 'weak'
  return 'none'
}

/** Deterministic flash — no Math.random (SSR-safe when only used client-side during play) */
export function getVoidThunderFlash(time: number, level: VoidThunderLevel) {
  if (level === 'none') return 0
  const bucket = level === 'heavy' ? 1.6 : 3.4
  const phase = time % bucket
  const slot = Math.floor(time / bucket)
  const gate = (slot * 928371 + (level === 'heavy' ? 41 : 17)) % 100
  if (gate > (level === 'heavy' ? 50 : 76)) return 0
  if (phase > 0.14) return 0
  const peak = level === 'heavy' ? 0.42 : 0.16
  return peak * (1 - phase / 0.14)
}
