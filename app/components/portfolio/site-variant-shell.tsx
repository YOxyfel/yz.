'use client'

import type { ReactNode } from 'react'
import { useDeviceProfile } from './device-profile'

export function SiteVariantShell({ children }: { children: ReactNode }) {
  const { isCoarsePointer, isNarrow, isTablet, mobilePerfCut } = useDeviceProfile()
  const useFlatTransition = mobilePerfCut || isCoarsePointer || isNarrow || isTablet

  return (
    <div className="site-variant-viewport">
      <div
        className="site-variant-root"
        data-site-variant="station"
        data-variant-transition={useFlatTransition ? 'flat' : '3d'}
      >
        {children}
      </div>
    </div>
  )
}
