'use client'

import { useSyncExternalStore } from 'react'
import { AnalyticsScripts } from './analytics-scripts'
import { readMobileStaticFromDom, subscribeMobileStatic } from './mobile-static-mode'

export function ConditionalAnalyticsScripts() {
  const mobileStatic = useSyncExternalStore(
    subscribeMobileStatic,
    readMobileStaticFromDom,
    () => false
  )

  if (mobileStatic) return null

  return <AnalyticsScripts />
}
