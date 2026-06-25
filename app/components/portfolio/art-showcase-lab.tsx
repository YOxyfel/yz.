'use client'

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { artPieces, type ArtPiece } from './arsenal-art'
import { ArtPovFx } from './art-pov-fx'
import { ArtScreenFx, artCharacterGlow } from './art-screen-fx'
import { CatalogStrip, LabShell, LabTransition } from './arsenal-lab-shell'
import { LabFxControls, LabFxPreferencesProvider, useLabFxPreferences } from './lab-fx-preferences'
import { OffscreenAnimationFreeze } from './offscreen-animation-freeze'
import { usePointerBoundsCache } from './use-pointer-bounds-cache'

const accentRing: Record<ArtPiece['accent'], string> = {
  cyan: 'ring-cyan/35 shadow-[0_0_60px_-12px_oklch(0.84_0.16_200/0.5)] border-cyan/25',
  violet: 'ring-violet/35 shadow-[0_0_60px_-12px_oklch(0.55_0.24_295/0.5)] border-violet/25',
  amber: 'ring-amber-400/35 shadow-[0_0_60px_-12px_oklch(0.75_0.15_75/0.45)] border-amber-400/25',
}

const accentText: Record<ArtPiece['accent'], string> = {
  cyan: 'text-cyan',
  violet: 'text-violet',
  amber: 'text-amber-300',
}

const accentFrameBg: Record<ArtPiece['accent'], string> = {
  cyan: 'from-cyan-950/90 via-slate-900/85 to-black',
  violet: 'from-violet-950/90 via-indigo-950/80 to-black',
  amber: 'from-amber-950/85 via-stone-900/80 to-black',
}

const POV_CYCLE_MS = 2200
const POV_TRANSITION_S = 0.28

