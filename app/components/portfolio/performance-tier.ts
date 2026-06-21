export type PerformanceTier = 'high' | 'mid' | 'low'

const ADAPTIVE_TIER_KEY = 'portfolio-perf-tier-adaptive'
const HARDWARE_TIER_KEY = 'portfolio-perf-tier-hardware'
const BENCHMARK_DONE_KEY = 'portfolio-perf-benchmark-done'

export const COSMIC_STAR_COUNTS: Record<PerformanceTier, { lite: number; medium: number; full: number }> =
  {
    low: { lite: 10, medium: 28, full: 40 },
    mid: { lite: 14, medium: 40, full: 55 },
    high: { lite: 18, medium: 48, full: 72 },
  }

export function tierRank(tier: PerformanceTier): number {
  return tier === 'high' ? 2 : tier === 'mid' ? 1 : 0
}

export function minTier(a: PerformanceTier, b: PerformanceTier): PerformanceTier {
  return tierRank(a) <= tierRank(b) ? a : b
}

export function downgradeTier(tier: PerformanceTier): PerformanceTier {
  if (tier === 'high') return 'mid'
  return 'low'
}

export function upgradeTier(tier: PerformanceTier): PerformanceTier {
  if (tier === 'low') return 'mid'
  return 'high'
}

type GpuClass = 'integrated' | 'mobile' | 'discrete' | 'unknown'

export function detectGpuClass(): GpuClass {
  if (typeof document === 'undefined') return 'unknown'

  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl' as 'webgl')
    if (!gl) return 'unknown'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return 'unknown'

    const renderer = String(
      gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    ).toLowerCase()

    if (/apple gpu|adreno|mali|powervr|tegra|vivante|videocore/.test(renderer)) {
      return 'mobile'
    }
    if (/intel|iris|uhd|hd graphics|llvmpipe|swiftshader|microsoft basic|angle/.test(renderer)) {
      return 'integrated'
    }
    if (/nvidia|geforce|quadro|radeon|rx |apple m[0-9]|amd/.test(renderer)) {
      return 'discrete'
    }
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

export function detectHardwareTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'mid'

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.matchMedia('(max-width: 767px)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (coarse || narrow || reduced) return 'low'

  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const gpu = detectGpuClass()

  let score = 0

  if (cores >= 8) score += 2
  else if (cores >= 4) score += 1
  else score -= 1

  if (memory !== undefined) {
    if (memory >= 8) score += 2
    else if (memory >= 4) score += 1
    else score -= 1
  }

  if (gpu === 'discrete') score += 2
  else if (gpu === 'integrated') score -= 1
  else if (gpu === 'mobile') score -= 2

  if (score >= 4) return 'high'
  if (score >= 1) return 'mid'
  return 'low'
}

export function readBootstrapPerfTier(): PerformanceTier | null {
  if (typeof document === 'undefined') return null
  const value = document.documentElement.dataset.perfTier
  if (value === 'high' || value === 'mid' || value === 'low') return value
  return null
}

let cachedHardwareTier: PerformanceTier | null = null

export function getHardwareTier(): PerformanceTier {
  if (cachedHardwareTier) return cachedHardwareTier

  if (typeof sessionStorage !== 'undefined') {
    const stored = sessionStorage.getItem(HARDWARE_TIER_KEY)
    if (stored === 'high' || stored === 'mid' || stored === 'low') {
      cachedHardwareTier = stored
      return stored
    }
  }

  const detected = detectHardwareTier()
  cachedHardwareTier = detected
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(HARDWARE_TIER_KEY, detected)
  }
  return detected
}

export function getAdaptiveTier(): PerformanceTier | null {
  if (typeof sessionStorage === 'undefined') return null
  const stored = sessionStorage.getItem(ADAPTIVE_TIER_KEY)
  if (stored === 'high' || stored === 'mid' || stored === 'low') return stored
  return null
}

export function setAdaptiveTier(tier: PerformanceTier) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(ADAPTIVE_TIER_KEY, tier)
}

export function resolvePerformanceTier(adaptive: PerformanceTier | null): PerformanceTier {
  const hardware = getHardwareTier()
  if (!adaptive) return hardware
  return minTier(hardware, adaptive)
}

export function isPerfBenchmarkDone(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(BENCHMARK_DONE_KEY) === '1'
}

export function markPerfBenchmarkDone() {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(BENCHMARK_DONE_KEY, '1')
}

export function sampleFrameRate(durationMs: number): Promise<number> {
  return new Promise((resolve) => {
    const frameTimes: number[] = []
    let last = performance.now()
    let start = last
    let raf = 0

    const tick = (now: number) => {
      frameTimes.push(now - last)
      last = now

      if (now - start >= durationMs) {
        cancelAnimationFrame(raf)
        const averageMs =
          frameTimes.reduce((sum, value) => sum + value, 0) / Math.max(frameTimes.length, 1)
        resolve(1000 / averageMs)
        return
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
  })
}

export const PERF_DOWNGRADE_FPS = 45
export const PERF_UPGRADE_FPS = 58
export const PERF_BENCHMARK_MS = 2500
export const PERF_UPGRADE_HOLD_MS = 10_000
