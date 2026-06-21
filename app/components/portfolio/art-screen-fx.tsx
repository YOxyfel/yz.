'use client'

import { useMemo } from 'react'

type ArtScreenFxProps = {
  active: boolean
  accent: 'cyan' | 'violet' | 'amber'
  reduced?: boolean
}

const accentTheme = {
  cyan: {
    glow: 'oklch(0.84 0.16 200 / 0.32)',
    glowStrong: 'oklch(0.84 0.16 200 / 0.5)',
    mist: 'oklch(0.78 0.14 200 / 0.22)',
    floor: 'oklch(0.72 0.16 200 / 0.45)',
    rim: 'oklch(0.9 0.12 200 / 0.35)',
    ink: 'oklch(0.55 0.2 250 / 0.15)',
  },
  violet: {
    glow: 'oklch(0.55 0.24 295 / 0.34)',
    glowStrong: 'oklch(0.55 0.24 295 / 0.52)',
    mist: 'oklch(0.5 0.22 295 / 0.24)',
    floor: 'oklch(0.48 0.22 295 / 0.48)',
    rim: 'oklch(0.65 0.2 295 / 0.38)',
    ink: 'oklch(0.4 0.18 280 / 0.18)',
  },
  amber: {
    glow: 'oklch(0.75 0.15 75 / 0.32)',
    glowStrong: 'oklch(0.78 0.16 75 / 0.5)',
    mist: 'oklch(0.72 0.14 70 / 0.22)',
    floor: 'oklch(0.68 0.15 65 / 0.45)',
    rim: 'oklch(0.82 0.12 80 / 0.35)',
    ink: 'oklch(0.55 0.12 45 / 0.16)',
  },
} as const

export function ArtScreenFx({ active, accent, reduced = false }: ArtScreenFxProps) {
  const theme = accentTheme[accent]

  const orbs = useMemo(
    () =>
      Array.from({ length: reduced ? 6 : 16 }, (_, index) => ({
        id: index,
        left: `${4 + ((index * 13) % 92)}%`,
        top: `${8 + ((index * 19) % 78)}%`,
        size: 28 + (index % 5) * 22,
        delay: index * 0.55,
      })),
    [reduced]
  )

  const sparks = useMemo(
    () =>
      Array.from({ length: reduced ? 0 : 8 }, (_, index) => ({
        id: index,
        left: `${15 + index * 10}%`,
        delay: index * 1.1,
      })),
    [reduced]
  )

  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 95% 70% at 50% 88%, ${theme.floor}, transparent 62%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 42%, ${theme.glowStrong}, transparent 68%)`,
        }}
      />
      <div
        className="art-halo-pulse absolute left-1/2 top-[38%] h-[55%] w-[70%] rounded-full blur-3xl"
        style={{ background: theme.glow }}
      />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(ellipse 50% 45% at 50% 38%, ${theme.rim}, transparent 72%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(165deg, ${theme.ink} 0%, transparent 38%, transparent 62%, ${theme.mist} 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,oklch(0.08_0.01_270/0.75)_100%)]" />

      {!reduced ? (
        <>
          {orbs.map((orb) => (
            <span
              key={orb.id}
              className="art-qi-orb absolute rounded-full blur-xl"
              style={{
                left: orb.left,
                top: orb.top,
                width: orb.size,
                height: orb.size,
                background: theme.glow,
                animationDelay: `${orb.delay}s`,
              }}
            />
          ))}
          {sparks.map((spark) => (
            <span
              key={spark.id}
              className="art-spark absolute h-px w-8 rotate-45 blur-[0.5px]"
              style={{
                left: spark.left,
                top: `${22 + (spark.id % 4) * 18}%`,
                background: `linear-gradient(90deg, transparent, ${theme.rim}, transparent)`,
                animationDelay: `${spark.delay}s`,
              }}
            />
          ))}
          <div
            className="art-mist absolute inset-x-0 bottom-0 h-2/3 opacity-80"
            style={{
              background: `linear-gradient(to top, ${theme.mist}, transparent 70%)`,
            }}
          />
          <div
            className="art-mist art-mist-delayed absolute inset-x-0 top-0 h-1/3 opacity-50"
            style={{
              background: `linear-gradient(to bottom, ${theme.ink}, transparent 80%)`,
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${theme.glow}, transparent 70%)`,
          }}
        />
      )}
    </div>
  )
}

export function artCharacterGlow(accent: ArtScreenFxProps['accent']) {
  const theme = accentTheme[accent]
  return `drop-shadow(0 0 28px ${theme.glowStrong}) drop-shadow(0 8px 32px oklch(0 0 0 / 0.65))`
}
