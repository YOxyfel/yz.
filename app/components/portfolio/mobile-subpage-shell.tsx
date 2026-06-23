'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

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

export function MobileSubpageShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Nav')
  const tFooter = useTranslations('Footer')
  const locale = useLocale()
  const home = `/${locale}`

  const navHref = (href: string) => (href.startsWith('#') ? `/${locale}${href}` : `/${locale}${href}`)

  return (
    <div className="mobile-subpage">
      <header className="mobile-static-nav">
        <div className="mobile-static-nav-inner">
          <Link href={home} className="mobile-subpage-logo">
            YZ<span className="text-cyan">.</span>
          </Link>
          <details className="mobile-static-menu">
            <summary className="mobile-static-nav-trigger" aria-label={t('menuOpen')}>
              Menu
            </summary>
            <nav className="mobile-static-nav-panel">
              {pageLinks.map((link) => (
                <Link key={link.key} href={navHref(link.href)} className="mobile-static-nav-link">
                  {t(link.key)}
                </Link>
              ))}
              {homeLinks.map((link) => (
                <Link key={link.key} href={navHref(link.href)} className="mobile-static-nav-link">
                  {t(link.key)}
                </Link>
              ))}
              <Link href={navHref('#contact')} className="mobile-static-btn mobile-static-btn-primary mobile-subpage-nav-cta">
                {t('hireMe')}
              </Link>
            </nav>
          </details>
        </div>
      </header>
      <div className="site-nav-spacer" aria-hidden />
      <main className="mobile-subpage-main">{children}</main>
      <footer className="mobile-static-footer">
        <p className="mobile-subpage-footer-tagline">{tFooter('tagline')}</p>
        <p className="mobile-subpage-footer-copy">© {new Date().getFullYear()} Yane Zhekov</p>
        <nav className="mobile-static-footer-nav">
          <Link href={`/${locale}/about`}>{t('about')}</Link>
          <Link href={`/${locale}/services`}>{t('services')}</Link>
          <Link href={navHref('#contact')}>{t('contact')}</Link>
        </nav>
      </footer>
    </div>
  )
}
