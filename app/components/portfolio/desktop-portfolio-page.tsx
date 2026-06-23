'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { BackgroundFx } from './background-fx'
import { ConstellationProvider, useConstellationChrome } from './constellation-context'
import { CornerToolsDock } from './corner-tools-dock'
import { useDeviceProfile } from './device-profile'
import { resolveSkyLabFx } from './sky-lab-fx'
import { useVisualFxPreferences } from './visual-fx-preferences'
import { Hero } from './hero'
import { PortfolioProviders } from './portfolio-providers'
import { SiteNav } from './site-nav'
import { SiteVariantShell } from './site-variant-shell'
import { useSiteVariant } from './site-variant-context'
import { HeroVisibilityBridge } from './hero-visibility-bridge'
import { LazySection } from './lazy-section'
import { NavScrollSentinel } from './nav-scroll-sentinel'
import { StationDeckShell } from './station-deck-shell'

const HomeHubSection = dynamic(
  () => import('./home-hub-section').then((mod) => ({ default: mod.HomeHubSection })),
  { ssr: true }
)

const ProjectsSection = dynamic(
  () => import('./projects-section').then((mod) => ({ default: mod.ProjectsSection })),
  { ssr: true }
)

const SocialProofSection = dynamic(
  () => import('./social-proof-section').then((mod) => ({ default: mod.SocialProofSection })),
  { ssr: true }
)

const TestimonialsSection = dynamic(
  () => import('./testimonials-section').then((mod) => ({ default: mod.TestimonialsSection })),
  { ssr: true }
)

const FaqSection = dynamic(
  () => import('./faq-section').then((mod) => ({ default: mod.FaqSection })),
  { ssr: true }
)

const ContactSection = dynamic(
  () => import('./contact-section').then((mod) => ({ default: mod.ContactSection })),
  { ssr: true }
)

const SiteFooter = dynamic(
  () => import('./site-footer').then((mod) => ({ default: mod.SiteFooter })),
  { ssr: true }
)

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

function DesktopPortfolioContent() {
  const { variant } = useSiteVariant()
  const { constellationLabEnabled, mobileSkyLabMode } = useConstellationChrome()
  const { fxLite } = useDeviceProfile()
  const { showScreenFx, isReduced } = useVisualFxPreferences()
  const { skyLabFxTier } = resolveSkyLabFx(showScreenFx, isReduced, fxLite)

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
      <HeroVisibilityBridge />
      <BackgroundFx />

      <SiteVariantShell>
        {!mobileSkyLabMode ? (
          <StationDeckShell>
            <NavScrollSentinel />
            <SiteNav />
            <Hero />
            <LazySection minHeight="min(36vh, 420px)" anchorId="explore">
              <HomeHubSection />
            </LazySection>
            <LazySection minHeight="min(56vh, 640px)" anchorId="engine">
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
            <LazySection minHeight="min(32vh, 420px)" anchorId="faq">
              <FaqSection />
            </LazySection>
            <LazySection minHeight="min(40vh, 480px)" anchorId="contact">
              <ContactSection />
            </LazySection>
            <LazySection minHeight="min(24vh, 320px)">
              <SiteFooter />
            </LazySection>
          </StationDeckShell>
        ) : null}
      </SiteVariantShell>

      <CornerToolsDock />
      {constellationLabEnabled ? <SkyDecorLayer /> : null}
      {!mobileSkyLabMode && constellationLabEnabled ? <ConstellationPanel /> : null}
    </>
  )
}

export function DesktopPortfolioPage() {
  return (
    <PortfolioProviders>
      <ConstellationProvider>
        <DesktopPortfolioContent />
      </ConstellationProvider>
    </PortfolioProviders>
  )
}
