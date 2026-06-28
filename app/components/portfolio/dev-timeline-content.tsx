'use client'

import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { StationChip, StationPanel } from './station-console'
import { devTimeline, type DevTimelineEntry } from './dev-timeline-data'

function faceGradient(entry: DevTimelineEntry) {
  const [a, b] = entry.hue
  return `linear-gradient(140deg, hsl(${a} 70% 22%), hsl(${b} 65% 14%) 60%, hsl(${a} 60% 8%))`
}

export function DevTimelineContent() {
  const entries = devTimeline
  const count = entries.length
  const [active, setActive] = useState(0)
  const stepRefs = useRef<Array<HTMLLIElement | null>>([])
  const lockRef = useRef(false)

  const step = 360 / count
  const radius = useMemo(() => {
    // Keep neighbouring faces from overlapping for any version count.
    const half = 165
    return Math.round(half / Math.tan((step / 2) * (Math.PI / 180)))
  }, [step])

  // Scroll-driven selection: whichever step block is nearest the viewport
  // centre becomes the active iteration and rotates the ring into view.
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
    const clamped = Math.max(0, Math.min(devTimeline.length - 1, idx))
    setActive(clamped)
    const node = stepRefs.current[clamped]
    if (node) {
      lockRef.current = true
      // Compute the centred scroll target manually — smooth scrollIntoView is
      // unreliable when scrolling upward from the bottom (it can stick at max
      // scroll), which left the last version unreachable via the controls.
      const rect = node.getBoundingClientRect()
      const target = Math.max(
        0,
        rect.top + window.scrollY - (window.innerHeight - rect.height) / 2
      )
      window.scrollTo({ top: target, behavior: 'smooth' })
      window.setTimeout(() => {
        lockRef.current = false
      }, 800)
    }
  }, [])

  const current = entries[active]

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
        description="Every release of this site, tied to its git tag. Scroll the log and the matching iteration rotates into view — or use the controls to jump between versions."
      />

      <div className="dev-timeline">
        <div className="dev-timeline-stage" aria-hidden>
          <div className="dev-ring-wrap">
            <div
              className="dev-ring"
              style={{ transform: `translateZ(-${radius}px) rotateY(${-active * step}deg)` }}
            >
              {entries.map((entry, i) => {
                const dist = Math.min(Math.abs(i - active), count - Math.abs(i - active))
                const opacity = dist === 0 ? 1 : dist === 1 ? 0.4 : dist === 2 ? 0.14 : 0
                return (
                <button
                  key={entry.tag}
                  type="button"
                  tabIndex={-1}
                  className={`dev-ring-face ${i === active ? 'is-active' : ''}`}
                  style={{
                    transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                    background: faceGradient(entry),
                    opacity,
                    pointerEvents: dist > 2 ? 'none' : 'auto',
                  }}
                  onClick={() => goTo(i)}
                >
                  {entry.shot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.shot} alt="" className="dev-face-shot" />
                  ) : null}
                  <span className="dev-face-version">v{entry.version}</span>
                  <span className="dev-face-title">{entry.title}</span>
                  <span className="dev-face-phase">{entry.phase}</span>
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
                aria-label="Previous version"
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="dev-stage-tag">{current.tag}</span>
              <button
                type="button"
                className="dev-stage-btn"
                aria-label="Next version"
                onClick={() => goTo(active + 1)}
                disabled={active === count - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <ol className="dev-track">
          {entries.map((entry, i) => (
            <li
              key={entry.tag}
              ref={(node) => {
                stepRefs.current[i] = node
              }}
              data-index={i}
              className={`dev-step ${i === active ? 'is-active' : ''}`}
            >
              <div className="dev-step-rail" aria-hidden>
                <span className="dev-step-dot" />
              </div>
              <StationPanel variant="module" backLabel={`v${entry.version}`} className="dev-step-panel">
                <div
                  className="dev-step-poster"
                  style={{ background: faceGradient(entry) }}
                  aria-hidden
                >
                  <span className="dev-step-poster-version">v{entry.version}</span>
                </div>
                <div className="relative z-[1]">
                  <div className="flex flex-wrap items-center gap-2">
                    <StationChip className="station-chip-active !text-[10px]">{entry.tag}</StationChip>
                    <StationChip className="!text-[10px]">{entry.phase}</StationChip>
                  </div>
                  <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight">{entry.title}</h2>
                  <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{entry.summary}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {entry.highlights.map((h) => (
                      <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan/80" aria-hidden />
                        {h}
                      </li>
                    ))}
                  </ul>
                  {entry.url ? (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="station-button station-button-ghost mt-5 inline-flex items-center gap-2 !text-[11px]"
                    >
                      Visit this build
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </StationPanel>
            </li>
          ))}
        </ol>
      </div>
    </SitePageLayout>
  )
}
