'use client'

import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { OrbitDecor, OrbitDecorOrbiter } from './orbit-decor-logic'
import { getDecorFrameSize, getDecorHubSize, getDecorVisualBounds } from './orbit-decor-bounds'
import { useConstellations } from './constellation-context'
import { useDeviceProfile } from './device-profile'
import {
  scaleSelectedDecor,
  useOrbitDecorInteraction,
} from './orbit-decor-interaction'
import { useSkyScrollFade } from './sky-scroll-fade'

export type OrbitDecorRenderMode = 'full' | 'visual' | 'hitbox'

function PlanetAtmosphere({ decor }: { decor: OrbitDecor }) {
  if (!decor.atmosphere) return null
  const size = Math.min(decor.width, decor.height)

  return (
    <div
      className="orbit-decor-atmosphere absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: size * 1.35,
        height: size * 1.35,
        opacity: decor.atmosphere.opacity,
        background: `radial-gradient(circle, oklch(0.72 0.14 ${decor.atmosphere.hue} / 0.45), transparent 68%)`,
        filter: `blur(${decor.atmosphere.blur}px)`,
      }}
    />
  )
}

function PlanetRings({ decor }: { decor: OrbitDecor }) {
  return decor.rings.map((ring) => (
    <div
      key={ring.id}
      className={`orbit-decor-ring-plane ${ring.reverse ? 'orbit-decor-orbit-reverse' : ''}`}
      style={{
        width: ring.radius * 2,
        height: ring.radius * 0.42,
        marginLeft: -ring.radius,
        marginTop: -(ring.radius * 0.21),
        transform: `rotateX(${ring.tilt}deg)`,
        animationDuration: `${ring.duration}s`,
        opacity: ring.opacity,
      }}
    >
      <span
        className="orbit-decor-ring-stroke"
        style={{
          height: ring.width,
          background: `linear-gradient(90deg, transparent, oklch(0.78 0.1 ${ring.hue} / 0.85), oklch(0.9 0.08 ${ring.hue + 15} / 0.95), oklch(0.78 0.1 ${ring.hue} / 0.85), transparent)`,
          boxShadow: `0 0 18px oklch(0.7 0.12 ${ring.hue} / 0.45)`,
        }}
      />
    </div>
  ))
}

function RockCloud({ decor }: { decor: OrbitDecor }) {
  if (!decor.rockCloud) return null
  const size = Math.min(decor.width, decor.height)

  return (
    <div
      className="orbit-decor-rock-cloud"
      style={{ animationDuration: `${decor.rockCloud.speed}s` }}
    >
      {Array.from({ length: decor.rockCloud.count }, (_, index) => {
        const angle = (index / decor.rockCloud!.count) * Math.PI * 2
        const dist = size * decor.rockCloud!.spread * (0.45 + (index % 5) * 0.08)
        return (
          <span
            key={index}
            className="orbit-decor-rock"
            style={{
              left: `calc(50% + ${Math.cos(angle) * dist}px)`,
              top: `calc(50% + ${Math.sin(angle) * dist * 0.35}px)`,
              width: 2 + (index % 4),
              height: 2 + (index % 3),
              background: `oklch(${0.55 + (index % 3) * 0.08} 0.04 ${decor.hue + 30})`,
            }}
          />
        )
      })}
    </div>
  )
}

function VortexCore({ decor }: { decor: OrbitDecor }) {
  const size = Math.min(decor.width, decor.height)
  const arms = decor.vortex?.arms ?? 3
  const speed = decor.vortex?.speed ?? 6

  return (
    <div
      className="orbit-decor-vortex"
      style={{
        width: size,
        height: size,
        animationDuration: `${speed}s`,
      }}
    >
      {Array.from({ length: arms }, (_, index) => (
        <span
          key={index}
          className="orbit-decor-vortex-arm"
          style={{
            transform: `rotate(${(360 / arms) * index}deg)`,
            background: `conic-gradient(from 0deg, transparent, oklch(0.75 0.16 ${decor.hue} / 0.75), transparent)`,
          }}
        />
      ))}
    </div>
  )
}

