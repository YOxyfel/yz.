'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { isMobilePerfCutViewport } from './breakpoints'
import {
  hashTargetId,
  INTRO_ONLY_HASH,
  isSectionHash,
  requestAllSectionsMount,
  requestHashSectionMount,
} from './hash-scroll'

export function scrollToHashTarget(hash: string, behavior: ScrollBehavior = 'smooth') {
  const id = hashTargetId(hash)
  if (!id) return false

  const target = document.getElementById(id)
  if (!target) return false

  target.style.contentVisibility = 'visible'
  target.scrollIntoView({ behavior, block: 'start' })
  return true
}

/**
 * Reliable hash scrolling.
 *
 * Lazy sections between the viewport and the target expand past their
 * placeholder heights as they mount, so a single smooth scroll lands short.
 * To avoid that we (1) force every section to mount, (2) wait for the target's
 * absolute document position to stabilise, (3) issue one smooth scroll, then
 * (4) keep re-aligning for a short window in case late content (images, etc.)
 * shifts the target again.
 */
function scrollToHashTargetWithRetry(hash: string, behavior: ScrollBehavior = 'smooth') {
  const id = hashTargetId(hash)
  if (!id) return

  const mobile = isMobilePerfCutViewport()
  const scrollBehavior: ScrollBehavior = mobile ? 'auto' : behavior
  const start = performance.now()
  const settleMs = mobile ? 1100 : 2000
  const stabilizeCapMs = mobile ? 320 : 520
  const requiredStable = mobile ? 4 : 6

  let phase: 'stabilize' | 'settle' = 'stabilize'
  let lastDocTop = Number.NaN
  let stableCount = 0
  let requestedMounts = false

  const docTopOf = (el: HTMLElement) =>
    Math.round(el.getBoundingClientRect().top + window.scrollY)

  const frame = () => {
    // Fire on the first frame (not synchronously) so that on a fresh page load
    // the lazy sections have already attached their mount listeners.
    if (!requestedMounts) {
      requestHashSectionMount(id)
      requestAllSectionsMount()
      requestedMounts = true
    }

    const target = document.getElementById(id)
    const elapsed = performance.now() - start

    if (!target) {
      if (elapsed < settleMs) requestAnimationFrame(frame)
      return
    }

    target.style.contentVisibility = 'visible'
    const docTop = docTopOf(target)

    if (phase === 'stabilize') {
      if (!Number.isNaN(lastDocTop) && Math.abs(docTop - lastDocTop) <= 1) {
        stableCount += 1
      } else {
        stableCount = 0
      }
      lastDocTop = docTop

      if (stableCount >= 2 || elapsed >= stabilizeCapMs) {
        target.scrollIntoView({ behavior: scrollBehavior, block: 'start' })
        phase = 'settle'
        stableCount = 0
        lastDocTop = docTopOf(target)
      }
      requestAnimationFrame(frame)
      return
    }

    // settle: realign instantly if the target drifted, otherwise count down.
    if (Math.abs(docTop - lastDocTop) > 1) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' })
      stableCount = 0
    } else {
      stableCount += 1
    }
    lastDocTop = docTop

    if (stableCount < requiredStable && elapsed < settleMs) {
      requestAnimationFrame(frame)
    }
  }

  requestAnimationFrame(frame)
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

function stripIntroHash(pathname: string) {
  if (!isHomePath(pathname)) return
  if (window.location.hash !== INTRO_ONLY_HASH) return
  window.history.replaceState(null, '', `${pathname}${window.location.search}`)
}

export function HashScrollBridge() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    history.scrollRestoration = 'manual'

    const onHome = isHomePath(pathname)

    const lockTop = () => {
      if (!onHome) return
      if (window.location.hash) {
        window.history.replaceState(null, '', `${pathname}${window.location.search}`)
      }
      window.scrollTo(0, 0)
    }

    // Landed on the home page with a real section hash (e.g. came from a
    // subpage via Work/FAQ/Contact) → scroll to that section instead of top.
    if (onHome && isSectionHash(window.location.hash)) {
      scrollToHashTargetWithRetry(window.location.hash, 'smooth')
    } else {
      lockTop()
    }

    const onPageShow = (event: PageTransitionEvent) => {
      if (!onHome) return
      const hash = window.location.hash
      if (isSectionHash(hash)) {
        scrollToHashTargetWithRetry(hash, 'auto')
        return
      }
      if (!event.persisted && hash === INTRO_ONLY_HASH) return
      lockTop()
    }

    window.addEventListener('pageshow', onPageShow)

    return () => {
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [pathname])

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash
      if (!isSectionHash(hash)) {
        stripIntroHash(pathname)
        return
      }
      scrollToHashTargetWithRetry(hash)
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const anchor = (event.target as Element).closest('a[href*="#"]')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || !isSamePageHashLink(href, pathname)) return

      const hash = href.slice(href.indexOf('#'))
      if (!isSectionHash(hash)) return

      event.preventDefault()
      window.history.pushState(null, '', hash)
      scrollToHashTargetWithRetry(hash)
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
