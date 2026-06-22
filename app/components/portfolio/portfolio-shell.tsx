'use client'

import { BackgroundFx } from './background-fx'
import { ConstellationProvider } from './constellation-context'
import { CornerToolsDock } from './corner-tools-dock'
import { NavScrollSentinel } from './nav-scroll-sentinel'
import { SiteFooter } from './site-footer'
import { SiteNav } from './site-nav'
import { SiteVariantShell } from './site-variant-shell'
import { StationDeckShell } from './station-deck-shell'

export function PortfolioShell({ children }: { children: React.ReactNode }) {
  return (
    <ConstellationProvider>
      <BackgroundFx />
      <SiteVariantShell>
        <StationDeckShell>
          <NavScrollSentinel />
          <SiteNav />
          {children}
          <SiteFooter />
        </StationDeckShell>
      </SiteVariantShell>
      <CornerToolsDock />
    </ConstellationProvider>
  )
}
