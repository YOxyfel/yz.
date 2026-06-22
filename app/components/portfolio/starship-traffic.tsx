'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { allSegmentStars, type Constellation, type Star } from './constellation-logic'
import { useConstellations } from './constellation-context'
import type { OrbitDecor } from './orbit-decor-logic'
import { usePageVisible } from './use-page-visible'

const SHIP_VARIANTS = ['scout', 'freighter', 'interceptor', 'cruiser'] as const
const CRAZY_SHIP_MULTIPLIER = 2.5
const MAX_ACTIVE_BASE = 10
const SPAWN_MIN_MS = 4000
const SPAWN_MAX_MS = 8000
const WAVE_MIN = 2
const WAVE_MAX = 4
const PLANET_BURST_MIN = 3
const PLANET_BURST_MAX = 6
const PLANET_INBOUND_MIN = 2
const PLANET_INBOUND_MAX = 5
const MIN_TRAVEL_RATIO = 0.4
const PAIR_ATTEMPTS = 96
const PLANET_ROUTE_WEIGHT = 2.8

function shipTrafficScale(crazyMode: boolean) {
  return crazyMode ? CRAZY_SHIP_MULTIPLIER : 1
}

function scaledShipCount(base: number, crazyMode: boolean, min = 1) {
  return Math.max(min, Math.round(base * shipTrafficScale(crazyMode)))
}

function scaledSpawnDelay(ms: number, crazyMode: boolean) {
  return Math.max(900, Math.round(ms / shipTrafficScale(crazyMode)))
}

type ShipVariant = (typeof SHIP_VARIANTS)[number]
type SpeedMode = 'slow' | 'warp'

type ConstellationStarPoint = {
  x: number
  y: number
  constellationId: number
  starId: number
}

type ConstellationGroup = {
  constellationId: number
  stars: ConstellationStarPoint[]
}

export type StarshipFlight = {
  id: string
  variant: ShipVariant
  speed: SpeedMode
  fromConstellationId: number
  toConstellationId: number
  fromPlanetId: string | null
  toPlanetId: string | null
  startX: number
  startY: number
  endX: number
  endY: number
  startPxX: number
  startPxY: number
  endPxX: number
  endPxY: number
  duration: number
  minScale: number
  maxScale: number
  rotation: number
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1))
}

function shuffle<T>(items: T[]) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index)
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

function pairKey(fromId: number, toId: number) {
  return `${fromId}->${toId}`
}

function planetRouteKey(planetId: string, mode: 'depart' | 'arrive') {
  return `planet:${planetId}:${mode}`
}

function planetJitterPoint(planet: OrbitDecor, spread = 26) {
  const angle = randomBetween(0, Math.PI * 2)
  const radius = randomBetween(8, spread)
  return {
    x: planet.x + Math.cos(angle) * radius,
    y: planet.y + Math.sin(angle) * radius,
  }
}

function pickRandomPlanet(planets: OrbitDecor[]) {
  if (planets.length === 0) return null
  return planets[randomInt(0, planets.length - 1)]
}

function pickConstellationStar(
  groups: ConstellationGroup[],
  viewport: { width: number; height: number },
  options?: {
    excludeConstellationId?: number
    preferFarFrom?: { x: number; y: number }
  }
): ConstellationStarPoint | null {
  if (groups.length === 0) return null

  const pool = options?.excludeConstellationId
    ? groups.filter((group) => group.constellationId !== options.excludeConstellationId)
    : groups
  const usable = pool.length > 0 ? pool : groups

  if (!options?.preferFarFrom) {
    const group = usable[randomInt(0, usable.length - 1)]
    return group.stars[randomInt(0, group.stars.length - 1)]
  }

  const candidates: Array<{ star: ConstellationStarPoint; weight: number }> = []
  const maxDist = Math.hypot(viewport.width, viewport.height)

  for (const group of usable) {
    for (const star of group.stars) {
      const dist = Math.hypot(
        star.x - options.preferFarFrom.x,
        star.y - options.preferFarFrom.y
      )
      candidates.push({
        star,
        weight: 0.55 + (dist / maxDist) * 1.45 + Math.random() * 0.35,
      })
    }
  }

  const picked = pickWeightedCandidate(candidates)
  return picked?.star ?? null
}

