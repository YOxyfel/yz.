import type {
  CompletedEntry,
  Constellation,
  ConstellationRecord,
  MemeBoostState,
  Star,
} from './constellation-logic'
import {
  allSegmentStars,
  buildMemeMerge,
  createDefaultBoosts,
  pickConstellationName,
  pickTargetCount,
  resolveMeme,
  rollShouldComplete,
  skyCompletedHistory,
  updateBoostsAfterComplete,
  variantForCount,
} from './constellation-logic'
import {
  buildCrazyConstellation,
  buildInstantConstellation,
  cloneConstellationForRevive,
  findOpenPosition,
  getMaxConstellations,
  trimConstellationsToLimit,
} from './constellation-generate'
import { collectUsedPatternIds } from './constellation-patterns'

export type MaxVisibleOption = 2 | 4 | 6 | 8 | 10

export type ConstellationStoreState = {
  constellations: Constellation[]
  archive: ConstellationRecord[]
  maxVisible: MaxVisibleOption
  manualMode: boolean
  crazyMode: boolean
  listMode: 'sky' | 'archive'
}

function visible(constellations: Constellation[]) {
  return constellations.filter((item) => !item.hidden)
}

function finishConstellation(
  current: Constellation[],
  active: Constellation,
  history: CompletedEntry[],
  boosts: MemeBoostState,
  maxLimit: number,
  memeWindow: number
): {
  constellations: Constellation[]
  history: CompletedEntry[]
  boosts: MemeBoostState
  archiveEntry?: ConstellationRecord
} {
  const starCount = active.stars.length
  const skyHistory = skyCompletedHistory(current, active.id)
  const meme = resolveMeme(skyHistory, active.id, starCount, memeWindow, current)
  const nextBoosts = updateBoostsAfterComplete(boosts, starCount)
  const nextHistory = [...history, { id: active.id, count: starCount }].slice(-8)

  if (meme) {
    const partners = current.filter((constellation) =>
      meme.partnerIds.includes(constellation.id)
    )
    const segments = buildMemeMerge(active, partners, meme)
    const merged: Constellation = {
      id: active.id,
      stars: allSegmentStars(segments),
      segments,
      complete: true,
      targetCount: starCount,
      starCount,
      name: meme.label,
      variant: meme.variant,
      anchor: active.anchor,
      source: active.source ?? 'manual',
      merging: true,
      mergeFlash: true,
    }

    const hiddenPartners = current.map((constellation) =>
      meme.partnerIds.includes(constellation.id)
        ? { ...constellation, hidden: true }
        : constellation
    )

    const replaced = hiddenPartners.map((constellation) =>
      constellation.id === active.id ? merged : constellation
    )

    return {
      constellations: trimConstellationsToLimit(replaced, maxLimit),
      history: nextHistory,
      boosts: nextBoosts,
      archiveEntry: snapshotRecord(merged),
    }
  }

  const completed: Constellation = {
    ...active,
    complete: true,
    starCount,
    name: pickConstellationName(starCount),
    variant: variantForCount(starCount),
  }

  return {
    constellations: trimConstellationsToLimit(
      current.map((constellation) =>
        constellation.id === active.id ? completed : constellation
      ),
      maxLimit
    ),
    history: nextHistory,
    boosts: nextBoosts,
    archiveEntry: snapshotRecord(completed),
  }
}

export function snapshotRecord(constellation: Constellation): ConstellationRecord {
  return {
    id: constellation.id,
    name: constellation.name ?? 'Unknown',
    starCount: constellation.starCount ?? constellation.stars.length,
    variant: constellation.variant ?? 'normal',
    stars: constellation.stars.map((star) => ({ ...star })),
    anchor: constellation.anchor ? { ...constellation.anchor } : undefined,
    segments: constellation.segments?.map((segment) => ({
      stars: segment.stars.map((star) => ({ ...star })),
      anchor: segment.anchor ? { ...segment.anchor } : undefined,
      initialStars: segment.initialStars.map((star) => ({ ...star })),
      initialAnchor: segment.initialAnchor ? { ...segment.initialAnchor } : undefined,
    })),
    lines: constellation.lines?.map((pair) => [...pair] as [number, number]),
    patternId: constellation.patternId,
    source: constellation.source ?? 'manual',
    completedAt: Date.now(),
  }
}

