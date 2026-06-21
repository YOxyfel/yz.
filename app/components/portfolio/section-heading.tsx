import { StationLed, StationPanel } from './station-console'
import type { StationTone } from './station-console'

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  tone?: StationTone
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone,
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === 'center'
          ? 'mx-auto max-w-2xl text-center'
          : 'max-w-2xl text-left'
      }
    >
      <StationPanel
        variant="module"
        backLabel="SECTOR-LABEL"
        data-section-tone={tone}
        className={`station-sector-heading ${align === 'center' ? 'mx-auto inline-block text-center' : 'inline-block'}`}
      >
        <p
          className={`station-readout-label flex items-center gap-2 ${align === 'center' ? 'justify-center' : ''}`}
        >
          <StationLed active />
          <span>
            <span className="station-bracket">[</span>
            {eyebrow}
            <span className="station-bracket">]</span>
          </span>
        </p>
        <h2 className="font-heading mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </StationPanel>
    </div>
  )
}
