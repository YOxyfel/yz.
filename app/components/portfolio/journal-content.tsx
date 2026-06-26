'use client'

import { BookOpen, ChevronLeft, ChevronRight, Clock, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { journalEntries, type JournalEntry } from './journal-data'

function isComingSoon(entry: JournalEntry | null | undefined) {
  return !!entry && (entry.comingSoon || entry.body.length === 0)
}

/** Feature (left) page of a spread — title, tags, pull quote. */
function FeaturePage({ entry, index }: { entry: JournalEntry; index: number }) {
  const soon = isComingSoon(entry)
  return (
    <div className="journal-feature">
      <div className="journal-feature-top">
        <span className="journal-vol">{entry.date}</span>
        <span className="journal-feature-index">{String(index).padStart(2, '0')}</span>
      </div>
      <h3 className="journal-feature-title">{entry.title}</h3>
      <div className="journal-tags">
        {entry.tags.map((tag) => (
          <span key={tag} className="journal-tag">
            #{tag}
          </span>
        ))}
      </div>
      {entry.pullQuote ? (
        <blockquote className="journal-pullquote">
          <span className="journal-pullquote-mark" aria-hidden>
            &ldquo;
          </span>
          {entry.pullQuote}
        </blockquote>
      ) : null}
      <span className="journal-feature-rule" aria-hidden />
      {soon ? <span className="journal-soon-pill">Coming soon</span> : null}
    </div>
  )
}

/** Notes (right) page of a spread — summary + Details / coming soon. */
function NotesPage({
  entry,
  pageNum,
  onOpen,
}: {
  entry: JournalEntry
  pageNum: number
  onOpen: () => void
}) {
  const soon = isComingSoon(entry)
  return (
    <div className="journal-notes">
      <div className="journal-notes-head">
        <span>Field note</span>
        <span className="journal-page-num">{String(pageNum).padStart(2, '0')}</span>
      </div>

      <div className="journal-notes-mobilehead">
        <span className="journal-vol">{entry.date}</span>
        <h3 className="journal-notes-title">{entry.title}</h3>
        <div className="journal-tags">
          {entry.tags.map((tag) => (
            <span key={tag} className="journal-tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <p className="journal-notes-label">Summary</p>
      <p className="journal-notes-summary">{entry.summary}</p>

      <div className="journal-notes-foot">
        {soon ? (
          <span className="journal-soon-inline">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            More is being written
          </span>
        ) : (
          <>
            <button type="button" className="journal-details-btn" onClick={onOpen}>
              <BookOpen className="h-4 w-4" aria-hidden />
              Details
            </button>
            {entry.readTime ? (
              <span className="journal-readtime">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {entry.readTime}
              </span>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

function JournalReader({
  entry,
  onClose,
}: {
  entry: JournalEntry
  onClose: () => void
}) {
  const [progress, setProgress] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 1)
  }

  return (
    <div className="journal-reader" role="dialog" aria-modal="true" aria-label={entry.title}>
      <button
        type="button"
        className="journal-reader-scrim"
        aria-label="Close reader"
        onClick={onClose}
      />
      <div className="journal-reader-panel">
        <div className="journal-reader-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden />
        <header className="journal-reader-head">
          <div className="journal-reader-meta">
            <span className="journal-vol">{entry.date}</span>
            {entry.readTime ? (
              <span className="journal-readtime">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {entry.readTime} read
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className="journal-reader-close station-button station-button-secondary !h-10 !w-10 !p-0"
            aria-label="Close reader"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="journal-reader-scroll" ref={scrollRef} onScroll={onScroll}>
          <div className="journal-reader-article">
            <div className="journal-tags">
              {entry.tags.map((tag) => (
                <span key={tag} className="journal-tag">
                  #{tag}
                </span>
              ))}
            </div>
            <h2 className="journal-reader-title">{entry.title}</h2>

            {entry.pullQuote ? (
              <blockquote className="journal-reader-quote">{entry.pullQuote}</blockquote>
            ) : null}

            <div className="journal-reader-body">
              {entry.body.map((para, p) => (
                <p key={p} className={p === 0 ? 'has-dropcap' : ''}>
                  {para}
                </p>
              ))}
            </div>

            <div className="journal-reader-end" aria-hidden>
              <span className="journal-feature-rule" />
              <span className="journal-reader-end-mark">YZ.</span>
              <span className="journal-feature-rule" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function JournalContent() {
  // Leaf 0 is the cover; the rest are one journal entry each.
  const total = journalEntries.length + 1
  const [current, setCurrent] = useState(0)
  const [readerId, setReaderId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const turn = useCallback(
    (dir: 1 | -1) => {
      setCurrent((c) => Math.max(0, Math.min(total - 1, c + dir)))
    },
    [total]
  )

  const readerEntry = useMemo(
    () => journalEntries.find((e) => e.id === readerId) ?? null,
    [readerId]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (readerId) {
        if (e.key === 'Escape') setReaderId(null)
        return
      }
      if (e.key === 'ArrowRight') turn(1)
      if (e.key === 'ArrowLeft') turn(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turn, readerId])

  useEffect(() => {
    document.body.style.overflow = readerId ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [readerId])

  return (
    <SitePageLayout
      breadcrumbs={[
        { name: 'Bridge', path: '' },
        { name: 'Journal', path: '/journal' },
      ]}
    >
      <SitePageHero
        eyebrow="Field notes · log"
        title="The Journal"
        description="A working log of how this station gets built. Turn the pages — each spread opens with its tags and a short summary, and the Details button unrolls the full story across the screen."
      />

      <div className="journal-stage">
        <div className="journal-aura" aria-hidden />

        <div className="journal-book" data-current={current} data-open={current > 0 ? 'true' : 'false'}>
          <div className="journal-book-base" aria-hidden>
            <span className="journal-spine-glow" />
          </div>

          <div className="journal-pages">
            {Array.from({ length: total }).map((_, i) => {
              const turned = i < current
              const zIndex = turned ? i + 1 : 100 + (total - i)
              const isCover = i === 0
              const frontEntry = isCover ? null : journalEntries[i - 1]
              const backEntry = journalEntries[i] ?? null
              return (
                <div
                  key={i}
                  className={`journal-leaf ${turned ? 'is-turned' : ''} ${isCover ? 'is-cover' : ''}`}
                  style={{ zIndex }}
                >
                  <div className="journal-face journal-face-front">
                    {isCover ? (
                      <div className="journal-cover-face">
                        <span className="journal-cover-rule" aria-hidden />
                        <span className="journal-cover-eyebrow">Build log</span>
                        <h2 className="journal-cover-title">
                          YZ<span className="text-cyan">.</span> Journal<span className="text-cyan">.</span>
                        </h2>
                        <p className="journal-cover-sub">Build notes from the station</p>
                        <span className="journal-cover-rule" aria-hidden />
                        <button type="button" className="journal-cover-open" onClick={() => turn(1)}>
                          Open the journal
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : frontEntry ? (
                      <NotesPage
                        entry={frontEntry}
                        pageNum={i}
                        onOpen={() => setReaderId(frontEntry.id)}
                      />
                    ) : null}
                  </div>

                  <div className="journal-face journal-face-back" aria-hidden={!backEntry}>
                    {backEntry ? (
                      <FeaturePage entry={backEntry} index={i + 1} />
                    ) : (
                      <div className="journal-end-face">
                        <span className="journal-back-motif">YZ.</span>
                        <p className="journal-end-text">More notes are on the way.</p>
                        <span className="journal-soon-pill">Coming soon</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="journal-controls">
          <button
            type="button"
            className="dev-stage-btn"
            aria-label="Previous page"
            onClick={() => turn(-1)}
            disabled={current === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="journal-page-indicator">
            {current === 0 ? 'Cover' : `Spread ${current} / ${total - 1}`}
          </span>
          <button
            type="button"
            className="dev-stage-btn"
            aria-label="Next page"
            onClick={() => turn(1)}
            disabled={current === total - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {mounted && readerEntry
        ? createPortal(
            <JournalReader entry={readerEntry} onClose={() => setReaderId(null)} />,
            document.body
          )
        : null}
    </SitePageLayout>
  )
}
