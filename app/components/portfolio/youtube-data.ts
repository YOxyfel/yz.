// YouTube blog feed. Fill in `youtubeId` with the 11-char video id from a
// watch URL (https://www.youtube.com/watch?v=XXXXXXXXXXX) to enable the
// click-to-play lite embed + real thumbnail. Entries without an id render a
// styled placeholder poster that links out to the channel, so the page stays
// presentable until the real posts are wired in.

export type YoutubeChannel = {
  handle: string
  url: string
  tagline: string
}

export type YoutubePost = {
  id: string
  /** 11-char YouTube video id, or '' for a placeholder poster. */
  youtubeId: string
  title: string
  date: string
  description: string
  tags: string[]
  /** Two HSL hues for the placeholder poster gradient. */
  hue: [number, number]
}

export const youtubeChannel: YoutubeChannel = {
  handle: '@yanezhekov',
  url: 'https://www.youtube.com/@yanezhekov',
  tagline: 'Devlogs, breakdowns and build-in-public notes from the station.',
}

export const youtubePosts: YoutubePost[] = [
  {
    id: 'devlog-character',
    youtubeId: '',
    title: 'Building a real-time 3D version of myself',
    date: '2026',
    description:
      'Full breakdown of the Arsenal character configurator — one rig, swappable outfits, the FBX → GLB pipeline and the wireframe-swipe inspector.',
    tags: ['devlog', '3d', 'three.js'],
    hue: [275, 330],
  },
  {
    id: 'devlog-performance',
    youtubeId: '',
    title: 'Making cinematic WebGL run on a potato',
    date: '2025',
    description:
      'How the cosmic FX tiers, scroll FPS watchdog and lazy-mounted sections keep the frame rate up without dropping the spectacle.',
    tags: ['devlog', 'performance', 'webgl'],
    hue: [165, 210],
  },
  {
    id: 'devlog-station',
    youtubeId: '',
    title: 'Designing a portfolio as a space station',
    date: '2025',
    description:
      'The thinking behind the bridge, the chambers and the Arsenal — turning a portfolio into a place you operate instead of a page you skim.',
    tags: ['design', 'process'],
    hue: [205, 255],
  },
]
