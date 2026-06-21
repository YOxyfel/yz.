export type Star = { id: number; x: number; y: number }

export type ConstellationVariant =
  | 'normal'
  | 'shiny'
  | 'mythic'
  | 'meme-69'
  | 'meme-96'
  | 'meme-420'
  | 'meme-weed'
  | 'meme-21'
  | 'meme-404'
  | 'meme-666'
  | 'meme-1337'
  | 'meme-80085'
  | 'crazy'

export type ConstellationSource = 'manual' | 'auto' | 'crazy' | 'revived'

export type ConstellationRecord = {
  id: number
  name: string
  starCount: number
  variant: ConstellationVariant
  stars: Star[]
  anchor?: { x: number; y: number }
  segments?: MergeSegment[]
  lines?: [number, number][]
  patternId?: string
  source: ConstellationSource
  completedAt: number
}

export type CompletedEntry = {
  id: number
  count: number
}

export type MemeBoostState = {
  afterSix: number
  afterNine: number
  afterFour: number
  afterTwo: number
  afterFive: number
}

export type Constellation = {
  id: number
  stars: Star[]
  complete: boolean
  targetCount: number
  name?: string
  starCount?: number
  variant?: ConstellationVariant
  anchor?: { x: number; y: number }
  merging?: boolean
  hidden?: boolean
  mergeFlash?: boolean
  segments?: MergeSegment[]
  source?: ConstellationSource
  /** Star index pairs for non-sequential stick figures (auto patterns). */
  lines?: [number, number][]
  /** Source stick-figure id — used to prevent repeats in auto/crazy. */
  patternId?: string
}

export type MemeResolution = {
  label: string
  variant: ConstellationVariant
  partnerIds: number[]
  orderedIds: number[]
}

export type MergeSegment = {
  stars: Star[]
  anchor?: { x: number; y: number }
  initialStars: Star[]
  initialAnchor?: { x: number; y: number }
}

const SHINY_COUNTS = new Set([7, 11, 14])
const MYTHIC_COUNTS = new Set([10, 12])

const BASE_WEIGHTS: Record<number, number> = {
  0: 0.14,
  1: 1.05,
  2: 1.28,
  3: 1.42,
  4: 1.38,
  5: 1.32,
  6: 1.12,
  7: 0.48,
  8: 0.38,
  9: 0.3,
  10: 0.24,
  11: 0.18,
  12: 0.15,
  13: 0.12,
  14: 0.1,
}

const CONSTELLATION_NAMES = {
  cub: ['Bear', 'Bunny', 'Bee', 'Fox', 'Owl', 'Cub'],
  dragon: ['Dragon', 'Drake', 'Wyrm', 'Serpent', 'Wyvern', 'Hydra'],
  wing: ['Dragonfly', 'Damselfly', 'Hawker', 'Skimmer', 'Emberwing', 'Glider'],
  legend: ['Phoenix', 'Leviathan', 'Celestial', 'Aurora', 'Nova', 'Nebula'],
} as const

export const MAX_CONSTELLATIONS = 4
export const MEME_HISTORY_WINDOW = 4
export const CHAIN_BOOST_CLICKS = 3

export function createDefaultBoosts(): MemeBoostState {
  return {
    afterSix: 0,
    afterNine: 0,
    afterFour: 0,
    afterTwo: 0,
    afterFive: 0,
  }
}

function namePoolFor(starCount: number): readonly string[] {
  if (starCount <= 3) return CONSTELLATION_NAMES.cub
  if (starCount <= 6) return CONSTELLATION_NAMES.dragon
  if (starCount <= 10) return CONSTELLATION_NAMES.wing
  return CONSTELLATION_NAMES.legend
}

function weightedPick(weights: Record<number, number>): number {
  const entries = Object.entries(weights).map(([count, weight]) => ({
    count: Number(count),
    weight: Math.max(0, weight),
  }))
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0)
  if (total <= 0) return 4

  let roll = Math.random() * total
  for (const entry of entries) {
    roll -= entry.weight
    if (roll <= 0) return entry.count
  }
  return entries[entries.length - 1]?.count ?? 4
}

