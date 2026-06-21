import type {
  Constellation,
  ConstellationRecord,
  ConstellationSource,
  ConstellationVariant,
  Star,
} from './constellation-logic'
import { pickCrazyStarCount, pickSpawnIdentity } from './constellation-logic'
import type { IdGenerator } from './constellation-store'

type Bounds = { minX: number; maxX: number; minY: number; maxY: number }

export function getMaxConstellations(crazyMode: boolean, maxVisible: number) {
  return crazyMode ? 20 : maxVisible
}

export function trimConstellationsToLimit(constellations: Constellation[], max: number) {
  const visible = constellations.filter((item) => !item.hidden)
  if (visible.length <= max) return constellations

  const dropCount = visible.length - max
  const dropIds = new Set(
    visible
      .filter((item) => !item.merging)
      .slice(0, dropCount)
      .map((item) => item.id)
  )

  return constellations.filter((item) => !dropIds.has(item.id))
}

export function getConstellationBounds(
  constellation: Constellation,
  padding = 52
): Bounds | null {
  const stars = constellation.segments
    ? constellation.segments.flatMap((segment) => segment.stars)
    : constellation.stars

  if (stars.length === 0) {
    if (!constellation.anchor) return null
    return {
      minX: constellation.anchor.x - padding,
      maxX: constellation.anchor.x + padding,
      minY: constellation.anchor.y - padding,
      maxY: constellation.anchor.y + padding,
    }
  }

  const xs = stars.map((star) => star.x)
  const ys = stars.map((star) => star.y)
  return {
    minX: Math.min(...xs) - padding,
    maxX: Math.max(...xs) + padding,
    minY: Math.min(...ys) - padding,
    maxY: Math.max(...ys) + padding,
  }
}

function boundsOverlap(a: Bounds, b: Bounds) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY
}

export function findOpenPosition(
  existing: Constellation[],
  viewport: { width: number; height: number },
  options?: { spreadOutside?: boolean; minDistance?: number }
) {
  const spreadOutside = options?.spreadOutside ?? false
  const bleed = spreadOutside ? 0.12 : 0.08
  const minX = viewport.width * -bleed + 80
  const maxX = viewport.width * (1 + bleed) - 80
  const minY = viewport.height * -bleed + 100
  const maxY = viewport.height * (1 + bleed) - 80

  for (let attempt = 0; attempt < 48; attempt += 1) {
    const rect = randomRect(viewport, options?.spreadOutside ?? false)
    const probe: Constellation = {
      id: -1,
      stars: starsInRect(rect, 4, { nextConstellationId: () => 0, nextStarId: () => 0 }),
      complete: true,
      targetCount: 4,
    }
    const probeBounds = getConstellationBounds(probe, options?.minDistance ?? 56)
    if (!probeBounds) continue

    const overlaps = existing.some((item) => {
      const bounds = getConstellationBounds(item, 36)
      return bounds ? boundsOverlap(probeBounds, bounds) : false
    })

    if (!overlaps) {
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.5,
      }
    }
  }

  return {
    x: minX + Math.random() * (maxX - minX),
    y: minY + Math.random() * (maxY - minY),
  }
}

export function biasedSizeFraction() {
  const bucket = Math.random()

  if (bucket < 0.52) {
    return 0.03 + Math.pow(Math.random(), 1.35) * 0.15
  }
  if (bucket < 0.88) {
    return 0.18 + Math.pow(Math.random(), 1.1) * 0.27
  }
  return 0.45 + Math.pow(Math.random(), 1.6) * 0.35
}

function randomRect(
  viewport: { width: number; height: number },
  spreadOutside: boolean
) {
  const bleed = spreadOutside ? 0.1 : 0.06
  const marginX = 48
  const marginY = 64

  const width = viewport.width * biasedSizeFraction()
  const height = viewport.height * biasedSizeFraction()

  const minLeft = viewport.width * -bleed + marginX
  const maxLeft = viewport.width * (1 + bleed) - marginX - width
  const minTop = viewport.height * -bleed + marginY
  const maxTop = viewport.height * (1 + bleed) - marginY - height

  const leftRange = Math.max(0, maxLeft - minLeft)
  const topRange = Math.max(0, maxTop - minTop)

  return {
    left: minLeft + Math.random() * leftRange,
    top: minTop + Math.random() * topRange,
    width,
    height,
  }
}

function starsInRect(
  rect: { left: number; top: number; width: number; height: number },
  count: number,
  ids: IdGenerator
): Star[] {
  const stars: Star[] = []
  for (let index = 0; index < count; index += 1) {
    stars.push({
      id: ids.nextStarId(),
      x: rect.left + Math.random() * rect.width,
      y: rect.top + Math.random() * rect.height,
    })
  }
  return stars
}

