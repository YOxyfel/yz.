'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

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
          <details className="mobile-static-menu">
            <summary className="mobile-static-nav-trigger" aria-label={t('menuOpen')}>
              Menu
            </summary>
            <nav className="mobile-static-nav-panel">
              {[...pageLinks, ...homeLinks].map((link) => (
                <Link key={link.key} href={navHref(link.href)} className="mobile-static-nav-link">
                  {t(link.key)}
                </Link>
              ))}
              <Link href={navHref('#contact')} className="mobile-static-btn mobile-static-btn-primary mt-3">
                {t('hireMe')}
              </Link>
            </nav>
          </details>
        </div>
      </header>
      <div className="site-nav-spacer" aria-hidden />
    </>
  )
}
