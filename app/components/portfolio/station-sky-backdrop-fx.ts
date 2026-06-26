export const STATION_GRID_PX = 56

type OklchTone = { l: number; c: number; h: number }

const PARTICLE_TONES: OklchTone[] = [
  { l: 0.82, c: 0.16, h: 200 },
  { l: 0.78, c: 0.14, h: 200 },
  { l: 0.72, c: 0.14, h: 290 },
  { l: 0.62, c: 0.16, h: 295 },
  { l: 0.76, c: 0.15, h: 55 },
  { l: 0.65, c: 0.16, h: 35 },
  { l: 0.62, c: 0.12, h: 350 },
  { l: 0.62, c: 0.1, h: 180 },
  { l: 0.55, c: 0.1, h: 230 },
]

const NEBULA_TONES: OklchTone[] = [
  { l: 0.58, c: 0.15, h: 200 },
  { l: 0.6, c: 0.18, h: 290 },
  { l: 0.74, c: 0.18, h: 55 },
  { l: 0.64, c: 0.17, h: 350 },
  { l: 0.66, c: 0.2, h: 35 },
  { l: 0.64, c: 0.15, h: 180 },
  { l: 0.58, c: 0.15, h: 230 },
]

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]!
}

function oklch({ l, c, h }: OklchTone, alpha: number) {
  return `oklch(${l} ${c} ${h} / ${alpha})`
}

export type SkyBackdropFx = {
  particles: string
  nebula: string
}

export function generateSkyBackdropFx(): SkyBackdropFx {
  const particleCount = 34 + Math.floor(Math.random() * 7)
  const particles = Array.from({ length: particleCount }, () => {
    const x = rand(3, 97)
    const y = rand(3, 95)
    const size = rand(0.9, 2.1)
    const fade = size + rand(1.2, 2.4)
    const alpha = rand(0.22, 0.58)
    return `radial-gradient(circle at ${x.toFixed(1)}% ${y.toFixed(1)}%, ${oklch(pick(PARTICLE_TONES), alpha)} 0 ${size.toFixed(2)}px, transparent ${fade.toFixed(2)}px)`
  }).join(', ')

  const nebulaCount = 10 + Math.floor(Math.random() * 3)
  const nebula = Array.from({ length: nebulaCount }, () => {
    const width = rand(36, 80)
    const height = rand(34, 68)
    const x = rand(5, 95)
    const y = rand(5, 93)
    const fade = rand(58, 74)
    const alpha = rand(0.18, 0.36)
    return `radial-gradient(ellipse ${width.toFixed(1)}% ${height.toFixed(1)}% at ${x.toFixed(1)}% ${y.toFixed(1)}%, ${oklch(pick(NEBULA_TONES), alpha)}, transparent ${fade.toFixed(1)}%)`
  }).join(', ')

  return { particles, nebula }
}

export function snapGridCellCenter(clientX: number, clientY: number, grid = STATION_GRID_PX) {
  const x = Math.floor(clientX / grid) * grid + grid / 2
  const y = Math.floor(clientY / grid) * grid + grid / 2
  return { x, y }
}