function buildConstellationGroups(points: ConstellationStarPoint[]): ConstellationGroup[] {
  const grouped = new Map<number, ConstellationStarPoint[]>()

  for (const point of points) {
    const stars = grouped.get(point.constellationId) ?? []
    stars.push(point)
    grouped.set(point.constellationId, stars)
  }

  return [...grouped.entries()].map(([constellationId, stars]) => ({
    constellationId,
    stars,
  }))
}

function buildDirectedConstellationPairs(groups: ConstellationGroup[]) {
  const pairs: Array<{ from: ConstellationGroup; to: ConstellationGroup }> = []

  for (const from of groups) {
    for (const to of groups) {
      if (from.constellationId === to.constellationId) continue
      pairs.push({ from, to })
    }
  }

  return pairs
}

function pickWeightedCandidate<T extends { weight: number }>(items: T[]) {
  if (items.length === 0) return null
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * total

  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) return item
  }

  return items[items.length - 1]
}

function collectConstellationStars(constellations: Constellation[]): ConstellationStarPoint[] {
  const points: ConstellationStarPoint[] = []

  for (const constellation of constellations) {
    if (constellation.hidden) continue

    const stars = constellation.segments?.length
      ? allSegmentStars(constellation.segments)
      : constellation.stars

    for (const star of stars) {
      points.push({
        x: star.x,
        y: star.y,
        constellationId: constellation.id,
        starId: star.id,
      })
    }

    if (stars.length === 0 && constellation.anchor) {
      points.push({
        x: constellation.anchor.x,
        y: constellation.anchor.y,
        constellationId: constellation.id,
        starId: -1,
      })
    }
  }

  return points
}

function pickEdgePair(viewport: { width: number; height: number }) {
  const { width, height } = viewport
  const margin = 0.06
  const edgePoints = [
    { x: width * margin, y: height * randomBetween(0.12, 0.88) },
    { x: width * (1 - margin), y: height * randomBetween(0.12, 0.88) },
    { x: width * randomBetween(0.12, 0.88), y: height * margin },
    { x: width * randomBetween(0.12, 0.88), y: height * (1 - margin) },
  ]

  let bestStart = edgePoints[0]
  let bestEnd = edgePoints[1]
  let bestDist = 0

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const start = edgePoints[randomInt(0, edgePoints.length - 1)]
    const end = edgePoints[randomInt(0, edgePoints.length - 1)]
    const dist = Math.hypot(end.x - start.x, end.y - start.y)
    if (dist > bestDist) {
      bestDist = dist
      bestStart = start
      bestEnd = end
    }
  }

  return { start: bestStart, end: bestEnd }
}

