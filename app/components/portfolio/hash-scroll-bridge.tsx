'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const NAV_OFFSET_PX = 88
const INTRO_ONLY_HASH = '#explore'

export function scrollToHashTarget(hash: string, behavior: ScrollBehavior = 'smooth') {
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  if (!id) return false

  const target = document.getElementById(id)
  if (!target) return false

  target.style.contentVisibility = 'visible'
  const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET_PX
  window.scrollTo({ top: Math.max(0, top), behavior })
  return true
}

function isSamePageHashLink(href: string, pathname: string) {
  const hashIndex = href.indexOf('#')
  if (hashIndex === -1) return false

  const pathPart = href.slice(0, hashIndex)
  const hash = href.slice(hashIndex)
  if (hash.length <= 1) return false

  if (pathPart === '') return true
  return pathPart === pathname
}

function isHomePath(pathname: string) {
  return pathname === '/' || /^\/[a-z]{2}$/.test(pathname)
}

function shouldLandOnIntro(hash: string) {
  return !hash || hash === INTRO_ONLY_HASH
}

function scrollToTop(behavior: ScrollBehavior = 'auto') {
  window.scrollTo({ top: 0, left: 0, behavior })
}

function landOnIntro(pathname: string) {
  if (!isHomePath(pathname)) return

  if (window.location.hash === INTRO_ONLY_HASH) {
    window.history.replaceState(null, '', `${pathname}${window.location.search}`)
  }

  scrollToTop('auto')
  requestAnimationFrame(() => scrollToTop('auto'))
  window.setTimeout(() => scrollToTop('auto'), 50)
  window.setTimeout(() => scrollToTop('auto'), 250)
}

export function HashScrollBridge() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    history.scrollRestoration = 'manual'

    if (shouldLandOnIntro(window.location.hash)) {
      landOnIntro(pathname)
    }

    const onPageShow = (event: PageTransitionEvent) => {
      if (!shouldLandOnIntro(window.location.hash)) return
      if (!event.persisted && window.location.hash === INTRO_ONLY_HASH) return
      landOnIntro(pathname)
    }

    window.addEventListener('pageshow', onPageShow)

    return () => {
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [pathname])

  useEffect(() => {
    const run = () => {
      const hash = window.location.hash

      if (shouldLandOnIntro(hash)) {
        landOnIntro(pathname)
        return
      }

      const attempt = (retries = 0) => {
        if (scrollToHashTarget(hash)) return
        if (retries < 12) {
          requestAnimationFrame(() => attempt(retries + 1))
        }
      }

      attempt()
    }

    run()

    const onHashChange = () => run()

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return

      const anchor = (event.target as Element).closest('a[href*="#"]')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || !isSamePageHashLink(href, pathname)) return

      const hash = href.slice(href.indexOf('#'))
      event.preventDefault()
      window.history.pushState(null, '', hash)
      scrollToHashTarget(hash)
    }

    window.addEventListener('hashchange', onHashChange)
    document.addEventListener('click', onClick, true)

    return () => {
      window.removeEventListener('hashchange', onHashChange)
      document.removeEventListener('click', onClick, true)
    }
  }, [pathname])

  return null
}
