'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, Sparkles, X, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/** Width at which all inline desktop nav links fit without overlapping the CTA.
 *  Lowered after collapsing the content pages into a single "Logs" dropdown. */
const NAV_INLINE_MIN_PX = 1100

function useMinWidth(px: number) {
  const [match, setMatch] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(min-width: ${px}px)`).matches : false
  )
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`)
    const onChange = () => setMatch(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [px])
  return match
}
import { useTranslations } from 'next-intl'
import { useCompactNavLayout, useCornerDockVisible, useDeviceProfile } from './device-profile'
import { useConstellationChrome } from './constellation-context'
import { useNavScrolled } from './use-nav-scrolled'
import { SiteFxControls } from './site-fx-controls'
import { StationButton, StationLed } from './station-console'
const pageLinks = [
  { href: '/about', key: 'about' as const },
  { href: '/services', key: 'services' as const },
  { href: '/pricing', key: 'pricing' as const },
  { href: '/case-studies', key: 'caseStudies' as const },
  { href: '/resources', key: 'resources' as const },
] as const

// Build-in-public content pages, grouped under a single "Logs" dropdown to keep
// the top bar uncluttered.
const logLinks = [
  { href: '/timeline', key: 'timeline' as const },
  { href: '/journal', key: 'journal' as const },
  { href: '/videos', key: 'videos' as const },
] as const

// Homepage section anchors. Kept out of the desktop top bar (reachable via footer
// and the "Hire me" CTA) but still listed in the mobile menu.
const homeLinks = [
  { href: '#engine', key: 'work' as const },
  { href: '#faq', key: 'faq' as const },
  { href: '#contact', key: 'contact' as const },
] as const

function NavDropdown({
  label,
  links,
  navHref,
  t,
}: {
  label: string
  links: ReadonlyArray<{ href: string; key: string }>
  navHref: (href: string) => string
  t: (key: string) => string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 140)
  }

  return (
    <li
      ref={ref}
      className="station-nav-dropdown"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={`station-nav-link station-nav-dropdown-trigger ${open ? 'is-open' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {label}
        <ChevronDown className="station-nav-dropdown-caret h-3 w-3" aria-hidden />
      </button>
      <div className="station-nav-dropdown-panel" role="menu" data-open={open ? 'true' : 'false'}>
        {links.map((link) => (
          <a
            key={link.key}
            href={navHref(link.href)}
            role="menuitem"
            className="station-nav-dropdown-item"
            onClick={() => setOpen(false)}
          >
            {t(link.key)}
          </a>
        ))}
      </div>
    </li>
  )
}

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
  const scrolled = useNavScrolled()
  const { mobilePerfCut } = useDeviceProfile()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const compactNav = useCompactNavLayout()
  const wideNav = useMinWidth(NAV_INLINE_MIN_PX)
  // Below the wide breakpoint the full link set won't fit inline, so it lives in the menu.
  const linksInMenu = !wideNav
  const cornerDockVisible = useCornerDockVisible()
  const toolsInMenu = !cornerDockVisible
  const showMenuTrigger = linksInMenu || toolsInMenu
  const { constellationLabEnabled, toggleConstellationLab, skyViewMode, toggleSkyViewMode } =
    useConstellationChrome()
  const t = useTranslations('Nav')
  const locale = useLocale()
  const navHref = useNavHref()
  const home = `/${locale}`

  // Mobile menu has vertical room, so it lists every destination flat.
  const allLinks = [...pageLinks, ...logLinks, ...homeLinks]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showMenuTrigger) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen, showMenuTrigger])

  useEffect(() => {
    if (!showMenuTrigger) setMenuOpen(false)
  }, [showMenuTrigger])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const mobileTools = (
    <div className={linksInMenu ? 'site-nav-mobile-tools mt-6 border-t border-[var(--station-bezel)]/35 pt-5' : 'site-nav-mobile-tools'}>
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
          <span>{constellationLabEnabled ? t('skyLabOn') : t('skyLab')}</span>
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
  )

  const mobileMenu =
    showMenuTrigger && menuOpen && mounted
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
                {linksInMenu ? (
                  <>
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
                    {mobileTools}
                  </>
                ) : (
                  <>
                    <p className="site-nav-mobile-section-label mb-1 text-center">
                      {t('interactiveTools')}
                    </p>
                    {mobileTools}
                  </>
                )}
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
        <StationLed active pulse={!mobilePerfCut} />
        YZ<span className="text-cyan">.</span>
      </a>

      <ul
        className={`site-nav-desktop-links min-w-0 items-center gap-0.5 ${
          wideNav ? 'flex' : 'hidden'
        }`}
      >
        {pageLinks.map((link) => (
          <li key={link.key}>
            <a href={navHref(link.href)} className="station-nav-link">
              {t(link.key)}
            </a>
          </li>
        ))}
        <NavDropdown label={t('logs')} links={logLinks} navHref={navHref} t={t} />
      </ul>

      <div className="flex shrink-0 items-center gap-2">
        <StationButton
          href={navHref('#contact')}
          variant="ghost"
          className={`site-nav-desktop-hire !px-3.5 !py-1.5 !text-[10px] !uppercase !tracking-[0.18em] text-cyan ${
            wideNav ? 'inline-flex' : 'hidden'
          }`}
        >
          {t('hireMe')}
        </StationButton>

        {showMenuTrigger ? (
          <button
            type="button"
            className="site-nav-menu-trigger station-button station-button-secondary !h-10 !w-10 !p-0"
            aria-label={menuOpen ? t('menuClose') : linksInMenu ? t('menuOpen') : t('interactiveTools')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    </nav>
  )

  const navHeader = mobilePerfCut ? (
    <header
      data-portfolio-chrome
      className={`site-nav-header ${scrolled ? 'site-nav-header-scrolled' : ''}`}
    >
      <div className="site-nav-header-inner">{navBar}</div>
    </header>
  ) : (
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
