import { PortfolioClientGate } from './portfolio-client-gate'

type DesktopHomeProps = {
  serverMobile: boolean
}

export function DesktopHome({ serverMobile }: DesktopHomeProps) {
  return <PortfolioClientGate serverMobile={serverMobile} />
}
