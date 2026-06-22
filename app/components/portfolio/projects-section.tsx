'use client'

import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageCtaPanel } from './page-cta-panel'
import { ProjectModal } from './project-modal'
import { projects } from './projects-data'
import { SectionHeading } from './section-heading'
import { StationChip, StationPanel, StationScreen, StationSection } from './station-console'

export function ProjectsSection() {
  const t = useTranslations('Projects')
  const [selectedProject, setSelectedProject] =
    useState<(typeof projects)[number] | null>(null)

  return (
    <StationSection id="engine" tone="engine" className="perf-deferred-section">
      <SectionHeading
        tone="engine"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        {projects.map((project, index) => (
          <div key={project.id}>
            <StationPanel
              variant="display"
              interactive
              fill
              backLabel={`PRJ-${String(index + 1).padStart(2, '0')}`}
              className="group relative cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <StationScreen className="relative aspect-[16/10]">
                <Image
                  src={project.image}
                  alt={`${project.title} key art`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 50vw"
                  className="relative z-[1] object-cover"
                />
                <div className="station-screen-vignette" aria-hidden />
                <StationChip className="station-screen-badge absolute right-3 top-3">
                  {project.year}
                </StationChip>
              </StationScreen>

              <div className="station-screen-body">
                <p className="station-readout-label">{project.subtitle}</p>
                <h3 className="font-heading mt-2 text-2xl font-bold tracking-tight">
                  {project.title}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.slice(0, 3).map((tag) => (
                    <StationChip key={tag}>{tag}</StationChip>
                  ))}
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors group-hover:text-cyan">
                  {project.cardCta ?? t('defaultCardCta')}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </StationPanel>
          </div>
        ))}
      </div>

      <PageCtaPanel className="mt-12" backLabel="SCOPE" />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </StationSection>
  )
}
