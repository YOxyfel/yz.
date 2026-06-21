'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { Clock, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import type { Project } from './projects-data'
import { StationChip, StationPanel } from './station-console'

type ProjectModalProps = {
  project: Project | null
  onClose: () => void
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const t = useTranslations('Projects')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    if (project) {
      document.addEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [project, onClose])

  const modal = (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          data-portfolio-chrome
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="mobile-solid-backdrop absolute inset-0 bg-background/88 md:bg-background/80 md:backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} architecture`}
            className="project-modal-dialog station-panel station-display-bezel relative z-10 w-full max-w-4xl p-2"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="station-button station-button-secondary absolute right-5 top-5 z-20 !h-9 !w-9 !p-0"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="project-modal-body">
              <div className="project-modal-media group relative aspect-video w-full shrink-0 overflow-hidden rounded-[0.35rem] border border-black/55">
                <Image
                  src={project.image}
                  alt={`${project.title} gameplay`}
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="relative z-[1] object-cover"
                />
                <div className="station-screen-vignette" aria-hidden />
                {project.comingSoon ? (
                  <div className="absolute inset-0 z-[4] flex items-center justify-center bg-background/45">
                    <StationChip className="station-chip-active !text-[10px]">{t('comingSoonLabel')}</StationChip>
                  </div>
                ) : (
                  <button
                    aria-label="Play showreel"
                    className="absolute inset-0 z-[4] flex items-center justify-center"
                  >
                    <span className="station-button station-button-primary !h-16 !w-16 !rounded-full !p-0">
                      <Play className="ml-1 h-6 w-6 fill-current" />
                    </span>
                  </button>
                )}
              </div>

              <div className="p-6 sm:p-8">
                <p className="station-readout-label">
                  {project.subtitle} · {project.year}
                </p>
                <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  {project.title}
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {project.highlights.map((item) => (
                    <StationPanel key={item.label} variant="module" iso={false} className="station-panel-compact">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 font-medium text-foreground">{item.value}</p>
                    </StationPanel>
                  ))}
                </div>

                <p className="mt-6 leading-relaxed text-muted-foreground">
                  {project.summary}
                </p>

                {project.comingSoon ? (
                  <StationPanel variant="module" iso={false} className="mt-8">
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-cyan/80" aria-hidden />
                      <div>
                        <p className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                          {t('comingSoonTitle')}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {project.modalNote ?? t('comingSoonBody')}
                        </p>
                      </div>
                    </div>
                  </StationPanel>
                ) : null}

                <h3 className="font-heading mt-8 text-sm font-semibold uppercase tracking-wider text-foreground">
                  {project.comingSoon ? t('comingSoonChecklistTitle') : t('highlightsTitle')}
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {project.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet shadow-[0_0_8px_var(--violet)]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {!project.comingSoon && project.code ? (
                  <>
                    <h3 className="font-heading mt-8 text-sm font-semibold uppercase tracking-wider text-foreground">
                      {t('codeSampleTitle')}
                    </h3>
                    <div className="project-modal-code mt-4 overflow-hidden rounded-[0.35rem] border border-black/55 bg-[linear-gradient(180deg,var(--station-screen),oklch(0.12_0.022_258))]">
                      <div className="flex items-center gap-1.5 border-b border-[var(--station-bezel)]/40 px-4 py-3">
                        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                      </div>
                      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed">
                        <code className="font-mono text-cyan/90">{project.code}</code>
                      </pre>
                    </div>
                  </>
                ) : null}

                <div className="mt-8 flex flex-wrap gap-2">
                  {project.tech.map((tag) => (
                    <StationChip key={tag}>{tag}</StationChip>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  if (!mounted) return null
  return createPortal(modal, document.body)
}
