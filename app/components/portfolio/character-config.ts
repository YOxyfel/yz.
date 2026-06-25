import { arsenalPath } from './arsenal-path'

/**
 * CHARACTER OUTFIT CONFIGURATOR — data manifest.
 *
 * Setup:
 * - One .glb per animation, each containing the FULL character with every
 *   wearable mesh present. All files share the same skeleton + identical names.
 * - Each region variant maps to explicit mesh name(s) in the GLB (see below).
 * - Any mesh NOT listed in a variant is treated as always-on base (e.g. BodyV2).
 *
 * To go live:
 *   1. Drop the animation .glb files into public/arsenal/models/character/
 *   2. Fill in `characterAnimations` with your filenames + clip behavior.
 *   3. Set `CHARACTER_READY = true`.
 */

/** Flip to true once the animation .glb files exist and `characterAnimations` is filled in. */
export const CHARACTER_READY = true

/** Set true once a poster.png exists in the character folder (used for mobile fallback). */
export const CHARACTER_POSTER_READY = false

export type CharacterAnimation = {
  /** stable id used for the play controls */
  id: string
  label: string
  /** filename inside public/arsenal/models/character/ */
  file: string
  /** loop forever (true) or play once and hold the last frame (false). Default true. */
  loop?: boolean
  /** the clip shown on load */
  default?: boolean
  /** CSS background (gradient/color) shown behind the model for this state */
  background?: string
  /**
   * Multi-clip sequence within the same file (auto-chained in order). Each step
   * plays through, then the next begins; the final step's `loop` decides whether
   * it repeats. When omitted, the file's first clip plays with `loop`.
   */
  clips?: { name: string; loop: boolean }[]
}

export type CharacterVariant = {
  id: string
  label: string
  /** exact mesh name(s) in the GLB shown when this variant is selected */
  meshes: string[]
  /** region ids whose meshes are hidden while this variant is active (e.g. a full-body suit) */
  hides?: string[]
  /** when active, ONLY this variant's meshes show — hides every other region AND the base body */
  solo?: boolean
}

/** Always-visible base meshes (e.g. the body), hidden only by a `solo` variant. */
export const characterBaseMeshes = ['BodyMe']

export type CharacterRegion = {
  id: string
  label: string
  variants: CharacterVariant[]
  /** allow toggling this region fully off (no mesh shown) */
  allowNone?: boolean
}

/** region id → selected variant id (or null when the region is toggled off). */
export type CharacterOutfit = Record<string, string | null>

/* ── Animations — fill in once the .glb files are exported ─────────────── */

export const characterAnimations: CharacterAnimation[] = [
  {
    id: 'sit-talk',
    label: 'Sit & Talk',
    file: 'Sitting/Sitting_Character.draco.glb',
    loop: true,
    default: true,
    background:
      'radial-gradient(120% 90% at 50% 18%, oklch(0.26 0.05 250 / 0.95), oklch(0.08 0.02 270) 60%, #04040a 100%)',
  },
  {
    id: 'walk',
    label: 'Walk',
    file: 'Walking/Walk.draco.glb',
    loop: true,
    clips: [
      { name: 'Walk_Start', loop: false },
      { name: 'Walk_Loop', loop: true },
    ],
    background:
      'linear-gradient(180deg, oklch(0.28 0.06 30 / 0.6) 0%, oklch(0.1 0.03 280) 55%, #05050a 100%)',
  },
]

/* ── Regions + variants — mapped to your Blender mesh names ────────────── */

export const characterRegions: CharacterRegion[] = [
  {
    id: 'Hoodie',
    label: 'Hoodie',
    variants: [
      { id: 'Dev', label: 'Dev', meshes: ['GameDevHoodie'] },
      { id: 'Trump', label: 'Trump', meshes: ['TrumpHoodie'] },
      { id: 'Garbage', label: 'Garbage', meshes: ['GarbageHoodie'] },
      { id: 'Psy', label: 'Psychedelic', meshes: ['PsyHoodie'] },
    ],
  },
  {
    id: 'Pants',
    label: 'Pants',
    allowNone: true,
    variants: [
      { id: 'Dev', label: 'Dev', meshes: ['GameDevPants'] },
      { id: 'Trump', label: 'Trump', meshes: ['TrumpPants'] },
      { id: 'Garbage', label: 'Garbage', meshes: ['GarbagePants'] },
      { id: 'Psy', label: 'Psychedelic', meshes: ['PsyPants'] },
    ],
  },
  {
    id: 'Shoes',
    label: 'Shoes',
    allowNone: true,
    variants: [
      { id: 'Nike', label: 'Nike', meshes: ['ShoesNike1'] },
      { id: 'Nike2', label: 'Nike Alt', meshes: ['ShoesNike2'] },
    ],
  },
  {
    id: 'Glasses',
    label: 'Glasses',
    allowNone: true,
    variants: [{ id: 'On', label: 'Glasses', meshes: ['Glasses.001'] }],
  },
  {
    id: 'Hat',
    label: 'Hat',
    allowNone: true,
    variants: [{ id: 'On', label: 'Hat', meshes: ['Hat.001'] }],
  },
  {
    id: 'Suit',
    label: 'Suit',
    allowNone: true,
    variants: [{ id: 'Alien', label: 'Alien', meshes: ['AlienSuit'], solo: true }],
  },
]

