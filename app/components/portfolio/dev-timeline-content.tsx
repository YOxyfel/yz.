'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { StationChip, StationPanel } from './station-console'
import { devEras } from './dev-timeline-data'

function faceGradient(hue: [number, number]) {
  const [a, b] = hue
  return `linear-gradient(140deg, hsl(${a} 70% 22%), hsl(${b} 65% 14%) 60%, hsl(${a} 60% 8%))`
}

export function DevTimelineContent() {
  const eras = devEras
  const count = eras.length
  const [active, setActive] = useState(0)
  const stepRefs = useRef<Array<HTMLLIElement | null>>([])
  const lockRef = useRef(false)

  const step = 360 / count
  const radius = useMemo(() => {
    // Keep neighbouring faces from overlapping for any era count, but with only a
    // few faces the raw value collapses too small — clamp so the ring still reads
    // as a 3D carousel with the active era front and the others to the sides.
    const half = 165
    const raw = Math.round(half / Math.tan((step / 2) * (Math.PI / 180)))
    return Math.max(raw, 340)
  }, [step])

  // Scroll-driven selection: whichever era block is nearest the viewport centre
  // becomes the active era and rotates the ring into view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (obsEntries) => {
        if (lockRef.current) return
        const visible = obsEntries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const idx = Number((visible.target as HTMLElement).dataset.index)
        if (!Number.isNaN(idx)) setActive(idx)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    stepRefs.current.forEach((node) => node && observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(devEras.length - 1, idx))
    setActive(clamped)
    lockRef.current = true
    // Defer the scroll past React's commit. Jumping to the first/last entry
    // disables the Prev/Next button that was just clicked; that re-render plus
    // the focus blur on the now-disabled button cancels a smooth scroll issued
    // in the same tick, which left the ring rotated but the detail panel stuck
    // on the previous entry. Running it on the next frame lets the commit
    // settle first so the scroll actually sticks.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const node = stepRefs.current[clamped]
        if (!node) return
        // Compute the centred scroll target manually — smooth scrollIntoView is
        // unreliable when scrolling upward from the bottom (it can stick at max
        // scroll), which left the last era unreachable via the controls.
        const rect = node.getBoundingClientRect()
        const target = Math.max(
          0,
          rect.top + window.scrollY - (window.innerHeight - rect.height) / 2
        )
        window.scrollTo({ top: target, behavior: 'smooth' })
      })
    })
    window.setTimeout(() => {
      lockRef.current = false
    }, 900)
  }, [])

  const current = eras[active]

  return (
    <SitePageLayout
      breadcrumbs={[
        { name: 'Bridge', path: '' },
        { name: 'Timeline', path: '/timeline' },
      ]}
    >
      <SitePageHero
        eyebrow="Build log · git tags"
        title="Development timeline"
        description="Every release of this site, grouped by major version. Scroll the log and the matching era rotates into view — each card lists the sub-versions that shipped within it."
      />

      <div className="dev-timeline">
        <div className="dev-timeline-stage" aria-hidden>
          <div className="dev-ring-wrap">
            <div
              className="dev-ring"
              style={{ transform: `translateZ(-${radius}px) rotateY(${-active * step}deg)` }}
            >
              {eras.map((era, i) => {
                const dist = Math.min(Math.abs(i - active), count - Math.abs(i - active))
                const opacity = dist === 0 ? 1 : dist === 1 ? 0.4 : dist === 2 ? 0.14 : 0
                return (
                  <button
                    key={era.major}
                    type="button"
                    tabIndex={-1}
                    className={`dev-ring-face ${i === active ? 'is-active' : ''}`}
                    style={{
                      transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                      background: faceGradient(era.hue),
                      opacity,
                      pointerEvents: dist > 2 ? 'none' : 'auto',
                    }}
                    onClick={() => goTo(i)}
                  >
                    <span className="dev-face-version">{era.label}</span>
                    <span className="dev-face-title">{era.title}</span>
                    <span className="dev-face-phase">{era.releases.length} releases</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="dev-stage-readout">
            <span className="dev-stage-count">
              {String(active + 1).padStart(2, '0')} <span className="opacity-40">/ {String(count).padStart(2, '0')}</span>
            </span>
            <div className="dev-stage-controls">
              <button
                type="button"
                className="dev-stage-btn"
                aria-label="Previous era"
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="dev-stage-tag">{current.label}</span>
              <button
                type="button"
                className="dev-stage-btn"
                aria-label="Next era"
                onClick={() => goTo(active + 1)}
                disabled={active === count - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <ol className="dev-track">
          {eras.map((era, i) => (
            <li
              key={era.major}
              ref={(node) => {
                stepRefs.current[i] = node
              }}
              data-index={i}
              className={`dev-step ${i === active ? 'is-active' : ''}`}
            >
              <div className="dev-step-rail" aria-hidden>
                <span className="dev-step-dot" />
              </div>
              <StationPanel variant="module" backLabel={era.label} className="dev-step-panel">
                <div
                  className="dev-step-poster"
                  style={{ background: faceGradient(era.hue) }}
                  aria-hidden
                >
                  <span className="dev-step-poster-version">{era.label}</span>
                </div>
                <div className="relative z-[1]">
                  <div className="flex flex-wrap items-center gap-2">
                    <StationChip className="station-chip-active !text-[10px]">{era.label}.x</StationChip>
                    <StationChip className="!text-[10px]">{era.releases.length} releases</StationChip>
                  </div>
                  <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight">{era.title}</h2>
                  <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{era.summary}</p>

                  <ul className="mt-5 flex flex-col gap-2">
                    {era.releases.map((release) => (
                      <li
                        key={release.tag}
                        className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                      >
                        <span className="w-12 shrink-0 pt-0.5 font-mono text-[11px] tabular-nums text-cyan/80">
                          v{release.version}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-sm font-medium text-foreground">{release.title}</span>
                            <span className="rounded-full border border-white/10 px-1.5 py-px text-[9px] uppercase tracking-wider text-muted-foreground/70">
                              {release.phase}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs leading-snug text-muted-foreground/70">
                            {release.highlights.join(' · ')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </StationPanel>
            </li>
          ))}
        </ol>
      </div>
    </SitePageLayout>
  )
}
