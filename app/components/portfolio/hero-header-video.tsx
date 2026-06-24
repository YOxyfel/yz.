'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import './hero-header-video.css'

const HERO_POSTER_SRC = '/HeaderVideo/alien-poster.jpg'
const HERO_AUDIO_SRC = '/HeaderVideo/AlienVideo.MP3'

type HeroHeaderVideoProps = {
  variant?: 'video' | 'poster'
}

export function HeroHeaderVideo({ variant = 'video' }: HeroHeaderVideoProps) {
  const t = useTranslations('Hero')
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [muted, setMuted] = useState(true)

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

    const onLoop = () => {
      if (!muted) {
        audio.currentTime = 0
        void audio.play().catch(() => {})
      }
    }

    video.addEventListener('timeupdate', syncAudio)
    video.addEventListener('seeking', onSeek)
    video.addEventListener('ended', onLoop)

    return () => {
      video.removeEventListener('timeupdate', syncAudio)
      video.removeEventListener('seeking', onSeek)
      video.removeEventListener('ended', onLoop)
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
      audio.currentTime = video.currentTime
      void Promise.all([video.play(), audio.play()]).catch(() => {})
      return
    }

    setMuted(true)
    audio.muted = true
    audio.pause()
  }

  if (variant === 'poster') {
    return (
      <div className="hero-header-video hero-header-video--poster">
        <div className="hero-header-video__frame">
          <img
            src={HERO_POSTER_SRC}
            alt=""
            className="hero-header-video__poster"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="hero-header-video">
      <div className="hero-header-video__frame">
        <video
          ref={videoRef}
          className="hero-header-video__media"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HERO_POSTER_SRC}
        >
          <source src="/HeaderVideo/alien.webm" type="video/webm" />
          <source src="/HeaderVideo/alien.mp4" type="video/mp4" />
          <source src="/HeaderVideo/Test10001-1000.mkv" type="video/x-matroska" />
        </video>
      </div>

      <audio ref={audioRef} src={HERO_AUDIO_SRC} preload="auto" loop className="sr-only" />

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
