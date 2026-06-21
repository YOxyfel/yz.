'use client'

import { DeviceProfileProvider } from './device-profile'
import { SkyScrollFadeProvider } from './sky-scroll-fade'
import { SiteVariantProvider } from './site-variant-context'
import { VisualFxPreferencesProvider } from './visual-fx-preferences'
import { ExitIntentOffer } from './exit-intent-offer'
import { HashScrollBridge } from './hash-scroll-bridge'

export function PortfolioProviders({ children }: { children: React.ReactNode }) {
  return (
    <DeviceProfileProvider>
      <VisualFxPreferencesProvider>
        <SkyScrollFadeProvider>
          <SiteVariantProvider>
            <HashScrollBridge />
            {children}
            <ExitIntentOffer />
          </SiteVariantProvider>
        </SkyScrollFadeProvider>
      </VisualFxPreferencesProvider>
    </DeviceProfileProvider>
  )
}
