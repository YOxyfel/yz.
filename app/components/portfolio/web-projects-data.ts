export type WebProject = {
  id: string
  title: string
  domain: string
  href: string
  description: string
  client: string
  stack: string[]
  accent: 'cyan' | 'violet' | 'amber'
  /** Optional preview under public/ — add when available */
  preview?: string
}

export const webProjects: WebProject[] = [
  {
    id: 'stilmerseng',
    title: 'Stilmerseng',
    domain: 'stilmerseng.bg',
    href: 'https://stilmerseng.bg',
    client: 'Architecture studio',
    description:
      'Professional Bulgarian website for an architecture practice — clean presentation of projects, services, and studio identity.',
    stack: ['WordPress', 'HTML', 'CSS', 'JavaScript'],
    accent: 'cyan',
  },
  {
    id: 'albenta',
    title: 'Albenta',
    domain: 'albenta.bg',
    href: 'https://albenta.bg',
    client: 'Industrial parts supplier',
    description:
      'Commercial site for mechanical parts — product catalog UX, trust-focused layout, and fast browsing for B2B buyers.',
    stack: ['WordPress', 'HTML', 'CSS', 'JavaScript'],
    accent: 'violet',
  },
  {
    id: 'dominaresidence',
    title: 'Domina Residence',
    domain: 'dominaresidence.bg',
    href: 'https://dominaresidence.bg',
    client: 'Real estate development',
    description:
      'Apartment sales platform — immersive unit storytelling, lead capture, and a polished brand presence for residential sales.',
    stack: ['WordPress', 'HTML', 'CSS', 'JavaScript'],
    accent: 'amber',
  },
  {
    id: 'tindog',
    title: 'TinDog',
    domain: 'yoxyfel.github.io/Tindog',
    href: 'https://yoxyfel.github.io/Tindog/',
    client: 'Landing page · GitHub Pages',
    description:
      'Playful dog-dating marketing site — feature blocks, testimonials, pricing tiers, and a download CTA, built with Bootstrap and deployed on GitHub Pages.',
    stack: ['HTML', 'CSS', 'Bootstrap'],
    accent: 'cyan',
  },
]

export const githubShowcase = {
  title: 'GitHub',
  handle: '@yanezhekov',
  href: 'https://github.com/yanezhekov',
  description:
    'Engine repos, experiments, and tooling — game systems, web prototypes, and pipeline scripts.',
  preview: '/Info/GithubPreview.png',
}
