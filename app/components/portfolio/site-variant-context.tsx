'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useDeviceProfile } from './device-profile'
import { useVisualFxPreferences } from './visual-fx-preferences'

export const SITE_VARIANTS = ['station'] as const
export type SiteVariant = (typeof SITE_VARIANTS)[number]

type SiteVariantContextValue = {
  variant: SiteVariant
  transitionDirection: number
  isTransitioning: boolean
  scrollProgress: number
  setVariant: (variant: SiteVariant, direction?: number) => void
  panelUsesFlip: boolean
}

const SiteVariantContext = createContext<SiteVariantContextValue | null>(null)

export function SiteVariantProvider({ children }: { children: ReactNode }) {
  const { isCoarsePointer, isDesktop } = useDeviceProfile()
  const { showCardFx } = useVisualFxPreferences()

  const value = useMemo<SiteVariantContextValue>(
    () => ({
      variant: 'station',
      transitionDirection: 0,
      isTransitioning: false,
      scrollProgress: 0,
      setVariant: () => {},
      panelUsesFlip: isDesktop && !isCoarsePointer && showCardFx,
    }),
    [isCoarsePointer, isDesktop, showCardFx]
  )

  return (
    <SiteVariantContext.Provider value={value}>{children}</SiteVariantContext.Provider>
  )
}

export function useSiteVariant() {
  const context = useContext(SiteVariantContext)
  if (!context) {
    throw new Error('useSiteVariant must be used within SiteVariantProvider')
  }
  return context
}
