'use client'

import { ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, Globe } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { SectionHeading } from './section-heading'
import { StationChip, StationPanel, StationScreen, StationSection } from './station-console'
import { useDeviceProfile } from './device-profile'
import { webProjects } from './web-projects-data'

const accentPanelClass: Record<(typeof webProjects)[number]['accent'], string> = {
  cyan: 'station-card-accent-cyan',
  violet: 'station-card-accent-violet',
  amber: 'station-card-accent-amber',
}

const accentText: Record<(typeof webProjects)[number]['accent'], string> = {
  cyan: 'text-cyan',
  violet: 'text-violet',
  amber: 'text-amber-300',
}

const accentScreenRing: Record<(typeof webProjects)[number]['accent'], string> = {
  cyan: 'shadow-[0_14px_46px_-18px_oklch(0.62_0.13_220/0.55)] transition-shadow duration-500 group-hover:shadow-[0_22px_64px_-14px_oklch(0.68_0.16_220/0.9)]',
  violet:
    'shadow-[0_14px_46px_-18px_oklch(0.55_0.14_285/0.55)] transition-shadow duration-500 group-hover:shadow-[0_22px_64px_-14px_oklch(0.66_0.16_285/0.95)]',
  amber: 'shadow-[0_14px_46px_-18px_oklch(0.7_0.14_80/0.5)] transition-shadow duration-500 group-hover:shadow-[0_22px_64px_-14px_oklch(0.78_0.16_80/0.85)]',
}

const accentCta: Record<(typeof webProjects)[number]['accent'], string> = {
  cyan: 'border-[oklch(0.7_0.13_220/0.55)] text-[oklch(0.88_0.1_220)]',
  violet: 'border-[oklch(0.72_0.14_285/0.55)] text-[oklch(0.88_0.1_285)]',
  amber: 'border-[oklch(0.78_0.14_80/0.55)] text-[oklch(0.88_0.12_80)]',
}

function WebProjectCard({
  project,
  flipDelay = 0,
}: {
  project: (typeof webProjects)[number]
  flipDelay?: number
}) {
  return (
    <div className="h-full">
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="station-card-link group"
      >
        <StationPanel
          variant="display"
          interactive
          fill
          flipDelay={flipDelay}
          backLabel="WEB-MOD"
          className={`flex h-full flex-col ${accentPanelClass[project.accent]}`}
        >
          <StationScreen className={`relative aspect-[16/10] overflow-hidden ${accentScreenRing[project.accent]}`}>
            {/* Faux browser chrome — reads as a real, live site */}
            <div className="absolute inset-x-0 top-0 z-[5] flex items-center border-b border-white/10 bg-[oklch(0.16_0.03_286)] px-3 py-2">
              <span className="truncate font-mono text-[10px] tracking-wide text-foreground/75">
                {project.domain}
              </span>
            </div>

            {project.embed ? (
              <div className="absolute inset-0 top-[34px] z-[1] overflow-hidden bg-[oklch(0.08_0.03_286)]">
                <iframe
                  src={project.embed}
                  title={`${project.title} live preview`}
                  loading="lazy"
                  tabIndex={-1}
                  aria-hidden
                  scrolling="no"
                  sandbox="allow-scripts allow-same-origin"
                  className="pointer-events-none absolute left-0 top-0 h-[250%] w-[250%] origin-top-left border-0 [transform:scale(0.4)]"
                />
              </div>
            ) : project.preview ? (
              <Image
                src={project.preview}
                alt={`${project.title} website preview`}
                fill
                className="relative z-[1] object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="relative z-[1] flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <Globe className={`h-10 w-10 ${accentText[project.accent]} opacity-80`} />
                <p className="font-mono text-sm tracking-widest text-muted-foreground">
                  {project.domain}
                </p>
              </div>
            )}

            <div className="station-screen-vignette" aria-hidden />

            {/* Hover call-to-action rising from the base */}
            <div className="absolute inset-x-0 bottom-0 top-[34px] z-[3] flex items-end justify-center bg-gradient-to-t from-[oklch(0.07_0.02_286/0.9)] via-[oklch(0.07_0.02_286/0.15)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span
                className={`mb-4 inline-flex items-center gap-1.5 rounded-full border bg-[oklch(0.12_0.03_286/0.85)] px-4 py-2 font-mono text-[11px] uppercase tracking-wider backdrop-blur-md ${accentCta[project.accent]}`}
              >
                Visit live site
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Live indicator badge */}
            <span className="absolute right-3 top-12 z-[4] inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[oklch(0.1_0.025_286/0.8)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/90 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.8_0.18_150)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.8_0.18_150)]" />
              </span>
              {project.embed ? 'Live' : 'Online'}
            </span>
          </StationScreen>

          <div className="station-screen-body flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`station-readout-label ${accentText[project.accent]}`}>
                  {project.client}
                </p>
                <h3 className="font-heading mt-1 text-lg font-bold tracking-tight">
                  {project.title}
                </h3>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.stack.map((item) => (
                <StationChip key={item}>{item}</StationChip>
              ))}
            </div>
          </div>
        </StationPanel>
      </a>
    </div>
  )
}