export function generateStarsInOpenRect(
  count: number,
  ids: IdGenerator,
  viewport: { width: number; height: number },
  existing: Constellation[],
  options?: { spreadOutside?: boolean; padding?: number }
): Star[] {
  if (count <= 0) return []

  const spreadOutside = options?.spreadOutside ?? false
  const padding = options?.padding ?? 56

  for (let attempt = 0; attempt < 48; attempt += 1) {
    const rect = randomRect(viewport, spreadOutside)
    const points = Array.from({ length: count }, () => ({
      x: rect.left + Math.random() * rect.width,
      y: rect.top + Math.random() * rect.height,
    }))
    const probe: Constellation = {
      id: -1,
      stars: points.map((point, index) => ({ id: index, ...point })),
      complete: true,
      targetCount: count,
    }
    const probeBounds = getConstellationBounds(probe, padding)
    if (!probeBounds) continue

    const overlaps = existing.some((item) => {
      const bounds = getConstellationBounds(item, 36)
      return bounds ? boundsOverlap(probeBounds, bounds) : false
    })

    if (!overlaps) {
      return points.map((point) => ({
        id: ids.nextStarId(),
        x: point.x,
        y: point.y,
      }))
    }
  }

  const fallbackRect = randomRect(viewport, spreadOutside)
  return starsInRect(fallbackRect, count, ids)
}

/** @deprecated Use generateStarsInOpenRect — kept for overlap probes */
export function generateStarPattern(
  originX: number,
  originY: number,
  count: number,
  ids: IdGenerator
): Star[] {
  if (count <= 0) return []

  const width = 90 + Math.random() * 120
  const height = 70 + Math.random() * 100
  return starsInRect(
    { left: originX - width * 0.5, top: originY - height * 0.5, width, height },
    count,
    ids
  )
}

function finalizeInstant(
  id: number,
  starCount: number,
  stars: Star[],
  source: ConstellationSource,
  name: string,
  variant: ConstellationVariant
): Constellation {
  return {
    id,
    stars,
    complete: true,
    targetCount: starCount,
    starCount,
    name,
    variant,
    source,
  }
}

export function buildInstantConstellation(
  id: number,
  starCount: number,
  ids: IdGenerator,
  source: ConstellationSource,
  viewport: { width: number; height: number },
  existing: Constellation[],
  options?: { spreadOutside?: boolean }
): Constellation {
  if (starCount === 0) {
    const anchor = findOpenPosition(existing, viewport, options)
    const identity = pickSpawnIdentity(0)
    return {
      id,
      stars: [],
      anchor,
      complete: true,
      targetCount: 0,
      starCount: 0,
      name: identity.name,
      variant: identity.variant,
      source,
    }
  }

  const stars = generateStarsInOpenRect(starCount, ids, viewport, existing, options)
  const identity = pickSpawnIdentity(starCount, { crazyBias: source === 'crazy' })
  return finalizeInstant(id, starCount, stars, source, identity.name, identity.variant)
}

export function buildCrazyConstellation(
  id: number,
  ids: IdGenerator,
  viewport: { width: number; height: number },
  existing: Constellation[]
): Constellation {
  const starCount = pickCrazyStarCount()
  return buildInstantConstellation(
    id,
    starCount,
    ids,
    'crazy',
    viewport,
    existing,
    { spreadOutside: true }
  )
}

export function cloneConstellationForRevive(
  record: ConstellationRecord,
  newId: number,
  placement: { x: number; y: number }
): Constellation {
  const sourceStars = record.segments
    ? record.segments.flatMap((segment) => segment.stars)
    : record.stars

  if (sourceStars.length === 0) {
    return {
      id: newId,
      stars: [],
      anchor: { x: placement.x, y: placement.y },
      complete: true,
      targetCount: record.starCount,
      starCount: record.starCount,
      name: record.name,
      variant: record.variant,
      source: 'revived',
    }
  }

  const centerX = sourceStars.reduce((sum, star) => sum + star.x, 0) / sourceStars.length
  const centerY = sourceStars.reduce((sum, star) => sum + star.y, 0) / sourceStars.length
  const dx = placement.x - centerX
  const dy = placement.y - centerY

  const stars = sourceStars.map((star, index) => ({
    id: newId * 1000 + index,
    x: star.x + dx,
    y: star.y + dy,
  }))

  return {
    id: newId,
    stars,
    complete: true,
    targetCount: record.starCount,
    starCount: record.starCount,
    name: record.name,
    variant: record.variant,
    source: 'revived',
    segments: record.segments?.map((segment, segmentIndex) => ({
      stars: segment.stars.map((star, starIndex) => ({
        id: newId * 1000 + segmentIndex * 100 + starIndex,
        x: star.x + dx,
        y: star.y + dy,
      })),
      anchor: segment.anchor
        ? { x: segment.anchor.x + dx, y: segment.anchor.y + dy }
        : undefined,
      initialStars: segment.initialStars.map((star, starIndex) => ({
        id: newId * 1000 + segmentIndex * 100 + starIndex,
        x: star.x + dx,
        y: star.y + dy,
      })),
      initialAnchor: segment.initialAnchor
        ? { x: segment.initialAnchor.x + dx, y: segment.initialAnchor.y + dy }
        : undefined,
    })),
  }
}
