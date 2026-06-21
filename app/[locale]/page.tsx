import { PortfolioPage } from '../components/portfolio/portfolio-page'
import { DeviceProfileProvider } from '../components/portfolio/device-profile'
import { SkyScrollFadeProvider } from '../components/portfolio/sky-scroll-fade'
import { SiteVariantProvider } from '../components/portfolio/site-variant-context'
import { VisualFxPreferencesProvider } from '../components/portfolio/visual-fx-preferences'
import { setRequestLocale } from 'next-intl/server'
import { routing, type AppLocale } from '../../i18n/routing'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as AppLocale)

  return (
    <DeviceProfileProvider>
      <VisualFxPreferencesProvider>
        <SkyScrollFadeProvider>
          <SiteVariantProvider>
            <PortfolioPage />
          </SiteVariantProvider>
        </SkyScrollFadeProvider>
      </VisualFxPreferencesProvider>
    </DeviceProfileProvider>
  )
}
