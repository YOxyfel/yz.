'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { StationButton, StationLed } from './station-console'

const links = [
  { href: '#engine', key: 'engine' as const },
  { href: '#arsenal', key: 'arsenal' as const },
  { href: '#stack', key: 'stack' as const },
  { href: '#contact', key: 'contact' as const },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
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
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

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
          <div className="site-nav-mobile-menu md:hidden" role="dialog" aria-modal="true">
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
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(link.key)}
                  </a>
                ))}
                <StationButton className="mt-4 w-full justify-center" href="#contact">
                  {t('hireMe')}
                </StationButton>
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
        className="site-nav-header sticky top-0 z-[60] flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <nav
          className={`station-nav-bar flex w-full max-w-3xl items-center justify-between px-4 py-2.5 transition-all duration-300 sm:px-5 ${
            scrolled ? 'opacity-100' : 'opacity-95'
          }`}
        >
          <a href="#top" className="flex items-center gap-2 font-heading text-sm font-bold tracking-widest">
            <StationLed active pulse />
            YZ<span className="text-cyan">.</span>
          </a>

          <ul className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="station-nav-link">
                  {t(link.key)}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <StationButton
              href="#contact"
              variant="ghost"
              className="hidden !px-3.5 !py-1.5 !text-[10px] !uppercase !tracking-[0.18em] text-cyan md:inline-flex"
            >
              {t('hireMe')}
            </StationButton>

            <button
              type="button"
              className="station-button station-button-secondary !h-10 !w-10 !p-0 md:hidden"
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
