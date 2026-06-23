'use client'

import { Analytics } from '@vercel/analytics/next'
import { readMobileStaticFromDom } from './mobile-static-mode'
import { useSyncExternalStore } from 'react'
import { subscribeMobileStatic } from './mobile-static-mode'

export function ConditionalAnalytics() {
  const mobileStatic = useSyncExternalStore(
    subscribeMobileStatic,
    readMobileStaticFromDom,
    () => false
  )

  if (mobileStatic || process.env.NODE_ENV !== 'production') {
    return null
  }

  return <Analytics />
}