function WebProjectsCarousel({ animate = true }: { animate?: boolean }) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const count = webProjects.length

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + count) % count)
  }, [count])

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % count)
  }, [count])

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartX.current
    const end = event.changedTouches[0]?.clientX
    touchStartX.current = null
    if (start == null || end == null) return
    const delta = end - start
    if (Math.abs(delta) < 40) return
    if (delta < 0) goNext()
    else goPrev()
  }

  return (
    <div className="web-projects-carousel relative mt-14 w-full">
      <div className="relative">
        {/* Soft nebula aura radiating outward from behind the card */}
        <div
          className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.75rem] bg-[radial-gradient(58%_60%_at_50%_50%,oklch(0.46_0.14_285/0.3),transparent_74%)] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -inset-x-10 inset-y-4 -z-10 bg-[radial-gradient(40%_70%_at_0%_50%,oklch(0.4_0.12_285/0.28),transparent_70%),radial-gradient(40%_70%_at_100%_50%,oklch(0.4_0.12_285/0.28),transparent_70%)] blur-2xl"
          aria-hidden
        />

        <div
          className="relative overflow-hidden rounded-[1.4rem]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={`flex ${animate ? 'transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]' : ''}`}
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {webProjects.map((project) => (
              <div key={project.id} className="w-full shrink-0 px-0.5 pb-1" aria-hidden={project.id !== webProjects[index]!.id}>
                <WebProjectCard project={project} flipDelay={0} />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous project"
          className="group/arrow absolute left-2 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full transition-transform duration-300 hover:scale-110 active:scale-95 sm:left-4 sm:h-14 sm:w-14"
        >
          <span
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.7_0.13_285/0.4),transparent_68%)] opacity-50 blur-md transition-opacity duration-300 group-hover/arrow:opacity-100"
            aria-hidden
          />
          <span
            className="absolute inset-1.5 rounded-full border border-[oklch(0.7_0.12_285/0.22)] bg-[oklch(0.12_0.03_286/0.45)] backdrop-blur-sm transition-colors duration-300 group-hover/arrow:border-[oklch(0.78_0.14_285/0.6)]"
            aria-hidden
          />
          <ChevronLeft className="relative h-5 w-5 text-[oklch(0.88_0.07_285)] drop-shadow-[0_0_8px_oklch(0.72_0.14_285/0.85)] transition-transform duration-300 group-hover/arrow:-translate-x-1" />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next project"
          className="group/arrow absolute right-2 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full transition-transform duration-300 hover:scale-110 active:scale-95 sm:right-4 sm:h-14 sm:w-14"
        >
          <span
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.7_0.13_285/0.4),transparent_68%)] opacity-50 blur-md transition-opacity duration-300 group-hover/arrow:opacity-100"
            aria-hidden
          />
          <span
            className="absolute inset-1.5 rounded-full border border-[oklch(0.7_0.12_285/0.22)] bg-[oklch(0.12_0.03_286/0.45)] backdrop-blur-sm transition-colors duration-300 group-hover/arrow:border-[oklch(0.78_0.14_285/0.6)]"
            aria-hidden
          />
          <ChevronRight className="relative h-5 w-5 text-[oklch(0.88_0.07_285)] drop-shadow-[0_0_8px_oklch(0.72_0.14_285/0.85)] transition-transform duration-300 group-hover/arrow:translate-x-1" />
        </button>
      </div>

      {/* Constellation progress */}
      <div className="mt-8 flex items-center justify-center gap-3">
        {webProjects.map((project, dotIndex) => (
          <button
            key={project.id}
            type="button"
            aria-label={`Show ${project.title}`}
            aria-current={dotIndex === index}
            onClick={() => setIndex(dotIndex)}
            className="group/dot grid h-5 w-5 place-items-center"
          >
            <span
              className={`rounded-full transition-all duration-500 ${
                dotIndex === index
                  ? 'h-2.5 w-2.5 bg-[oklch(0.85_0.11_285)] shadow-[0_0_14px_3px_oklch(0.72_0.14_285/0.7)]'
                  : 'h-1.5 w-1.5 bg-[oklch(0.55_0.05_285/0.55)] group-hover/dot:h-2 group-hover/dot:w-2 group-hover/dot:bg-[oklch(0.75_0.1_285/0.8)]'
              }`}
            />
          </button>
        ))}
      </div>

      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
        <span className="text-[oklch(0.82_0.1_285)]">{String(index + 1).padStart(2, '0')}</span>
        <span className="mx-2 text-[oklch(0.7_0.12_285)]">✦</span>
        {String(count).padStart(2, '0')}
      </p>
    </div>
  )
}

type WebStackSectionProps = {
  /** Render without the outer StationSection + heading (used as an Arsenal tab). */
  embedded?: boolean
}

export function WebStackSection({ embedded = false }: WebStackSectionProps = {}) {
  const { mobilePerfCut } = useDeviceProfile()

  const projectsGrid = mobilePerfCut ? (
    <div className={`${embedded ? 'mt-2' : 'mt-14'} grid gap-6`}>
      {webProjects.map((project) => (
        <WebProjectCard key={project.id} project={project} flipDelay={0} />
      ))}
    </div>
  ) : (
    <WebProjectsCarousel />
  )

  if (embedded) {
    return <div className="web-stack-embedded">{projectsGrid}</div>
  }

  return (
    <StationSection id="stack" tone="stack">
      <SectionHeading
        tone="stack"
        align="center"
        eyebrow="05 — Web Stack Bay"
        title="The Full Stack Flex"
        description="When I'm not in the engine, I ship fast, polished web experiences — from client WordPress builds to custom frontends."
      />

      {projectsGrid}
    </StationSection>
  )
}
