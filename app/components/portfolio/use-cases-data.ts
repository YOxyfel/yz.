export type UseCase = {
  slug: string
  title: string
  tagline: string
  audience: string
  challenges: string[]
  approach: string[]
  outcomes: string[]
  stack: string[]
}

export const useCases: UseCase[] = [
  {
    slug: 'complex-gameplay-systems',
    title: 'Complex Gameplay Systems',
    tagline: 'Architect the logic layer your milestone depends on.',
    audience: 'Studios and indie teams shipping UE5 titles with ambitious mechanics.',
    challenges: [
      'Combat, progression, or ability logic that outgrows Blueprint spaghetti',
      'Networked stats and state that must stay predictable under load',
      'Milestone pressure without a senior gameplay engineer on staff',
    ],
    approach: [
      'Design C++ foundations with clear ownership boundaries and replication rules',
      'Wrap systems for designers via data assets, tags, and validated Blueprint APIs',
      'Prototype in vertical slices so gameplay proves out before content scale',
    ],
    outcomes: [
      'Maintainable gameplay code your team can extend after handoff',
      'Designer iteration without daily engineer unblock sessions',
      'Systems documented around your milestone—not generic templates',
    ],
    stack: ['Unreal Engine 5', 'C++', 'Gameplay Ability System', 'Enhanced Input'],
  },
  {
    slug: 'designer-friendly-tooling',
    title: 'Modular, Designer-Ready Systems',
    tagline: 'Reusable architecture your team can extend—not a one-off prototype.',
    audience: 'Teams that need gameplay code structured for iteration by designers and future you.',
    challenges: [
      'Systems that work in a vertical slice but resist reuse when scope grows',
      'Blueprint layers that become fragile because C++ boundaries were never defined',
      'Teammates blocked because architecture was optimized for speed, not clarity',
    ],
    approach: [
      'Design modular components with explicit data surfaces and composition in mind',
      'Keep designer-facing entry points in data assets, tags, and validated Blueprint APIs',
      'Document ownership boundaries so systems stay reusable across features and milestones',
    ],
    outcomes: [
      'Gameplay architecture your team can extend without rewriting foundations',
      'Designer iteration through clear in-editor surfaces—not ad-hoc engineer requests',
      'Systems built to compose across your project, not lock you into one feature',
    ],
    stack: ['Unreal Engine 5', 'C++', 'Gameplay Tags', 'Blueprint'],
  },
  {
    slug: 'immersive-player-experiences',
    title: 'Immersive Player Experiences',
    tagline: 'Make progression, combat, and VFX feel like one system.',
    audience: 'Projects where player fantasy—not feature count—is the differentiator.',
    challenges: [
      'Combat or progression that reads well in docs but feels flat in playtests',
      'VFX and audio triggered without reliable gameplay hooks',
      'Immersion breaking when systems fight each other at runtime',
    ],
    approach: [
      'Bind feedback to gameplay tags, ability phases, and camera-readable telegraphs',
      'Tune input buffering, cancel windows, and reward cadence for game feel first',
      'Integrate Niagara, UI, and audio hooks from the same event model',
    ],
    outcomes: [
      'Moments that sell your fantasy in the first hour of play',
      'Feedback loops designers can iterate without re-architecting code',
      'A cohesive player layer—not isolated tech demos per feature',
    ],
    stack: ['Unreal Engine 5', 'C++', 'Niagara', 'Gameplay Tags'],
  },
  {
    slug: 'ai-assisted-production',
    title: 'AI-Assisted Production',
    tagline: 'Move faster across design, code, and content—with human sign-off.',
    audience: 'Studios and indies adopting AI across ideation, implementation, and polish.',
    challenges: [
      'Pressure to ship more scope without doubling headcount',
      'Unclear where AI saves time vs. creates review debt',
      'Need for UE5-native output—not generic scripts that never compile',
    ],
    approach: [
      'Use AI for exploration, boilerplate, docs, and iteration—then harden in C++',
      'Keep designer-facing surfaces and network rules engineer-reviewed',
      'Build repeatable prompts and checks around your project conventions',
    ],
    outcomes: [
      'Shorter loops from concept to playable prototype',
      'Production gains without surrendering quality gates',
      'Workflows tuned to UE5 and your team’s standards',
    ],
    stack: ['Unreal Engine 5', 'C++', 'Cursor', 'AI-assisted pipelines'],
  },
]

export function getUseCase(slug: string) {
  return useCases.find((item) => item.slug === slug)
}

export const useCaseSlugs = useCases.map((item) => item.slug)
