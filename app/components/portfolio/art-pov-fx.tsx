'use client'

import { motion } from 'framer-motion'
import { useVisualFxPreferences } from './visual-fx-preferences'

type ArtPovFxProps = {
  accent: 'cyan' | 'violet' | 'amber'
  cycling: boolean
  transitionKey: string
  active: boolean
}

const accentColor: Record<ArtPovFxProps['accent'], string> = {
  cyan: 'var(--cyan)',
  violet: 'var(--violet)',
  amber: 'oklch(0.75 0.15 75)',
}

const accentRgb: Record<ArtPovFxProps['accent'], string> = {
  cyan: 'oklch(0.84 0.16 200 / 0.55)',
  violet: 'oklch(0.55 0.24 295 / 0.55)',
  amber: 'oklch(0.75 0.15 75 / 0.5)',
}

export function ArtPovFx({ accent, cycling, transitionKey, active }: ArtPovFxProps) {
  const { showScreenFx, isReduced } = useVisualFxPreferences()

  if (!active || !showScreenFx || isReduced) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-[12] overflow-hidden rounded-2xl" aria-hidden>
      {cycling ? (
        <div
          className="art-orbit-ring absolute inset-3 rounded-[1.1rem] border border-dashed opacity-70"
          style={{ borderColor: accentRgb[accent] }}
        />
      ) : null}

      {cycling ? (
        <>
          <span
            className="art-orbit-orb absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 rounded-full blur-[1px]"
            style={{ background: accentColor[accent], boxShadow: `0 0 14px ${accentColor[accent]}` }}
          />
          <span
            className="art-orbit-orb art-orbit-orb-delayed absolute bottom-8 right-8 h-1.5 w-1.5 rounded-full blur-[1px]"
            style={{ background: accentColor[accent], boxShadow: `0 0 10px ${accentColor[accent]}` }}
          />
        </>
      ) : null}

      <motion.div
        key={transitionKey}
        className="art-pov-sweep absolute inset-y-0 left-0 w-2/5"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentRgb[accent]}, transparent)`,
        }}
        initial={{ x: '-120%', opacity: 0.85 }}
        animate={{ x: '320%', opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        key={`${transitionKey}-burst`}
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${accentRgb[accent]}, transparent 68%)`,
        }}
        initial={{ scale: 0.2, opacity: 0.7 }}
        animate={{ scale: 2.4, opacity: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      />
    </div>
  )
}