export function pushArchive(
  archive: ConstellationRecord[],
  entry: ConstellationRecord
): ConstellationRecord[] {
  return [...archive, entry].slice(-30)
}

export type IdGenerator = {
  nextConstellationId: () => number
  nextStarId: () => number
}

export function createIdGenerator(): IdGenerator {
  let constellationId = 0
  let starId = 0
  return {
    nextConstellationId: () => constellationId++,
    nextStarId: () => starId++,
  }
}

export function handleConstellationClick(
  current: Constellation[],
  x: number,
  y: number,
  history: CompletedEntry[],
  boosts: MemeBoostState,
  ids: IdGenerator,
  maxLimit: number,
  memeWindow: number,
  manualMode: boolean,
  crazyMode: boolean
): {
  constellations: Constellation[]
  history: CompletedEntry[]
  boosts: MemeBoostState
  archive: ConstellationRecord[] | null
  spawnedConstellation: boolean
} | null {
  if (!manualMode || crazyMode) return null

  const activeIndex = current.findIndex(
    (constellation) => !constellation.complete && !constellation.hidden
  )

  if (activeIndex >= 0) {
    const active = current[activeIndex]
    const currentCount = active.stars.length

    if (
      rollShouldComplete(currentCount, active.targetCount) ||
      (active.targetCount === 0 && currentCount === 0)
    ) {
      const result = finishConstellation(
        current,
        active,
        history,
        boosts,
        maxLimit,
        memeWindow
      )
      return {
        constellations: result.constellations,
        history: result.history,
        boosts: result.boosts,
        archive: result.archiveEntry ? [result.archiveEntry] : null,
        spawnedConstellation: false,
      }
    }

    if (active.targetCount === 0) {
      return {
        constellations: current,
        history,
        boosts,
        archive: null,
        spawnedConstellation: false,
      }
    }

    const nextStar: Star = { id: ids.nextStarId(), x, y }
    return {
      constellations: current.map((constellation, index) =>
        index === activeIndex
          ? { ...constellation, stars: [...constellation.stars, nextStar] }
          : constellation
      ),
      history,
      boosts,
      archive: null,
      spawnedConstellation: false,
    }
  }

  const skyHistory = skyCompletedHistory(current)
  const recentCounts = skyHistory.map((entry) => entry.count)
  const lastCount = recentCounts[recentCounts.length - 1] ?? null
  const targetCount = pickTargetCount(lastCount, recentCounts, boosts, memeWindow)

  if (targetCount === 0) {
    const zeroConstellation: Constellation = {
      id: ids.nextConstellationId(),
      stars: [],
      complete: false,
      targetCount: 0,
      anchor: { x, y },
      source: 'manual',
    }
    const result = finishConstellation(
      [...current, zeroConstellation],
      zeroConstellation,
      history,
      boosts,
      maxLimit,
      memeWindow
    )
    return {
      constellations: result.constellations,
      history: result.history,
      boosts: result.boosts,
      archive: result.archiveEntry ? [result.archiveEntry] : null,
      spawnedConstellation: true,
    }
  }

  const newConstellation: Constellation = {
    id: ids.nextConstellationId(),
    stars: [{ id: ids.nextStarId(), x, y }],
    complete: false,
    targetCount,
    source: 'manual',
  }

  return {
    constellations: trimConstellationsToLimit([...current, newConstellation], maxLimit),
    history,
    boosts,
    archive: null,
    spawnedConstellation: true,
  }
}

const AMBIENT_SEED_COUNT = 4

