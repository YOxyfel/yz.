'use client'

import { DeviceProfileProvider } from './device-profile'
import { SkyScrollFadeProvider } from './sky-scroll-fade'
import { SiteVariantProvider } from './site-variant-context'
import { VisualFxPreferencesProvider } from './visual-fx-preferences'

export function PortfolioProviders({ children }: { children: React.ReactNode }) {
  return (
    <DeviceProfileProvider>
      <VisualFxPreferencesProvider>
        <SkyScrollFadeProvider>
          <SiteVariantProvider>{children}</SiteVariantProvider>
        </SkyScrollFadeProvider>
      </VisualFxPreferencesProvider>
    </DeviceProfileProvider>
  )
}
