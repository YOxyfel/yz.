'use client'

import { useMemo, useState } from 'react'
import { Box } from 'lucide-react'
import { propAssets } from './arsenal-props'
import { CatalogStrip, LabShell, LabTransition } from './arsenal-lab-shell'
import { PropViewer } from './prop-viewer'
import { VisualFxControls, useVisualFxPreferences } from './visual-fx-preferences'

function PropShowcaseLabInner({ embedded = false }: { embedded?: boolean }) {
  const [selectedId, setSelectedId] = useState(propAssets[0].id)
  const { screenFxLive, toggleScreenFxLive } = useVisualFxPreferences()

  const selected = useMemo(
    () => propAssets.find((asset) => asset.id === selectedId) ?? propAssets[0],
    [selectedId]
  )

  const go = (step: number) => {
    const index = propAssets.findIndex((asset) => asset.id === selectedId)
    const next = propAssets[(index + step + propAssets.length) % propAssets.length]
    setSelectedId(next.id)
  }

  return (
    <LabShell
      embedded={embedded}
      eyebrow="3D Art & Props · Blender"
      title="Prop Forge"
      description="Inspectable game-ready assets — orbit in real time, expose quad topology, and swipe between rendered and wireframe reads. Each slot in the carousel gets the full stage."
      icon={Box}
      controls={
        <VisualFxControls screenFxActive={screenFxLive} onToggleScreenFx={toggleScreenFxLive} />
      }
    >
      <CatalogStrip
        items={propAssets}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
      />

      <LabTransition itemKey={selected.id}>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <PropViewer asset={selected} />
          <div className="flex flex-col justify-center space-y-5 rounded-2xl border border-white/10 bg-black/30 p-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan">
                {selected.category}
              </p>
              <h4 className="font-heading mt-2 text-2xl font-bold tracking-tight">{selected.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Status · {selected.status === 'pipeline' ? 'In pipeline' : 'Production ready'}
            </p>
          </div>
        </div>
      </LabTransition>
    </LabShell>
  )
}

export function PropShowcaseLab({ embedded = false }: { embedded?: boolean }) {
  return <PropShowcaseLabInner embedded={embedded} />
}
