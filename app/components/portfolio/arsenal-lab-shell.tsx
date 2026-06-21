'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Box,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { StationChip, StationLed, StationPanel } from './station-console'

type CatalogStripProps<T extends { id: string; title: string }> = {
  items: T[]
  selectedId: string
  onSelect: (id: string) => void
  onPrev: () => void
  onNext: () => void
}

export function CatalogStrip<T extends { id: string; title: string }>({
  items,
  selectedId,
  onSelect,
  onPrev,
  onNext,
}: CatalogStripProps<T>) {
  const index = items.findIndex((item) => item.id === selectedId)

  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`station-chip transition-all ${
              item.id === selectedId ? 'station-chip-active' : ''
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous item"
          className="station-button station-button-secondary !h-10 !w-10 !p-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-[4.5rem] text-center font-mono text-xs tracking-widest text-muted-foreground">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next item"
          className="station-button station-button-secondary !h-10 !w-10 !p-0"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

type LabShellProps = {
  eyebrow: string
  title: string
  description: string
  icon: typeof Box
  children: ReactNode
  controls?: ReactNode
  embedded?: boolean
}

export function LabShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  controls,
  embedded = false,
}: LabShellProps) {
  return (
    <div className={embedded ? 'mt-0' : 'mt-20'}>
      <StationPanel variant="display" iso={false} flipOnView={false} backLabel="LAB-BAY">
        {!embedded ? (
          <div className="relative z-[1] max-w-3xl">
            <p className="station-readout-label flex items-center gap-2">
              <Icon className="h-3.5 w-3.5" />
              <StationLed active />
              <span>
                <span className="station-bracket">[</span>
                {eyebrow}
                <span className="station-bracket">]</span>
              </span>
            </p>
            <h3 className="font-heading mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h3>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{description}</p>
          </div>
        ) : null}
        {controls}
        <div className={`relative z-[1] ${embedded ? 'mt-0' : 'mt-8'}`}>{children}</div>
      </StationPanel>
    </div>
  )
}

export function LabTransition({ itemKey, children }: { itemKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={itemKey}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
