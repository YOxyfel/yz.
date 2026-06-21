'use client'

import { motion } from 'framer-motion'
import { Menu, Sparkles, X, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { useCompactNavLayout } from './device-profile'
import { isBlockScrollPair, requestBlockNavScroll } from './block-scroll-nav'
import { useConstellations } from './constellation-context'
import { SiteFxControls } from './site-fx-controls'
import { StationButton, StationLed } from './station-console'

const links = [
  { href: '#engine', key: 'engine' as const },
  { href: '#arsenal', key: 'arsenal' as const },
  { href: '#stack', key: 'stack' as const },
  { href: '#contact', key: 'contact' as const },
]

function onNavAnchorClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (!document.documentElement.dataset.blockScroll) return
  const targetId = href.replace(/^#/, '')
  if (!isBlockScrollPair(targetId)) return
  event.preventDefault()
  requestBlockNavScroll(href)
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const compactNav = useCompactNavLayout()
  const { constellationLabEnabled, toggleConstellationLab, skyViewMode, toggleSkyViewMode } =
    useConstellations()
  const t = useTranslations('Nav')

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
    menuOpen && mounted
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
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="site-nav-mobile-link"
                    onClick={(event) => {
                      onNavAnchorClick(event, link.href)
                      setMenuOpen(false)
                    }}
                  >
                    {t(link.key)}
                  </a>
                ))}
                <StationButton className="mt-4 w-full justify-center" href="#contact">
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

  return (
    <>
      <motion.header
        data-portfolio-chrome
        className="site-nav-header sticky top-0 z-[60] flex justify-center overflow-x-clip px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <nav
          className={`station-nav-bar flex w-full min-w-0 max-w-3xl items-center justify-between gap-2 px-3 py-2.5 transition-all duration-300 sm:px-5 ${
            scrolled ? 'opacity-100' : 'opacity-95'
          }`}
        >
          <a
            href="#top"
            className="flex shrink-0 items-center gap-2 font-heading text-sm font-bold tracking-widest"
            onClick={(event) => onNavAnchorClick(event, '#top')}
          >
            <StationLed active pulse />
            YZ<span className="text-cyan">.</span>
          </a>

          <ul className="site-nav-desktop-links hidden min-w-0 lg:flex items-center gap-0.5">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="station-nav-link"
                  onClick={(event) => onNavAnchorClick(event, link.href)}
                >
                  {t(link.key)}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <StationButton
              href="#contact"
              variant="ghost"
              className="site-nav-desktop-hire hidden !px-3.5 !py-1.5 !text-[10px] !uppercase !tracking-[0.18em] text-cyan lg:inline-flex"
            >
              {t('hireMe')}
            </StationButton>

            <button
              type="button"
              className="site-nav-mobile-trigger station-button station-button-secondary !h-10 !w-10 !p-0 lg:hidden"
              aria-label={menuOpen ? t('menuClose') : t('menuOpen')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </motion.header>
      {mobileMenu}
    </>
  )
}
