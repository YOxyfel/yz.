import { multiviewPaths } from './arsenal-path'

export type ArtTheme = 'xianxia'

export type ArtPiece = {
  id: string
  title: string
  role: string
  description: string
  theme: ArtTheme
  folder: string
  views: string[]
  povLabels: [string, string, string, string]
  accent: 'cyan' | 'violet' | 'amber'
}

export const artPieces: ArtPiece[] = [
  {
    id: 'wang-lin',
    title: 'Wang Cultivator MC',
    role: 'Protagonist',
    description:
      'The main character of the cultivation game — Wang Cultivator. Four orthographic POVs for rigging, costume lock, and in-engine silhouette reads.',
    theme: 'xianxia',
    folder: 'Wang Lin',
    views: multiviewPaths('Wang Lin'),
    povLabels: ['Front', '¾ Left', 'Profile', '¾ Back'],
    accent: 'cyan',
  },
  {
    id: 'situ-nan',
    title: 'Wang Cultivator Villain',
    role: 'Antagonist',
    description:
      'The villain of Wang Cultivator — sharp regalia, predatory poise, and a presence that bends qi around him.',
    theme: 'xianxia',
    folder: 'Situ Nan',
    views: multiviewPaths('Situ Nan'),
    povLabels: ['Front', '¾ Left', 'Profile', '¾ Back'],
    accent: 'violet',
  },
  {
    id: 'li-muwan',
    title: 'Wang Cultivator Maiden',
    role: 'Lead maiden',
    description:
      'The lead maiden of Wang Cultivator — ethereal robes, jade accents, and a calm center in the storm of cultivation.',
    theme: 'xianxia',
    folder: 'Li Muwan',
    views: multiviewPaths('Li Muwan'),
    povLabels: ['Front', '¾ Left', 'Profile', '¾ Back'],
    accent: 'amber',
  },
]
