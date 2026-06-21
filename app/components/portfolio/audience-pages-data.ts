export type AudiencePage = {
  slug: string
  title: string
  tagline: string
  painPoints: string[]
  offerings: string[]
  outcomes: string[]
}

export const audiencePages: AudiencePage[] = [
  {
    slug: 'studios',
    title: 'For Game Studios',
    tagline: 'Senior UE5 gameplay engineering when your milestone cannot wait on a full-time hire.',
    painPoints: [
      'Gameplay scope is growing faster than your in-house systems team can absorb.',
      'A vertical slice needs to prove combat or progression before greenlighting full production.',
      'Designers are blocked because architecture was not built for iteration at content scale.',
    ],
    offerings: [
      'Complex gameplay systems in C++ with designer-ready Blueprint surfaces',
      'Milestone-scoped co-dev—combat loops, GAS, progression, replication',
      'Architecture reviews and modular refactors before debt compounds',
    ],
    outcomes: [
      'Shippable systems your existing team can extend after handoff',
      'Direct communication with the engineer doing the work',
      'Documentation and boundaries aligned to your production pipeline',
    ],
  },
  {
    slug: 'indie-teams',
    title: 'For Indie Teams',
    tagline: 'One technical partner for ambitious mechanics—without agency overhead or generic freelancers.',
    painPoints: [
      'Small team wearing every hat; gameplay code becomes the bottleneck.',
      'Blueprint prototypes need a C++ foundation before multiplayer or content scale.',
      'Player feel and progression matter as much as feature checklists.',
    ],
    offerings: [
      'End-to-end gameplay slices: combat, abilities, progression, VFX hooks',
      'Modular architecture designed for reuse as your game grows',
      'AI-accelerated iteration with engineer-reviewed UE5-native delivery',
    ],
    outcomes: [
      'Faster path from prototype to playable milestone',
      'Systems you can tune in-editor without daily engineer unblock sessions',
      'Honest scoping for what a solo external partner can ship in your timeline',
    ],
  },
  {
    slug: 'engine-tooling',
    title: 'For Engine-Level & Systems Work',
    tagline: 'Modular, reusable gameplay architecture—not one-off scripts that break on the next feature.',
    painPoints: [
      'Features ship fast but nothing composes; every sprint reopens old code.',
      'Designers cannot safely tune data because C++ boundaries were never defined.',
      'You need engine-facing systems, not surface-level Blueprint glue.',
    ],
    offerings: [
      'Data-driven configs, gameplay tags, and validated editor workflows',
      'GAS integration, networked stats, and performance-conscious C++ cores',
      'Refactors that preserve momentum while making systems composable',
    ],
    outcomes: [
      'Architecture that scales with content and team size',
      'Clear ownership between code, data, and designer iteration',
      'Less rework when scope shifts mid-milestone',
    ],
  },
]

export const audienceSlugs = audiencePages.map((page) => page.slug)

export function getAudiencePage(slug: string) {
  return audiencePages.find((page) => page.slug === slug)
}
