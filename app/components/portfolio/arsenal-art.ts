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
    title: 'Wan&Lin Immortals MC',
    role: 'Protagonist',
    description:
      'Protagonist character sheet for Wan&Lin Immortals—gallery notes and lore breakdown coming soon.',
    theme: 'xianxia',
    folder: 'Wang Lin',
    views: multiviewPaths('Wang Lin'),
    povLabels: ['Front', '¾ Left', 'Profile', '¾ Back'],
    accent: 'cyan',
  },
  {
    id: 'situ-nan',
    title: 'Wan&Lin Immortals Villain',
    role: 'Antagonist',
    description:
      'Antagonist character sheet for Wan&Lin Immortals—full character notes on the way.',
    theme: 'xianxia',
    folder: 'Situ Nan',
    views: multiviewPaths('Situ Nan'),
    povLabels: ['Front', '¾ Left', 'Profile', '¾ Back'],
    accent: 'violet',
  },
  {
    id: 'li-muwan',
    title: 'Wan&Lin Immortals Maiden',
    role: 'Lead maiden',
    description:
      'Lead maiden character sheet for Wan&Lin Immortals—profile write-up coming soon.',
    theme: 'xianxia',
    folder: 'Li Muwan',
    views: multiviewPaths('Li Muwan'),
    povLabels: ['Front', '¾ Left', 'Profile', '¾ Back'],
    accent: 'amber',
  },
]