function StormBands({ decor }: { decor: OrbitDecor }) {
  if (!decor.stormBand) return null
  const size = Math.min(decor.width, decor.height)

  return (
    <div
      className="orbit-decor-storm"
      style={{ animationDuration: `${decor.stormBand.speed}s` }}
    >
      {Array.from({ length: decor.stormBand.count }, (_, index) => (
        <span
          key={index}
          className="orbit-decor-storm-band"
          style={{
            top: `${18 + index * (55 / decor.stormBand!.count)}%`,
            background: `linear-gradient(90deg, transparent, oklch(0.7 0.14 ${decor.hue + index * 8} / 0.55), transparent)`,
          }}
        />
      ))}
      <span
        className="absolute inset-[12%] rounded-full opacity-50"
        style={{
          background: `radial-gradient(circle at 30% 28%, oklch(0.88 0.12 ${decor.hue}), oklch(0.55 0.18 ${decor.hue} / 0.8) 55%, oklch(0.35 0.14 ${decor.hue - 10})`,
        }}
      />
    </div>
  )
}

function PlantCore({ decor }: { decor: OrbitDecor }) {
  const leaf = `oklch(0.72 0.16 ${decor.hue})`
  const stem = `oklch(0.58 0.12 ${decor.hue + 25})`
  const core = `oklch(0.88 0.14 ${decor.hue - 20})`

  return (
    <svg
      viewBox="0 0 80 96"
      aria-hidden
      className="crazy-decor-plant-sway"
      style={{
        width: decor.width,
        height: decor.height,
        filter: `drop-shadow(0 0 14px oklch(0.75 0.14 ${decor.hue} / 0.45))`,
      }}
    >
      <path d="M40 88 C38 72, 36 58, 40 44 C42 58, 44 72, 40 88 Z" fill={stem} opacity={0.85} />
      <ellipse cx="40" cy="40" rx="9" ry="11" fill={core} opacity={0.95} />
      <path d="M40 36 C22 28, 10 18, 8 8 C18 14, 28 22, 40 30 Z" fill={leaf} opacity={0.9} />
      <path d="M40 34 C58 24, 72 12, 74 4 C64 10, 52 18, 40 28 Z" fill={leaf} opacity={0.88} />
      <path d="M40 42 C16 40, 4 48, 2 58 C14 52, 28 46, 40 44 Z" fill={leaf} opacity={0.82} />
      <path d="M40 44 C64 46, 78 54, 80 64 C68 58, 54 50, 40 48 Z" fill={leaf} opacity={0.8} />
      <circle cx="40" cy="38" r="4.5" fill={core} />
    </svg>
  )
}

