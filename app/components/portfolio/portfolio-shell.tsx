'use client'

import { BackgroundFx } from './background-fx'
import { ConstellationProvider } from './constellation-context'
import { CornerToolsDock } from './corner-tools-dock'
import { SiteFooter } from './site-footer'
import { SiteNav } from './site-nav'
import { SiteVariantShell } from './site-variant-shell'

export function PortfolioShell({ children }: { children: React.ReactNode }) {
  return (
    <ConstellationProvider>
      <BackgroundFx />
      <SiteVariantShell>
        <main
          className="station-deck relative min-h-dvh text-foreground"
          data-portfolio-chrome
        >
          <SiteNav />
          {children}
          <SiteFooter />
        </main>
      </SiteVariantShell>
      <CornerToolsDock />
    </ConstellationProvider>
  )
}
