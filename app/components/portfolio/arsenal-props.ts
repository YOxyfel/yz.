import { arsenalPath } from './arsenal-path'

export type PropViewMode =
  | 'orbit'
  | 'wireframe'
  | 'beauty'
  | 'swipe-live'
  | 'swipe-images'
  | 'swipe-hybrid'

export type PropAsset = {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
  /** glTF binary — drop into public/arsenal/models/ when ready */
  glb?: string
  beauty?: string
  wireframe?: string
  poster?: string
  polyCount?: string
  status: 'ready' | 'pipeline'
}

export const propViewModeLabels: Record<PropViewMode, string> = {
  orbit: 'Orbit',
  wireframe: 'Wireframe',
  beauty: 'Beauty',
  'swipe-live': 'Swipe · Live',
  'swipe-images': 'Swipe · Stills',
  'swipe-hybrid': 'Swipe · Hybrid',
}

export const propAssets: PropAsset[] = [
  {
    id: 'prop-slot-01',
    title: 'Hard-surface weapon',
    category: 'Weapons',
    description:
      'Game-ready hard-surface prop slot — optimized topology, clean UVs, and PBR texturing pipeline.',
    tags: ['Hard-surface', 'PBR', 'Blender'],
    status: 'pipeline',
    poster: arsenalPath('promo', 'PromoVideoV3_120FPS', 'PromoVideoV3_120FPS-Cover.jpg'),
  },
  {
    id: 'prop-slot-02',
    title: 'Character bust',
    category: 'Characters',
    description:
      'Organic character prop slot — sculpt, retopo, and material pass staged for real-time engines.',
    tags: ['Organic', 'Retopo', 'Blender'],
    status: 'pipeline',
    poster: arsenalPath('promo', 'PromoVideoV3_120FPS', 'PromoVideoV3_120FPS-Cover.jpg'),
  },
  {
    id: 'prop-slot-03',
    title: 'Environment shrine',
    category: 'Environment',
    description:
      'Modular environment piece — shrine architecture with modular kit pieces and baked lighting hooks.',
    tags: ['Modular', 'Environment', 'Blender'],
    status: 'pipeline',
    poster: arsenalPath('promo', 'PromoVideoV3_120FPS', 'PromoVideoV3_120FPS-Cover.jpg'),
  },
]
