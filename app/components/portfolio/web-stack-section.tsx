'use client'

import { ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, Globe } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { SectionHeading } from './section-heading'
import { StationChip, StationPanel, StationScreen, StationSection } from './station-console'
import { useDeviceProfile } from './device-profile'
import { githubShowcase, webProjects } from './web-projects-data'

const stack = [
  'WordPress',
  'CSS',
  'HTML',
  'JavaScript',
  'Java',
  'C++',
  'C#',
  'Lua',
  'Figma',
  'GitHub',
  'Cursor',
  'AI-assisted pipelines',
]

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
          <StationScreen className="relative aspect-[16/10]">
            {project.preview ? (
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
            <StationChip className="station-screen-badge absolute right-3 top-3">Live uplink</StationChip>
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

function WebProjectsCarousel() {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + webProjects.length) % webProjects.length)
  }, [])

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % webProjects.length)
  }, [])

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
    <div className="web-projects-carousel mt-14">
      <div
        className="relative overflow-hidden rounded-[1rem] border border-[var(--station-bezel)]/50 bg-[var(--station-hull-dark)]/40 p-1 shadow-[inset_0_1px_0_oklch(0.5_0.04_245/0.2),0_12px_36px_-16px_oklch(0_0_0/0.75)]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <WebProjectCard project={webProjects[index]!} flipDelay={0} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous project"
          className="station-button station-button-secondary !h-10 !w-10 !p-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex flex-1 items-center justify-center gap-1.5">
          {webProjects.map((project, dotIndex) => (
            <button
              key={project.id}
              type="button"
              aria-label={`Show ${project.title}`}
              aria-current={dotIndex === index}
              onClick={() => setIndex(dotIndex)}
              className={`h-1.5 rounded-full transition-all ${
                dotIndex === index
                  ? 'w-6 bg-cyan shadow-[0_0_10px_var(--cyan)]'
                  : 'w-1.5 bg-[var(--station-bezel)]'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next project"
          className="station-button station-button-secondary !h-10 !w-10 !p-0"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {String(index + 1).padStart(2, '0')} / {String(webProjects.length).padStart(2, '0')}
      </p>
    </div>
  )
}

function GitHubShowcaseCard() {
  return (
    <div className="mt-14">
      <a
        href={githubShowcase.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <StationPanel
          variant="display"
          interactive
          fill
          flipDelay={0.12}
          backLabel="GIT-UPLINK"
        >
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <StationScreen className="station-screen-hover-soft relative min-h-[220px] lg:min-h-[280px]">
              <Image
                src={githubShowcase.preview}
                alt="GitHub profile preview"
                fill
                unoptimized
                className="relative z-[1] object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="station-screen-vignette" aria-hidden />
            </StationScreen>
            <div className="relative z-[2] flex flex-col justify-center rounded-[0.4rem] bg-[var(--station-hull-dark)] px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
              <p className="station-readout-label">Open source uplink</p>
              <h3 className="font-heading mt-2 text-2xl font-bold tracking-tight">
                {githubShowcase.title}
              </h3>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {githubShowcase.handle}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {githubShowcase.description}
              </p>
              <span className="mt-5 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan">
                View profile
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </StationPanel>
      </a>
    </div>
  )
}

export function WebStackSection() {
  const { mobilePerfCut, isNarrow } = useDeviceProfile()

  return (
    <StationSection id="stack" tone="stack">
      <SectionHeading
        tone="stack"
        align="center"
        eyebrow="05 — Web Stack Bay"
        title="The Full Stack Flex"
        description="When I'm not in the engine, I ship fast, polished web experiences — from client WordPress builds to custom frontends."
      />

      {mobilePerfCut ? (
        <div className="mt-14 grid gap-6">
          {webProjects.map((project) => (
            <WebProjectCard key={project.id} project={project} flipDelay={0} />
          ))}
        </div>
      ) : isNarrow ? (
        <WebProjectsCarousel />
      ) : (
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {webProjects.map((project, index) => (
            <WebProjectCard key={project.id} project={project} flipDelay={index * 0.08} />
          ))}
        </div>
      )}

      <GitHubShowcaseCard />

      <div className="mt-14 flex flex-wrap justify-center gap-3">
        {stack.map((item) => (
          <StationChip key={item} className="whitespace-nowrap !px-5 !py-2.5 !text-xs">
            <span className="station-led station-led-cyan station-led-on" />
            {item}
          </StationChip>
        ))}
      </div>
    </StationSection>
  )
}