function pickConstellationPair(
  groups: ConstellationGroup[],
  viewport: { width: number; height: number },
  avoidPairs?: Set<string>
): { start: Star; end: Star; fromConstellationId: number; toConstellationId: number } | null {
  if (groups.length < 2) return null

  const baseMinDist = Math.hypot(viewport.width, viewport.height) * MIN_TRAVEL_RATIO
  const directedPairs = buildDirectedConstellationPairs(groups)
  if (directedPairs.length === 0) return null

  type Candidate = {
    start: ConstellationStarPoint
    end: ConstellationStarPoint
    dist: number
    weight: number
  }

  const candidates: Candidate[] = []

  for (let attempt = 0; attempt < PAIR_ATTEMPTS; attempt += 1) {
    const relaxedRatio =
      attempt < 48 ? 1 : attempt < 80 ? 0.82 : 0.62
    const minDist = baseMinDist * relaxedRatio

    const freshPairs = shuffle(directedPairs)
    const preferredPairs = avoidPairs
      ? freshPairs.filter(
          (pair) => !avoidPairs.has(pairKey(pair.from.constellationId, pair.to.constellationId))
        )
      : freshPairs
    const pairPool = preferredPairs.length > 0 ? preferredPairs : freshPairs
    const route = pairPool[randomInt(0, pairPool.length - 1)]

    const start = route.from.stars[randomInt(0, route.from.stars.length - 1)]
    const end = route.to.stars[randomInt(0, route.to.stars.length - 1)]
    const dist = Math.hypot(end.x - start.x, end.y - start.y)

    if (dist < minDist) continue

    const distNorm = dist / Math.hypot(viewport.width, viewport.height)
    candidates.push({
      start,
      end,
      dist,
      weight: 0.65 + distNorm * 1.35 + Math.random() * 0.55,
    })
  }

  if (candidates.length === 0) {
    let best: Candidate | null = null

    for (const route of directedPairs) {
      const start = route.from.stars[randomInt(0, route.from.stars.length - 1)]
      const end = route.to.stars[randomInt(0, route.to.stars.length - 1)]
      const dist = Math.hypot(end.x - start.x, end.y - start.y)
      const distNorm = dist / Math.hypot(viewport.width, viewport.height)

      const candidate: Candidate = {
        start,
        end,
        dist,
        weight: 0.65 + distNorm * 1.35 + Math.random() * 0.55,
      }

      if (!best || candidate.dist > best.dist) {
        best = candidate
      }
    }

    if (!best) return null

    return {
      start: { id: best.start.starId, x: best.start.x, y: best.start.y },
      end: { id: best.end.starId, x: best.end.x, y: best.end.y },
      fromConstellationId: best.start.constellationId,
      toConstellationId: best.end.constellationId,
    }
  }

  const picked = pickWeightedCandidate(candidates)
  if (!picked) return null

  return {
    start: { id: picked.start.starId, x: picked.start.x, y: picked.start.y },
    end: { id: picked.end.starId, x: picked.end.x, y: picked.end.y },
    fromConstellationId: picked.start.constellationId,
    toConstellationId: picked.end.constellationId,
  }
}

function toPercent(
  point: { x: number; y: number },
  viewport: { width: number; height: number }
) {
  return {
    x: (point.x / viewport.width) * 100,
    y: (point.y / viewport.height) * 100,
  }
}

