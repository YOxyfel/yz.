import Script from 'next/script'
import { DEVICE_BOOTSTRAP_SCRIPT } from './components/portfolio/breakpoints'

export function MobileRootLayout({
  children,
  locale = 'en',
  subpage = false,
}: {
  children: React.ReactNode
  locale?: string
  subpage?: boolean
}) {
  return (
    <html
      lang={locale}
      data-mobile-static="on"
      data-mobile-perf-cut="on"
      className="mobile-ultra"
      suppressHydrationWarning
    >
      <head>
        <link rel="stylesheet" href="/mobile-ultra.css" />
        {subpage ? <link rel="stylesheet" href="/mobile-subpages.css" /> : null}
      </head>
      <body>
        <Script id="device-bootstrap" strategy="beforeInteractive">
          {DEVICE_BOOTSTRAP_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  )
}
