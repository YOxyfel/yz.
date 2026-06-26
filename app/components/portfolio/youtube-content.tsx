'use client'

import { ArrowUpRight, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { StationChip, StationPanel } from './station-console'
import { youtubeChannel, youtubePosts, type YoutubePost } from './youtube-data'

function posterGradient(post: YoutubePost) {
  const [a, b] = post.hue
  return `linear-gradient(135deg, hsl(${a} 65% 24%), hsl(${b} 60% 12%))`
}

export function YoutubeContent() {
  const posts = youtubePosts
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const current = posts[active]

  const select = useCallback((idx: number) => {
    setActive(idx)
    setPlaying(false)
  }, [])

  const step = useCallback(
    (dir: 1 | -1) => {
      setActive((a) => {
        const next = Math.max(0, Math.min(posts.length - 1, a + dir))
        return next
      })
      setPlaying(false)
    },
    [posts.length]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  const hasVideo = !!current?.youtubeId

  return (
    <SitePageLayout
      breadcrumbs={[
        { name: 'Bridge', path: '' },
        { name: 'Videos', path: '/videos' },
      ]}
    >
      <SitePageHero
        eyebrow="Broadcast · channel"
        title="Video log"
        description="Devlogs and breakdowns from the channel, laid out on a timeline. Pick a post to watch it inline, or step through the broadcast history."
      />

      <StationPanel variant="module" backLabel="CH-01" className="yt-channel">
        <div className="relative z-[1] flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="station-readout-label">Channel</p>
            <p className="mt-1 font-heading text-xl font-bold tracking-tight">{youtubeChannel.handle}</p>
            <p className="mt-1 text-pretty text-sm text-muted-foreground">{youtubeChannel.tagline}</p>
          </div>
          <a
            href={youtubeChannel.url}
            target="_blank"
            rel="noreferrer"
            className="station-button station-button-secondary inline-flex items-center gap-2 !text-[11px]"
          >
            Visit channel
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </StationPanel>

      {current ? (
        <div className="yt-stage">
          <div className="yt-player">
            {hasVideo && playing ? (
              <iframe
                className="yt-frame"
                src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1&rel=0`}
                title={current.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className="yt-poster"
                style={
                  hasVideo
                    ? undefined
                    : { background: posterGradient(current) }
                }
                onClick={() => {
                  if (hasVideo) setPlaying(true)
                  else window.open(youtubeChannel.url, '_blank', 'noopener')
                }}
                aria-label={hasVideo ? `Play ${current.title}` : `Open channel for ${current.title}`}
              >
                {hasVideo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://i.ytimg.com/vi/${current.youtubeId}/hqdefault.jpg`}
                    alt=""
                    className="yt-poster-img"
                  />
                ) : (
                  <span className="yt-poster-badge">Preview</span>
                )}
                <span className="yt-play">
                  <Play className="h-6 w-6" />
                </span>
              </button>
            )}
          </div>

          <div className="yt-meta">
            <div className="flex flex-wrap items-center gap-2">
              <StationChip className="station-chip-active !text-[10px]">{current.date}</StationChip>
              {current.tags.map((tag) => (
                <StationChip key={tag} className="!text-[10px]">
                  {tag}
                </StationChip>
              ))}
            </div>
            <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight">{current.title}</h2>
            <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{current.description}</p>
            {!hasVideo ? (
              <p className="mt-3 text-xs text-muted-foreground/70">
                Placeholder post — add the YouTube id in <code>youtube-data.ts</code> to embed the real video.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="yt-timeline-head">
        <p className="station-readout-label">Broadcast timeline</p>
        <div className="dev-stage-controls">
          <button
            type="button"
            className="dev-stage-btn"
            aria-label="Previous post"
            onClick={() => step(-1)}
            disabled={active === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="dev-stage-tag">
            {String(active + 1).padStart(2, '0')} / {String(posts.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="dev-stage-btn"
            aria-label="Next post"
            onClick={() => step(1)}
            disabled={active === posts.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ol className="yt-timeline">
        {posts.map((post, i) => (
          <li key={post.id}>
            <button
              type="button"
              className={`yt-timeline-card ${i === active ? 'is-active' : ''}`}
              onClick={() => select(i)}
            >
              <span
                className="yt-timeline-thumb"
                style={
                  post.youtubeId
                    ? {
                        backgroundImage: `url(https://i.ytimg.com/vi/${post.youtubeId}/mqdefault.jpg)`,
                      }
                    : { background: posterGradient(post) }
                }
                aria-hidden
              >
                <Play className="h-4 w-4" />
              </span>
              <span className="yt-timeline-body">
                <span className="yt-timeline-date">{post.date}</span>
                <span className="yt-timeline-title">{post.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </SitePageLayout>
  )
}