function PlanetBody({ decor }: { decor: OrbitDecor }) {
  const size = Math.min(decor.width, decor.height)

  if (decor.variant === 'plant') return <PlantCore decor={decor} />
  if (decor.variant === 'vortex') return <VortexCore decor={decor} />
  if (decor.variant === 'storm') return <StormBands decor={decor} />

  const surface: Record<string, string> = {
    gas_giant: `radial-gradient(circle at 35% 30%, oklch(0.88 0.14 ${decor.hue}), oklch(0.62 0.2 ${decor.hue + 18} / 0.9) 48%, oklch(0.42 0.16 ${decor.hue - 8}) 72%)`,
    rocky: `radial-gradient(circle at 38% 32%, oklch(0.62 0.06 ${decor.hue}), oklch(0.45 0.05 ${decor.hue + 12}) 55%, oklch(0.28 0.04 ${decor.hue - 5}))`,
    ringed: `radial-gradient(circle at 34% 30%, oklch(0.78 0.12 ${decor.hue}), oklch(0.55 0.14 ${decor.hue + 10}) 58%, oklch(0.35 0.1 ${decor.hue}))`,
    binary: `radial-gradient(circle at 30% 30%, oklch(0.9 0.15 ${decor.hue}), oklch(0.65 0.18 ${decor.hue + 20} / 0.85) 50%, transparent 68%)`,
    ice: `radial-gradient(circle at 36% 28%, oklch(0.92 0.08 ${decor.hue}), oklch(0.72 0.1 ${decor.hue + 8}) 52%, oklch(0.48 0.08 ${decor.hue - 5}))`,
    magma: `radial-gradient(circle at 40% 35%, oklch(0.92 0.2 ${decor.hue}), oklch(0.68 0.24 ${decor.hue + 8}) 45%, oklch(0.32 0.12 ${decor.hue - 15}))`,
    debris: `radial-gradient(circle at 42% 38%, oklch(0.58 0.05 ${decor.hue}), oklch(0.38 0.04 ${decor.hue + 5}) 60%, oklch(0.22 0.03 ${decor.hue}))`,
    crystal: `radial-gradient(circle at 32% 28%, oklch(0.9 0.14 ${decor.hue}), oklch(0.68 0.2 ${decor.hue + 15} / 0.85) 48%, oklch(0.45 0.18 ${decor.hue + 30}))`,
    nebula_core: `radial-gradient(circle at 38% 36%, oklch(0.85 0.2 ${decor.hue}), oklch(0.58 0.24 ${decor.hue + 22} / 0.75) 50%, oklch(0.3 0.16 ${decor.hue - 10}))`,
    dwarf: `radial-gradient(circle at 40% 35%, oklch(0.7 0.07 ${decor.hue}), oklch(0.48 0.06 ${decor.hue + 6}) 58%, oklch(0.3 0.04 ${decor.hue}))`,
    star: `radial-gradient(circle at 35% 35%, oklch(0.92 0.16 ${decor.hue}), oklch(0.78 0.2 ${decor.hue + 15}) 42%, transparent 68%)`,
  }

  return (
    <div
      className={`orbit-decor-body orbit-decor-body-${decor.variant}`}
      style={{
        width: size,
        height: size,
        background: surface[decor.variant] ?? surface.rocky,
        boxShadow: `0 0 28px 8px oklch(0.72 0.16 ${decor.hue} / 0.45), inset -8px -10px 18px oklch(0 0 0 / 0.35)`,
      }}
    >
      {decor.variant === 'star' ? (
        <svg viewBox="0 0 64 64" aria-hidden className="absolute inset-0 h-full w-full">
          {[0, 45, 90, 135].map((angle) => (
            <line
              key={angle}
              x1="32"
              y1="32"
              x2="32"
              y2="8"
              stroke={`oklch(0.9 0.12 ${decor.hue} / 0.55)`}
              strokeWidth="1.2"
              transform={`rotate(${angle} 32 32)`}
            />
          ))}
        </svg>
      ) : null}
      {decor.variant === 'magma' ? (
        <span
          className="orbit-decor-magma-vein absolute inset-0 rounded-full opacity-70"
          style={{
            background: `repeating-conic-gradient(from 0deg, oklch(0.85 0.22 ${decor.hue + 5} / 0.5) 0deg 18deg, transparent 18deg 36deg)`,
          }}
        />
      ) : null}
      {decor.variant === 'crystal' ? (
        <span
          className="orbit-decor-crystal-facet absolute inset-[8%] rounded-full opacity-60"
          style={{
            background: `conic-gradient(from 20deg, transparent, oklch(0.92 0.12 ${decor.hue} / 0.65), transparent)`,
          }}
        />
      ) : null}
    </div>
  )
}

function OrbitRing({ orbiter, hue }: { orbiter: OrbitDecorOrbiter; hue: number }) {
  const size = orbiter.radius * 2
  const colorMap = {
    moon: `oklch(0.78 0.06 ${hue + 210})`,
    sun: `oklch(0.88 0.18 ${hue + (orbiter.reverse ? -18 : 12)})`,
    rock: `oklch(0.55 0.04 ${hue + 25})`,
    ice_shard: `oklch(0.86 0.08 ${hue + 180})`,
  }
  const color = colorMap[orbiter.kind]
  const orbSize = Math.max(4, Math.min(16, orbiter.radius * 0.13))

  return (
    <div
      className={`orbit-decor-orbit-ring ${orbiter.reverse ? 'orbit-decor-orbit-reverse' : ''}`}
      style={{
        width: size,
        height: size,
        marginLeft: -orbiter.radius,
        marginTop: -orbiter.radius,
        animationDuration: `${orbiter.duration}s`,
        animationDelay: `${orbiter.delay}s`,
        transform: orbiter.tilt ? `rotateX(${orbiter.tilt}deg)` : undefined,
      }}
    >
      <span
        className={`orbit-decor-orbit-body orbit-decor-orbit-${orbiter.kind}`}
        style={{
          width: orbSize,
          height: orbiter.kind === 'ice_shard' ? orbSize * 1.6 : orbSize,
          background: color,
          borderRadius: orbiter.kind === 'rock' ? '20%' : '9999px',
          boxShadow:
            orbiter.kind === 'sun'
              ? `0 0 16px 4px oklch(0.85 0.2 ${hue} / 0.75)`
              : `0 0 10px 2px oklch(0.75 0.08 ${hue + 210} / 0.55)`,
        }}
      />
    </div>
  )
}

