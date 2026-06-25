'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Maximize2,
  Play,
  RotateCcw,
  Shirt,
  SplitSquareHorizontal,
} from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useDeviceProfile } from './device-profile'
import {
  CHARACTER_POSTER_READY,
  buildInitialOutfit,
  characterAnimationUrl,
  characterAnimations,
  characterPoster,
  characterReady,
  characterRegions,
  defaultAnimationId,
  regionOptions,
  type CharacterOutfit,
} from './character-config'

const CharacterViewerCanvas = dynamic(
  () => import('./character-viewer-canvas').then((mod) => mod.CharacterViewerCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Loading viewer…
      </div>
    ),
  }
)

function variantLabel(regionId: string, variantId: string | null): string {
  if (variantId === null) return 'None'
  const region = characterRegions.find((r) => r.id === regionId)
  return region?.variants.find((v) => v.id === variantId)?.label ?? variantId
}

type ComboState = { label: string; values: CharacterOutfit }
type ViewerRow =
  | { kind: 'region'; id: string; label: string }
  | { kind: 'combo'; id: string; label: string; states: ComboState[] }

// Top-to-bottom rows shown over the model, each with its own ◀ / ▶ arrows.
const HEAD_STATES: ComboState[] = [
  { label: 'None', values: { Glasses: null, Hat: null } },
  { label: 'Glasses', values: { Glasses: 'On', Hat: null } },
  { label: 'Hat', values: { Glasses: null, Hat: 'On' } },
  { label: 'Hat + Glasses', values: { Glasses: 'On', Hat: 'On' } },
]

const VIEWER_ROWS: ViewerRow[] = [
  { kind: 'combo', id: 'head', label: 'Head', states: HEAD_STATES },
  { kind: 'region', id: 'Hoodie', label: 'Hoodie' },
  { kind: 'region', id: 'Pants', label: 'Pants' },
  { kind: 'region', id: 'Shoes', label: 'Foot' },
]

function comboStateIndex(states: ComboState[], outfit: CharacterOutfit): number {
  const idx = states.findIndex((state) =>
    Object.entries(state.values).every(([region, value]) => (outfit[region] ?? null) === value)
  )
  return idx < 0 ? 0 : idx
}

function rowValueLabel(row: ViewerRow, outfit: CharacterOutfit): string {
  if (row.kind === 'combo') return row.states[comboStateIndex(row.states, outfit)].label
  return variantLabel(row.id, outfit[row.id] ?? null)
}

function ConfiguratorPlaceholder() {
  const regionNames = characterRegions.map((r) => r.label).join(' · ')
  const clipNames = characterAnimations.map((a) => a.label).join(' · ')

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-card/60 to-black p-8 text-center">
      <div className="relative z-10 max-w-md space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 text-cyan">
          <Box className="h-7 w-7" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan">
          Character configurator
        </p>
        <p className="font-heading text-xl font-bold tracking-tight">Outfit + animation rig</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A single rigged character with swappable wearables and playable animations — cycle each
          region with the side arrows, scrub the wireframe ⟷ rendered swipe, and switch clips.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {regionNames ? `Regions · ${regionNames}` : 'Drop animation .glb files into public/arsenal/models/character/'}
        </p>
        {clipNames ? (
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Clips · {clipNames}
          </p>
        ) : null}
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.84 0.16 200 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(0.84 0.16 200 / 0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  )
}

