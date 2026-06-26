'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import './hero-header-video.css'

const HERO_POSTER_SRC = '/HeaderVideo/alien-poster.jpg'
const HERO_AUDIO_SRC = '/HeaderVideo/AlienVideo.MP3'

type HeroHeaderVideoProps = {
  variant?: 'video' | 'poster'
}

const PORTAL_POSTER_SRC = '/HeaderVideo/portal-poster.jpg'

/* The alien clip is 8.33s; the portal VFX is stretched to match. */
const HERO_VIDEO_DURATION = 8.333
const PORTAL_SYNC_TOLERANCE = 0.12
/* Bias the reveal to sit *inside* the ring: open a touch later, close a touch
   sooner, so the alien never spills past the portal edge. */
const PORTAL_OPEN_DELAY = 0.18
const PORTAL_CLOSE_LEAD = 0.18
const PORTAL_MIDPOINT = HERO_VIDEO_DURATION / 2

/* After each single playthrough the transmission goes dark for a random gap. */
const IDLE_MIN_MS = 15_000
const IDLE_MAX_MS = 120_000

type TransmissionPhase = 'live' | 'idle'

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.ceil(totalSeconds))
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
/* Reveal-circle radius at full open, as a fraction of the frame width.
   Large enough to uncover the whole soft-disc the alien lives in. */
const PORTAL_REVEAL_MAX = 0.46

/* Openness sampled directly from the portal clip's measured brightness so the
   reveal tracks the actual ring instead of guessed timings. Normalised
   (closed ≈ 16, full ≈ 47) → 0..1, anchored to the 8.333s master duration.
   Each entry is [seconds, openness]; we linearly interpolate between them. */
const PORTAL_OPENNESS_LUT: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0],
  [0.3, 0.05],
  [0.4, 0.18],
  [0.5, 0.27],
  [0.6, 0.39],
  [0.7, 0.52],
  [0.8, 0.58],
  [0.9, 0.73],
  [1.0, 0.79],
  [1.1, 0.88],
  [1.2, 0.95],
  [1.3, 0.98],
  [1.4, 1],
  [7.0, 1],
  [7.1, 0.86],
  [7.2, 0.81],
  [7.3, 0.72],
  [7.4, 0.62],
  [7.5, 0.48],
  [7.6, 0.36],
  [7.7, 0.24],
  [7.8, 0.17],
  [7.9, 0.1],
  [8.0, 0.03],
  [8.1, 0],
]

/** 0 = collapsed into the portal point, 1 = fully open. */
function portalOpenness(time: number, duration: number) {
  const dur = duration > 0.5 ? duration : HERO_VIDEO_DURATION
  const mapped = time * (HERO_VIDEO_DURATION / dur) // map onto the LUT's 8.333s timeline
  // Shift the lookup earlier while opening (reveal lags the ring) and later
  // while closing (reveal leads the ring) so it always hugs the inside.
  const t = mapped < PORTAL_MIDPOINT ? mapped - PORTAL_OPEN_DELAY : mapped + PORTAL_CLOSE_LEAD
  const lut = PORTAL_OPENNESS_LUT
  if (t <= lut[0][0]) return lut[0][1]
  const last = lut[lut.length - 1]
  if (t >= last[0]) return last[1]
  for (let i = 1; i < lut.length; i += 1) {
    const [t1, o1] = lut[i]
    if (t <= t1) {
      const [t0, o0] = lut[i - 1]
      const span = t1 - t0
      const f = span > 0 ? (t - t0) / span : 0
      return o0 + (o1 - o0) * f
    }
  }
  return last[1]
}

