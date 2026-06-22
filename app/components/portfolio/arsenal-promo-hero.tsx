'use client'

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import {
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useConstellationChrome } from './constellation-context'
import { arsenalPromo } from './arsenal-promo'
import { isMobileSkyLabViewport, useDeviceProfile } from './device-profile'

const ease = [0.22, 1, 0.36, 1] as const
const DEFAULT_VOLUME = 0.28
const VOLUME_STEP = 0.14
const MAX_VOLUME = 1
const SCROLL_COLLAPSE_THRESHOLD = 160
const SCROLL_LOCK_MS = 3000
const EXPAND_DELAY_MS = 750
const INTRO_VIDEO_MS = 1100
const THEATER_ENTER_MS = 1400
const THEATER_MAX_WIDTH_PX = 2180

type PromoPhase = 'intro' | 'playing' | 'ended'
type CopyPlacement = 'overlay' | 'sidebar' | 'below'

function clampVolume(value: number) {
  return Math.min(MAX_VOLUME, Math.max(0, Number(value.toFixed(2))))
}

function syncVideoVolume(video: HTMLVideoElement, level: number) {
  const clamped = clampVolume(level)
  video.volume = clamped
  video.muted = clamped === 0
}

function isPromoKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function PromoCopy({ placement }: { placement: CopyPlacement }) {
  const isOverlay = placement === 'overlay'
  const isSidebar = placement === 'sidebar'

  return (
    <div
      className={
        isOverlay
          ? 'flex max-w-2xl flex-col items-center px-6 py-8 text-center'
          : isSidebar
            ? 'flex h-full flex-col justify-center px-6 py-8 lg:px-8 lg:py-10'
            : 'space-y-4'
      }
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-cyan sm:text-xs">
        Spotlight reel · Character creation · 120 FPS
      </p>
      <h3
        className={`font-heading font-bold tracking-tight ${
          isOverlay
            ? 'mt-3 text-balance text-2xl text-foreground drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)] sm:text-3xl'
            : isSidebar
              ? 'mt-3 text-balance text-xl text-foreground sm:text-2xl lg:text-3xl'
              : 'max-w-4xl text-balance text-3xl text-foreground sm:text-4xl lg:text-5xl'
        }`}
      >
        {arsenalPromo.headline}
      </h3>
      <p
        className={`leading-relaxed ${
          isOverlay
            ? 'mt-3 max-w-xl text-pretty text-sm text-foreground/90 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]'
            : isSidebar
              ? 'mt-3 text-pretty text-sm text-foreground/85 lg:text-base'
              : 'max-w-2xl text-pretty text-sm text-foreground/85 sm:text-base'
        }`}
      >
        {arsenalPromo.description}
      </p>
      <div
        className={`flex flex-wrap gap-2 ${
          isOverlay ? 'mt-4 justify-center' : isSidebar ? 'mt-5' : ''
        }`}
      >
        {arsenalPromo.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-md ${
              isOverlay
                ? 'border-white/20 bg-black/50 text-foreground/80'
                : 'border-white/15 bg-black/40 text-foreground/75'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function PromoCopyShell({
  placement,
  className = '',
  sharedLayout = true,
}: {
  placement: CopyPlacement
  className?: string
  sharedLayout?: boolean
}) {
  const layoutId = sharedLayout ? 'promo-hero-copy' : undefined
  if (placement === 'overlay') {
    return (
      <div className={`relative max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-black/55 px-5 py-7 shadow-[0_12px_48px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:px-8 sm:py-9 ${className}`}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/65" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/45 to-transparent" />
        <motion.div
          layoutId={layoutId}
          transition={{ duration: 0.85, ease }}
          className="relative"
        >
          <PromoCopy placement="overlay" />
        </motion.div>
      </div>
    )
  }

  if (placement === 'sidebar') {
    return (
      <div
        className={`relative flex min-h-0 flex-col overflow-hidden border-white/10 bg-black/90 lg:border-r ${className}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan/6 via-transparent to-violet/8" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
        <motion.div
          layoutId={layoutId}
          transition={{ duration: 0.85, ease }}
          className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <PromoCopy placement="sidebar" />
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/12 bg-black/85 p-6 shadow-[0_12px_48px_-16px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan/8 via-transparent to-violet/8" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/55 to-transparent" />
      <motion.div
        layoutId={layoutId}
        transition={{ duration: 0.85, ease }}
        className="relative"
      >
        <PromoCopy placement="below" />
      </motion.div>
    </div>
  )
}

export function ArsenalPromoHero({ embedded = false }: { embedded?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const volumeRef = useRef(DEFAULT_VOLUME)
  const timersRef = useRef<number[]>([])
  const lastVolumeRef = useRef(DEFAULT_VOLUME)
  const scrollAccumRef = useRef(0)
  const scrollAnchorYRef = useRef(0)
  const lastTouchYRef = useRef<number | null>(null)
  const reelEndedRef = useRef(false)
  const reelStartedRef = useRef(false)
  const manualMinimizeRef = useRef(false)
  const expandedAtRef = useRef(0)
  const playbackSnapshotRef = useRef<{ time: number; playing: boolean } | null>(null)
  const inView = useInView(rootRef, { once: false, margin: '-10%' })
  const reduceMotion = useReducedMotion()
  const { skyViewMode } = useConstellationChrome()
  const deviceProfile = useDeviceProfile()
  const isMobileVideo = isMobileSkyLabViewport(deviceProfile)

  const [phase, setPhase] = useState<PromoPhase>('intro')
  const [showVideo, setShowVideo] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [reelStarted, setReelStarted] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const [mobileTheaterOpen, setMobileTheaterOpen] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    volumeRef.current = volume
    const video = videoRef.current
    if (video) syncVideoVolume(video, volume)
  }, [volume])

  const bindVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node
    if (node) syncVideoVolume(node, volumeRef.current)
  }, [])

  const snapshotPlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    playbackSnapshotRef.current = {
      time: video.currentTime,
      playing: !video.paused,
    }
  }, [])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  const applyVolume = useCallback((next: number) => {
    const clamped = clampVolume(next)
    if (clamped > 0) lastVolumeRef.current = clamped
    setVolume(clamped)
    const video = videoRef.current
    if (video) syncVideoVolume(video, clamped)
  }, [])

  const resetMedia = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    setPlaying(false)
  }, [])

  const pauseVideo = useCallback(() => {
    const video = videoRef.current
    if (video) video.pause()
    setPlaying(false)
  }, [])

  const enterTheater = useCallback(() => {
    if (reelEndedRef.current || manualMinimizeRef.current) return
    if (isMobileVideo) {
      setPhase('playing')
      setMobileTheaterOpen(true)
      return
    }
    snapshotPlayback()
    expandedAtRef.current = Date.now()
    scrollAccumRef.current = 0
    setPhase('playing')
    setExpanded(true)
  }, [isMobileVideo, snapshotPlayback])

  const replayReel = useCallback(() => {
    reelEndedRef.current = false
    manualMinimizeRef.current = false
    reelStartedRef.current = true
    setReelStarted(true)
    clearTimers()
    setPhase('playing')
    setShowVideo(true)

    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      syncVideoVolume(video, volume)
    }

    if (isMobileVideo) {
      setMobileTheaterOpen(true)
      void video?.play().catch(() => undefined)
      return
    }

    enterTheater()
  }, [clearTimers, enterTheater, isMobileVideo, volume])

  const collapseExpanded = useCallback(() => {
    pauseVideo()
    const video = videoRef.current
    if (video) {
      playbackSnapshotRef.current = {
        time: video.currentTime,
        playing: false,
      }
    }
    clearTimers()
    manualMinimizeRef.current = true
    scrollAccumRef.current = 0
    setExpanded(false)
  }, [clearTimers, pauseVideo])

  useEffect(() => {
    if (!skyViewMode || !expanded) return
    collapseExpanded()
  }, [skyViewMode, expanded, collapseExpanded])

  const expandReel = useCallback(() => {
    if (isMobileVideo) {
      manualMinimizeRef.current = false
      setMobileTheaterOpen(true)
      return
    }
    if (!showVideo || phase === 'ended') return
    manualMinimizeRef.current = false
    expandedAtRef.current = Date.now()
    scrollAccumRef.current = 0
    if (phase !== 'playing') {
      enterTheater()
      return
    }
    snapshotPlayback()
    setExpanded(true)
  }, [showVideo, phase, enterTheater, snapshotPlayback, isMobileVideo])

  const handleVideoEnded = useCallback(() => {
    clearTimers()
    setPlaying(false)
    if (isMobileVideo) {
      setMobileTheaterOpen(false)
    } else {
      setExpanded(false)
    }
    reelEndedRef.current = true
    scrollAccumRef.current = 0
    setPhase('ended')
  }, [clearTimers, isMobileVideo])

  const resetReel = useCallback(() => {
    clearTimers()
    reelStartedRef.current = false
    manualMinimizeRef.current = false
    setReelStarted(false)
    setMobileTheaterOpen(false)
    setPhase('intro')
    setShowVideo(false)
    setExpanded(false)
    reelEndedRef.current = false
    scrollAccumRef.current = 0
    resetMedia()
  }, [clearTimers, resetMedia])

  const closeMobileTheater = useCallback(() => {
    const video = videoRef.current
    if (video) {
      video.pause()
    }
    setMobileTheaterOpen(false)
    setPlaying(false)
    manualMinimizeRef.current = true
  }, [])

  const restartMobileReel = useCallback(() => {
    reelEndedRef.current = false
    setPhase('playing')
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    syncVideoVolume(video, volume)
    void video.play().catch(() => undefined)
  }, [volume])

  const beginReel = useCallback(() => {
    if (reelStartedRef.current || reelEndedRef.current) return
    reelStartedRef.current = true
    manualMinimizeRef.current = false
    setReelStarted(true)
    clearTimers()

    if (isMobileVideo) {
      setShowVideo(true)
      setPhase('playing')
      setMobileTheaterOpen(true)
      return
    }

    if (reduceMotion) {
      setShowVideo(true)
      timersRef.current.push(
        window.setTimeout(() => {
          if (reelEndedRef.current) return
          enterTheater()
        }, 300)
      )
      return
    }

    timersRef.current.push(
      window.setTimeout(() => setShowVideo(true), INTRO_VIDEO_MS),
      window.setTimeout(() => {
        if (reelEndedRef.current) return
        enterTheater()
      }, THEATER_ENTER_MS + EXPAND_DELAY_MS)
    )
  }, [clearTimers, reduceMotion, enterTheater, isMobileVideo])

  useEffect(() => {
    if (!mobileTheaterOpen) {
      if (!expanded) document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    const startPlayback = () => {
      const video = videoRef.current
      if (!video) return false
      syncVideoVolume(video, volume)
      void video.play().catch(() => undefined)
      return true
    }

    let frame = 0
    if (!startPlayback()) {
      frame = requestAnimationFrame(startPlayback)
    }

    return () => {
      if (frame) cancelAnimationFrame(frame)
      if (!expanded) document.body.style.overflow = ''
    }
  }, [expanded, mobileTheaterOpen, volume])

  useEffect(() => {
    if (!inView) {
      resetReel()
      return
    }
    return clearTimers
  }, [inView, resetReel, clearTimers])

  useEffect(() => {
    if (!showVideo) return
    const video = videoRef.current
    if (!video) return
    syncVideoVolume(video, volume)
  }, [showVideo, volume, expanded, phase, isMobileVideo])

  useEffect(() => {
    if (!expanded || !showVideo || phase !== 'playing' || isMobileVideo) return

    expandedAtRef.current = Date.now()
    scrollAnchorYRef.current = window.scrollY
    scrollAccumRef.current = 0

    const scrollFrame = requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
      window.setTimeout(() => {
        scrollAnchorYRef.current = window.scrollY
        scrollAccumRef.current = 0
      }, 450)
    })
    const video = videoRef.current
    if (!video) return () => cancelAnimationFrame(scrollFrame)
    syncVideoVolume(video, volume)
    void video.play().catch(() => undefined)
    return () => cancelAnimationFrame(scrollFrame)
  }, [expanded, showVideo, phase, volume, isMobileVideo])

  useEffect(() => {
    if (!expanded || isMobileVideo) {
      if (!mobileTheaterOpen) document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'
    scrollAnchorYRef.current = window.scrollY
    scrollAccumRef.current = 0

    const tryCollapse = () => {
      if (Date.now() - expandedAtRef.current < SCROLL_LOCK_MS) return
      if (scrollAccumRef.current >= SCROLL_COLLAPSE_THRESHOLD) {
        collapseExpanded()
      }
    }

    const onWheel = (event: WheelEvent) => {
      if (Date.now() - expandedAtRef.current < SCROLL_LOCK_MS) {
        event.preventDefault()
        return
      }
      scrollAccumRef.current += Math.abs(event.deltaY)
      tryCollapse()
    }

    const onScroll = () => {
      if (Date.now() - expandedAtRef.current < SCROLL_LOCK_MS) {
        window.scrollTo(0, scrollAnchorYRef.current)
        return
      }
      const delta = Math.abs(window.scrollY - scrollAnchorYRef.current)
      scrollAccumRef.current = Math.max(scrollAccumRef.current, delta)
      tryCollapse()
    }

    const onTouchMove = (event: TouchEvent) => {
      if (Date.now() - expandedAtRef.current < SCROLL_LOCK_MS) {
        event.preventDefault()
        lastTouchYRef.current = null
        return
      }
      const touch = event.touches[0]
      if (!touch) return
      if (lastTouchYRef.current !== null) {
        scrollAccumRef.current += Math.abs(touch.clientY - lastTouchYRef.current)
        tryCollapse()
      }
      lastTouchYRef.current = touch.clientY
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') collapseExpanded()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      lastTouchYRef.current = null
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [expanded, collapseExpanded, isMobileVideo, mobileTheaterOpen])

  const restartReel = () => {
    if (!inView) return
    resetReel()
  }

  const togglePlay = () => {
    if (isMobileVideo) {
      if (!reelStarted || reelEndedRef.current || phase === 'ended') {
        if (reelEndedRef.current || phase === 'ended') {
          replayReel()
        } else {
          beginReel()
        }
        return
      }
      if (mobileTheaterOpen) {
        const video = videoRef.current
        if (!video) return
        if (video.paused) void video.play()
        else video.pause()
        return
      }
      manualMinimizeRef.current = false
      setMobileTheaterOpen(true)
      return
    }

    if (phase === 'ended' || reelEndedRef.current) {
      replayReel()
      return
    }

    if (!reelStarted) {
      beginReel()
      return
    }
    const video = videoRef.current
    if (!video) return
    if (!showVideo) setShowVideo(true)
    if (video.paused) void video.play()
    else video.pause()
  }

  const togglePlayRef = useRef(togglePlay)
  togglePlayRef.current = togglePlay

  useEffect(() => {
    if (!reelStarted || !showVideo) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== ' ') return
      if (event.repeat) return
      if (isPromoKeyboardTarget(event.target)) return
      event.preventDefault()
      togglePlayRef.current()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [reelStarted, showVideo])

  const onVideoSurfaceClick = () => {
    if (isMobileVideo) {
      togglePlay()
      return
    }

    if (!reelStarted) {
      beginReel()
      return
    }
    if (phase === 'ended' || reelEndedRef.current) {
      replayReel()
      return
    }
    if (!showVideo) return
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  const isTheater = !isMobileVideo && expanded && phase === 'playing'
  const mobileLandscapeTheater = isMobileVideo && mobileTheaterOpen
  const mobileReelActive = mobileLandscapeTheater

  const copyPlacement: CopyPlacement =
    mobileReelActive
      ? 'overlay'
      : phase === 'playing' && expanded
        ? 'sidebar'
        : phase === 'playing' && !expanded
          ? 'below'
          : 'overlay'

  const showOverlayCopy =
    !isMobileVideo && !mobileTheaterOpen && copyPlacement === 'overlay'
  const showBelowCopy =
    !isMobileVideo && !mobileTheaterOpen && copyPlacement === 'below'
  const showMobilePlayOverlay =
    isMobileVideo && !mobileTheaterOpen && !reelStarted && phase !== 'ended'
  const showMobileResumeOverlay =
    isMobileVideo && !mobileTheaterOpen && reelStarted && phase === 'playing'
  const showInlinePromoShell = !isTheater && !mobileTheaterOpen
  const showSidebarCopy = !isMobileVideo && copyPlacement === 'sidebar'

  useEffect(() => {
    const snapshot = playbackSnapshotRef.current
    if (!snapshot) return
    const video = videoRef.current
    if (!video) return

    const restore = () => {
      syncVideoVolume(video, volumeRef.current)
      video.currentTime = snapshot.time
      if (snapshot.playing) void video.play().catch(() => undefined)
      playbackSnapshotRef.current = null
    }

    const frame = requestAnimationFrame(restore)
    return () => cancelAnimationFrame(frame)
  }, [isTheater, showVideo])

  const canExpand =
    inView && reelStarted && showVideo && phase !== 'ended' && !expanded

  const volumeLabel = volume === 0 ? 'Off' : `${Math.round(volume * 100)}%`

  useEffect(() => {
    if (!mobileLandscapeTheater) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileTheater()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeMobileTheater, mobileLandscapeTheater])

  const theaterShellClass = mobileLandscapeTheater
    ? 'promo-mobile-landscape-theater fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black'
    : 'promo-theater-shell fixed z-[100] flex flex-col overflow-hidden rounded-2xl border border-cyan/25 bg-black shadow-[0_0_120px_-20px_oklch(0.84_0.16_200/0.55)]'
  const theaterPlaceholderStyle = {
    width: `min(calc(100vw - 1.5rem), ${THEATER_MAX_WIDTH_PX}px)`,
    maxWidth: '100%',
    height: 'min(calc(100dvh - 1.5rem), 56.25vw)',
  } as const

  const videoSurface = (
    <>
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        animate={{ opacity: showVideo ? 0 : 1 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
        aria-hidden={showVideo}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={arsenalPromo.posterSrc}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,oklch(0.12_0.01_270/0.15),oklch(0.12_0.01_270/0.55))]" />
      </motion.div>

      <motion.div
        className="absolute inset-0 z-[8]"
        animate={{ opacity: showVideo ? 1 : 0 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        <video
          ref={bindVideoRef}
          className={
            mobileLandscapeTheater
              ? 'promo-mobile-landscape-video'
              : isTheater
                ? 'promo-theater-video'
                : 'h-full w-full object-cover object-center'
          }
          src={arsenalPromo.videoSrc}
          playsInline
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleVideoEnded}
        />
      </motion.div>

      {showVideo && reelStarted ? (
        <button
          type="button"
          className="absolute inset-0 z-[14] cursor-pointer"
          onClick={onVideoSurfaceClick}
          aria-label={playing ? 'Pause spotlight video' : 'Play spotlight video'}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-[12] bg-gradient-to-t from-black/55 via-transparent to-black/15" />

      {showOverlayCopy ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-[17] bg-black/45 backdrop-blur-[3px]"
            aria-hidden
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 px-4 sm:px-10">
            <PromoCopyShell placement="overlay" />
            {!reelStarted ? (
              <button
                type="button"
                onClick={beginReel}
                className="inline-flex items-center gap-2.5 rounded-full border border-cyan/40 bg-cyan/15 px-6 py-3 font-mono text-xs uppercase tracking-wider text-cyan shadow-[0_0_32px_-8px_oklch(0.84_0.16_200/0.65)] backdrop-blur-md transition-transform hover:scale-105 sm:px-8 sm:text-sm"
              >
                <Play className="h-4 w-4 fill-current" />
                Press to play
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      {showMobilePlayOverlay ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-[17] bg-black/40"
            aria-hidden
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
            <button
              type="button"
              onClick={beginReel}
              className="inline-flex items-center gap-2.5 rounded-full border border-cyan/40 bg-cyan/15 px-6 py-3 font-mono text-xs uppercase tracking-wider text-cyan shadow-[0_0_32px_-8px_oklch(0.84_0.16_200/0.65)] backdrop-blur-md"
            >
              <Play className="h-4 w-4 fill-current" />
              Press to play
            </button>
          </div>
        </>
      ) : null}

      {showMobileResumeOverlay ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={() => {
              manualMinimizeRef.current = false
              setMobileTheaterOpen(true)
            }}
            className="inline-flex items-center gap-2.5 rounded-full border border-cyan/40 bg-black/70 px-6 py-3 font-mono text-xs uppercase tracking-wider text-cyan backdrop-blur-md"
          >
            <Play className="h-4 w-4 fill-current" />
            Resume
          </button>
        </div>
      ) : null}
    </>
  )

  const promoShellBody = (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[25] h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
      <div className="pointer-events-none absolute -inset-px z-[5] rounded-[inherit] bg-gradient-to-b from-cyan/10 via-transparent to-violet/10 opacity-60" />

      {isTheater ? (
        <button
          type="button"
          onClick={collapseExpanded}
          className="absolute right-3 top-3 z-40 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/75 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground backdrop-blur-md transition-colors hover:border-cyan/40 hover:text-cyan"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          Minimize
        </button>
      ) : null}

      <div
        className={
          isTheater && !mobileLandscapeTheater
            ? 'promo-theater-grid min-h-0 min-w-0 flex-1'
            : `flex min-h-0 w-full ${
                isTheater
                  ? 'h-full w-full flex-1 items-center justify-center'
                  : 'flex-col'
              }`
        }
      >
        {showSidebarCopy ? (
          <PromoCopyShell
            placement="sidebar"
            sharedLayout={!isTheater}
            className="promo-theater-sidebar min-h-0 min-w-0 overflow-hidden border-white/10 bg-black/90 lg:border-r"
          />
        ) : null}
        <div
          className={`relative min-h-0 min-w-0 bg-black ${
            isTheater
              ? mobileLandscapeTheater
                ? 'flex h-full w-full flex-1 items-center justify-center'
                : 'promo-theater-video-panel'
              : 'aspect-video w-full overflow-hidden'
          }`}
        >
          <div
            className={`${
              isTheater
                ? mobileLandscapeTheater
                  ? 'promo-mobile-landscape-frame relative flex items-center justify-center'
                  : 'promo-theater-video-wrap'
                : 'relative h-full w-full'
            }`}
          >
            {videoSurface}
          </div>
        </div>
      </div>

      <div
        className={`relative z-30 shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/75 p-3 backdrop-blur-md sm:gap-3 sm:p-5 ${
          isMobileVideo ? 'hidden' : ''
        }`}
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex items-center gap-2 rounded-full border border-cyan/35 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-cyan backdrop-blur-md transition-transform hover:scale-105 sm:px-4 sm:text-xs"
          >
            {!reelStarted ? (
              <>
                <Play className="h-4 w-4" />
                Press to play
              </>
            ) : playing ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play
              </>
            )}
          </button>

          <button
            type="button"
            onClick={restartReel}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-foreground backdrop-blur-md transition-transform hover:scale-105 sm:px-4 sm:text-xs"
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </button>

          {isTheater ? (
            <button
              type="button"
              onClick={collapseExpanded}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-foreground backdrop-blur-md transition-transform hover:scale-105 sm:px-4 sm:text-xs"
            >
              <Minimize2 className="h-4 w-4" />
              Minimize
            </button>
          ) : canExpand ? (
            <button
              type="button"
              onClick={expandReel}
              className="inline-flex items-center gap-2 rounded-full border border-cyan/35 bg-cyan/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-cyan backdrop-blur-md transition-transform hover:scale-105 sm:px-4 sm:text-xs"
            >
              <Maximize2 className="h-4 w-4" />
              Expand
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 p-1 backdrop-blur-md">
          <button
            type="button"
            aria-label="Decrease volume"
            onClick={() => applyVolume(volume - VOLUME_STEP)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            aria-label={volume === 0 ? 'Enable audio' : 'Mute audio'}
            onClick={() =>
              volume === 0
                ? applyVolume(lastVolumeRef.current || DEFAULT_VOLUME)
                : applyVolume(0)
            }
            className="flex h-8 min-w-[2.75rem] items-center justify-center gap-1 rounded-full px-2 font-mono text-[10px] uppercase tracking-wider text-foreground transition-colors hover:bg-white/10"
          >
            {volume === 0 ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{volumeLabel}</span>
          </button>

          <button
            type="button"
            aria-label="Increase volume"
            onClick={() => applyVolume(volume + VOLUME_STEP)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isTheater ? (
        <p className="pointer-events-none absolute -bottom-10 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Scroll to exit after 3s · Esc anytime
        </p>
      ) : null}
    </>
  )

  const promoShell = (
    <motion.div
      key="promo-shell"
      layout={!isTheater}
      data-portfolio-chrome={isTheater ? true : undefined}
      className={`group/promo overflow-hidden border bg-black shadow-[0_0_100px_-28px_oklch(0.84_0.16_200/0.45)] ${
        isTheater ? theaterShellClass : 'relative w-full rounded-[1.75rem] border-white/10'
      }`}
      initial={
        reduceMotion
          ? false
          : isTheater
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.98 }
      }
      animate={
        isTheater
          ? { opacity: 1 }
          : inView
            ? { opacity: 1, scale: 1 }
            : { opacity: 0.98, scale: 0.98 }
      }
      transition={{ duration: isTheater ? 0.75 : 0.7, ease }}
    >
      {promoShellBody}
    </motion.div>
  )

  const theaterPortal =
    isTheater && portalReady
      ? createPortal(
          <>
            <AnimatePresence>
              <motion.div
                key="cinema-backdrop"
                data-portfolio-chrome
                className="fixed inset-0 z-[98] bg-black/92 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease }}
                aria-hidden
              />
            </AnimatePresence>
            {promoShell}
          </>,
          document.body
        )
      : null

  const mobileTheaterPortal =
    mobileTheaterOpen && portalReady
      ? createPortal(
          <div className="mobile-promo-theater">
            <video
              ref={bindVideoRef}
              className="mobile-promo-theater-video"
              src={arsenalPromo.videoSrc}
              playsInline
              preload="auto"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={handleVideoEnded}
            />
            <button
              type="button"
              className="mobile-promo-theater-close"
              aria-label="Close video"
              onClick={closeMobileTheater}
            >
              ×
            </button>
            <div className="mobile-promo-theater-controls">
              <button
                type="button"
                className="mobile-promo-theater-btn mobile-promo-theater-btn-primary"
                onClick={() => {
                  const video = videoRef.current
                  if (!video) return
                  if (video.paused) void video.play()
                  else video.pause()
                }}
              >
                {playing ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Play
                  </>
                )}
              </button>
              <button
                type="button"
                className="mobile-promo-theater-btn"
                onClick={restartMobileReel}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restart
              </button>
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <LayoutGroup>
      <motion.div
        ref={rootRef}
        className={`relative ${embedded ? 'mt-0' : 'mt-14'} ${isTheater ? '!transform-none' : ''}`}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={
          isTheater
            ? { opacity: 1, y: 0 }
            : inView
              ? { opacity: 1, y: 0 }
              : { opacity: 0.98, y: 24 }
        }
        transition={{ duration: 0.65, ease }}
        style={isTheater ? { transform: 'none' } : undefined}
      >
        {mobileTheaterPortal}
        {theaterPortal}

        <AnimatePresence>
          {showBelowCopy ? (
            <motion.div
              key="copy-below"
              className="relative mb-6 sm:mb-8"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
            >
              <div
                className="pointer-events-none absolute -inset-3 rounded-3xl bg-black/50 blur-2xl sm:-inset-4"
                aria-hidden
              />
              <PromoCopyShell placement="below" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {isTheater ? (
          <div
            className="pointer-events-none mx-auto w-full max-w-[2180px] opacity-0"
            style={theaterPlaceholderStyle}
            aria-hidden
          />
        ) : null}

        {showInlinePromoShell ? promoShell : null}

        <motion.p
          className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground sm:text-left"
          animate={{ opacity: showBelowCopy ? 1 : 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          AI-assisted pipeline · art references · manual assembly
        </motion.p>
      </motion.div>
    </LayoutGroup>
  )
}
