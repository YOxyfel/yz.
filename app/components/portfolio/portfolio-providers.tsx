'use client'

import { DeviceProfileProvider, useDeviceProfile } from './device-profile'
import { SkyScrollFadeProvider } from './sky-scroll-fade'
import { SiteVariantProvider } from './site-variant-context'
import { VisualFxPreferencesProvider } from './visual-fx-preferences'
import { ExitIntentOffer } from './exit-intent-offer'
import { HashScrollBridge } from './hash-scroll-bridge'

function DesktopPortfolioProviders({ children }: { children: React.ReactNode }) {
  return (
    <VisualFxPreferencesProvider>
      <SkyScrollFadeProvider>
        <SiteVariantProvider>
          <HashScrollBridge />
          {children}
          <ExitIntentOffer />
        </SiteVariantProvider>
      </SkyScrollFadeProvider>
    </VisualFxPreferencesProvider>
  )
}

function PortfolioProvidersInner({ children }: { children: React.ReactNode }) {
  const { mobilePerfCut } = useDeviceProfile()

  if (mobilePerfCut) {
    return <>{children}</>
  }

  return <DesktopPortfolioProviders>{children}</DesktopPortfolioProviders>
}

export function PortfolioProviders({ children }: { children: React.ReactNode }) {
  return (
    <DeviceProfileProvider>
      <PortfolioProvidersInner>{children}</PortfolioProvidersInner>
    </DeviceProfileProvider>
  )
}