export function pickTargetCount(
  lastCount: number | null,
  recentCounts: number[],
  boosts: MemeBoostState,
  memeWindow: number
): number {
  const weights: Record<number, number> = { ...BASE_WEIGHTS }

  if (lastCount !== null) {
    weights[lastCount] = (weights[lastCount] ?? 0.2) * 0.1
  }

  if (boosts.afterSix > 0) weights[9] = (weights[9] ?? 0.5) * 9
  if (boosts.afterNine > 0) weights[6] = (weights[6] ?? 0.5) * 9
  if (boosts.afterFour > 0) weights[2] = (weights[2] ?? 0.5) * 9
  if (boosts.afterTwo > 0) weights[0] = (weights[0] ?? 0.08) * 12
  if (boosts.afterFive > 0) weights[9] = (weights[9] ?? 0.5) * 6

  const window = recentCounts.slice(-memeWindow)
  if (window.includes(6) && !window.includes(9)) weights[9] = (weights[9] ?? 0.5) * 5.5
  if (window.includes(9) && !window.includes(6)) weights[6] = (weights[6] ?? 0.5) * 5.5

  const lastThree = recentCounts.slice(-3)
  if (lastThree.includes(4) && !lastThree.includes(2)) weights[2] = (weights[2] ?? 0.5) * 5
  if (lastThree.includes(2) && !lastThree.includes(0)) weights[0] = (weights[0] ?? 0.08) * 8

  if (window.includes(5) && !window.includes(9)) weights[9] = (weights[9] ?? 0.5) * 4.5
  if (window.includes(9) && !window.includes(5)) weights[5] = (weights[5] ?? 0.5) * 4.5

  return weightedPick(weights)
}

export function rollShouldComplete(currentCount: number, targetCount: number): boolean {
  if (targetCount === 0) return currentCount === 0

  if (currentCount < targetCount) {
    const gap = targetCount - currentCount
    if (gap >= 3) return Math.random() < 0.035
    if (gap === 2) return Math.random() < 0.075
    return Math.random() < 0.12
  }

  if (currentCount === targetCount) return Math.random() < 0.3
  if (currentCount === targetCount + 1) return Math.random() < 0.42
  return Math.random() < 0.55
}

export function variantForCount(count: number): ConstellationVariant {
  if (SHINY_COUNTS.has(count)) return 'shiny'
  if (MYTHIC_COUNTS.has(count)) return 'mythic'
  return 'normal'
}

export function pickConstellationName(starCount: number): string {
  const pool = namePoolFor(starCount)
  const name = pool[Math.floor(Math.random() * pool.length)]
  if (SHINY_COUNTS.has(starCount)) return `shiny ${name}`
  if (MYTHIC_COUNTS.has(starCount)) return `mythic ${name}`
  return name
}

export function pickBaseName(starCount: number): string {
  const pool = namePoolFor(starCount)
  return pool[Math.floor(Math.random() * pool.length)]
}

const SPAWN_MEME_FLAVORS: Array<{ label: string; variant: ConstellationVariant }> = [
  { label: '69', variant: 'meme-69' },
  { label: '96', variant: 'meme-96' },
  { label: '420', variant: 'meme-420' },
  { label: 'WEEEEEEED', variant: 'meme-weed' },
  { label: '5+9', variant: 'meme-21' },
  { label: 'NOT FOUND', variant: 'meme-404' },
  { label: 'SKULL', variant: 'meme-666' },
  { label: 'LEET', variant: 'meme-1337' },
  { label: 'BOOBS', variant: 'meme-80085' },
]

const SPAWN_CRAZY_NAMES = [
  'Chaos Moth',
  'Void Ferret',
  'Glitch Kraken',
  'Neon Wombat',
  'Cosmic Pickle',
  'Warp Weasel',
  'Entropy Duck',
  'Turbo Sphinx',
] as const

function weightedPickIdentity<T extends { weight: number }>(options: T[]): T {
  const total = options.reduce((sum, option) => sum + option.weight, 0)
  let roll = Math.random() * total
  for (const option of options) {
    roll -= option.weight
    if (roll <= 0) return option
  }
  return options[options.length - 1]
}

