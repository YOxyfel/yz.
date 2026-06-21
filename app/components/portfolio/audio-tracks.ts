export type AudioSourceType = 'found' | 'ai' | 'recorded' | 'hybrid'

export type AudioTheme =
  | 'cultivation'
  | 'void'
  | 'impact'
  | 'ost'
  | 'breakthrough-success'
  | 'breakthrough-fail'
  | 'slice'

export const catalogOrder = [
  'cultivation',
  'void',
  'aha',
  'ost',
  'breakthrough-success',
  'breakthrough-fail',
  'wood-slice',
] as const

export type CatalogId = (typeof catalogOrder)[number]

export type AudioTrack = {
  id: string
  catalogId: CatalogId
  index: string
  title: string
  subtitle: string
  gameContext: string
  src: string
  layerLabel?: string
  sources: { type: AudioSourceType; label: string }[]
  reaperPipeline: string[]
  designNotes: string
  theme: AudioTheme
  accent: 'cyan' | 'violet' | 'emerald' | 'amber' | 'gold' | 'rose'
}

export const catalogLabels: Record<CatalogId, string> = {
  cultivation: 'Cultivation',
  void: 'The Void',
  aha: 'Grass Crush',
  ost: 'Game OST',
  'breakthrough-success': 'Ascension',
  'breakthrough-fail': 'Collapse',
  'wood-slice': 'Wood Slice',
}

