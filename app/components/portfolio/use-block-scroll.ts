'use client'

import { useEffect, useRef } from 'react'
import {
  BLOCK_NAV_SCROLL_EVENT,
  BLOCK_SCROLL_PAIR_IDS,
  type BlockScrollPairId,
} from './block-scroll-nav'

const NAV_OFFSET_PX = 88
const WHEEL_THRESHOLD = 95
const SNAP_ANIM_LOCK_MS = 850
const ACCUM_DECAY_MS = 380
const SECTION_SCROLL_BUFFER_PX = 300
const EDGE_BAND_MIN_PX = 96
const EDGE_BAND_VIEWPORT_RATIO = 0.14
const EDGE_BAND_SECTION_RATIO = 0.12

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function isNestedScrollSurface(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  let node: Element | null = target
  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node)
      const overflowY = style.overflowY
      if (
        (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
        node.scrollHeight > node.clientHeight + 2
      ) {
        return true
      }
    }
    node = node.parentElement
  }
  return false
}

function isScrollBlocked() {
  if (document.documentElement.dataset.mobileSkyLab === 'on') return true
  if (document.documentElement.dataset.crazySkyFocus === 'on') return true
  if (document.body.dataset.projectModal === 'open') return true
  if (document.body.style.overflow === 'hidden') return true
  return false
}

function getScrollBlocks() {
  return BLOCK_SCROLL_PAIR_IDS.map((id) => document.getElementById(id)).filter(
    (node): node is HTMLElement => node instanceof HTMLElement
  )
}

function blockMetrics(block: HTMLElement) {
  const rect = block.getBoundingClientRect()
  const top = window.scrollY + rect.top
  return { block, top, height: rect.height, rect }
}

type ScrollBlockEntry = ReturnType<typeof blockMetrics>

function activePairIndex(blocks: ScrollBlockEntry[], scrollY = window.scrollY): number | null {
  const topEntry = blocks[0]
  const engineEntry = blocks[1]
  if (!topEntry || !engineEntry) return null

  const marker = scrollY + NAV_OFFSET_PX + 24

  if (marker < engineEntry.top - 4) return 0
  if (marker < engineEntry.top + engineEntry.height - 4) return 1
  return null
}

function edgeBand(entry: ScrollBlockEntry) {
  return Math.max(
    EDGE_BAND_MIN_PX,
    window.innerHeight * EDGE_BAND_VIEWPORT_RATIO,
    entry.height * EDGE_BAND_SECTION_RATIO
  )
}

function bufferRequired(entry: ScrollBlockEntry) {
  return Math.min(SECTION_SCROLL_BUFFER_PX, Math.max(entry.height - 40, 160))
}

function atTopEdge(entry: ScrollBlockEntry) {
  const focusY = window.scrollY + NAV_OFFSET_PX
  const depthFromTop = focusY - entry.top
  return depthFromTop <= edgeBand(entry)
}

function atBottomEdge(entry: ScrollBlockEntry) {
  const depthFromBottom = entry.top + entry.height - (window.scrollY + window.innerHeight)
  return depthFromBottom <= edgeBand(entry)
}

function scrollProgress(
  enterScrollY: number,
  edgeWheelDownPx: number,
  edgeWheelUpPx: number
) {
  return {
    down: Math.max(0, window.scrollY - enterScrollY) + edgeWheelDownPx,
    up: Math.max(0, enterScrollY - window.scrollY) + edgeWheelUpPx,
  }
}

function canSnapDown(
  entry: ScrollBlockEntry,
  enterScrollY: number,
  edgeWheelDownPx: number,
  edgeWheelUpPx: number,
  skipBuffer: boolean
) {
  if (!atBottomEdge(entry)) return false
  if (skipBuffer) return true
  const { down } = scrollProgress(enterScrollY, edgeWheelDownPx, edgeWheelUpPx)
  return down >= bufferRequired(entry)
}