function ArtConsole({ piece }: { piece: ArtPiece }) {
  const [povIndex, setPovIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [autoCycle, setAutoCycle] = useState(false)
  const [transitionKey, setTransitionKey] = useState('0')
  const { showLabCardFx, isReduced } = useLabFxPreferences()
  const frameRef = useRef<HTMLDivElement>(null)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const readRaf = useRef(0)
  const writeRaf = useRef(0)
  const pendingPointer = useRef({ x: 0, y: 0 })
  const { boundsRef, refreshBounds } = usePointerBoundsCache(frameRef)
  const springX = useSpring(pointerX, { stiffness: 120, damping: 20 })
  const springY = useSpring(pointerY, { stiffness: 120, damping: 20 })
  const parallaxX = useTransform(springX, [-0.5, 0.5], [-12, 12])
  const parallaxY = useTransform(springY, [-0.5, 0.5], [-8, 8])

  const scheduleParallax = useCallback(
    (clientX: number, clientY: number) => {
      pendingPointer.current = { x: clientX, y: clientY }
      if (readRaf.current) return

      readRaf.current = requestAnimationFrame(() => {
        readRaf.current = 0
        const { left, top, width, height } = boundsRef.current
        const nx = (pendingPointer.current.x - left) / width - 0.5
        const ny = (pendingPointer.current.y - top) / height - 0.5

        if (!writeRaf.current) {
          writeRaf.current = requestAnimationFrame(() => {
            writeRaf.current = 0
            pointerX.set(nx)
            pointerY.set(ny)
          })
        }
      })
    },
    [boundsRef, pointerX, pointerY]
  )

  useEffect(() => {
    return () => {
      if (readRaf.current) cancelAnimationFrame(readRaf.current)
      if (writeRaf.current) cancelAnimationFrame(writeRaf.current)
    }
  }, [])

  const go = useCallback((step: number) => {
    setDirection(step)
    setPovIndex((current) => {
      const next = (current + step + piece.views.length) % piece.views.length
      setTransitionKey(`${piece.id}-${next}-${Date.now()}`)
      return next
    })
  }, [piece.id, piece.views.length])

  const selectPov = useCallback((index: number) => {
    setDirection(index > povIndex ? 1 : -1)
    setPovIndex(index)
    setTransitionKey(`${piece.id}-${index}-${Date.now()}`)
  }, [piece.id, povIndex])

  useEffect(() => {
    if (!autoCycle || isReduced) return
    const timer = window.setInterval(() => go(1), POV_CYCLE_MS)
    return () => window.clearInterval(timer)
  }, [autoCycle, go, isReduced])

  useEffect(() => {
    setPovIndex(0)
    setDirection(0)
    setAutoCycle(false)
    setTransitionKey(`${piece.id}-0-reset`)
  }, [piece.id])

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <OffscreenAnimationFreeze>
      <div
        ref={frameRef}
        className={`relative aspect-[4/5] overflow-hidden rounded-2xl border bg-gradient-to-b ring-1 ${accentFrameBg[piece.accent]} ${accentRing[piece.accent]}`}
        onPointerEnter={refreshBounds}
        onPointerMove={(event) => {
          if (isReduced || !showLabCardFx) return
          scheduleParallax(event.clientX, event.clientY)
        }}
        onPointerLeave={() => {
          pointerX.set(0)
          pointerY.set(0)
        }}
      >
        <ArtScreenFx active={showLabCardFx} accent={piece.accent} reduced={isReduced} />
        <ArtPovFx
          accent={piece.accent}
          cycling={autoCycle}
          transitionKey={transitionKey}
          active={showLabCardFx}
          reduced={isReduced}
        />

        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={`${piece.id}-${povIndex}`}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 64 : -64, scale: 0.96, rotateY: direction >= 0 ? -8 : 8 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -64 : 64, scale: 0.96, rotateY: direction >= 0 ? 8 : -8 }}
            transition={{ duration: POV_TRANSITION_S, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 [perspective:1000px]"
          >
            <motion.div
              className="absolute inset-0"
              style={{ x: parallaxX, y: parallaxY, filter: artCharacterGlow(piece.accent) }}
            >
              <Image
                src={piece.views[povIndex]}
                alt={`${piece.title} — ${piece.povLabels[povIndex]}`}
                fill
                className="object-contain p-2 sm:p-4"
                sizes="(max-width: 768px) 100vw, 45vw"
                priority={povIndex === 0}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous POV"
          className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[oklch(0.08_0.012_270/0.9)] text-foreground transition-colors hover:border-cyan/40 hover:text-cyan"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next POV"
          className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[oklch(0.08_0.012_270/0.9)] text-foreground transition-colors hover:border-cyan/40 hover:text-cyan"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-4 z-20 rounded-full border border-white/10 bg-[oklch(0.08_0.012_270/0.9)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {piece.povLabels[povIndex]} · {String(povIndex + 1).padStart(2, '0')} /{' '}
          {String(piece.views.length).padStart(2, '0')}
        </div>

        <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
          {piece.views.map((view, index) => (
            <button
              key={view}
              type="button"
              aria-label={`Show ${piece.povLabels[index]}`}
              onClick={() => selectPov(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === povIndex
                  ? `w-6 bg-current ${accentText[piece.accent]} shadow-[0_0_12px_currentColor] ${autoCycle ? 'art-pov-dot-active' : ''}`
                  : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
      </OffscreenAnimationFreeze>

      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-black/30 p-6">
        <div>
          <p className={`font-mono text-[10px] uppercase tracking-[0.35em] ${accentText[piece.accent]}`}>
            {piece.role} · Xianxia cultivation
          </p>
          <h4 className="font-heading mt-2 text-2xl font-bold tracking-tight">{piece.title}</h4>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{piece.description}</p>
        </div>

        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Multiview sheet
          </p>
          <div className="grid grid-cols-4 gap-2">
            {piece.views.map((view, index) => (
              <button
                key={view}
                type="button"
                onClick={() => selectPov(index)}
                className={`relative aspect-[3/4] overflow-hidden rounded-lg border transition-all ${
                  index === povIndex
                    ? `${accentRing[piece.accent]} scale-[1.02] ${autoCycle ? 'art-thumb-pulse' : ''}`
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={view}
                  alt={piece.povLabels[index]}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAutoCycle((value) => !value)}
          className={`relative inline-flex w-fit items-center gap-2 overflow-hidden rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
            autoCycle
              ? 'border-cyan/40 bg-cyan/10 text-cyan shadow-[0_0_24px_-8px_var(--cyan)]'
              : 'border-white/15 text-muted-foreground hover:border-white/30'
          }`}
        >
          {autoCycle ? (
            <span className="art-cycle-ring pointer-events-none absolute inset-0 rounded-full border border-cyan/30" aria-hidden />
          ) : null}
          {autoCycle ? <Pause className="relative h-4 w-4" /> : <Play className="relative h-4 w-4" />}
          <span className="relative">{autoCycle ? 'Stop cycle' : 'Cycle POVs'}</span>
        </button>
      </div>
    </div>
  )
}

function ArtShowcaseLabInner({ embedded = false }: { embedded?: boolean }) {
  const [selectedId, setSelectedId] = useState(artPieces[0].id)

  const selected = useMemo(
    () => artPieces.find((piece) => piece.id === selectedId) ?? artPieces[0],
    [selectedId]
  )

  const go = (step: number) => {
    const index = artPieces.findIndex((piece) => piece.id === selectedId)
    const next = artPieces[(index + step + artPieces.length) % artPieces.length]
    setSelectedId(next.id)
  }

  return (
    <LabShell
      embedded={embedded}
      eyebrow="Concept art · AI-assisted pipeline"
      title="Cultivation Gallery"
      description="Character sheets and gallery notes for Wang Cultivator—full write-up coming soon."
      icon={Sparkles}
      controls={<LabFxControls />}
    >
      <CatalogStrip
        items={artPieces}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
      />

      <LabTransition itemKey={selected.id}>
        <div className="mt-6">
          <ArtConsole piece={selected} />
        </div>
      </LabTransition>
    </LabShell>
  )
}

export function ArtShowcaseLab({ embedded = false }: { embedded?: boolean }) {
  return (
    <LabFxPreferencesProvider>
      <ArtShowcaseLabInner embedded={embedded} />
    </LabFxPreferencesProvider>
  )
}
