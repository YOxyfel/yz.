'use client'

export const BLOCK_SCROLL_PAIR_IDS = ['top', 'engine'] as const

export type BlockScrollPairId = (typeof BLOCK_SCROLL_PAIR_IDS)[number]

export function isBlockScrollPair(targetId: string): targetId is BlockScrollPairId {
  return (BLOCK_SCROLL_PAIR_IDS as readonly string[]).includes(targetId)
}

/** Nav / in-page anchors call this to jump between hero and engine without wheel buffer. */
export function requestBlockNavScroll(target: string) {
  const targetId = target.replace(/^#/, '')
  if (!isBlockScrollPair(targetId)) return

  window.dispatchEvent(
    new CustomEvent('portfolio:block-nav-scroll', {
      detail: { targetId },
    })
  )
}

export const BLOCK_NAV_SCROLL_EVENT = 'portfolio:block-nav-scroll'