/** Decorative identity for auto/crazy spawns — all variant types, not count-locked. */
export function pickSpawnIdentity(
  starCount: number,
  options?: { crazyBias?: boolean }
): { name: string; variant: ConstellationVariant } {
  const crazyBias = options?.crazyBias ?? false
  const base = pickBaseName(starCount)
  const meme =
    SPAWN_MEME_FLAVORS[Math.floor(Math.random() * SPAWN_MEME_FLAVORS.length)] ??
    SPAWN_MEME_FLAVORS[0]
  const crazyName =
    SPAWN_CRAZY_NAMES[Math.floor(Math.random() * SPAWN_CRAZY_NAMES.length)] ?? 'Chaos Moth'

  const choices: Array<{ weight: number; name: string; variant: ConstellationVariant }> = [
    { weight: 42, name: base, variant: 'normal' },
    { weight: 14, name: `shiny ${base}`, variant: 'shiny' },
    { weight: 12, name: `mythic ${base}`, variant: 'mythic' },
    { weight: 16, name: meme.label, variant: meme.variant },
    { weight: crazyBias ? 20 : 9, name: `CRAZY ${crazyName}`, variant: 'crazy' },
    { weight: crazyBias ? 8 : 4, name: `${crazyName} x${starCount}`, variant: 'crazy' },
  ]

  if (SHINY_COUNTS.has(starCount)) {
    choices[1].weight += 10
  }
  if (MYTHIC_COUNTS.has(starCount)) {
    choices[2].weight += 10
  }

  const picked = weightedPickIdentity(choices)
  return { name: picked.name, variant: picked.variant }
}

const CRAZY_STAR_WEIGHTS: Record<number, number> = {
  2: 1.25,
  3: 1.4,
  4: 1.35,
  5: 1.28,
  6: 1.15,
  7: 0.85,
  8: 0.65,
  9: 0.5,
  10: 0.4,
  11: 0.32,
  12: 0.26,
  13: 0.2,
  14: 0.16,
  15: 0.12,
  16: 0.09,
}

export function pickCrazyStarCount(): number {
  return weightedPick(CRAZY_STAR_WEIGHTS)
}

function orderedPartners(
  history: CompletedEntry[],
  partnerCounts: number[],
  newId: number,
  newCount: number
): CompletedEntry[] {
  const timeline = [...history, { id: newId, count: newCount }]
  const picked: CompletedEntry[] = []

  for (const count of partnerCounts) {
    for (let index = timeline.length - 1; index >= 0; index -= 1) {
      const entry = timeline[index]
      if (entry.count !== count) continue
      if (picked.some((item) => item.id === entry.id)) continue
      picked.push(entry)
      break
    }
  }

  return picked.sort((a, b) => {
    const aIndex = timeline.findIndex((entry) => entry.id === a.id)
    const bIndex = timeline.findIndex((entry) => entry.id === b.id)
    return aIndex - bIndex
  })
}

export function skyCompletedHistory(
  current: Constellation[],
  excludeId?: number
): CompletedEntry[] {
  return current
    .filter(
      (item) => !item.hidden && item.complete && item.id !== excludeId
    )
    .map((item) => ({
      id: item.id,
      count: item.starCount ?? item.stars.length,
    }))
}

export function resolveMeme(
  skyHistory: CompletedEntry[],
  newId: number,
  newCount: number,
  memeWindow: number,
  current: Constellation[]
): MemeResolution | null {
  const visibleIds = new Set(
    current.filter((item) => !item.hidden).map((item) => item.id)
  )
  const timeline = [...skyHistory, { id: newId, count: newCount }]
  const window = timeline.slice(-memeWindow)

  if (newCount === 6 || newCount === 9) {
    if (window.some((entry) => entry.count === 6) && window.some((entry) => entry.count === 9)) {
      const partners = orderedPartners(skyHistory, [6, 9], newId, newCount)
      const onSkyPartners = partners.filter(
        (entry) => entry.id !== newId && visibleIds.has(entry.id)
      )

      if (onSkyPartners.length === 0) return null

      const first = partners[0]?.count
      const second = partners[1]?.count
      const forward = first === 6 && second === 9

      return {
        label: forward ? '69' : '96',
        variant: forward ? 'meme-69' : 'meme-96',
        partnerIds: onSkyPartners.map((entry) => entry.id),
        orderedIds: partners.map((entry) => entry.id),
      }
    }
  }

  const lastThree = timeline.slice(-Math.min(3, memeWindow))
  if (
    (newCount === 4 || newCount === 2 || newCount === 0) &&
    lastThree.some((entry) => entry.count === 4) &&
    lastThree.some((entry) => entry.count === 2) &&
    lastThree.some((entry) => entry.count === 0)
  ) {
    const partners = orderedPartners(skyHistory, [4, 2, 0], newId, newCount)
    const onSkyPartners = partners.filter(
      (entry) => entry.id !== newId && visibleIds.has(entry.id)
    )
    if (onSkyPartners.length === 0) return null

    const order = partners.map((entry) => entry.count).join('-')
    const forward = order === '4-2-0'

    return {
      label: forward ? '420' : 'WEEEEEEED',
      variant: forward ? 'meme-420' : 'meme-weed',
      partnerIds: onSkyPartners.map((entry) => entry.id),
      orderedIds: partners.map((entry) => entry.id),
    }
  }

  if (newCount === 5 || newCount === 9) {
    if (window.some((entry) => entry.count === 5) && window.some((entry) => entry.count === 9)) {
      const partners = orderedPartners(skyHistory, [5, 9], newId, newCount)
      const onSkyPartners = partners.filter(
        (entry) => entry.id !== newId && visibleIds.has(entry.id)
      )
      if (onSkyPartners.length === 0) return null

      return {
        label: '5+9',
        variant: 'meme-21',
        partnerIds: onSkyPartners.map((entry) => entry.id),
        orderedIds: partners.map((entry) => entry.id),
      }
    }
  }

  return null
}

