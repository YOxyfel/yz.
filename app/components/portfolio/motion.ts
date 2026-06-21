export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
}

export const flipReveal = {
  hidden: { rotateY: 180 },
  show: {
    rotateY: 0,
    transition: { duration: 1.25, ease: [0.22, 1, 0.36, 1] as const },
  },
}

/** Pause on the back face before rotating to content (ms). */
export const FLIP_BACK_HOLD_MS = 480

/** Flip-in duration when revealing content (seconds). */
export const FLIP_IN_DURATION = 1.25

/** Flip-out duration when returning to back (seconds). */
export const FLIP_OUT_DURATION = 0.95

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
