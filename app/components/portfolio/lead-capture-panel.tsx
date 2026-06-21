'use client'

import { ArrowUpRight, Mail, Radio } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { StationButton, StationChip, StationPanel } from './station-console'

const CONTACT_EMAIL = 'yane.zhekov@proton.me'

export function LeadCapturePanel({ className }: { className?: string }) {
  const t = useTranslations('LeadCapture')
  const locale = useLocale()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const [demoNote, setDemoNote] = useState('')

  const onNewsletterSubmit = (event: FormEvent) => {
    event.preventDefault()
    const body = encodeURIComponent(t('newsletterBody', { email: newsletterEmail }))
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('newsletterSubject'))}&body=${body}`
  }

  const onDemoSubmit = (event: FormEvent) => {
    event.preventDefault()
    const body = encodeURIComponent(
      t('demoBody', { email: demoEmail, note: demoNote || t('demoNotePlaceholder') })
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('demoSubject'))}&body=${body}`
  }

  return (
    <div className={`grid gap-6 lg:grid-cols-2 ${className ?? ''}`}>
      <StationPanel variant="module" backLabel="NL-01" className="h-full">
        <div className="relative z-[1] flex h-full flex-col">
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan/35 bg-cyan/10 text-cyan">
            <Mail className="h-5 w-5" aria-hidden />
          </span>
          <StationChip className="station-chip-active mb-3 w-fit !text-[10px]">{t('newsletterEyebrow')}</StationChip>
          <h2 className="font-heading text-xl font-bold tracking-tight">{t('newsletterTitle')}</h2>
          <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
            {t('newsletterDescription')}
          </p>
          <form className="mt-6 space-y-3" onSubmit={onNewsletterSubmit}>
            <label className="block text-left">
              <span className="sr-only">{t('emailLabel')}</span>
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder={t('emailPlaceholder')}
                className="station-input w-full"
                autoComplete="email"
              />
            </label>
            <StationButton type="submit" variant="primary" className="w-full justify-center">
              {t('newsletterCta')}
              <ArrowUpRight className="h-4 w-4" />
            </StationButton>
          </form>
        </div>
      </StationPanel>

      <StationPanel variant="module" backLabel="DEMO-01" className="h-full">
        <div className="relative z-[1] flex h-full flex-col">
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet/35 bg-violet/10 text-violet">
            <Radio className="h-5 w-5" aria-hidden />
          </span>
          <StationChip className="mb-3 w-fit !text-[10px]">{t('demoEyebrow')}</StationChip>
          <h2 className="font-heading text-xl font-bold tracking-tight">{t('demoTitle')}</h2>
          <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
            {t('demoDescription')}
          </p>
          <form className="mt-6 space-y-3" onSubmit={onDemoSubmit}>
            <label className="block text-left">
              <span className="sr-only">{t('emailLabel')}</span>
              <input
                type="email"
                required
                value={demoEmail}
                onChange={(event) => setDemoEmail(event.target.value)}
                placeholder={t('emailPlaceholder')}
                className="station-input w-full"
                autoComplete="email"
              />
            </label>
            <label className="block text-left">
              <span className="sr-only">{t('demoNoteLabel')}</span>
              <textarea
                value={demoNote}
                onChange={(event) => setDemoNote(event.target.value)}
                placeholder={t('demoNotePlaceholder')}
                rows={3}
                className="station-input min-h-[5.5rem] w-full resize-y"
              />
            </label>
            <StationButton type="submit" variant="secondary" className="w-full justify-center">
              {t('demoCta')}
              <ArrowUpRight className="h-4 w-4" />
            </StationButton>
          </form>
          <p className="mt-3 text-pretty text-xs text-muted-foreground">
            {t('demoFootnote')}{' '}
            <a href={`/${locale}/pricing`} className="text-cyan hover:underline">
              {t('demoPricingLink')}
            </a>
          </p>
        </div>
      </StationPanel>
    </div>
  )
}
