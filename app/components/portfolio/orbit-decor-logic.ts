import { biasedSizeFraction } from './constellation-generate'
import type { Constellation } from './constellation-logic'
import { allSegmentStars } from './constellation-logic'

export type PlanetVariant =
  | 'gas_giant'
  | 'rocky'
  | 'ringed'
  | 'vortex'
  | 'binary'
  | 'ice'
  | 'magma'
  | 'debris'
  | 'crystal'
  | 'storm'
  | 'nebula_core'
  | 'dwarf'
  | 'plant'
  | 'star'

export type OrbitDecorOrbiter = {
  id: string
  radius: number
  duration: number
  delay: number
  kind: 'moon' | 'sun' | 'rock' | 'ice_shard'
  reverse?: boolean
  tilt?: number
}

export type OrbitDecorRing = {
  id: string
  radius: number
  tilt: number
  opacity: number
  hue: number
  width: number
  reverse?: boolean
  duration: number
}

export type OrbitDecorStackLayer = 'back' | 'front'

export type OrbitDecor = {
  id: string
  x: number
  y: number
  width: number
  height: number
  variant: PlanetVariant
  stackLayer: OrbitDecorStackLayer
  orbiters: OrbitDecorOrbiter[]
  rings: OrbitDecorRing[]
  hue: number
  atmosphere?: {
    opacity: number
    blur: number
    hue: number
  }
  vortex?: {
    speed: number
    arms: number
  }
  rockCloud?: {
    count: number
    spread: number
    speed: number
  }
  stormBand?: {
    speed: number
    count: number
  }
}

export type NebulaBurst = {
  id: string
  hue: number
  holdMs: number
  particleCount: number
}

const PLANET_BASE_CHANCE = 0.012
const PLANET_CHANCE_PER_SPAWN = 0.0045
const PLANET_MAX_CHANCE = 0.28
const AUTO_PLANET_BONUS = 0.12
const NEBULA_BURST_CHANCE = 0.01

const VARIANT_POOL: Array<{ variant: PlanetVariant; weight: number }> = [
  { variant: 'gas_giant', weight: 11 },
  { variant: 'rocky', weight: 10 },
  { variant: 'dwarf', weight: 8 },
  { variant: 'ice', weight: 8 },
  { variant: 'ringed', weight: 7 },
  { variant: 'storm', weight: 5 },
  { variant: 'debris', weight: 5 },
  { variant: 'vortex', weight: 4 },
  { variant: 'binary', weight: 4 },
  { variant: 'magma', weight: 3 },
  { variant: 'crystal', weight: 3 },
  { variant: 'nebula_core', weight: 2 },
  { variant: 'plant', weight: 4 },
  { variant: 'star', weight: 4 },
]

let decorIdCounter = 0

function nextDecorId(prefix: string) {
  decorIdCounter += 1
  return `${prefix}-${decorIdCounter}-${Math.random().toString(36).slice(2, 7)}`
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function pickWeightedVariant(): PlanetVariant {
  const total = VARIANT_POOL.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * total
  for (const item of VARIANT_POOL) {
    roll -= item.weight
    if (roll <= 0) return item.variant
  }
  return 'rocky'
}

export function hasDrawingConstellation(constellations: Constellation[]) {
  return constellations.some((item) => !item.complete && !item.hidden)
}

export function canSpawnAmbientDecor(
  constellations: Constellation[],
  spawnedConstellation: boolean
) {
  return !hasDrawingConstellation(constellations) && !spawnedConstellation
}

export function pickDecorDimensions(viewport: { width: number; height: number }) {
  const widthFraction = Math.min(0.8, Math.max(0.03, biasedSizeFraction()))
  const heightFraction = Math.min(0.8, Math.max(0.03, biasedSizeFraction()))

  return {
    width: viewport.width * widthFraction,
    height: viewport.height * heightFraction,
  }
}

function buildOrbiters(
  size: number,
  variant: PlanetVariant
): OrbitDecorOrbiter[] {
  const count =
    variant === 'binary'
      ? 1
      : variant === 'debris'
        ? 4 + Math.floor(Math.random() * 5)
        : 1 + Math.floor(Math.random() * (variant === 'gas_giant' ? 5 : 4))

  const kinds: OrbitDecorOrbiter['kind'][] =
    variant === 'debris'
      ? ['rock', 'rock', 'ice_shard', 'moon']
      : variant === 'ice'
        ? ['ice_shard', 'moon', 'ice_shard']
        : variant === 'magma'
          ? ['sun', 'rock', 'moon']
          : ['moon', 'sun', 'moon', 'sun']

  return Array.from({ length: count }, (_, index) => {
    const layer = index + 1
    return {
      id: String.fromCharCode(97 + index),
      radius: size * (0.32 + layer * 0.14 + Math.random() * 0.12),
      duration: 5 + layer * 2.5 + Math.random() * 8,
      delay: -Math.random() * 10,
      kind: kinds[index % kinds.length],
      reverse: index % 2 === 1,
      tilt: randomBetween(-35, 35),
    }
  })
}

function buildRings(size: number, variant: PlanetVariant, hue: number): OrbitDecorRing[] {
  if (!['ringed', 'gas_giant', 'ice', 'crystal', 'storm'].includes(variant)) {
    return []
  }

  const ringCount =
    variant === 'ringed' ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2)

  return Array.from({ length: ringCount }, (_, index) => ({
    id: `ring-${index}`,
    radius: size * (0.48 + index * 0.12 + Math.random() * 0.08),
    tilt: randomBetween(58, 82),
    opacity: 0.35 + Math.random() * 0.45,
    hue: hue + randomBetween(-25, 35),
    width: 2 + Math.random() * 5,
    reverse: index % 2 === 1,
    duration: 18 + index * 10 + Math.random() * 12,
  }))
}

