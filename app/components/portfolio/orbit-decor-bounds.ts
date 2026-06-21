import type { OrbitDecor } from './orbit-decor-logic'

export function getDecorVisualBounds(decor: OrbitDecor) {
  if (decor.variant === 'plant') {
    return {
      width: decor.width + 6,
      height: decor.height + 6,
    }
  }

  const body = Math.min(decor.width, decor.height)
  let halfW = body * 0.5
  let halfH = body * 0.5

  if (decor.atmosphere) {
    const atmosphereRadius = body * 0.675
    halfW = Math.max(halfW, atmosphereRadius)
    halfH = Math.max(halfH, atmosphereRadius)
  }

  for (const ring of decor.rings) {
    halfW = Math.max(halfW, ring.radius)
    halfH = Math.max(halfH, ring.radius * 0.21 + ring.width * 0.5)
  }

  if (decor.rockCloud) {
    const cloud = body * decor.rockCloud.spread * 0.53
    halfW = Math.max(halfW, cloud)
    halfH = Math.max(halfH, cloud * 0.35)
  }

  const pad = 4

  return {
    width: halfW * 2 + pad,
    height: halfH * 2 + pad,
  }
}

export function getDecorHubSize(decor: OrbitDecor) {
  const visual = getDecorVisualBounds(decor)

  return {
    width: visual.width + 10,
    height: visual.height + 10,
  }
}

export function getDecorFrameSize(decor: OrbitDecor) {
  return getDecorHubSize(decor)
}

export function clampDecorDimensions(
  width: number,
  height: number,
  viewport: { width: number; height: number }
) {
  const minW = viewport.width * 0.03
  const maxW = viewport.width * 0.8
  const minH = viewport.height * 0.03
  const maxH = viewport.height * 0.8

  return {
    width: Math.min(maxW, Math.max(minW, width)),
    height: Math.min(maxH, Math.max(minH, height)),
  }
}

export function scaleDecorDimensions(
  decor: OrbitDecor,
  factor: number,
  viewport: { width: number; height: number }
) {
  const next = clampDecorDimensions(
    decor.width * factor,
    decor.height * factor,
    viewport
  )

  const scale = next.width / decor.width

  return {
    ...next,
    orbiters: decor.orbiters.map((orbiter) => ({
      ...orbiter,
      radius: orbiter.radius * scale,
    })),
    rings: decor.rings.map((ring) => ({
      ...ring,
      radius: ring.radius * scale,
      width: ring.width * scale,
    })),
  }
}
