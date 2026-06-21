import { ListChecks } from 'lucide-react'
import { StationChip, StationPanel } from './station-console'

export function KeyTakeaways({
  title,
  items,
  backLabel = 'TAKE',
}: {
  title: string
  items: string[]
  backLabel?: string
}) {
  return (
    <StationPanel variant="module" backLabel={backLabel} className="station-takeaways">
      <div className="relative z-[1] flex gap-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan/35 bg-cyan/10 text-cyan">
          <ListChecks className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl font-bold tracking-tight">{title}</h2>
            <StationChip className="station-chip-active !text-[9px]">Key takeaways</StationChip>
          </div>
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-pretty text-sm leading-relaxed text-muted-foreground"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </StationPanel>
  )
}
