'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const pageLinks = [
  { href: '/about', key: 'about' as const },
  { href: '/services', key: 'services' as const },
  { href: '/pricing', key: 'pricing' as const },
  { href: '/case-studies', key: 'caseStudies' as const },
  { href: '/resources', key: 'resources' as const },
] as const

const homeLinks = [
  { href: '#engine', key: 'work' as const },
  { href: '#faq', key: 'faq' as const },
  { href: '#contact', key: 'contact' as const },
] as const

function useNavHref() {
  const locale = useLocale()
  const pathname = usePathname()

  return (href: string) => {
    if (href.startsWith('#')) {
      const onHome = pathname === '/' || pathname === `/${locale}`
      return onHome ? href : `/${locale}${href}`
    }
    return `/${locale}${href}`
  }
}

export function MobileStaticNav() {
  const [open, setOpen] = useState(false)
  const t = useTranslations('Nav')
  const locale = useLocale()
  const navHref = useNavHref()
  const home = `/${locale}`

  return (
    <>
      <header className="mobile-static-nav">
        <div className="mobile-static-nav-inner">
          <Link href={home} className="font-heading text-sm font-bold tracking-widest">
            YZ<span className="text-cyan">.</span>
          </Link>
          <button
            type="button"
            className="mobile-static-nav-trigger"
            aria-expanded={open}
            aria-label={open ? t('menuClose') : t('menuOpen')}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>
      <div className="site-nav-spacer" aria-hidden />
      {open ? (
        <div className="mobile-static-nav-menu" role="dialog" aria-modal="true">
          <nav className="flex flex-col gap-2 p-6 pt-16">
            {[...pageLinks, ...homeLinks].map((link) => (
              <Link
                key={link.key}
                href={navHref(link.href)}
                className="mobile-static-nav-link"
                onClick={() => setOpen(false)}
              >
                {t(link.key)}
              </Link>
            ))}
            <Link
              href={navHref('#contact')}
              className="mobile-static-btn mobile-static-btn-primary mt-4 text-center"
              onClick={() => setOpen(false)}
            >
              {t('hireMe')}
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  )
}
