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

const logLinks = [
  { href: '/timeline', key: 'timeline' as const },
  { href: '/journal', key: 'journal' as const },
  { href: '/videos', key: 'videos' as const },
] as const

const homeLinks = [
  { href: '#engine', key: 'work' as const },
  { href: '#faq', key: 'faq' as const },
  { href: '#contact', key: 'contact' as const },
] as const

function useFooterHref() {
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

export function SiteFooter() {
  const t = useTranslations('Footer')
  const tNav = useTranslations('Nav')
  const locale = useLocale()
  const footerHref = useFooterHref()
  const home = `/${locale}`

  return (
    <footer className="site-footer" data-portfolio-chrome>
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link href={home} className="font-heading text-sm font-bold tracking-widest">
            YZ<span className="text-cyan">.</span>
          </Link>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            by <span className="text-cyan">Oxyfel</span>
          </p>
          <p className="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
            {t('tagline')}
          </p>
        </div>

        <nav className="site-footer-nav" aria-label={t('navLabel')}>
          <p className="site-footer-nav-title">{t('pagesTitle')}</p>
          <ul>
            {pageLinks.map((link) => (
              <li key={link.key}>
                <Link href={footerHref(link.href)} className="site-footer-link">
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer-nav" aria-label="Logs">
          <p className="site-footer-nav-title">Logs</p>
          <ul>
            {logLinks.map((link) => (
              <li key={link.key}>
                <Link href={footerHref(link.href)} className="site-footer-link">
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer-nav" aria-label={t('bridgeLabel')}>
          <p className="site-footer-nav-title">{t('bridgeTitle')}</p>
          <ul>
            {homeLinks.map((link) => (
              <li key={link.key}>
                <Link href={footerHref(link.href)} className="site-footer-link">
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="site-footer-bottom">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          © {new Date().getFullYear()} Yane Zhekov · by Oxyfel
        </p>
        <p className="text-pretty text-xs text-muted-foreground">{t('builtWith')}</p>
      </div>
    </footer>
  )
}
