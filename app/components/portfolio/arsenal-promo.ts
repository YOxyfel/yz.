import { arsenalPath } from './arsenal-path'

export const arsenalPromo = {
  id: 'character-creation',
  title: 'Character Creation',
  headline: 'From reference to ritual — forged in art, AI, and assembly',
  description:
    'Character created with art references, an AI-assisted pipeline, and manual assembly. Every silhouette, fold, and aura tuned for a cultivation world.',
  videoSrc: arsenalPath('promo', 'PromoVideoV3_120FPS', 'PromoVideoV3_120FPS.mp4'),
  posterSrc: arsenalPath('promo', 'PromoVideoV3_120FPS', 'PromoVideoV3_120FPS-Cover.jpg'),
  tags: ['Blender', 'AI-assisted', 'Manual assembly', '120 FPS'],
} as const