function ChamberButton({
  active,
  onClick,
  children,
  disabled = false,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 ${
        active
          ? 'border-cyan/40 bg-cyan/15 text-cyan'
          : 'border-white/10 text-muted-foreground hover:border-white/25'
      }`}
    >
      {children}
    </button>
  )
}

export function CharacterConfigurator() {
  const { isNarrow: isMobile, enablePropViewer3d, performanceTier } = useDeviceProfile()

  const [outfit, setOutfit] = useState<CharacterOutfit>(() => buildInitialOutfit())
  const [animationId, setAnimationId] = useState(() => defaultAnimationId() ?? '')
  const [wireframe, setWireframe] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [swipe, setSwipe] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [dividerPct, setDividerPct] = useState(50)

  const swipeRatioRef = useRef(0.5)
  const swipeBoxRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const selectedAnimation = useMemo(
    () => characterAnimations.find((a) => a.id === animationId) ?? characterAnimations[0],
    [animationId]
  )

  const viewerBackground =
    selectedAnimation?.background ??
    'radial-gradient(120% 90% at 50% 20%, oklch(0.2 0.03 270 / 0.9), #05050a 70%)'

  const suitOn = (outfit.Suit ?? null) !== null

  const cycleRow = useCallback((row: ViewerRow, step: number) => {
    setOutfit((prev) => {
      if (row.kind === 'combo') {
        const index = comboStateIndex(row.states, prev)
        const next = row.states[(index + step + row.states.length) % row.states.length]
        return { ...prev, ...next.values }
      }
      const region = characterRegions.find((r) => r.id === row.id)
      if (!region) return prev
      const options = regionOptions(region)
      if (options.length === 0) return prev
      const current = prev[row.id] ?? null
      const index = options.findIndex((opt) => opt === current)
      const nextIndex = (index + step + options.length) % options.length
      return { ...prev, [row.id]: options[nextIndex] }
    })
  }, [])

  const toggleSuit = useCallback(() => {
    setOutfit((prev) => ({ ...prev, Suit: (prev.Suit ?? null) === null ? 'Alien' : null }))
  }, [])

  const updateSwipeFromClientX = useCallback((clientX: number) => {
    const box = swipeBoxRef.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    const ratio = Math.min(0.98, Math.max(0.02, (clientX - rect.left) / rect.width))
    swipeRatioRef.current = ratio
    setDividerPct(ratio * 100)
  }, [])

  if (!characterReady) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/50">
          <ConfiguratorPlaceholder />
        </div>
      </div>
    )
  }

  const url = selectedAnimation ? characterAnimationUrl(selectedAnimation.file) : ''
  const loop = selectedAnimation?.loop ?? true
  const clips = selectedAnimation?.clips

  // Mobile / low-power: live viewer is off — show poster with an opt-in expand.
  const showCanvas = enablePropViewer3d && (!isMobile || mobileExpanded)

  const viewerBody = showCanvas ? (
    swipe ? (
      <div ref={swipeBoxRef} className="relative h-full w-full cursor-grab select-none active:cursor-grabbing">
        <CharacterViewerCanvas
          url={url}
          outfit={outfit}
          loop={loop}
          clips={clips}
          autoRotate={autoRotate}
          wireframe={false}
          swipeRatioRef={swipeRatioRef}
          performanceTier={performanceTier}
        />
        {/* Drag handle — only this strip moves the split; the rest of the view
            rotates / pans via the orbit controls underneath. */}
        <div
          className="absolute inset-y-0 z-10 w-6 -translate-x-1/2 cursor-ew-resize"
          style={{ left: `${dividerPct}%` }}
          onPointerDown={(event) => {
            dragging.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
            updateSwipeFromClientX(event.clientX)
          }}
          onPointerMove={(event) => {
            if (dragging.current) updateSwipeFromClientX(event.clientX)
          }}
          onPointerUp={(event) => {
            dragging.current = false
            event.currentTarget.releasePointerCapture(event.pointerId)
          }}
          onPointerCancel={() => {
            dragging.current = false
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-cyan shadow-[0_0_16px_var(--cyan)]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan/50 bg-[oklch(0.08_0.012_270/0.92)] text-cyan shadow-[0_0_16px_var(--cyan)]">
            <ChevronLeft className="-mr-1.5 h-3.5 w-3.5" />
            <ChevronRight className="-ml-1.5 h-3.5 w-3.5" />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-[oklch(0.08_0.012_270/0.9)] px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Wireframe
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/10 bg-[oklch(0.08_0.012_270/0.9)] px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Rendered
        </div>
      </div>
    ) : (
      <CharacterViewerCanvas
        url={url}
        outfit={outfit}
        loop={loop}
        clips={clips}
        autoRotate={autoRotate}
        wireframe={wireframe}
        performanceTier={performanceTier}
      />
    )
  ) : (
    <div className="relative h-full w-full">
      {CHARACTER_POSTER_READY ? (
        <Image
          src={characterPoster}
          alt="Character"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-card/60 to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {isMobile ? (
        <button
          type="button"
          onClick={() => setMobileExpanded(true)}
          className="mobile-solid-backdrop absolute inset-x-0 bottom-6 mx-auto flex w-fit items-center gap-2 rounded-full border border-cyan/40 bg-black/85 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-cyan transition-transform hover:scale-105"
        >
          <Maximize2 className="h-4 w-4" />
          View in 3D
        </button>
      ) : null}
    </div>
  )

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10"
        style={{ background: viewerBackground }}
      >
        {viewerBody}

        {/* Per-region cycle rows stacked top→bottom over the model (also in
            wireframe + swipe modes) */}
        {showCanvas ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-around py-5">
            {VIEWER_ROWS.map((row) => (
              <div key={row.id} className="flex items-center justify-between px-3">
                <div className="pointer-events-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cycleRow(row, -1)}
                    aria-label={`Previous ${row.label}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan/40 bg-[oklch(0.08_0.012_270/0.85)] text-cyan transition-transform hover:scale-110"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="rounded-full border border-white/10 bg-[oklch(0.08_0.012_270/0.9)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    {row.label} · {rowValueLabel(row, outfit)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleRow(row, 1)}
                  aria-label={`Next ${row.label}`}
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-cyan/40 bg-[oklch(0.08_0.012_270/0.85)] text-cyan transition-transform hover:scale-110"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {isMobile && mobileExpanded ? (
          <button
            type="button"
            onClick={() => setMobileExpanded(false)}
            className="mobile-solid-backdrop absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground"
          >
            Poster
          </button>
        ) : null}
      </div>

      {/* Alien suit replaces hoodie + pants */}
      <div className="flex flex-wrap gap-2">
        <ChamberButton active={suitOn} onClick={toggleSuit}>
          <Shirt className="h-3.5 w-3.5" />
          Alien suit
        </ChamberButton>
      </div>

      {/* Animation clips */}
      {characterAnimations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {characterAnimations.map((clip) => (
            <ChamberButton
              key={clip.id}
              active={clip.id === animationId}
              onClick={() => setAnimationId(clip.id)}
            >
              <Play className="h-3.5 w-3.5" />
              {clip.label}
            </ChamberButton>
          ))}
        </div>
      ) : null}

      {/* View controls */}
      <div className="flex flex-wrap gap-2">
        <ChamberButton active={swipe} onClick={() => setSwipe((value) => !value)}>
          <SplitSquareHorizontal className="h-3.5 w-3.5" />
          Wireframe swipe
        </ChamberButton>
        <ChamberButton
          active={wireframe}
          disabled={swipe}
          onClick={() => setWireframe((value) => !value)}
        >
          <Grid3x3 className="h-3.5 w-3.5" />
          Wireframe
        </ChamberButton>
        <ChamberButton active={autoRotate} onClick={() => setAutoRotate((value) => !value)}>
          <RotateCcw className="h-3.5 w-3.5" />
          Auto spin
        </ChamberButton>
      </div>
    </div>
  )
}