function variantHue(variant: PlanetVariant) {
  switch (variant) {
    case 'plant':
      return randomBetween(125, 175)
    case 'star':
      return randomBetween(35, 75)
    case 'magma':
      return randomBetween(18, 45)
    case 'ice':
      return randomBetween(195, 230)
    case 'crystal':
      return randomBetween(265, 310)
    case 'nebula_core':
      return randomBetween(280, 330)
    case 'vortex':
      return randomBetween(160, 220)
    default:
      return randomBetween(25, 250)
  }
}

export function createOrbitDecor(
  x: number,
  y: number,
  viewport: { width: number; height: number },
  options?: { variant?: PlanetVariant; idPrefix?: string }
): OrbitDecor {
  const { width, height } = pickDecorDimensions(viewport)
  const size = Math.min(width, height)
  const variant = options?.variant ?? pickWeightedVariant()
  const hue = variantHue(variant)

  const decor: OrbitDecor = {
    id: nextDecorId(options?.idPrefix ?? 'orbit-decor'),
    x,
    y,
    width,
    height,
    variant,
    stackLayer: 'back',
    hue,
    orbiters: buildOrbiters(size, variant),
    rings: buildRings(size, variant, hue),
  }

  if (['gas_giant', 'storm', 'ice', 'nebula_core', 'vortex'].includes(variant)) {
    decor.atmosphere = {
      opacity: 0.25 + Math.random() * 0.45,
      blur: 8 + Math.random() * 18,
      hue: hue + randomBetween(-15, 20),
    }
  }

  if (variant === 'vortex') {
    decor.vortex = {
      speed: 4 + Math.random() * 8,
      arms: 2 + Math.floor(Math.random() * 3),
    }
  }

  if (variant === 'debris' || variant === 'storm') {
    decor.rockCloud = {
      count: 12 + Math.floor(Math.random() * 20),
      spread: 0.55 + Math.random() * 0.35,
      speed: 6 + Math.random() * 10,
    }
  }

  if (variant === 'storm') {
    decor.stormBand = {
      speed: 3 + Math.random() * 5,
      count: 3 + Math.floor(Math.random() * 3),
    }
  }

  return decor
}

export function createCrazyOrbitDecors(
  viewport: { width: number; height: number }
): OrbitDecor[] {
  const slots = [
    { x: randomBetween(0.58, 0.88), y: randomBetween(0.14, 0.38) },
    { x: randomBetween(0.22, 0.52), y: randomBetween(0.62, 0.86) },
    { x: randomBetween(0.68, 0.92), y: randomBetween(0.58, 0.82) },
    { x: randomBetween(0.72, 0.94), y: randomBetween(0.28, 0.52) },
  ]

  return slots.map((slot) =>
    createOrbitDecor(slot.x * viewport.width, slot.y * viewport.height, viewport, {
      idPrefix: 'crazy-decor',
    })
  )
}

export function planetSpawnChance(spawnsSinceLastPlanet: number) {
  return Math.min(
    PLANET_MAX_CHANCE,
    PLANET_BASE_CHANCE + spawnsSinceLastPlanet * PLANET_CHANCE_PER_SPAWN
  )
}

export function rollManualPlanetSpawn(spawnsSinceLastPlanet: number) {
  return Math.random() < planetSpawnChance(spawnsSinceLastPlanet)
}

function collectConstellationStarPoints(constellations: Constellation[]) {
  const points: Array<{ x: number; y: number }> = []

  for (const constellation of constellations) {
    if (constellation.hidden) continue

    const stars = constellation.segments?.length
      ? allSegmentStars(constellation.segments)
      : constellation.stars

    for (const star of stars) {
      points.push({ x: star.x, y: star.y })
    }

    if (stars.length === 0 && constellation.anchor) {
      points.push(constellation.anchor)
    }
  }

  return points
}

export function spawnAutoPlanets(
  constellations: Constellation[],
  viewport: { width: number; height: number }
): OrbitDecor[] {
  const visible = constellations.filter((item) => !item.hidden)
  const points = collectConstellationStarPoints(visible)
  if (visible.length === 0 || points.length === 0) return []

  const planets: OrbitDecor[] = []
  let luck = 0

  for (let index = 0; index < visible.length; index += 1) {
    luck += 1
    const rolled =
      Math.random() < Math.min(PLANET_MAX_CHANCE, planetSpawnChance(luck) * 2.4) ||
      Math.random() < AUTO_PLANET_BONUS

    if (!rolled) continue

    const anchor = points[Math.floor(Math.random() * points.length)]
    planets.push(
      createOrbitDecor(anchor.x, anchor.y, viewport, { idPrefix: 'auto-planet' })
    )
    luck = 0
  }

  if (planets.length === 0 && visible.length >= 1) {
    const anchor = points[Math.floor(Math.random() * points.length)]
    planets.push(
      createOrbitDecor(anchor.x, anchor.y, viewport, { idPrefix: 'auto-planet' })
    )
  }

  return planets
}

export function rollNebulaBurst() {
  return Math.random() < NEBULA_BURST_CHANCE
}

export function createNebulaBurst(): NebulaBurst {
  return {
    id: nextDecorId('nebula-burst'),
    hue: randomBetween(180, 320),
    holdMs: 5000 + Math.floor(Math.random() * 5000),
    particleCount: 80 + Math.floor(Math.random() * 60),
  }
}
