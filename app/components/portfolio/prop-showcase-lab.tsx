'use client'

import { Box } from 'lucide-react'
import { CharacterConfigurator } from './character-configurator'
import { LabShell } from './arsenal-lab-shell'
import { LabFxControls, LabFxPreferencesProvider } from './lab-fx-preferences'

function PropShowcaseLabInner({ embedded = false }: { embedded?: boolean }) {
  return (
    <LabShell
      embedded={embedded}
      eyebrow="3D Character · Blender"
      title="Character Forge"
      description="A rigged character with swappable wearables and playable animations. Cycle each region — glasses, hat, hoodie, pants, shoes — with the side arrows, drag to reveal the wireframe under the render, and switch animation clips. Animations apply across every outfit."
      icon={Box}
      controls={<LabFxControls labName="props" />}
    >
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <CharacterConfigurator />
        <div className="flex flex-col justify-center space-y-5 rounded-2xl border border-white/10 bg-black/30 p-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan">
              Real-time 3D
            </p>
            <h4 className="font-heading mt-2 text-2xl font-bold tracking-tight">
              Modular outfit rig
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              One skeleton drives the body and every wearable, so each animation plays cleanly no
              matter which outfit is equipped. Toggle topology with the wireframe swipe to inspect
              the game-ready mesh.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Rigged', 'Modular wearables', 'Animated', 'Blender', 'glTF'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </LabShell>
  )
}

export function PropShowcaseLab({ embedded = false }: { embedded?: boolean }) {
  return (
    <LabFxPreferencesProvider>
      <PropShowcaseLabInner embedded={embedded} />
    </LabFxPreferencesProvider>
  )
}
