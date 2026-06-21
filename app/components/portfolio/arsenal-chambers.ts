import { Box, Clapperboard, Sparkles, Waves, type LucideIcon } from 'lucide-react'

export type ArsenalChamberId = 'spotlight' | 'props' | 'art' | 'audio'

export type ArsenalChamber = {
  id: ArsenalChamberId
  title: string
  shortTitle: string
  eyebrow: string
  description: string
  icon: LucideIcon
}

export const arsenalChambers: ArsenalChamber[] = [
  {
    id: 'spotlight',
    title: 'Spotlight Reel',
    shortTitle: 'Spotlight',
    eyebrow: 'Character creation · 120 FPS',
    description:
      'Cinema-style promo reel with manual playback — intro copy, expanded theater view, and side-panel context while the reel runs.',
    icon: Clapperboard,
  },
  {
    id: 'props',
    title: 'Prop Forge',
    shortTitle: '3D Props',
    eyebrow: '3D art & props · Blender',
    description:
      'Inspectable game-ready assets — orbit in real time, expose topology, and compare rendered versus wireframe reads.',
    icon: Box,
  },
  {
    id: 'art',
    title: 'Cultivation Gallery',
    shortTitle: 'Concept Art',
    eyebrow: 'Concept art · AI-assisted pipeline',
    description:
      'Character sheets with four POVs per cast member, parallax, ambient VFX, and a carousel for each hero.',
    icon: Sparkles,
  },
  {
    id: 'audio',
    title: 'Sound Design Lab',
    shortTitle: 'Audio',
    eyebrow: 'Audio architecture · Reaper DAW',
    description:
      'Found, recorded, and AI-assisted sources layered in Reaper — select a cue to inspect the pipeline and hear it.',
    icon: Waves,
  },
]
