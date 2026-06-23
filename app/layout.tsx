import type { Metadata } from 'next'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Yane Zhekov — UE5 Gameplay Systems for Studios & Indies',
  description:
    'Technical game developer for Unreal Engine 5 studios and indie teams. UE5 gameplay systems, modular architecture, AI-assisted production, and honest case studies from active game development.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerStore = await headers()
  const mobile = headerStore.get('x-mobile-static') === '1'

  if (mobile) {
    const locale = headerStore.get('x-locale') ?? 'en'
    const isMobileHome = headerStore.get('x-mobile-home') === '1'
    const { MobileRootLayout } = await import('./mobile-root-layout')
    return (
      <MobileRootLayout locale={locale} subpage={!isMobileHome}>
        {children}
      </MobileRootLayout>
    )
  }

  const { FullRootLayout } = await import('./full-root-layout')
  return <FullRootLayout>{children}</FullRootLayout>
}
