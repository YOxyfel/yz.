'use client'

import { ArrowUpRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, useTranslations } from 'next-intl'
import { MOBILE_MAX_PX } from './breakpoints'
import { StationButton } from './station-console'

const STORAGE_KEY = 'yz-exit-intent-dismissed'
const ARM_DELAY_MS = 800
const TOP_EXIT_PX = 28

function isDismissed() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function isDesktopViewport() {
  if (typeof window === 'undefined') return false
  return window.innerWidth > MOBILE_MAX_PX
}

export function ExitIntentOffer() {
  const t = useTranslations('ExitIntent')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const armedRef = useRef(false)
  const triggeredRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !isDesktopViewport() || isDismissed()) return

    armedRef.current = false
    triggeredRef.current = false

    const trigger = () => {
      if (triggeredRef.current || !armedRef.current || isDismissed()) return
      triggeredRef.current = true
      armedRef.current = false
      setOpen(true)
    }

    const armTimer = window.setTimeout(() => {
      if (!isDismissed()) armedRef.current = true
    }, ARM_DELAY_MS)

    const isLeavingDocument = (related: EventTarget | null) => {
      if (related == null) return true
      if (!(related instanceof Node)) return true
      return !document.documentElement.contains(related)
    }

    const onMouseOut = (event: MouseEvent) => {
      if (!armedRef.current) return
      if (!isLeavingDocument(event.relatedTarget)) return
      if (event.clientY > TOP_EXIT_PX) return
      trigger()
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!armedRef.current) return
      if (event.clientY <= 6) trigger()
    }

    document.addEventListener('mouseout', onMouseOut, true)
    document.addEventListener('mousemove', onMouseMove, { passive: true })

    return () => {
      window.clearTimeout(armTimer)
      document.removeEventListener('mouseout', onMouseOut, true)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [mounted])

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* private mode */
    }
    setOpen(false)
  }

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="exit-intent-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      <button type="button" className="exit-intent-scrim" aria-label={t('dismiss')} onClick={dismiss} />
      <div className="exit-intent-panel-wrap">
        <div className="station-panel station-module exit-intent-panel">
          <div className="station-panel-content">
            <button
              type="button"
              className="exit-intent-close station-button station-button-secondary !absolute !right-3 !top-3 !h-9 !w-9 !p-0"
              aria-label={t('dismiss')}
              onClick={dismiss}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative z-[1] pr-8">
              <p className="station-readout-label">{t('eyebrow')}</p>
              <h2 id="exit-intent-title" className="font-heading mt-3 text-2xl font-bold tracking-tight">
                {t('title')}
              </h2>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{t('body')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <StationButton href={`/${locale}/resources`} variant="secondary" onClick={dismiss}>
                  {t('resourcesCta')}
                  <ArrowUpRight className="h-4 w-4" />
                </StationButton>
                <StationButton href={`/${locale}#contact`} variant="primary" onClick={dismiss}>
                  {t('contactCta')}
                  <ArrowUpRight className="h-4 w-4" />
                </StationButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