function HeroPortalVfx({
  animated = true,
  videoRef,
}: {
  animated?: boolean
  videoRef?: RefObject<HTMLVideoElement | null>
}) {
  return (
    <>
      <span className="hero-header-video__portal-aura" aria-hidden />
      {animated ? (
        <video
          ref={videoRef}
          className="hero-header-video__portal-media"
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={PORTAL_POSTER_SRC}
          aria-hidden
        >
          <source src="/HeaderVideo/portal.webm" type="video/webm" />
          <source src="/HeaderVideo/portal.mp4" type="video/mp4" />
        </video>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          className="hero-header-video__portal-media"
          src={PORTAL_POSTER_SRC}
          alt=""
          aria-hidden
          decoding="async"
        />
      )}
    </>
  )
}

export function HeroHeaderVideo({ variant = 'video' }: HeroHeaderVideoProps) {
  const t = useTranslations('Hero')
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const portalRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(true)
  const [phase, setPhase] = useState<TransmissionPhase>('live')
  const [secondsLeft, setSecondsLeft] = useState(0)

  const mutedRef = useRef(muted)
  mutedRef.current = muted

  // ── Transmission lifecycle: play once, go dark for a random gap, repeat ──
  useEffect(() => {
    if (variant !== 'video') return

    const alien = videoRef.current
    if (!alien) return
    const portal = portalRef.current
    const audio = audioRef.current

    let cancelled = false
    let idleTimer = 0
    let countdownTimer = 0

    const clearTimers = () => {
      window.clearTimeout(idleTimer)
      window.clearInterval(countdownTimer)
    }

    const startLive = () => {
      if (cancelled) return
      clearTimers()
      setPhase('live')
      setSecondsLeft(0)
      try {
        alien.currentTime = 0
      } catch {
        /* ignore */
      }
      if (portal) {
        try {
          portal.currentTime = 0
        } catch {
          /* ignore */
        }
        void portal.play().catch(() => {})
      }
      void alien.play().catch(() => {})
      if (audio && !mutedRef.current) {
        audio.currentTime = 0
        void audio.play().catch(() => {})
      }
    }

    const goIdle = () => {
      if (cancelled) return
      clearTimers()
      alien.pause()
      if (portal) portal.pause()
      if (audio) audio.pause()

      const delayMs = Math.round(IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS))
      let remaining = Math.ceil(delayMs / 1000)
      setPhase('idle')
      setSecondsLeft(remaining)
      countdownTimer = window.setInterval(() => {
        remaining -= 1
        setSecondsLeft(Math.max(0, remaining))
        if (remaining <= 0) window.clearInterval(countdownTimer)
      }, 1000)
      idleTimer = window.setTimeout(startLive, delayMs)
    }

    const onEnded = () => goIdle()
    alien.addEventListener('ended', onEnded)
    startLive()

    return () => {
      cancelled = true
      clearTimers()
      alien.removeEventListener('ended', onEnded)
    }
  }, [variant])

  useEffect(() => {
    if (variant !== 'video') return

    const alien = videoRef.current
    const frame = frameRef.current
    if (!alien || !frame) return

    let raf = 0

    const tick = () => {
      const alienDuration = alien.duration || HERO_VIDEO_DURATION
      const alienTime = alien.currentTime

      // Keep the portal locked to the alien clock for loop coherence.
      const portal = portalRef.current
      const portalReady = portal && portal.readyState >= 2
      if (portal && portalReady && !portal.seeking) {
        const target = Math.min(alienTime, (portal.duration || alienDuration) - 0.05)
        if (Math.abs(portal.currentTime - target) > PORTAL_SYNC_TOLERANCE) {
          try {
            portal.currentTime = Math.max(0, target)
          } catch {
            /* seeking can throw mid-load; ignore */
          }
        }
      }

      // Drive the reveal from the frame the portal is *actually* showing so the
      // mask can never lag the ring (falls back to the alien clock pre-load).
      const sourceTime = portalReady ? portal.currentTime : alienTime
      const sourceDuration = portalReady ? portal.duration || alienDuration : alienDuration
      const openness = portalOpenness(sourceTime, sourceDuration)
      const maxRadius = frame.clientWidth * PORTAL_REVEAL_MAX
      frame.style.setProperty('--hero-portal-reveal-r', `${(openness * maxRadius).toFixed(1)}px`)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [variant])

  useEffect(() => {
    if (variant !== 'video') return

    const video = videoRef.current
    const audio = audioRef.current
    if (!video || !audio) return

    const syncAudio = () => {
      if (muted || audio.paused) return
      if (Math.abs(audio.currentTime - video.currentTime) > 0.28) {
        audio.currentTime = video.currentTime
      }
    }

    const onSeek = () => {
      if (!muted) audio.currentTime = video.currentTime
    }

    const onEnded = () => audio.pause()

    video.addEventListener('timeupdate', syncAudio)
    video.addEventListener('seeking', onSeek)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('timeupdate', syncAudio)
      video.removeEventListener('seeking', onSeek)
      video.removeEventListener('ended', onEnded)
    }
  }, [muted, variant])

  const toggleMute = () => {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video || !audio) return

    if (muted) {
      setMuted(false)
      video.muted = true
      audio.muted = false
      // Only sound up an in-flight transmission; idle gaps stay silent.
      if (phase === 'live') {
        audio.currentTime = video.currentTime
        void audio.play().catch(() => {})
      }
      return
    }

    setMuted(true)
    audio.muted = true
    audio.pause()
  }

  if (variant === 'poster') {
    return (
      <div className="hero-header-video hero-header-video--poster">
        <HeroPortalVfx animated={false} />
        <div className="hero-header-video__frame">
          <img
            src={HERO_POSTER_SRC}
            alt=""
            className="hero-header-video__poster"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="hero-header-video__live" data-open="true" aria-hidden>
          <span className="hero-header-video__live-dot" />
          <span className="hero-header-video__live-text">
            <span className="hero-header-video__live-label">{t('videoLiveNow')}</span>
          </span>
        </div>
      </div>
    )
  }

  const isLive = phase === 'live'
  const liveLabel = isLive ? t('videoLiveNow') : t('videoNextTransmission')

  return (
    <div className="hero-header-video" data-phase={phase}>
      <span className="hero-header-video__sphere" aria-hidden />
      <HeroPortalVfx videoRef={portalRef} />
      <div
        ref={frameRef}
        className="hero-header-video__frame hero-header-video__frame--portal-synced"
        style={{ '--hero-portal-reveal-r': '0px' } as CSSProperties}
      >
        <video
          ref={videoRef}
          className="hero-header-video__media"
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={HERO_POSTER_SRC}
        >
          <source src="/HeaderVideo/alien.webm" type="video/webm" />
          <source src="/HeaderVideo/alien.mp4" type="video/mp4" />
          <source src="/HeaderVideo/Test10001-1000.mkv" type="video/x-matroska" />
        </video>
      </div>

      <audio ref={audioRef} src={HERO_AUDIO_SRC} preload="auto" className="sr-only" />

      <div className="hero-header-video__live" data-open={isLive ? 'true' : 'false'}>
        <span className="hero-header-video__live-dot" aria-hidden />
        <span className="hero-header-video__live-text">
          <span className="hero-header-video__live-label">{liveLabel}</span>
          {!isLive ? (
            <span className="hero-header-video__live-timer">{formatCountdown(secondsLeft)}</span>
          ) : null}
        </span>
        <span className="sr-only" role="status" aria-live="polite">
          {isLive ? liveLabel : `${liveLabel} ${formatCountdown(secondsLeft)}`}
        </span>
      </div>

      <button
        type="button"
        className="hero-header-video__audio-toggle"
        onClick={toggleMute}
        aria-pressed={!muted}
        aria-label={muted ? t('videoAudioOn') : t('videoAudioOff')}
        title={muted ? t('videoAudioOn') : t('videoAudioOff')}
      >
        {muted ? (
          <VolumeX className="hero-header-video__audio-icon" aria-hidden />
        ) : (
          <Volume2 className="hero-header-video__audio-icon" aria-hidden />
        )}
      </button>
    </div>
  )
}
