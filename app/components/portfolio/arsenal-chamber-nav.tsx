'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { arsenalChambers, type ArsenalChamberId } from './arsenal-chambers'
import { useDeviceProfile } from './device-profile'
import { StationChip, StationLed, StationPanel } from './station-console'

type ArsenalChamberNavProps = {
  selectedId: ArsenalChamberId
  onSelect: (id: ArsenalChamberId) => void
  onPrev: () => void
  onNext: () => void
}

export function ArsenalChamberNav({
  selectedId,
  onSelect,
  onPrev,
  onNext,
}: ArsenalChamberNavProps) {
  const { isNarrow, isTablet, isCoarsePointer } = useDeviceProfile()
  const useCompactNav = isNarrow || isTablet || isCoarsePointer
  const index = arsenalChambers.findIndex((chamber) => chamber.id === selectedId)
  const active = arsenalChambers[index] ?? arsenalChambers[0]
  const ActiveIcon = active.icon

  return (
    <div className="mt-12">
      <div className="mb-6 flex gap-1.5">
        {arsenalChambers.map((chamber, chamberIndex) => (
          <button
            key={chamber.id}
            type="button"
            onClick={() => onSelect(chamber.id)}
            aria-label={`Open ${chamber.title}`}
            className={`h-1.5 flex-1 rounded-sm transition-colors ${
              chamberIndex <= index
                ? 'bg-cyan shadow-[0_0_10px_var(--cyan)]'
                : 'bg-[var(--station-hull-dark)] hover:bg-[var(--station-bezel)]'
            }`}
          />
        ))}
      </div>

      <StationPanel variant="module" iso={false} className="station-panel-compact arsenal-station-nav">
        {useCompactNav ? (
          <div className="arsenal-station-nav-compact relative z-[1]">
            <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous discipline"
              className="station-button station-button-secondary !h-11 !w-11 shrink-0 !p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1 rounded-lg border border-[var(--station-bezel)]/45 bg-[var(--station-hull-dark)]/50 px-3 py-3 text-center">
              <p className="station-readout-label flex items-center justify-center gap-2">
                <ActiveIcon className="h-3.5 w-3.5" />
                <StationLed active />
                {active.eyebrow}
              </p>
              <h3 className="font-heading mt-2 text-lg font-bold tracking-tight sm:text-xl">
                {active.title}
              </h3>
              <StationChip className="mx-auto mt-2 min-w-[4.5rem] justify-center">
                {String(index + 1).padStart(2, '0')} / {String(arsenalChambers.length).padStart(2, '0')}
              </StationChip>
            </div>

            <button
              type="button"
              onClick={onNext}
              aria-label="Next discipline"
              className="station-button station-button-secondary !h-11 !w-11 shrink-0 !p-0"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative z-[1]">
              <p className="station-readout-label mb-3 flex items-center gap-2">
                <StationLed active />
                Select a lab · {String(arsenalChambers.length).padStart(2, '0')} disciplines
              </p>
              <div className="arsenal-lab-tabs grid grid-cols-2 gap-2 sm:grid-cols-4">
                {arsenalChambers.map((chamber, chamberIndex) => {
                  const Icon = chamber.icon
                  const isActive = chamber.id === selectedId
                  return (
                    <button
                      key={chamber.id}
                      type="button"
                      onClick={() => onSelect(chamber.id)}
                      aria-pressed={isActive}
                      aria-label={`Open ${chamber.title}`}
                      className={`arsenal-lab-tab ${isActive ? 'arsenal-lab-tab-active' : ''}`}
                    >
                      <span className="arsenal-lab-tab-index">
                        {String(chamberIndex + 1).padStart(2, '0')}
                      </span>
                      <Icon className="arsenal-lab-tab-icon" />
                      <span className="arsenal-lab-tab-label">{chamber.shortTitle}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="relative z-[1] mt-5 flex flex-col gap-4 border-t border-[var(--station-bezel)]/40 pt-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="station-readout-label flex items-center gap-2">
                  <ActiveIcon className="h-3.5 w-3.5" />
                  <StationLed active />
                  {active.eyebrow}
                </p>
                <h3 className="font-heading mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                  {active.title}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {active.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-end lg:self-start">
                <button
                  type="button"
                  onClick={onPrev}
                  aria-label="Previous discipline"
                  className="station-button station-button-secondary !h-10 !w-10 !p-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <StationChip className="min-w-[4.5rem] justify-center">
                  {String(index + 1).padStart(2, '0')} / {String(arsenalChambers.length).padStart(2, '0')}
                </StationChip>
                <button
                  type="button"
                  onClick={onNext}
                  aria-label="Next discipline"
                  className="station-button station-button-secondary !h-10 !w-10 !p-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}

        {useCompactNav ? (
          <p className="relative z-[1] mt-4 rounded-lg border border-[var(--station-bezel)]/35 bg-[var(--station-hull-dark)]/40 px-3 py-3 text-sm leading-relaxed text-muted-foreground">
            {active.description}
          </p>
        ) : null}
      </StationPanel>
    </div>
  )
}
