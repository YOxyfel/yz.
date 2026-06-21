'use client'

import type { ReactNode } from 'react'
import { StationDeckBackdrop } from './station-deck-backdrop'

export function StationDeckShell({ children }: { children: ReactNode }) {
  return (
    <>
      <StationDeckBackdrop />
      <main className="station-deck relative min-h-dvh text-foreground">
        <div className="station-deck-surface" data-portfolio-chrome>
          {children}
        </div>
      </main>
    </>
  )
}