export function seedAmbientConstellations(
  history: CompletedEntry[],
  boosts: MemeBoostState,
  ids: IdGenerator,
  viewport: { width: number; height: number }
): {
  constellations: Constellation[]
  history: CompletedEntry[]
  boosts: MemeBoostState
} {
  let next: Constellation[] = []
  let nextHistory = history
  let nextBoosts = boosts
  const usedPatterns = new Set<string>()

  for (let index = 0; index < AMBIENT_SEED_COUNT; index += 1) {
    const built = buildInstantConstellation(
      ids.nextConstellationId(),
      0,
      ids,
      'auto',
      viewport,
      visible(next),
      { spreadOutside: false, excludePatternIds: usedPatterns }
    )
    if (built.patternId) {
      usedPatterns.add(built.patternId)
    }
    const starCount = built.starCount ?? built.stars.length
    next = [...next, built]
    nextHistory = [...nextHistory, { id: built.id, count: starCount }].slice(-8)
    nextBoosts = updateBoostsAfterComplete(nextBoosts, starCount)
  }

  return {
    constellations: next,
    history: nextHistory,
    boosts: nextBoosts,
  }
}

export function runAutoBatch(
  current: Constellation[],
  history: CompletedEntry[],
  boosts: MemeBoostState,
  ids: IdGenerator,
  maxLimit: number,
  memeWindow: number,
  viewport: { width: number; height: number }
): {
  constellations: Constellation[]
  history: CompletedEntry[]
  boosts: MemeBoostState
  archiveEntries: ConstellationRecord[]
} {
  const batchSize =
    maxLimit <= 2 ? maxLimit : 2 + Math.floor(Math.random() * (maxLimit - 1))
  let next = [...current]
  let nextHistory = history
  let nextBoosts = boosts
  const archiveEntries: ConstellationRecord[] = []
  const existing = () => visible(next)
  const usedPatterns = collectUsedPatternIds(existing())

  for (let index = 0; index < batchSize; index += 1) {
    const built = buildInstantConstellation(
      ids.nextConstellationId(),
      0,
      ids,
      'auto',
      viewport,
      existing(),
      { spreadOutside: false, excludePatternIds: usedPatterns }
    )
    if (built.patternId) {
      usedPatterns.add(built.patternId)
    }
    const starCount = built.starCount ?? built.stars.length
    next = trimConstellationsToLimit([...next, built], maxLimit)
    nextHistory = [...nextHistory, { id: built.id, count: starCount }].slice(-8)
    nextBoosts = updateBoostsAfterComplete(nextBoosts, starCount)
    archiveEntries.push(snapshotRecord(built))
  }

  return {
    constellations: next,
    history: nextHistory,
    boosts: nextBoosts,
    archiveEntries,
  }
}

export function runCrazySpawn(
  current: Constellation[],
  ids: IdGenerator,
  viewport: { width: number; height: number }
): {
  constellations: Constellation[]
  archiveEntry: ConstellationRecord
} | null {
  if (visible(current).length >= 20) return null

  const usedPatterns = collectUsedPatternIds(visible(current))

  const built = buildCrazyConstellation(
    ids.nextConstellationId(),
    ids,
    viewport,
    visible(current),
    { excludePatternIds: usedPatterns }
  )

  return {
    constellations: trimConstellationsToLimit([...current, built], 20),
    archiveEntry: snapshotRecord(built),
  }
}

export function reviveFromArchive(
  current: Constellation[],
  record: ConstellationRecord,
  ids: IdGenerator,
  maxLimit: number,
  viewport: { width: number; height: number }
): Constellation[] {
  const visibleItems = visible(current)
  const withoutLast = visibleItems.slice(0, -1)
  const hiddenIds = new Set(
    current
      .filter((item) => !withoutLast.some((keep) => keep.id === item.id))
      .map((item) => item.id)
  )

  const trimmed = current.filter((item) => !hiddenIds.has(item.id))
  const placement = findOpenPosition(visible(trimmed), viewport)
  const revived = cloneConstellationForRevive(record, ids.nextConstellationId(), placement)

  return trimConstellationsToLimit([...trimmed, revived], maxLimit)
}

export function removeAutoConstellations(constellations: Constellation[]) {
  return constellations.filter((item) => item.source !== 'auto')
}

export { getMaxConstellations }
