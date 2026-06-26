// Journal entries rendered as a flip-through, two-page book. Each spread shows a
// feature (left) page with the title, tags and a pull quote, and a notes (right)
// page with a short summary plus a "Details" button that opens the full story in
// a fullscreen reader. Add or edit entries here — order is oldest → newest.
//
// Leave `body` empty (or set `comingSoon: true`) and the entry renders as a
// "Coming soon" placeholder instead of an openable story.

export type JournalEntry = {
  id: string
  /** Volume / date label, e.g. "2026 · Vol. III". */
  date: string
  title: string
  tags: string[]
  /** Short blurb shown on the page itself. */
  summary: string
  /** Optional highlighted line shown large on the feature page + reader. */
  pullQuote?: string
  /** Estimated read time label, e.g. "4 min". Optional. */
  readTime?: string
  /** Full body, one string per paragraph. Shown in the fullscreen reader. */
  body: string[]
  /** Force the "coming soon" placeholder even if other fields are filled. */
  comingSoon?: boolean
}

export const journalEntries: JournalEntry[] = [
  {
    id: 'first-light',
    date: '2025 · Vol. I',
    title: 'Building a station, not a page',
    tags: ['design', 'identity', 'origins'],
    summary:
      'Why the portfolio became a space station instead of a scrolling résumé — and what that decision unlocked.',
    pullQuote: 'A portfolio should feel like a place you operate, not a document you skim.',
    readTime: '3 min',
    body: [
      'I never wanted a static résumé. A portfolio should feel like a place you operate, not a document you skim. So the site became a station: a bridge you walk onto, chambers you step into, an Arsenal you can actually pick things up in.',
      'The constraint turned out to be liberating. Once everything was framed as "instruments on a deck", every feature had an obvious home — Sky Lab for the cosmic toys, the Arsenal for the craft, the dock for the controls.',
      'The metaphor also kept me honest about scope. If a feature could not be explained as part of the station, it usually did not belong. The bridge sells the work, the chambers prove it, and the journal — this — is the maintenance log nobody usually gets to read.',
      'It is the difference between decorating a page and designing a place. A place has rules, wear, and a point of view. That is what I wanted a visitor to feel in the first three seconds: that someone actually lives here and runs it.',
    ],
  },
  {
    id: 'performance',
    date: '2025 · Vol. II',
    title: 'Making the cosmos cheap',
    tags: ['performance', 'webgl', 'craft'],
    summary:
      'The cosmic effects looked great and ran terribly. Here is how the FX tiers, watchdogs and lazy mounts brought the frame rate back.',
    pullQuote: 'The first build looked cinematic on my machine and stuttered on everyone else\u2019s.',
    readTime: '4 min',
    body: [
      'Particles, nebulae and constellations are expensive. The first build looked cinematic on my machine and stuttered on everyone else\u2019s. The fix was honesty: detect the hardware, pick a tier, and only spend frames where they earn their keep.',
      'A scroll FPS watchdog now downgrades the tier mid-session if things get heavy, heavy sky work only runs while Sky Lab is open, and whole sections lazy-mount as they approach the viewport.',
      'The uncomfortable lesson was that "looks amazing on a 4090" is a trap. The median visitor is on an integrated GPU and a throttled laptop. Designing for that machine first, then layering richness on top for the ones that can take it, is the only version that scales.',
      'Now the cosmos has tiers like a game does: ultra for the rare strong machine, a sensible middle, and a calm low-power mode that still feels intentional rather than broken.',
    ],
  },
  {
    id: 'character',
    date: '2026 · Vol. III',
    title: 'A character you can wear',
    tags: ['3d', 'three.js', 'pipeline'],
    summary:
      'The Arsenal got a real-time 3D version of me — one rig, swappable outfits, and a wireframe inspector you can swipe through.',
    pullQuote: 'The hardest part was not the rendering — it was the pipeline.',
    readTime: '5 min',
    body: [
      'The hardest part was not the rendering — it was the pipeline. Raw FBX from the scanner, Tripo-style node names, a 0.01-scale armature, and 79 MB files. A build script now converts, remaps the rig, merges the walk clips, and Draco + WebP compression takes the sitting model from 79 MB down to 11.7 MB.',
      'On screen it is one skeleton driving every wearable, a mandatory hoodie, an Alien suit that replaces the whole body, and a wireframe-swipe reveal that you can rotate, pan and zoom in every mode.',
      'Every decision was a fight between fidelity and weight. The win condition was never "the prettiest mesh" — it was "the heaviest thing that still loads on a phone". Compression, instancing and a single shared rig were how that line got walked.',
      'The wireframe swipe started as a debug view and became the favourite feature. There is something honest about showing the skeleton under the skin — it says here is exactly how the trick is done, no smoke.',
    ],
  },
  {
    id: 'reliability',
    date: '2026 · Vol. IV',
    title: 'It has to load on their machine',
    tags: ['reliability', 'lessons', 'shipping'],
    summary:
      'A friend opened the 3D viewer and got a blank box. The lesson: impressive only counts if it loads everywhere.',
    pullQuote: 'The demo that only works on the author\u2019s laptop is not finished.',
    readTime: '4 min',
    body: [
      'The Draco decoder was being pulled from a Google CDN that some networks block, so the compressed models silently failed to decode. Self-hosting the decoder fixed it. Then I added a universal "View in 3D" opt-in and an error boundary with a retry button.',
      'The takeaway keeps repeating across every version: the demo that only works on the author\u2019s laptop is not finished. Graceful degradation is a feature, not an afterthought.',
      'Reliability is invisible when it works and the only thing anyone remembers when it does not. A blank box on a friend\u2019s screen taught me more than a hundred green checks on mine.',
      'So now the question for every feature is the same: what does this look like when it fails? If I do not have a good answer, the feature is not done — it is just demoed.',
    ],
  },
  {
    id: 'next-chapter',
    date: '2026 · Vol. V',
    title: 'The next chapter',
    tags: ['soon'],
    summary:
      'New build notes are in the works — fresh experiments and post-mortems from the station are on the way.',
    body: [],
    comingSoon: true,
  },
]