function buildStarshipFlight(
  startPx: { x: number; y: number },
  endPx: { x: number; y: number },
  viewport: { width: number; height: number },
  meta: {
    fromConstellationId: number
    toConstellationId: number
    fromPlanetId?: string | null
    toPlanetId?: string | null
  }
): StarshipFlight {
  const { width, height } = viewport
  const start = toPercent(startPx, viewport)
  const end = toPercent(endPx, viewport)

  const dx = endPx.x - startPx.x
  const dy = endPx.y - startPx.y
  const travelRatio = Math.hypot(dx, dy) / Math.hypot(width, height)

  const speed: SpeedMode = Math.random() > 0.58 ? 'slow' : 'warp'
  const duration =
    speed === 'slow'
      ? randomBetween(11, 18) * (0.9 + travelRatio * 0.45)
      : randomBetween(1, 2.1) * (0.75 + travelRatio * 0.35)

  const variant = SHIP_VARIANTS[Math.floor(Math.random() * SHIP_VARIANTS.length)]
  const rotation = (Math.atan2(dy, dx) * 180) / Math.PI + 90

  const depthBoost = Math.min(1.35, 0.92 + travelRatio * 0.55)
  const minScale =
    speed === 'warp' ? randomBetween(0.32, 0.46) : randomBetween(0.42, 0.56)
  const maxScale =
    speed === 'warp'
      ? randomBetween(1.15, 1.55) * depthBoost
      : randomBetween(0.95, 1.28) * depthBoost

  return {
    id: `starship-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    variant,
    speed,
    fromConstellationId: meta.fromConstellationId,
    toConstellationId: meta.toConstellationId,
    fromPlanetId: meta.fromPlanetId ?? null,
    toPlanetId: meta.toPlanetId ?? null,
    startX: start.x,
    startY: start.y,
    endX: end.x,
    endY: end.y,
    startPxX: startPx.x,
    startPxY: startPx.y,
    endPxX: endPx.x,
    endPxY: endPx.y,
    duration,
    minScale,
    maxScale,
    rotation,
  }
}

export function createPlanetDepartureFlight(
  planet: OrbitDecor,
  groups: ConstellationGroup[],
  viewport: { width: number; height: number }
): StarshipFlight | null {
  const destination = pickConstellationStar(groups, viewport, {
    preferFarFrom: { x: planet.x, y: planet.y },
  })

  const startPx = planetJitterPoint(planet)
  const endPx = destination
    ? { x: destination.x, y: destination.y }
    : pickEdgePair(viewport).end

  return buildStarshipFlight(startPx, endPx, viewport, {
    fromConstellationId: -1,
    toConstellationId: destination?.constellationId ?? -1,
    fromPlanetId: planet.id,
    toPlanetId: null,
  })
}

export function createPlanetArrivalFlight(
  planet: OrbitDecor,
  groups: ConstellationGroup[],
  viewport: { width: number; height: number }
): StarshipFlight | null {
  const origin = pickConstellationStar(groups, viewport, {
    preferFarFrom: { x: planet.x, y: planet.y },
  })

  const endPx = planetJitterPoint(planet, 18)
  const startPx = origin
    ? { x: origin.x, y: origin.y }
    : pickEdgePair(viewport).start

  return buildStarshipFlight(startPx, endPx, viewport, {
    fromConstellationId: origin?.constellationId ?? -1,
    toConstellationId: -1,
    fromPlanetId: null,
    toPlanetId: planet.id,
  })
}

export function createPlanetBiasedFlight(
  planets: OrbitDecor[],
  groups: ConstellationGroup[],
  viewport: { width: number; height: number },
  avoidPairs?: Set<string>
): StarshipFlight | null {
  if (planets.length === 0) {
    return createConstellationFlight(groups, viewport, avoidPairs)
  }

  const planet = pickRandomPlanet(planets)
  if (!planet) return createConstellationFlight(groups, viewport, avoidPairs)

  if (Math.random() < 0.5) {
    return createPlanetDepartureFlight(planet, groups, viewport)
  }

  return createPlanetArrivalFlight(planet, groups, viewport)
}

export function createConstellationFlight(
  groups: ConstellationGroup[],
  viewport: { width: number; height: number },
  avoidPairs?: Set<string>
): StarshipFlight | null {
  const width = viewport.width || window.innerWidth
  const height = viewport.height || window.innerHeight
  const safeViewport = { width, height }

  const pair = pickConstellationPair(groups, safeViewport, avoidPairs)
  const edgeFallback = pickEdgePair(safeViewport)
  const startPx = pair ? pair.start : edgeFallback.start
  const endPx = pair ? pair.end : edgeFallback.end

  return buildStarshipFlight(startPx, endPx, safeViewport, {
    fromConstellationId: pair?.fromConstellationId ?? -1,
    toConstellationId: pair?.toConstellationId ?? -2,
    fromPlanetId: null,
    toPlanetId: null,
  })
}

function StarshipSvg({
  variant,
  className = '',
}: {
  variant: ShipVariant
  className?: string
}) {
  const shared = `starship-svg starship-svg-${variant} ${className}`.trim()

  switch (variant) {
    case 'scout':
      return (
        <svg viewBox="0 0 56 80" className={shared} aria-hidden>
          <path className="starship-svg-hull" d="M28 4 L34 22 L48 54 L34 48 L28 58 L22 48 L8 54 L22 22 Z" />
          <path className="starship-svg-panel" d="M28 14 L31 28 L28 26 L25 28 Z" />
          <path className="starship-svg-wing" d="M8 54 L2 60 L10 58 Z" />
          <path className="starship-svg-wing" d="M48 54 L54 60 L46 58 Z" />
          <rect className="starship-svg-cockpit" x="24" y="16" width="8" height="14" rx="2" />
          <path className="starship-svg-panel" d="M22 40 H34" />
          <circle className="starship-svg-light" cx="20" cy="44" r="1.4" />
          <circle className="starship-svg-light" cx="36" cy="44" r="1.4" />
          <path className="starship-svg-engine" d="M22 58 L28 74 L34 58 Z" />
          <path className="starship-svg-engine-glow" d="M24 62 L28 70 L32 62 Z" />
        </svg>
      )
    case 'freighter':
      return (
        <svg viewBox="0 0 72 64" className={shared} aria-hidden>
          <path className="starship-svg-hull" d="M10 24 H62 V40 H10 Z" />
          <path className="starship-svg-hull" d="M22 12 H50 L58 24 H14 Z" />
          <rect className="starship-svg-cargo" x="14" y="27" width="10" height="10" rx="1.5" />
          <rect className="starship-svg-cargo" x="28" y="27" width="10" height="10" rx="1.5" />
          <rect className="starship-svg-cargo" x="42" y="27" width="10" height="10" rx="1.5" />
          <rect className="starship-svg-cockpit" x="30" y="15" width="12" height="9" rx="1.5" />
          <path className="starship-svg-nacelle" d="M6 40 H12 V56 H6 Z" />
          <path className="starship-svg-nacelle" d="M60 40 H66 V56 H60 Z" />
          <path className="starship-svg-engine" d="M7 56 L9 62 L11 56 Z" />
          <path className="starship-svg-engine" d="M61 56 L63 62 L65 56 Z" />
          <path className="starship-svg-panel" d="M18 24 H54" />
          <path className="starship-svg-panel" d="M18 40 H54" />
        </svg>
      )
    case 'interceptor':
      return (
        <svg viewBox="0 0 60 84" className={shared} aria-hidden>
          <path className="starship-svg-hull" d="M30 3 L50 58 L30 50 L10 58 Z" />
          <path className="starship-svg-wing" d="M10 58 L0 66 L14 62 Z" />
          <path className="starship-svg-wing" d="M50 58 L60 66 L46 62 Z" />
          <path className="starship-svg-panel" d="M30 18 L38 46 L30 42 L22 46 Z" />
          <ellipse className="starship-svg-cockpit" cx="30" cy="22" rx="5" ry="8" />
          <path className="starship-svg-panel" d="M24 52 H36" />
          <path className="starship-svg-engine" d="M24 50 L30 78 L36 50 Z" />
          <path className="starship-svg-engine-glow" d="M26 56 L30 70 L34 56 Z" />
          <circle className="starship-svg-light" cx="30" cy="12" r="1.6" />
        </svg>
      )
    case 'cruiser':
      return (
        <svg viewBox="0 0 80 72" className={shared} aria-hidden>
          <path className="starship-svg-hull" d="M40 6 L68 30 L56 36 L64 52 L40 46 L16 52 L24 36 L12 30 Z" />
          <rect className="starship-svg-bridge" x="34" y="14" width="12" height="16" rx="2" />
          <rect className="starship-svg-cockpit" x="36" y="18" width="8" height="8" rx="1.5" />
          <path className="starship-svg-panel" d="M20 34 H60" />
          <path className="starship-svg-panel" d="M24 42 H56" />
          <path className="starship-svg-wing" d="M12 30 L4 38 L16 36 Z" />
          <path className="starship-svg-wing" d="M68 30 L76 38 L64 36 Z" />
          <path className="starship-svg-nacelle" d="M18 46 H24 V58 H18 Z" />
          <path className="starship-svg-nacelle" d="M56 46 H62 V58 H56 Z" />
          <path className="starship-svg-engine" d="M32 46 L40 66 L48 46 Z" />
          <path className="starship-svg-engine-glow" d="M34 50 L40 62 L46 50 Z" />
          <circle className="starship-svg-light" cx="28" cy="38" r="1.5" />
          <circle className="starship-svg-light" cx="52" cy="38" r="1.5" />
        </svg>
      )
  }
}

function StarshipEntity({
  flight,
  onComplete,
}: {
  flight: StarshipFlight
  onComplete: (id: string) => void
}) {
  const isWarp = flight.speed === 'warp'

  return (
    <motion.div
      className={`starship-flight ${isWarp ? 'starship-flight-warp' : 'starship-flight-slow'} ${
        flight.fromPlanetId ? 'starship-flight-planet-launch' : ''
      } ${flight.toPlanetId ? 'starship-flight-planet-arrival' : ''}`}
      style={{
        rotate: flight.rotation,
        left: 0,
        top: 0,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{
        x: flight.startPxX,
        y: flight.startPxY,
        scale: flight.minScale,
        opacity: 0,
      }}
      animate={{
        x: flight.endPxX,
        y: flight.endPxY,
        scale: [flight.minScale, flight.maxScale, flight.minScale],
        opacity: isWarp ? [0, 1, 1, 0] : [0, 0.92, 0.92, 0],
      }}
      transition={{
        duration: flight.duration,
        ease: isWarp ? [0.18, 0.82, 0.22, 1] : 'linear',
        scale: {
          duration: flight.duration,
          times: [0, 0.5, 1],
          ease: 'easeInOut',
        },
        opacity: {
          duration: flight.duration,
          times: [0, 0.06, 0.94, 1],
          ease: 'easeInOut',
        },
      }}
      onAnimationComplete={() => onComplete(flight.id)}
    >
      {isWarp ? <span className="starship-warp-trail" aria-hidden /> : null}
      {isWarp ? <span className="starship-warp-flare" aria-hidden /> : null}
      <span className="starship-launch-burst" aria-hidden />
      <StarshipSvg variant={flight.variant} />
    </motion.div>
  )
}

export function StarshipTraffic({
  enabled = true,
  liteMode = false,
  pauseSpawning = false,
  pauseMotion = false,
}: {
  enabled?: boolean
  liteMode?: boolean
  pauseSpawning?: boolean
  pauseMotion?: boolean
}) {
  const reducedMotion = useReducedMotion()
  const pageVisible = usePageVisible()
  const spawnPaused = pauseSpawning || !pageVisible
  const { constellations, orbitDecors, crazyMode } = useConstellations()
  const [ships, setShips] = useState<StarshipFlight[]>([])
  const shipsRef = useRef(ships)
  const timeoutRef = useRef<number | null>(null)
  const staggerRefs = useRef<number[]>([])
  const wavePairsRef = useRef<Set<string>>(new Set())

  const maxActive = scaledShipCount(liteMode ? 4 : MAX_ACTIVE_BASE, crazyMode)

  const visibleConstellations = useMemo(
    () => constellations.filter((item) => !item.hidden),
    [constellations]
  )

  const constellationGroups = useMemo(
    () => buildConstellationGroups(collectConstellationStars(visibleConstellations)),
    [visibleConstellations]
  )

  const hasPlanets = orbitDecors.length > 0

  useEffect(() => {
    shipsRef.current = ships
  }, [ships])

  useEffect(() => {
    if (!pauseMotion) return
    setShips([])
    staggerRefs.current.forEach((timer) => window.clearTimeout(timer))
    staggerRefs.current = []
  }, [pauseMotion])

  const removeShip = useCallback((id: string) => {
    setShips((current) => current.filter((ship) => ship.id !== id))
  }, [])

  const addFlight = useCallback(
    (flight: StarshipFlight | null) => {
      if (!flight || shipsRef.current.length >= maxActive) return null

      setShips((current) => {
        if (current.length >= maxActive) return current
        return [...current, flight]
      })

      return flight
    },
    [maxActive]
  )

  const scheduleFlight = useCallback(
    (
      delay: number,
      factory: () => StarshipFlight | null,
      onSpawned?: (flight: StarshipFlight) => void
    ) => {
      const timer = window.setTimeout(() => {
        const flight = factory()
        const added = addFlight(flight)
        if (added && onSpawned) onSpawned(added)
      }, delay)
      staggerRefs.current.push(timer)
    },
    [addFlight]
  )

  const spawnWave = useCallback(() => {
    const slots = maxActive - shipsRef.current.length
    if (slots <= 0) return

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    const waveMin = scaledShipCount(WAVE_MIN, crazyMode)
    const waveMax = scaledShipCount(WAVE_MAX, crazyMode)
    const planetBurstMin = scaledShipCount(PLANET_BURST_MIN, crazyMode)
    const planetBurstMax = scaledShipCount(PLANET_BURST_MAX, crazyMode)
    const planetInboundMin = scaledShipCount(PLANET_INBOUND_MIN, crazyMode)
    const planetInboundMax = scaledShipCount(PLANET_INBOUND_MAX, crazyMode)

    wavePairsRef.current = new Set<string>()

    if (hasPlanets) {
      const modeRoll = Math.random()

      if (modeRoll < 0.56) {
        const planet = pickRandomPlanet(orbitDecors)
        if (planet) {
          const burstCount = Math.min(
            slots,
            Math.max(planetBurstMin, randomInt(planetBurstMin, planetBurstMax))
          )

          for (let index = 0; index < burstCount; index += 1) {
            scheduleFlight(
              index * randomBetween(70, 240),
              () => createPlanetDepartureFlight(planet, constellationGroups, viewport),
              () => {
                wavePairsRef.current.add(planetRouteKey(planet.id, 'depart'))
              }
            )
          }
          return
        }
      }

      if (modeRoll < 0.86) {
        const planet = pickRandomPlanet(orbitDecors)
        if (planet) {
          const convoyCount = Math.min(
            slots,
            Math.max(planetInboundMin, randomInt(planetInboundMin, planetInboundMax))
          )

          for (let index = 0; index < convoyCount; index += 1) {
            scheduleFlight(
              index * randomBetween(120, 360),
              () => createPlanetArrivalFlight(planet, constellationGroups, viewport),
              () => {
                wavePairsRef.current.add(planetRouteKey(planet.id, 'arrive'))
              }
            )
          }
          return
        }
      }

      const miniConvoy = Math.min(slots, randomInt(scaledShipCount(2, crazyMode), scaledShipCount(3, crazyMode)))
      const planet = pickRandomPlanet(orbitDecors)
      if (planet && miniConvoy >= 2) {
        const inbound = Math.random() < 0.55
        for (let index = 0; index < miniConvoy; index += 1) {
          scheduleFlight(
            index * randomBetween(140, 420),
            () =>
              inbound
                ? createPlanetArrivalFlight(planet, constellationGroups, viewport)
                : createPlanetDepartureFlight(planet, constellationGroups, viewport)
          )
        }
        return
      }
    }

    const count = Math.min(slots, randomInt(waveMin, waveMax))

    for (let index = 0; index < count; index += 1) {
      scheduleFlight(
        index * randomBetween(180, 620),
        () => {
          if (hasPlanets && Math.random() < PLANET_ROUTE_WEIGHT / (PLANET_ROUTE_WEIGHT + 1)) {
            return createPlanetBiasedFlight(
              orbitDecors,
              constellationGroups,
              viewport,
              new Set([...wavePairsRef.current])
            )
          }

          return createConstellationFlight(
            constellationGroups,
            viewport,
            new Set([...wavePairsRef.current])
          )
        },
        (flight) => {
          if (flight.fromConstellationId >= 0 && flight.toConstellationId >= 0) {
            wavePairsRef.current.add(
              pairKey(flight.fromConstellationId, flight.toConstellationId)
            )
          }
        }
      )
    }
  }, [constellationGroups, crazyMode, hasPlanets, maxActive, orbitDecors, scheduleFlight])

  useEffect(() => {
    if (!enabled || reducedMotion || spawnPaused) {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      staggerRefs.current.forEach((timer) => window.clearTimeout(timer))
      staggerRefs.current = []
      return
    }

    const scheduleNext = () => {
      const delayScale = liteMode ? 1.55 : 1
      const delay = randomBetween(
        scaledSpawnDelay(SPAWN_MIN_MS * delayScale, crazyMode),
        scaledSpawnDelay(SPAWN_MAX_MS * delayScale, crazyMode)
      )
      timeoutRef.current = window.setTimeout(() => {
        spawnWave()
        scheduleNext()
      }, delay)
    }

    const boot = window.setTimeout(() => {
      spawnWave()
      scheduleNext()
    }, randomBetween(scaledSpawnDelay(1600, crazyMode), scaledSpawnDelay(3000, crazyMode)))

    return () => {
      window.clearTimeout(boot)
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      staggerRefs.current.forEach((timer) => window.clearTimeout(timer))
      staggerRefs.current = []
    }
  }, [crazyMode, enabled, liteMode, reducedMotion, spawnPaused, spawnWave])

  if (!enabled || reducedMotion) return null

  const visibleShips = pauseMotion ? [] : ships

  return (
    <div className="starship-traffic-layer pointer-events-none absolute inset-0 z-[4] overflow-hidden">
      {visibleShips.map((flight) => (
        <StarshipEntity key={flight.id} flight={flight} onComplete={removeShip} />
      ))}
    </div>
  )
}
