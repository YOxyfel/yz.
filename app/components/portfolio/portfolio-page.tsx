'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { BackgroundFx } from './background-fx'
import { ConstellationProvider, useConstellationChrome } from './constellation-context'
import { CornerToolsDock } from './corner-tools-dock'
import { useDeviceProfile } from './device-profile'
import { resolveSkyLabFx } from './sky-lab-fx'
import { useVisualFxPreferences } from './visual-fx-preferences'
import { FaqSection } from './faq-section'
import { Hero } from './hero'
import { HomeHubSection } from './home-hub-section'
import { ProjectsSection } from './projects-section'
import { ContactSection } from './contact-section'
import { SiteFooter } from './site-footer'
import { SiteNav } from './site-nav'
import { SocialProofSection } from './social-proof-section'
import { TestimonialsSection } from './testimonials-section'
import { SiteVariantShell } from './site-variant-shell'
import { useSiteVariant } from './site-variant-context'
import { LazySection } from './lazy-section'
import { StationDeckShell } from './station-deck-shell'

const SkyDecorLayer = dynamic(
  () => import('./sky-decor-layer').then((mod) => ({ default: mod.SkyDecorLayer })),
  { ssr: false }
)

const ConstellationPanel = dynamic(
  () => import('./constellation-panel').then((mod) => ({ default: mod.ConstellationPanel })),
  { ssr: false }
)

const ArsenalSection = dynamic(
  () => import('./arsenal-section').then((mod) => ({ default: mod.ArsenalSection })),
  {
    loading: () => (
      <div
        id="arsenal"
        className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-6 py-24 font-mono text-xs uppercase tracking-widest text-muted-foreground"
      >
        Loading arsenal bay…
      </div>
    ),
  }
)

const WebStackSection = dynamic(
  () => import('./web-stack-section').then((mod) => ({ default: mod.WebStackSection })),
  {
    loading: () => (
      <div className="mx-auto flex min-h-[32vh] max-w-6xl items-center justify-center px-6 py-16 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Loading stack…
      </div>
    ),
  }
)

function PortfolioContent() {
  const { variant } = useSiteVariant()
  const { constellationLabEnabled, skyViewMode, mobileSkyLabMode } = useConstellationChrome()
  const deviceProfile = useDeviceProfile()
  const { showScreenFx, isReduced } = useVisualFxPreferences()
  const { skyLabFxTier } = resolveSkyLabFx(showScreenFx, isReduced, deviceProfile.fxLite)

  useEffect(() => {
    document.documentElement.dataset.siteVariant = variant
  }, [variant])

  useEffect(() => {
    document.documentElement.dataset.constellationLab = constellationLabEnabled ? 'on' : 'off'
    return () => {
      delete document.documentElement.dataset.constellationLab
    }
  }, [constellationLabEnabled])

  useEffect(() => {
    document.documentElement.dataset.mobileSkyLab = mobileSkyLabMode ? 'on' : 'off'
    return () => {
      delete document.documentElement.dataset.mobileSkyLab
    }
  }, [mobileSkyLabMode])

  useEffect(() => {
    document.documentElement.dataset.skyLabFx = constellationLabEnabled ? skyLabFxTier : 'idle'
    return () => {
      delete document.documentElement.dataset.skyLabFx
    }
  }, [constellationLabEnabled, skyLabFxTier])

  useEffect(() => {
    if (!mobileSkyLabMode) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileSkyLabMode])

  return (
    <>
      <BackgroundFx />

      <SiteVariantShell>
        {!mobileSkyLabMode ? (
          <StationDeckShell>
            <SiteNav />
            <Hero />
            <HomeHubSection />
            <LazySection minHeight="min(56vh, 640px)">
              <ProjectsSection />
            </LazySection>
            <LazySection minHeight="min(40vh, 520px)">
              <SocialProofSection />
            </LazySection>
            <LazySection minHeight="min(36vh, 480px)">
              <TestimonialsSection />
            </LazySection>
            <LazySection minHeight="min(72vh, 720px)">
              <ArsenalSection />
            </LazySection>
            <LazySection minHeight="min(48vh, 560px)">
              <WebStackSection />
            </LazySection>
            <LazySection minHeight="min(32vh, 420px)">
              <FaqSection />
            </LazySection>
            <LazySection minHeight="min(40vh, 480px)">
              <ContactSection />
            </LazySection>
            <SiteFooter />
          </StationDeckShell>
        ) : null}
      </SiteVariantShell>

      <CornerToolsDock />
      <SkyDecorLayer />
      {!mobileSkyLabMode ? <ConstellationPanel /> : null}
    </>
  )
}

export function PortfolioPage() {
  return (
    <ConstellationProvider>
      <PortfolioContent />
    </ConstellationProvider>
  )
}
