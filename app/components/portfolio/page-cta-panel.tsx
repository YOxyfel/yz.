'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { StationButton, StationPanel } from './station-console'

type PageCtaPanelProps = {
  body?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  backLabel?: string
  className?: string
}

export function PageCtaPanel({
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  backLabel = 'COMMS',
  className,
}: PageCtaPanelProps) {
  const t = useTranslations('SiteCta')
  const locale = useLocale()

  const primary = primaryHref ?? '#contact'
  const secondary = secondaryHref ?? '/pricing'

  const resolveHref = (href: string) => {
    if (href.startsWith('mailto:') || href.startsWith('http')) return href
    if (href.startsWith('#')) return `/${locale}${href}`
    if (href.startsWith('/')) return `/${locale}${href}`
    return href
  }

  return (
    <StationPanel variant="module" backLabel={backLabel} className={className}>
      <p className="relative z-[1] text-pretty leading-relaxed text-muted-foreground">
        {body ?? t('defaultBody')}
      </p>
      <div className="relative z-[1] mt-6 flex flex-wrap gap-3">
        <StationButton href={resolveHref(primary)} variant="primary">
          {primaryLabel ?? t('primary')}
          <ArrowUpRight className="h-4 w-4" />
        </StationButton>
        <Link
          href={resolveHref(secondary)}
          className="station-button station-button-ghost inline-flex items-center gap-2 !text-[11px]"
        >
          {secondaryLabel ?? t('secondary')}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </StationPanel>
  )
}