export function updateBoostsAfterComplete(
  boosts: MemeBoostState,
  starCount: number
): MemeBoostState {
  return {
    afterSix: starCount === 6 ? CHAIN_BOOST_CLICKS : Math.max(0, boosts.afterSix - 1),
    afterNine: starCount === 9 ? CHAIN_BOOST_CLICKS : Math.max(0, boosts.afterNine - 1),
    afterFour: starCount === 4 ? CHAIN_BOOST_CLICKS : Math.max(0, boosts.afterFour - 1),
    afterTwo: starCount === 2 ? CHAIN_BOOST_CLICKS : Math.max(0, boosts.afterTwo - 1),
    afterFive: starCount === 5 ? CHAIN_BOOST_CLICKS : Math.max(0, boosts.afterFive - 1),
  }
}

export function constellationLabelPosition(stars: Star[], anchor?: { x: number; y: number }) {
  if (stars.length === 0 && anchor) {
    return { centerX: anchor.x, labelY: anchor.y + 28 }
  }

  const xs = stars.map((star) => star.x)
  const ys = stars.map((star) => star.y)
  return {
    centerX: (Math.min(...xs) + Math.max(...xs)) / 2,
    labelY: Math.max(...ys) + 28,
  }
}

function segmentStart(segment: { stars: Star[]; anchor?: { x: number; y: number } }) {
  if (segment.stars.length === 0 && segment.anchor) return segment.anchor
  return segment.stars[0]
}

function segmentEnd(segment: { stars: Star[]; anchor?: { x: number; y: number } }) {
  if (segment.stars.length === 0 && segment.anchor) return segment.anchor
  return segment.stars[segment.stars.length - 1]
}

function segmentDirection(segment: { stars: Star[] }) {
  if (segment.stars.length >= 2) {
    const previous = segment.stars[segment.stars.length - 2]
    const end = segment.stars[segment.stars.length - 1]
    const length = Math.hypot(end.x - previous.x, end.y - previous.y) || 1
    return { x: (end.x - previous.x) / length, y: (end.y - previous.y) / length }
  }
  return { x: 1, y: 0 }
}

const CHAIN_TOUCH_GAP = 2

export function chainConstellationsSpatially(constellations: Constellation[]): MergeSegment[] {
  const segments: MergeSegment[] = []

  for (let index = 0; index < constellations.length; index += 1) {
    const constellation = constellations[index]
    const initialStars = constellation.stars.map((star) => ({ ...star }))
    const initialAnchor = constellation.anchor ? { ...constellation.anchor } : undefined

    let stars = initialStars.map((star) => ({ ...star }))
    let anchor = initialAnchor ? { ...initialAnchor } : undefined

    if (index > 0) {
      const previous = segments[index - 1]
      const previousEnd = segmentEnd(previous)
      const currentStart = segmentStart({ stars, anchor })
      const direction = segmentDirection(previous)
      const targetStart = {
        x: previousEnd.x + direction.x * CHAIN_TOUCH_GAP,
        y: previousEnd.y + direction.y * CHAIN_TOUCH_GAP,
      }
      const dx = targetStart.x - currentStart.x
      const dy = targetStart.y - currentStart.y

      stars = stars.map((star) => ({ ...star, x: star.x + dx, y: star.y + dy }))
      if (anchor) {
        anchor = { x: anchor.x + dx, y: anchor.y + dy }
      }
    }

    segments.push({
      stars,
      anchor,
      initialStars,
      initialAnchor,
    })
  }

  return segments
}

