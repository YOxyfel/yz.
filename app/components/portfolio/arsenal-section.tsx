'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { AudioArchitecture } from './audio-architecture'
import { ArsenalChamberNav } from './arsenal-chamber-nav'
import { arsenalChambers, type ArsenalChamberId } from './arsenal-chambers'
import { SectionHeading } from './section-heading'
import { StationConsoleFrame, StationSection } from './station-console'

const ArsenalPromoHero = dynamic(
  () => import('./arsenal-promo-hero').then((mod) => ({ default: mod.ArsenalPromoHero })),
  {
    loading: () => (
      <div className="flex min-h-[min(52vh,480px)] items-center justify-center rounded-xl border border-white/10 bg-black/30 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Loading spotlight…
      </div>
    ),
  }
)

const PropShowcaseLab = dynamic(
  () => import('./prop-showcase-lab').then((mod) => ({ default: mod.PropShowcaseLab })),
  {
    loading: () => (
      <div className="flex min-h-[min(52vh,480px)] items-center justify-center rounded-xl border border-white/10 bg-black/30 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Loading props lab…
      </div>
    ),
  }
)

const ArtShowcaseLab = dynamic(
  () => import('./art-showcase-lab').then((mod) => ({ default: mod.ArtShowcaseLab })),
  {
    loading: () => (
      <div className="flex min-h-[min(52vh,480px)] items-center justify-center rounded-xl border border-white/10 bg-black/30 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Loading art lab…
      </div>
    ),
  }
)

export function ArsenalSection() {
  const [activeChamber, setActiveChamber] = useState<ArsenalChamberId>('spotlight')

  const goChamber = useCallback(
    (step: number) => {
      const index = arsenalChambers.findIndex((chamber) => chamber.id === activeChamber)
      const next =
        arsenalChambers[(index + step + arsenalChambers.length) % arsenalChambers.length]
      setActiveChamber(next.id)
    },
    [activeChamber]
  )

  return (
    <StationSection id="arsenal" tone="arsenal">
      <StationConsoleFrame>
        <SectionHeading
          eyebrow="04 — Arsenal Bay"
          title="The Arsenal"
          description="Beyond code, I bridge disciplines — building the art, effects, and audio that make systems feel alive. Pick one lab at a time."
        />

        <ArsenalChamberNav
          selectedId={activeChamber}
          onSelect={setActiveChamber}
          onPrev={() => goChamber(-1)}
          onNext={() => goChamber(1)}
        />

        <div className="relative mt-8 min-h-[min(72vh,720px)]">
          {activeChamber === 'spotlight' ? <ArsenalPromoHero embedded /> : null}
          {activeChamber === 'props' ? <PropShowcaseLab embedded /> : null}
          {activeChamber === 'art' ? <ArtShowcaseLab embedded /> : null}
          {activeChamber === 'audio' ? <AudioArchitecture embedded /> : null}
        </div>
      </StationConsoleFrame>
    </StationSection>
  )
}
