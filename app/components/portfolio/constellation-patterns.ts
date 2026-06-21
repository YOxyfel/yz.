import classicData from './constellation-pattern-data.json'
import otherData from './constellation-pattern-data-other.json'

export type PatternCategory = 'classic' | 'meme' | 'popular' | 'object' | 'icon'

export type ConstellationPattern = {
  id: string
  name: string
  stars: [number, number][]
  edges: [number, number][]
  file?: string
  category?: PatternCategory
}

export type PatternPool = 'classic' | 'other' | 'crazy'

export type PickPatternOptions = {
  excludeIds?: Set<string>
  pool?: PatternPool
  category?: Exclude<PatternCategory, 'classic'>
}

const CLASSIC_PATTERNS = classicData.constellations as ConstellationPattern[]
const OTHER_PATTERNS = otherData.constellations as ConstellationPattern[]

function availablePatterns(
  patterns: ConstellationPattern[],
  excludeIds?: Set<string>,
  category?: Exclude<PatternCategory, 'classic'>
) {
  return patterns.filter((pattern) => {
    if (excludeIds?.has(pattern.id)) return false
    if (category && pattern.category !== category) return false
    return true
  })
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export function getConstellationPatterns(pool: PatternPool = 'classic') {
  return pool === 'other' ? OTHER_PATTERNS : CLASSIC_PATTERNS
}

export function getOtherConstellationPatterns(category?: Exclude<PatternCategory, 'classic'>) {
  if (!category) return OTHER_PATTERNS
  return OTHER_PATTERNS.filter((pattern) => pattern.category === category)
}

export function getConstellationPattern(id: string) {
  return (
    CLASSIC_PATTERNS.find((pattern) => pattern.id === id) ??
    OTHER_PATTERNS.find((pattern) => pattern.id === id)
  )
}

export function pickConstellationPattern(options?: PickPatternOptions): ConstellationPattern | null {
  const pool = options?.pool ?? 'classic'

  if (pool === 'crazy') {
    return pickCrazyConstellationPattern(options?.excludeIds)
  }

  const patterns = pool === 'other' ? OTHER_PATTERNS : CLASSIC_PATTERNS
  const available = availablePatterns(patterns, options?.excludeIds, options?.category)
  if (available.length === 0) return null

  return pickRandom(available)
}

export function pickCrazyConstellationPattern(excludeIds?: Set<string>): ConstellationPattern | null {
  const classicAvailable = availablePatterns(CLASSIC_PATTERNS, excludeIds)
  const otherAvailable = availablePatterns(OTHER_PATTERNS, excludeIds)

  if (classicAvailable.length === 0 && otherAvailable.length === 0) {
    return null
  }

  const preferOther = Math.random() < 0.82
  const primary = preferOther ? otherAvailable : classicAvailable
  const fallback = preferOther ? classicAvailable : otherAvailable
  const pool = primary.length > 0 ? primary : fallback

  return pickRandom(pool)
}

export function collectUsedPatternIds(constellations: Array<{ hidden?: boolean; patternId?: string }>) {
  const used = new Set<string>()
  for (const constellation of constellations) {
    if (constellation.hidden || !constellation.patternId) continue
    used.add(constellation.patternId)
  }
  return used
}