/** Starting selection. Regions omitted fall back to first variant (or none). */
export const defaultOutfit: CharacterOutfit = {
  Hoodie: 'Dev',
  Pants: 'Dev',
  Shoes: 'Nike',
  Glasses: null,
  Hat: null,
  Suit: null,
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

export const characterPoster = arsenalPath('models', 'character', 'poster.png')

export function characterAnimationUrl(file: string) {
  // `file` may include subfolders (e.g. "Sitting/foo.glb"); encode each segment.
  return arsenalPath('models', 'character', ...file.split('/'))
}

export function defaultAnimationId(): string | undefined {
  return (characterAnimations.find((a) => a.default) ?? characterAnimations[0])?.id
}

export function buildInitialOutfit(): CharacterOutfit {
  const outfit: CharacterOutfit = {}
  for (const region of characterRegions) {
    if (region.id in defaultOutfit) {
      outfit[region.id] = defaultOutfit[region.id]
    } else {
      outfit[region.id] = region.allowNone ? null : (region.variants[0]?.id ?? null)
    }
  }
  return outfit
}

/** Ordered selectable options for a region (includes null when allowNone). */
export function regionOptions(region: CharacterRegion): (string | null)[] {
  const options: (string | null)[] = region.variants.map((v) => v.id)
  return region.allowNone ? [null, ...options] : options
}

/**
 * three.js GLTFLoader sanitizes object names (drops `. : / [ ]`, spaces → `_`).
 * Normalize on both sides so config names match the loaded scene regardless.
 */
export function normalizeMeshName(name: string): string {
  return name.replace(/[\s.:/[\]]/g, '').toLowerCase()
}

/** Every (normalized) mesh name the viewer controls — region variants + base. */
export function managedMeshNames(): Set<string> {
  const set = new Set<string>()
  for (const region of characterRegions) {
    for (const variant of region.variants) {
      for (const mesh of variant.meshes) set.add(normalizeMeshName(mesh))
    }
  }
  for (const mesh of characterBaseMeshes) set.add(normalizeMeshName(mesh))
  return set
}

/** Normalized mesh names that should be visible for the given outfit. */
export function visibleMeshNames(outfit: CharacterOutfit): Set<string> {
  // A `solo` variant (e.g. the full-body Alien suit) replaces everything,
  // including the base body and all other wearables.
  for (const region of characterRegions) {
    const selected = outfit[region.id] ?? null
    if (selected === null) continue
    const variant = region.variants.find((v) => v.id === selected)
    if (variant?.solo) {
      return new Set(variant.meshes.map(normalizeMeshName))
    }
  }

  // Collect regions hidden by an active variant.
  const hiddenRegions = new Set<string>()
  for (const region of characterRegions) {
    const selected = outfit[region.id] ?? null
    if (selected === null) continue
    const variant = region.variants.find((v) => v.id === selected)
    variant?.hides?.forEach((id) => hiddenRegions.add(id))
  }

  const set = new Set<string>()
  for (const mesh of characterBaseMeshes) set.add(normalizeMeshName(mesh))
  for (const region of characterRegions) {
    if (hiddenRegions.has(region.id)) continue
    const selected = outfit[region.id] ?? null
    if (selected === null) continue
    const variant = region.variants.find((v) => v.id === selected)
    variant?.meshes.forEach((mesh) => set.add(normalizeMeshName(mesh)))
  }
  return set
}

export const characterReady =
  CHARACTER_READY && characterAnimations.length > 0 && characterRegions.length > 0