export const audioTracks: AudioTrack[] = [
  {
    id: 'cultivation',
    catalogId: 'cultivation',
    index: '01',
    title: 'Cultivation Loop',
    subtitle: 'Spiritual Energy · Meditative State',
    gameContext:
      'Plays while the cultivator channels qi — a breathing, cyclical bed that sells focus, pressure, and inner power building over time.',
    src: '/arsenal/cultivating.wav',
    sources: [
      { type: 'found', label: 'Ambient texture pulls' },
      { type: 'recorded', label: 'Breath & room tone layers' },
      { type: 'hybrid', label: 'Mixed & developed in Reaper' },
    ],
    reaperPipeline: [
      'Stem import & lane organization',
      'Overlapping loop points for seamless cycle',
      'EQ carve — airy highs, warm low-mid body',
      'Subtle chorus + long-tail reverb for “qi halo”',
      'Sidechain ducking on transient hits',
      'Final loudness pass for in-game loop',
    ],
    designNotes:
      'Built to loop invisibly during cultivation UI — energy rises without stealing attention from gameplay.',
    theme: 'cultivation',
    accent: 'cyan',
  },
  {
    id: 'void',
    catalogId: 'void',
    index: '02',
    title: 'The Void',
    subtitle: 'Warp Transit · Dimensional Tear',
    gameContext:
      'The player is ripped through a literal void — compression, disorientation, and spatial collapse before re-materializing elsewhere.',
    src: '/arsenal/Void.wav',
    sources: [
      { type: 'found', label: 'Whoosh & sub-drop samples' },
      { type: 'recorded', label: 'Processed vocal breath layers' },
      { type: 'hybrid', label: 'Designed in Reaper' },
    ],
    reaperPipeline: [
      'Reverse layers + time-stretch for “pull”',
      'Overlapping doppler-style sweeps',
      'Convolution reverb on void tail',
      'Multiband distortion on collapse hit',
      'Stereo width automation — narrow → wide → snap',
      'Rendered as one-shot event stem',
    ],
    designNotes:
      'Spatial design matters more than melody — the mix sells velocity, dread, and arrival.',
    theme: 'void',
    accent: 'violet',
  },
  {
    id: 'aha',
    catalogId: 'aha',
    index: '03',
    title: 'Aha · Grass Crush',
    subtitle: 'Foley Impact · Vegetation Mash',
    gameContext:
      'A sharp grass-mashing hit — tactile, organic feedback when the player interacts with or tramples dense foliage.',
    src: '/arsenal/aha.wav',
    sources: [
      { type: 'recorded', label: 'Self-recorded foley passes' },
      { type: 'found', label: 'Supplemental crunch layers' },
    ],
    reaperPipeline: [
      'Stack 4–6 micro-takes for density',
      'Transient shaper on attack',
      'High-pass mud cut + presence boost',
      'Overlap & crossfade composite',
      'Light room reverb for outdoor read',
      'Exported as tight one-shot SFX',
    ],
    designNotes:
      'Short, punchy, and readable at mobile speaker scale — no mush, all snap.',
    theme: 'impact',
    accent: 'emerald',
  },
  {
    id: 'ost',
    catalogId: 'ost',
    index: '04',
    title: 'Game OST',
    subtitle: 'Main Theme · Adaptive Score',
    gameContext:
      'The flagship soundtrack — melodic identity for Wang Cultivator, carrying wuxia tone, momentum, and emotional lift.',
    src: '/arsenal/OST.MP3',
    sources: [
      { type: 'ai', label: 'AI-generated melodic draft' },
      { type: 'hybrid', label: 'Arranged & mixed in Reaper' },
    ],
    reaperPipeline: [
      'Section stems — drums, bass, leads, pads',
      'Overlapping arrangement builds',
      'Parallel compression on drums',
      'Orchestral layer glue & bus EQ',
      'Master chain — tape sat, limiter',
      'Game-ready export with headroom',
    ],
    designNotes:
      'Less a single sound, more a world — every layer earned its place in the final mix.',
    theme: 'ost',
    accent: 'gold',
  },
  {
    id: 'breakthrough-success',
    catalogId: 'breakthrough-success',
    index: '05',
    title: 'Breakthrough · Ascension',
    subtitle: 'Realm Advance · Success State',
    gameContext:
      'When cultivation succeeds — a surge of power, harmonic lift, and celebratory energy as the character breaks into the next realm.',
    src: '/arsenal/BreakthroughDemoV1.wav',
    sources: [
      { type: 'found', label: 'Impact & rise FX' },
      { type: 'recorded', label: 'Layered tonal accents' },
      { type: 'hybrid', label: 'Composited in Reaper' },
    ],
    reaperPipeline: [
      'Layered rise sweeps + sub bloom',
      'Overlapping chime & bell accents',
      'Reverb throw on climax hit',
      'Dynamic EQ for “breakthrough bloom”',
      'Combined & automated for 3-act arc',
      'Mastered for cinematic punch',
    ],
    designNotes:
      'Three acts in one cue: tension → rupture → ascension. The mix is the gameplay reward.',
    theme: 'breakthrough-success',
    accent: 'cyan',
  },
  {
    id: 'breakthrough-fail',
    catalogId: 'breakthrough-fail',
    index: '06',
    title: 'Breakthrough · Collapse',
    subtitle: 'Realm Failure · Backlash',
    gameContext:
      'When cultivation fails — qi backlash, harmonic fracture, and a sinking gut-punch that tells the player they overreached.',
    src: '/arsenal/BreakthroughFailedDemoV2.wav',
    sources: [
      { type: 'found', label: 'Glass & crumble layers' },
      { type: 'recorded', label: 'Low breath / strain texture' },
      { type: 'hybrid', label: 'Mirrored & destroyed in Reaper' },
    ],
    reaperPipeline: [
      'Reverse-success tail for irony',
      'Distortion + bit-crush on collapse',
      'Overlapping downward pitch bends',
      'Sub rumble for physical weight',
      'Automated filter close on fail point',
      'Final mix — harsh but readable',
    ],
    designNotes:
      'Failure should hurt — not annoying, but emotionally costly. Designed as the inverse of ascension.',
    theme: 'breakthrough-fail',
    accent: 'rose',
  },
  {
    id: 'wood-slice-1',
    catalogId: 'wood-slice',
    index: '07a',
    title: 'Wood Slice · Blade A',
    subtitle: 'Weapon Foley · Timber Split',
    gameContext:
      'Primary wood-on-wood weapon slice — sells blade weight cutting through organic material.',
    src: '/arsenal/wood_slice_weapon_1.mp3',
    layerLabel: 'Layer A',
    sources: [{ type: 'found', label: 'Foley library chop' }],
    reaperPipeline: [
      'Transient sharpen',
      'Body EQ — mid crack emphasis',
      'Tight room for close combat read',
    ],
    designNotes: 'First layer in a stacked weapon slice — attack-forward.',
    theme: 'slice',
    accent: 'amber',
  },
  {
    id: 'wood-slice-2',
    catalogId: 'wood-slice',
    index: '07b',
    title: 'Wood Slice · Blade B',
    subtitle: 'Weapon Foley · Splinter Tail',
    gameContext:
      'Secondary slice layer — splinter tail and debris scatter layered under Blade A in Reaper for a thicker, more violent read.',
    src: '/arsenal/wood_slice_weapon_2.mp3',
    layerLabel: 'Layer B',
    sources: [{ type: 'found', label: 'Splinter & debris foley' }],
    reaperPipeline: [
      'Offset overlap under Layer A',
      'High-frequency splinter boost',
      'Short decay room',
      'Bus-compressed with Blade A',
    ],
    designNotes:
      'Speaks for itself — two slices, one kill. Combined in Reaper, lethal in-game.',
    theme: 'slice',
    accent: 'amber',
  },
]

export function getTracksForCatalog(catalogId: CatalogId) {
  return audioTracks.filter((track) => track.catalogId === catalogId)
}

export const sourceTypeLabels: Record<AudioSourceType, string> = {
  found: 'Found Online',
  ai: 'AI Generated',
  recorded: 'Self Recorded',
  hybrid: 'Mixed in Reaper',
}

export const sourceTypeColors: Record<AudioSourceType, string> = {
  found: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  ai: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  recorded: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  hybrid: 'border-cyan/30 bg-cyan/10 text-cyan',
}
