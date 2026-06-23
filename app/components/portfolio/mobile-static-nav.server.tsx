import { getTranslations } from 'next-intl/server'
import type { AppLocale } from '../../../i18n/routing'

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

type MobileStaticNavProps = {
  locale: AppLocale
}

export async function MobileStaticNav({ locale }: MobileStaticNavProps) {
  const t = await getTranslations({ locale, namespace: 'Nav' })
  const home = `/${locale}`

  return (
    <>
      <header className="mobile-static-nav">
        <div className="mobile-static-nav-inner">
          <a href={home} className="font-heading" style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            YZ<span className="text-cyan">.</span>
          </a>
          <details className="mobile-static-menu">
            <summary className="mobile-static-nav-trigger" aria-label={t('menuOpen')}>
              Menu
            </summary>
            <nav className="mobile-static-nav-panel">
              {pageLinks.map((link) => (
                <a key={link.key} href={`/${locale}${link.href}`} className="mobile-static-nav-link">
                  {t(link.key)}
                </a>
              ))}
              {homeLinks.map((link) => (
                <a key={link.key} href={link.href} className="mobile-static-nav-link">
                  {t(link.key)}
                </a>
              ))}
              <a href="#contact" className="mobile-static-btn mobile-static-btn-primary" style={{ marginTop: '0.75rem' }}>
                {t('hireMe')}
              </a>
            </nav>
          </details>
        </div>
      </header>
      <div className="site-nav-spacer" aria-hidden />
    </>
  )
}
