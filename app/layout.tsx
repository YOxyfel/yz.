import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { AnalyticsScripts } from './components/portfolio/analytics-scripts'
import { DEVICE_BOOTSTRAP_SCRIPT, HOME_SCROLL_BOOTSTRAP_SCRIPT } from './components/portfolio/breakpoints'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
})

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: DEVICE_BOOTSTRAP_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: HOME_SCROLL_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        {children}
        <AnalyticsScripts />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
