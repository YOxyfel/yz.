'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, Sparkles, X, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { useCompactNavLayout } from './device-profile'
import { useConstellations } from './constellation-context'
import { SiteFxControls } from './site-fx-controls'
import { StationButton, StationLed } from './station-console'

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

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const compactNav = useCompactNavLayout()
  const { constellationLabEnabled, toggleConstellationLab, skyViewMode, toggleSkyViewMode } =
    useConstellations()
  const t = useTranslations('Nav')
  const locale = useLocale()
  const navHref = useNavHref()
  const home = `/${locale}`

  const allLinks = [...pageLinks, ...homeLinks]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!compactNav) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen, compactNav])

  useEffect(() => {
    if (!compactNav) setMenuOpen(false)
  }, [compactNav])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const mobileMenu =
    compactNav && menuOpen && mounted
      ? createPortal(
          <div
            className="site-nav-mobile-menu pointer-events-auto"
            role="dialog"
            aria-modal="true"
            data-sky-lab-keep
          >
            <button
              type="button"
              className="site-nav-mobile-scrim"
              aria-label={t('menuClose')}
              onClick={() => setMenuOpen(false)}
            />
            <div className="site-nav-mobile-panel">
              <button
                type="button"
                className="site-nav-mobile-close station-button station-button-secondary !h-10 !w-10 !p-0"
                aria-label={t('menuClose')}
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
              <nav className="flex flex-col items-stretch gap-2 px-6 pb-8 pt-16">
                {allLinks.map((link) => (
                  <a
                    key={link.key}
                    href={navHref(link.href)}
                    className="site-nav-mobile-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(link.key)}
                  </a>
                ))}
                <StationButton className="mt-4 w-full justify-center" href={navHref('#contact')}>
                  {t('hireMe')}
                </StationButton>

                <div className="site-nav-mobile-tools mt-6 border-t border-[var(--station-bezel)]/35 pt-5">
                  <SiteFxControls embedded />

                  <button
                    type="button"
                    data-no-constellation
                    data-sky-lab-keep
                    aria-pressed={constellationLabEnabled}
                    onClick={() => {
                      toggleConstellationLab()
                      setMenuOpen(false)
                    }}
                    className={`site-nav-mobile-tool-btn mt-4 w-full ${
                      constellationLabEnabled ? 'site-nav-mobile-tool-btn-active' : ''
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <StationLed active pulse={constellationLabEnabled} />
                      <Sparkles className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
                      <span>
                        {constellationLabEnabled ? t('skyLabOn') : t('skyLab')}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    data-no-constellation
                    data-sky-lab-keep
                    aria-pressed={skyViewMode}
                    onClick={() => {
                      toggleSkyViewMode()
                      setMenuOpen(false)
                    }}
                    className={`site-nav-mobile-tool-btn mt-3 w-full ${
                      skyViewMode ? 'site-nav-mobile-tool-btn-active' : ''
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <StationLed active={skyViewMode} pulse={skyViewMode} />
                      {skyViewMode ? (
                        <Eye className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
                      ) : (
                        <EyeOff className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
                      )}
                      <span>{skyViewMode ? t('showUi') : t('skyView')}</span>
                    </span>
                  </button>
                </div>
              </nav>
            </div>
          </div>,
          document.body
        )
      : null

  const navBar = (
    <nav
      className={`station-nav-bar flex w-full min-w-0 items-center justify-between gap-2 px-3 py-2.5 transition-all duration-300 sm:px-5 ${
        scrolled ? 'opacity-100' : 'opacity-95'
      }`}
    >
      <a
        href={home}
        className="flex shrink-0 items-center gap-2 font-heading text-sm font-bold tracking-widest"
      >
        <StationLed active pulse />
        YZ<span className="text-cyan">.</span>
      </a>

      <ul
        className={`site-nav-desktop-links min-w-0 items-center gap-0.5 ${
          compactNav ? 'hidden' : 'flex'
        }`}
      >
        {allLinks.map((link) => (
          <li key={link.key}>
            <a href={navHref(link.href)} className="station-nav-link">
              {t(link.key)}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex shrink-0 items-center gap-2">
        <StationButton
          href={navHref('#contact')}
          variant="ghost"
          className={`site-nav-desktop-hire !px-3.5 !py-1.5 !text-[10px] !uppercase !tracking-[0.18em] text-cyan ${
            compactNav ? 'hidden' : 'inline-flex'
          }`}
        >
          {t('hireMe')}
        </StationButton>

        {compactNav ? (
          <button
            type="button"
            className="site-nav-mobile-trigger station-button station-button-secondary !h-10 !w-10 !p-0"
            aria-label={menuOpen ? t('menuClose') : t('menuOpen')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    </nav>
  )

  const navHeader = (
    <motion.header
      data-portfolio-chrome
      className={`site-nav-header ${scrolled ? 'site-nav-header-scrolled' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="site-nav-header-inner">{navBar}</div>
    </motion.header>
  )

  return (
    <>
      {mounted ? createPortal(navHeader, document.body) : null}
      <div className="site-nav-spacer" aria-hidden />
      {mobileMenu}
    </>
  )
}
