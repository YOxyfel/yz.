'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { BreadcrumbItem } from '../../../lib/structured-data'
import { buildBreadcrumbSchema } from '../../../lib/structured-data'
import { JsonLd } from './json-ld'
import { StationLed, StationSection } from './station-console'

export function SitePageLayout({
  children,
  backHref,
  breadcrumbs,
}: {
  children: React.ReactNode
  backHref?: string
  breadcrumbs?: BreadcrumbItem[]
}) {
  const t = useTranslations('SitePages')
  const locale = useLocale()
  const home = `/${locale}`
  const back = backHref ?? home

  return (
    <StationSection tone="page" className="!pt-28">
      {breadcrumbs ? <JsonLd data={buildBreadcrumbSchema(locale, breadcrumbs)} /> : null}
      <div className="mx-auto max-w-4xl">
        {breadcrumbs ? (
          <nav className="site-breadcrumb" aria-label={t('breadcrumbLabel')}>
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.name}-${crumb.path}`} className="inline-flex items-center gap-2">
                {index > 0 ? <span className="site-breadcrumb-sep">/</span> : null}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-foreground">{crumb.name}</span>
                ) : (
                  <Link href={`/${locale}${crumb.path}`}>{crumb.name}</Link>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        <Link
          href={back}
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-cyan"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t('backToBridge')}
        </Link>
        {children}
      </div>
    </StationSection>
  )
}

export function SitePageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="mb-12">
      <p className="station-readout-label flex items-center gap-2">
        <StationLed active pulse />
        {eyebrow}
      </p>
      <h1 className="font-heading mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">
        {description}
      </p>
    </header>
  )
}