export function orderedConstellationsForMeme(
  current: Constellation,
  partners: Constellation[],
  orderedIds: number[]
): Constellation[] {
  const lookup = new Map<number, Constellation>()
  lookup.set(current.id, current)
  for (const partner of partners) {
    lookup.set(partner.id, partner)
  }

  return orderedIds
    .map((id) => lookup.get(id))
    .filter((constellation): constellation is Constellation => constellation !== undefined)
}

export function buildMemeMerge(
  current: Constellation,
  partners: Constellation[],
  meme: MemeResolution
): MergeSegment[] {
  const ordered = orderedConstellationsForMeme(current, partners, meme.orderedIds)
  return chainConstellationsSpatially(ordered)
}

export function allSegmentStars(segments: MergeSegment[]): Star[] {
  return segments.flatMap((segment) => segment.stars)
}

export function isFeaturedVariant(variant: ConstellationVariant | undefined): boolean {
  return variant !== undefined && variant !== 'normal'
}

export function featuredLabelTier(
  variant: ConstellationVariant | undefined
): 'shiny' | 'mythic' | 'meme' | 'crazy' | null {
  if (!variant || variant === 'normal') return null
  if (variant === 'shiny') return 'shiny'
  if (variant === 'mythic') return 'mythic'
  if (variant === 'crazy') return 'crazy'
  return 'meme'
}

export function variantStarClass(variant: ConstellationVariant | undefined): string {
  switch (variant) {
    case 'shiny':
      return 'constellation-star constellation-star-shiny'
    case 'mythic':
      return 'constellation-star constellation-star-mythic'
    case 'meme-69':
    case 'meme-96':
      return 'constellation-star constellation-star-meme-69'
    case 'meme-420':
    case 'meme-weed':
      return 'constellation-star constellation-star-meme-420'
    case 'meme-21':
      return 'constellation-star constellation-star-meme-21'
    case 'meme-404':
    case 'meme-666':
      return 'constellation-star constellation-star-meme-69'
    case 'meme-1337':
    case 'meme-80085':
      return 'constellation-star constellation-star-meme-420'
    case 'crazy':
      return 'constellation-star constellation-star-crazy'
    default:
      return 'constellation-star'
  }
}

export function variantLineClass(variant: ConstellationVariant | undefined): string {
  switch (variant) {
    case 'shiny':
      return 'constellation-line constellation-line-shiny'
    case 'mythic':
      return 'constellation-line constellation-line-mythic'
    case 'meme-69':
    case 'meme-96':
      return 'constellation-line constellation-line-meme-69'
    case 'meme-420':
    case 'meme-weed':
      return 'constellation-line constellation-line-meme-420'
    case 'meme-21':
      return 'constellation-line constellation-line-meme-21'
    case 'meme-404':
    case 'meme-666':
      return 'constellation-line constellation-line-meme-69'
    case 'meme-1337':
    case 'meme-80085':
      return 'constellation-line constellation-line-meme-420'
    case 'crazy':
      return 'constellation-line constellation-line-crazy'
    default:
      return 'constellation-line'
  }
}

export function variantLabelClass(variant: ConstellationVariant | undefined): string {
  let base: string
  switch (variant) {
    case 'shiny':
      base = 'constellation-label constellation-label-shiny'
      break
    case 'mythic':
      base = 'constellation-label constellation-label-mythic'
      break
    case 'meme-69':
    case 'meme-96':
      base = 'constellation-label constellation-label-meme-69'
      break
    case 'meme-420':
    case 'meme-weed':
      base = 'constellation-label constellation-label-meme-420'
      break
    case 'meme-21':
      base = 'constellation-label constellation-label-meme-21'
      break
    case 'meme-404':
    case 'meme-666':
      base = 'constellation-label constellation-label-meme-69'
      break
    case 'meme-1337':
    case 'meme-80085':
      base = 'constellation-label constellation-label-meme-420'
      break
    case 'crazy':
      base = 'constellation-label constellation-label-crazy'
      break
    default:
      base = 'constellation-label'
  }

  if (isFeaturedVariant(variant)) {
    const tier = featuredLabelTier(variant)
    return `${base} constellation-label-featured constellation-label-featured-${tier}`
  }
  return base
}
