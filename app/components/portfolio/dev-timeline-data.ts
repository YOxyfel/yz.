// Development timeline for the website, tied to the git version tags in RELEASES.md.
// Ordered oldest → newest so scrolling forward walks through the build history.
// To attach a real screenshot to an iteration, drop an image in /public/timeline/
// and set `shot` to its path (e.g. '/timeline/v3-0-0.jpg').

export type DevTimelineEntry = {
  tag: string
  version: string
  phase: string
  title: string
  summary: string
  highlights: string[]
  /** Two HSL hues used to build the iteration's gradient visualization. */
  hue: [number, number]
  /** Optional screenshot path under /public. Falls back to a generated panel. */
  shot?: string
  url?: string
}

export const devTimeline: DevTimelineEntry[] = [
  {
    tag: 'v1.0',
    version: '1.0',
    phase: 'Baseline',
    title: 'First light',
    summary:
      'The original portfolio went live — Sky Lab, station themes, Arsenal chambers, audio VFX and the full web stack, deployed and verified on Vercel.',
    highlights: ['Sky Lab + station themes', 'Arsenal chambers', 'Mobile Sky Lab', 'Shipped to Vercel'],
    hue: [205, 250],
    url: 'https://v0-yanez.vercel.app',
  },
  {
    tag: 'v1.1',
    version: '1.1',
    phase: 'Polish',
    title: 'Optimization pass',
    summary:
      'A polish pass after launch: Site FX tiers wired to Sky Lab, scroll buffers between hero and projects, and constellation pattern expansion.',
    highlights: ['Site FX tiers (off/reduced/full)', 'Hero ↔ projects block scroll', 'Spotlight reel replay', 'i18n copy updates'],
    hue: [220, 275],
    url: 'https://v0-yanez.vercel.app',
  },
  {
    tag: 'v1.1.1',
    version: '1.1.1',
    phase: 'Mobile',
    title: 'Mobile + Sky Lab refinement',
    summary:
      'Mobile Sky Lab with FX-gated toggles, constellation names, planets and starships, plus a proper hamburger drawer.',
    highlights: ['Mobile Sky Lab', 'FX dock relocation', 'Panel flip gating', 'Drawer overflow fixes'],
    hue: [250, 300],
    url: 'https://v0-yanez.vercel.app',
  },
  {
    tag: 'v2.3.0',
    version: '2.3.0',
    phase: 'Layout',
    title: 'Corner dock + scroll perf',
    summary:
      'A labeled Site FX / Sky Lab / Sky View dock on the nav row at wide widths, lighter cosmic FX while scrolling, and continued station polish.',
    highlights: ['Labeled corner dock', 'Lighter FX while scrolling', 'Opt-in flip cards', 'Hero/scroll fixes'],
    hue: [190, 235],
    url: 'https://v0-yanez.vercel.app',
  },
  {
    tag: 'v2.4.0',
    version: '2.4.0',
    phase: 'Performance',
    title: 'Smarter FX defaults',
    summary:
      'Hardware-based Site FX defaults, lazy-mounted sections, a scroll FPS watchdog with adaptive tier downgrade, and constellations only while Sky Lab is open.',
    highlights: ['Hardware FX defaults', 'Lazy-mounted sections', 'Scroll FPS watchdog', 'Split chrome context'],
    hue: [165, 205],
    url: 'https://yanezhekov.dev',
  },
  {
    tag: 'v3.0.0',
    version: '3.0.0',
    phase: 'Arsenal',
    title: '3D character configurator',
    summary:
      'A real-time 3D character rig in the Arsenal — one skeleton driving every wearable, swappable outfits, animations, and a wireframe-swipe inspector.',
    highlights: ['One rig, swappable wearables', 'Sit & Talk + Walk animations', 'FBX → GLB pipeline', 'Draco + WebP compression'],
    hue: [275, 330],
    url: 'https://yanezhekov.dev',
  },
  {
    tag: 'v3.0.1',
    version: '3.0.1',
    phase: 'Navigation',
    title: 'Arsenal tab redesign',
    summary:
      'The Arsenal lab selector rebuilt as a clear segmented tab bar with index + icon + label, so the chambers read as navigation instead of badges.',
    highlights: ['Segmented tab bar', 'Strong active state', 'Underline indicator', 'Discipline counter'],
    hue: [200, 260],
    url: 'https://yanezhekov.dev',
  },
  {
    tag: 'v3.0.2',
    version: '3.0.2',
    phase: 'Reliability',
    title: 'Viewer load fix',
    summary:
      'Self-hosted the Draco decoder, added a desktop "View in 3D" opt-in for any non-auto-mounting machine, and wrapped the canvas in a retry-able error boundary.',
    highlights: ['Self-hosted Draco decoder', 'Universal 3D opt-in', 'Error boundary + retry', 'Legacy viewer hardened'],
    hue: [150, 195],
    url: 'https://yanezhekov.dev',
  },
  {
    tag: 'v3.0.3',
    version: '3.0.3',
    phase: 'Cleanup',
    title: 'FX control cleanup',
    summary:
      'Removed the non-functional Lab FX / Chamber FX controls from the 3D Props chamber and narrowed the FX controls to the Concept Art lab where they actually do something.',
    highlights: ['Removed dead FX controls', 'Concept Art keeps parallax FX', 'Audio keeps its toggle', 'Leaner chamber UI'],
    hue: [95, 160],
    url: 'https://yanezhekov.dev',
  },
  {
    tag: 'v3.2.0',
    version: '3.2.0',
    phase: 'Cosmos',
    title: 'Parallax cosmos + Logs pages',
    summary:
      'A multi-layer parallax cosmos backdrop with a lazy 3D gas-giant hero, plus new Timeline, Journal, and Videos pages and a redesigned pricing compare.',
    highlights: ['Parallax cosmos backdrop', '3D gas-giant hero', 'Timeline / Journal / Videos', 'Pricing compare + Logs nav'],
    hue: [225, 270],
    url: 'https://yanezhekov.dev',
  },
  {
    tag: 'v3.2.1',
    version: '3.2.1',
    phase: 'Identity',
    title: 'Indigo recolor + Web Stack bay',
    summary:
      'A professional indigo/periwinkle palette across the station, Oxyfel branding, and a full-width Web Stack carousel with live in-card website previews.',
    highlights: ['Indigo/periwinkle palette', 'Oxyfel branding', 'Live-preview Web Stack carousel', 'Updated contact + projects'],
    hue: [258, 295],
    url: 'https://yanezhekov.dev',
  },
  {
    tag: 'v3.2.2',
    version: '3.2.2',
    phase: 'Controls',
    title: 'Timeline jump controls',
    summary:
      'Reworked the timeline jump controls to compute the scroll target manually so every version — including the last — is reachable and stays in sync with the ring.',
    highlights: ['Manual scroll targeting', 'Last version reachable', 'Trailing scroll buffer', 'Ring/panel in sync'],
    hue: [240, 275],
    url: 'https://yanezhekov.dev',
  },
  {
    tag: 'v3.2.3',
    version: '3.2.3',
    phase: 'Sync',
    title: 'Timeline sync fix',
    summary:
      'Fixed the last-version desync where the detail panel lagged behind the ring — deferring the scroll past the button-disable re-render so the jump always lands in view.',
    highlights: ['Deferred scroll past commit', 'Last-item panel in view', 'Boundary button fix', 'Verified with real clicks'],
    hue: [250, 288],
    url: 'https://yanezhekov.dev',
  },
]
