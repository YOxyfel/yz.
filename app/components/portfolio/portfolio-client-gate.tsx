'use client'

import dynamic from 'next/dynamic'
import { useSyncExternalStore } from 'react'
import { readMobileStaticFromDom, subscribeMobileStatic } from './mobile-static-mode'

const MobileStaticPortfolio = dynamic(
  () => import('./mobile-static-portfolio').then((mod) => ({ default: mod.MobileStaticPortfolio })),
  { ssr: true }
)

const DesktopPortfolioPage = dynamic(
  () => import('./desktop-portfolio-page').then((mod) => ({ default: mod.DesktopPortfolioPage })),
  { ssr: true }
)

type PortfolioClientGateProps = {
  serverMobile: boolean
}

export function PortfolioClientGate({ serverMobile }: PortfolioClientGateProps) {
  const clientMobile = useSyncExternalStore(
    subscribeMobileStatic,
    readMobileStaticFromDom,
    () => serverMobile
  )
  const mobile = serverMobile || clientMobile

  if (mobile) {
    return <MobileStaticPortfolio />
  }

  return <DesktopPortfolioPage />
}
