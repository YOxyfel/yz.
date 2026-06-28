export type Project = {
  id: string
  title: string
  subtitle: string
  /** Optional cover image under public/ — falls back to a "visuals coming soon" placeholder. */
  cover?: string
  year: string
  tech: string[]
  summary: string
  highlights: { label: string; value: string }[]
  features: string[]
  code: string
  comingSoon?: boolean
  cardCta?: string
  modalNote?: string
}

export const projects: Project[] = [
  {
    id: 'wang-cultivator',
    title: 'Wan&Lin Immortals',
    subtitle: 'Action RPG — Cultivation Systems',
    year: '2026',
    cover: '/project-wan-lin-immortals.png',
    tech: ['Unreal Engine 5', 'C++', 'Gameplay Ability System', 'Niagara'],
    comingSoon: true,
    cardCta: 'Breakdown coming soon',
    modalNote: 'Full module specs, footage, and technical notes are on the way.',
    summary:
      'An in-development UE5 action RPG. Detailed write-up and systems breakdown will land here once there is real material to share—not placeholder copy.',
    highlights: [
      { label: 'Status', value: 'In development' },
      { label: 'Stack', value: 'UE5 · C++ · GAS' },
      { label: 'Details', value: 'Coming soon' },
    ],
    features: [
      'Project overview in progress',
      'Gameplay footage when ready',
      'Technical notes after the next milestone',
    ],
    code: '',
  },
  {
    id: 'run-and-bank',
    title: 'Run & Bank',
    subtitle: 'Hyper-Casual Endless Runner',
    year: '2026',
    tech: ['Unreal Engine 5', 'Lua', 'Procedural Gen', 'Mobile'],
    comingSoon: true,
    cardCta: 'Specs on the way',
    modalNote: 'Module documentation and clips will post here when the slice is ready to show.',
    summary:
      'A mobile endless runner concept on the backlog. Specs and media will appear here when there is something concrete to publish.',
    highlights: [
      { label: 'Status', value: 'On the backlog' },
      { label: 'Platform', value: 'Mobile' },
      { label: 'Details', value: 'Coming soon' },
    ],
    features: [
      'Design notes still in draft',
      'Prototype footage not published yet',
      'Economy and tuning docs TBD',
    ],
    code: '',
  },
]