function canSnapUp(
  entry: ScrollBlockEntry,
  enterScrollY: number,
  edgeWheelDownPx: number,
  edgeWheelUpPx: number,
  skipBuffer: boolean
) {
  if (!atTopEdge(entry)) return false
  if (skipBuffer) return true
  const { up } = scrollProgress(enterScrollY, edgeWheelDownPx, edgeWheelUpPx)
  return up >= bufferRequired(entry)
}

export function useBlockScroll({
  enabled = true,
  reducedMotion = false,
}: {
  enabled?: boolean
  reducedMotion?: boolean
}) {
  const accumRef = useRef(0)
  const lockRef = useRef(false)
  const activeIndexRef = useRef(0)
  const snapTargetIndexRef = useRef<number | null>(null)
  const sectionEnterScrollYRef = useRef(0)
  const edgeWheelDownRef = useRef(0)
  const edgeWheelUpRef = useRef(0)
  const skipBufferRef = useRef(false)
  const lockTimerRef = useRef<number | null>(null)
  const decayTimerRef = useRef<number | null>(null)

  useEffect(() => {
    document.documentElement.dataset.blockScroll = enabled ? 'on' : 'off'
    return () => {
      delete document.documentElement.dataset.blockScroll
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const beginSection = (index: number, options?: { skipBuffer?: boolean }) => {
      activeIndexRef.current = index
      sectionEnterScrollYRef.current = window.scrollY
      edgeWheelDownRef.current = 0
      edgeWheelUpRef.current = 0
      skipBufferRef.current = options?.skipBuffer ?? false
      accumRef.current = 0
    }

    const syncActiveIndex = () => {
      const blocks = getScrollBlocks().map(blockMetrics)
      if (blocks.length < 2) return
      const index = activePairIndex(blocks)
      if (index !== null && index !== activeIndexRef.current) {
        beginSection(index)
      }
    }

    const blocks = getScrollBlocks().map(blockMetrics)
    const initialIndex = activePairIndex(blocks)
    if (initialIndex !== null) {
      beginSection(initialIndex)
    }

    const releaseSnapLock = () => {
      lockRef.current = false
      accumRef.current = 0
      snapTargetIndexRef.current = null
      syncActiveIndex()
    }

    const lockSnap = () => {
      lockRef.current = true
      if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current)
      lockTimerRef.current = window.setTimeout(releaseSnapLock, SNAP_ANIM_LOCK_MS)
    }

    const scheduleDecay = () => {
      if (decayTimerRef.current) window.clearTimeout(decayTimerRef.current)
      decayTimerRef.current = window.setTimeout(() => {
        accumRef.current = 0
      }, ACCUM_DECAY_MS)
    }

    const scrollToBlock = (entry: ScrollBlockEntry) => {
      const top = Math.max(0, entry.top - NAV_OFFSET_PX)
      window.scrollTo({
        top,
        behavior: reducedMotion ? 'auto' : 'smooth',
      })
    }

    const snapTo = (index: number, blocks: ScrollBlockEntry[], fromNav = false) => {
      const target = blocks[index]
      if (!target) return
      snapTargetIndexRef.current = index
      beginSection(index, { skipBuffer: fromNav })
      lockSnap()
      scrollToBlock(target)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.shiftKey || lockRef.current || isScrollBlocked()) return
      if (isTypingTarget(event.target) || isNestedScrollSurface(event.target)) return

      const blocks = getScrollBlocks().map(blockMetrics)
      if (blocks.length < 2) return

      const pairIndex = activePairIndex(blocks)
      if (pairIndex === null) return

      const scrollingDown = event.deltaY > 0

      if (pairIndex === 0 && !scrollingDown) return
      if (pairIndex === 1 && scrollingDown) return

      if (!lockRef.current && pairIndex !== activeIndexRef.current) {
        beginSection(pairIndex)
      }

      const index = pairIndex
      const entry = blocks[index]
      if (!entry) return

      const enterScrollY = sectionEnterScrollYRef.current
      const skipBuffer = skipBufferRef.current
      const progress = scrollProgress(
        enterScrollY,
        edgeWheelDownRef.current,
        edgeWheelUpRef.current
      )
      const required = bufferRequired(entry)

      if (scrollingDown) {
        if (!atBottomEdge(entry)) {
          edgeWheelDownRef.current = 0
          return
        }

        if (!skipBuffer && progress.down < required) {
          edgeWheelDownRef.current += Math.max(0, event.deltaY)
          event.preventDefault()
          accumRef.current = 0
          return
        }

        if (!canSnapDown(entry, enterScrollY, edgeWheelDownRef.current, edgeWheelUpRef.current, skipBuffer)) {
          return
        }
      } else {
        if (!atTopEdge(entry)) {
          edgeWheelUpRef.current = 0
          return
        }

        if (!skipBuffer && progress.up < required) {
          edgeWheelUpRef.current += Math.max(0, -event.deltaY)
          event.preventDefault()
          accumRef.current = 0
          return
        }

        if (!canSnapUp(entry, enterScrollY, edgeWheelDownRef.current, edgeWheelUpRef.current, skipBuffer)) {
          return
        }
      }

      accumRef.current += event.deltaY
      scheduleDecay()

      if (Math.abs(accumRef.current) < WHEEL_THRESHOLD) {
        event.preventDefault()
        return
      }

      const nextIndex = scrollingDown ? 1 : 0
      if (nextIndex === index) {
        accumRef.current = 0
        return
      }

      event.preventDefault()
      snapTo(nextIndex, blocks)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (lockRef.current || isScrollBlocked() || isTypingTarget(event.target)) return
      if (event.key !== 'PageDown' && event.key !== 'PageUp') return

      const blocks = getScrollBlocks().map(blockMetrics)
      if (blocks.length < 2) return

      const pairIndex = activePairIndex(blocks)
      if (pairIndex === null) return

      const goingDown = event.key === 'PageDown'
      if (pairIndex === 0 && !goingDown) return
      if (pairIndex === 1 && goingDown) return

      const entry = blocks[pairIndex]
      if (!entry) return

      const allowed = goingDown
        ? canSnapDown(
            entry,
            sectionEnterScrollYRef.current,
            edgeWheelDownRef.current,
            edgeWheelUpRef.current,
            skipBufferRef.current
          )
        : canSnapUp(
            entry,
            sectionEnterScrollYRef.current,
            edgeWheelDownRef.current,
            edgeWheelUpRef.current,
            skipBufferRef.current
          )

      if (!allowed) return

      event.preventDefault()
      snapTo(goingDown ? 1 : 0, blocks)
    }

    const onBlockNavScroll = (event: Event) => {
      const detail = (event as CustomEvent<{ targetId: BlockScrollPairId }>).detail
      const targetId = detail?.targetId
      if (!targetId) return

      const blocks = getScrollBlocks().map(blockMetrics)
      const index = blocks.findIndex((entry) => entry.block.id === targetId)
      if (index < 0) return

      snapTo(index, blocks, true)
    }

    const onScroll = () => {
      if (lockRef.current) return
      const blocks = getScrollBlocks().map(blockMetrics)
      const pairIndex = activePairIndex(blocks)
      const entry = pairIndex !== null ? blocks[pairIndex] : null
      if (entry) {
        if (!atTopEdge(entry)) edgeWheelUpRef.current = 0
        if (!atBottomEdge(entry)) edgeWheelDownRef.current = 0
      }
      syncActiveIndex()
    }

    const onScrollEnd = () => {
      if (snapTargetIndexRef.current === null) {
        if (!lockRef.current) syncActiveIndex()
        return
      }
      if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current)
      releaseSnapLock()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', onScrollEnd)
    window.addEventListener(BLOCK_NAV_SCROLL_EVENT, onBlockNavScroll)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', onScrollEnd)
      window.removeEventListener(BLOCK_NAV_SCROLL_EVENT, onBlockNavScroll)
      if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current)
      if (decayTimerRef.current) window.clearTimeout(decayTimerRef.current)
    }
  }, [enabled, reducedMotion])
}