function OrbitDecorEntity({
  decor,
  selected,
  renderMode = 'full',
  onSelect,
  onDragStart,
  onResizeStart,
}: {
  decor: OrbitDecor
  selected: boolean
  renderMode?: OrbitDecorRenderMode
  onSelect: () => void
  onDragStart: (event: ReactPointerEvent) => void
  onResizeStart: (event: ReactPointerEvent) => void
}) {
  const hub = getDecorHubSize(decor)
  const visualBounds = getDecorVisualBounds(decor)
  const { getSkyVisual } = useSkyScrollFade()
  const { prefersReducedMotion } = useDeviceProfile()
  const [spawning, setSpawning] = useState(!prefersReducedMotion)
  const isFront = (decor.stackLayer ?? 'back') === 'front'
  const skyVisual = getSkyVisual(decor.y)
  const showVisual = renderMode !== 'hitbox'
  const interactive = renderMode !== 'visual'
  const glow =
    isFront && renderMode === 'full'
      ? 'drop-shadow(0 0 22px oklch(0.72 0.14 200 / 0.45))'
      : ''

  useEffect(() => {
    if (!spawning) return
    const timer = window.setTimeout(() => setSpawning(false), 720)
    return () => window.clearTimeout(timer)
  }, [spawning])

  return (
    <div
      data-no-constellation
      data-orbit-decor
      className={`orbit-decor-hub ${selected ? 'orbit-decor-hub-selected' : ''} ${isFront ? 'orbit-decor-hub-front' : 'orbit-decor-hub-back'} ${renderMode === 'hitbox' ? 'orbit-decor-hub-hitbox' : ''} ${renderMode === 'visual' ? 'orbit-decor-hub-visual' : ''}`}
      style={{
        left: decor.x,
        top: decor.y,
        width: hub.width,
        height: hub.height,
        transform: 'translate(-50%, -50%)',
        pointerEvents: interactive ? 'auto' : 'none',
      }}
      onPointerDown={(event) => {
        event.stopPropagation()
        event.preventDefault()
        onSelect()
        if ((event.target as Element).closest('[data-orbit-resize]')) return
        onDragStart(event)
      }}
    >
      {selected && showVisual ? (
        <div
          className="orbit-decor-frame pointer-events-none absolute left-1/2 top-1/2"
          style={{
            width: visualBounds.width,
            height: visualBounds.height,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span className="orbit-decor-frame-label font-mono text-[9px] uppercase tracking-[0.2em]">
            {decor.variant.replace('_', ' ')}
          </span>
          <span className="orbit-decor-frame-corner orbit-decor-frame-corner-tl" />
          <span className="orbit-decor-frame-corner orbit-decor-frame-corner-tr" />
          <span
            className="orbit-decor-frame-corner orbit-decor-frame-corner-br pointer-events-auto"
            data-orbit-resize
            onPointerDown={(event) => {
              event.stopPropagation()
              event.preventDefault()
              onSelect()
              onResizeStart(event)
            }}
          />
          <span className="orbit-decor-frame-corner orbit-decor-frame-corner-bl" />
        </div>
      ) : null}

      {showVisual ? (
        <div
          className="orbit-decor-visual absolute inset-0 flex items-center justify-center"
          style={{
            opacity: skyVisual.opacity,
            filter: glow || undefined,
          }}
        >
          <div
            className={`relative ${spawning ? 'orbit-decor-visual-spawn-in' : ''}`}
            style={{ width: decor.width, height: decor.height }}
          >
            <PlanetAtmosphere decor={decor} />
            <RockCloud decor={decor} />
            <PlanetRings decor={decor} />

            {decor.orbiters.map((orbiter) => (
              <OrbitRing key={orbiter.id} orbiter={orbiter} hue={decor.hue} />
            ))}

            <div className="orbit-decor-core">
              <PlanetBody decor={decor} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function OrbitDecorSelectionHud() {
  const { selectedOrbitDecorId, orbitDecors, updateOrbitDecor, removeOrbitDecor } =
    useConstellations()
  const { isCoarsePointer } = useDeviceProfile()
  const decor = orbitDecors.find((item) => item.id === selectedOrbitDecorId)
  if (!decor) return null

  const frame = getDecorFrameSize(decor)

  return (
    <div
      data-no-constellation
      className="orbit-decor-selection-hud pointer-events-auto absolute z-20"
      style={{
        left: decor.x,
        top: decor.y - frame.height * 0.5 - 10,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <p className="orbit-decor-scale-hint font-mono text-[10px] uppercase tracking-[0.14em]">
        {isCoarsePointer
          ? 'Use +/- to resize · drag to move'
          : 'Hold Ctrl and scroll up/down'}
      </p>
      {isCoarsePointer ? (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <button
            type="button"
            data-orbit-control
            data-no-constellation
            className="orbit-decor-stack-btn"
            aria-label="Shrink planet"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              scaleSelectedDecor(decor, 0.9, updateOrbitDecor)
            }}
          >
            <Minus className="h-3 w-3" aria-hidden />
          </button>
          <button
            type="button"
            data-orbit-control
            data-no-constellation
            className="orbit-decor-stack-btn"
            aria-label="Grow planet"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              scaleSelectedDecor(decor, 1.1, updateOrbitDecor)
            }}
          >
            <Plus className="h-3 w-3" aria-hidden />
          </button>
        </div>
      ) : null}
      <div className="orbit-decor-stack-actions mt-2 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          data-orbit-control
          data-no-constellation
          className={`orbit-decor-stack-btn ${(decor.stackLayer ?? 'back') === 'front' ? 'orbit-decor-stack-btn-active' : ''}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            updateOrbitDecor(decor.id, { stackLayer: 'front' })
          }}
        >
          Bring to front
        </button>
        <button
          type="button"
          data-orbit-control
          data-no-constellation
          className={`orbit-decor-stack-btn ${(decor.stackLayer ?? 'back') === 'back' ? 'orbit-decor-stack-btn-active' : ''}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            updateOrbitDecor(decor.id, { stackLayer: 'back' })
          }}
        >
          Bring to back
        </button>
        <button
          type="button"
          data-orbit-control
          data-no-constellation
          className="orbit-decor-stack-btn orbit-decor-stack-btn-danger"
          aria-label="Delete planet"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            removeOrbitDecor(decor.id)
          }}
        >
          <Trash2 className="h-3 w-3" aria-hidden />
          Delete
        </button>
      </div>
    </div>
  )
}

export function OrbitDecorLayer({
  decors,
  renderMode = 'full',
  reduced = false,
}: {
  decors: OrbitDecor[]
  renderMode?: OrbitDecorRenderMode
  reduced?: boolean
}) {
  const { selectedOrbitDecorId, setSelectedOrbitDecorId } = useConstellations()
  const interaction = useOrbitDecorInteraction()

  if (decors.length === 0) return null

  return (
    <div
      className={`orbit-decor-layer absolute inset-0 ${renderMode === 'visual' ? 'orbit-decor-layer-visual' : ''} ${renderMode === 'hitbox' ? 'orbit-decor-layer-hitbox' : ''} ${reduced ? 'orbit-decor-layer-reduced' : ''}`}
    >
      {decors.map((decor) => (
        <OrbitDecorEntity
          key={decor.id}
          decor={decor}
          renderMode={renderMode}
          selected={selectedOrbitDecorId === decor.id}
          onSelect={() => setSelectedOrbitDecorId(decor.id)}
          onDragStart={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            interaction.beginDrag({
              id: decor.id,
              pointerId: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              originX: decor.x,
              originY: decor.y,
              mode: 'move',
              originWidth: decor.width,
              originHeight: decor.height,
              startDistance: 0,
            })
          }}
          onResizeStart={(event) => {
            ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
            const visual = getDecorVisualBounds(decor)
            interaction.beginDrag({
              id: decor.id,
              pointerId: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              originX: decor.x,
              originY: decor.y,
              mode: 'resize',
              originWidth: decor.width,
              originHeight: decor.height,
              startDistance: Math.max(visual.width, visual.height) * 0.5,
              originDecor: decor,
            })
          }}
        />
      ))}
    </div>
  )
}
