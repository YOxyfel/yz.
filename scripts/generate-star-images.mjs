/**
 * Generates simplified IAU-style constellation SVGs into public/StarImages/.
 * Star layouts are factual (not copyrightable); artwork is original for this project.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'StarImages')
const dataPath = path.join(
  __dirname,
  '..',
  'app',
  'components',
  'portfolio',
  'constellation-pattern-data.json'
)

/** @type {Array<{ id: string; name: string; stars: [number, number][]; edges: [number, number][] }>} */
const constellations = [
  {
    id: 'orion',
    name: 'Orion',
    stars: [
      [22, 18], [38, 16], [46, 48], [54, 50], [62, 48], [74, 72], [66, 82],
    ],
    edges: [
      [0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [4, 5], [5, 6],
    ],
  },
  {
    id: 'ursa-major',
    name: 'Ursa Major',
    stars: [
      [18, 62], [28, 52], [40, 48], [52, 50], [62, 42], [72, 48], [82, 38],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    ],
  },
  {
    id: 'ursa-minor',
    name: 'Ursa Minor',
    stars: [
      [34, 18], [42, 28], [50, 34], [58, 40], [66, 48], [74, 58], [48, 72],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 6],
    ],
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    stars: [
      [20, 42], [35, 28], [50, 44], [65, 30], [80, 46],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4],
    ],
  },
  {
    id: 'leo',
    name: 'Leo',
    stars: [
      [24, 58], [34, 44], [46, 36], [58, 40], [68, 52], [56, 68], [40, 72], [30, 66],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 7], [7, 0],
    ],
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    stars: [
      [20, 28], [32, 36], [44, 44], [54, 54], [62, 66], [70, 76], [78, 82], [48, 24],
    ],
    edges: [
      [7, 0], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    ],
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    stars: [
      [50, 16], [50, 38], [50, 58], [50, 78], [28, 38], [72, 38],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [1, 4], [1, 5],
    ],
  },
  {
    id: 'lyra',
    name: 'Lyra',
    stars: [
      [50, 22], [38, 42], [62, 42], [42, 62], [58, 62],
    ],
    edges: [
      [0, 1], [0, 2], [1, 3], [2, 4], [3, 4],
    ],
  },
  {
    id: 'aquila',
    name: 'Aquila',
    stars: [
      [50, 24], [34, 46], [66, 46], [28, 68], [50, 78], [72, 68],
    ],
    edges: [
      [0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5],
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    stars: [
      [38, 20], [42, 36], [46, 52], [50, 68], [62, 20], [58, 36], [54, 52], [50, 68],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7],
    ],
  },
  {
    id: 'taurus',
    name: 'Taurus',
    stars: [
      [24, 34], [38, 28], [50, 36], [62, 30], [74, 38], [44, 52], [56, 52], [50, 66],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [2, 6], [5, 6], [6, 7],
    ],
  },
  {
    id: 'canis-major',
    name: 'Canis Major',
    stars: [
      [34, 28], [50, 22], [66, 34], [58, 50], [42, 58], [28, 48], [50, 72],
    ],
    edges: [
      [1, 0], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [3, 6],
    ],
  },
  {
    id: 'pegasus',
    name: 'Pegasus',
    stars: [
      [24, 38], [44, 38], [44, 58], [24, 58], [64, 38], [74, 48], [84, 58], [64, 68],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [4, 5], [5, 6], [6, 7], [7, 2],
    ],
  },
  {
    id: 'andromeda',
    name: 'Andromeda',
    stars: [
      [18, 48], [32, 42], [46, 38], [60, 34], [74, 30], [58, 52], [42, 62],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6],
    ],
  },
  {
    id: 'draco',
    name: 'Draco',
    stars: [
      [18, 72], [28, 58], [38, 48], [48, 42], [58, 38], [68, 34], [78, 30], [72, 48], [60, 56],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
    ],
  },
  {
    id: 'bootes',
    name: 'Boötes',
    stars: [
      [50, 18], [38, 34], [62, 34], [30, 52], [50, 48], [70, 52], [50, 72],
    ],
    edges: [
      [0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5], [4, 6],
    ],
  },
  {
    id: 'virgo',
    name: 'Virgo',
    stars: [
      [50, 16], [38, 34], [62, 34], [34, 54], [50, 50], [66, 54], [50, 74],
    ],
    edges: [
      [0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5], [4, 6],
    ],
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    stars: [
      [28, 34], [42, 28], [56, 34], [70, 40], [36, 50], [50, 46], [64, 52], [44, 66], [58, 72],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [4, 5], [5, 6], [4, 7], [6, 8], [7, 8],
    ],
  },
  {
    id: 'perseus',
    name: 'Perseus',
    stars: [
      [22, 34], [36, 28], [50, 32], [64, 38], [42, 48], [54, 56], [46, 68], [58, 76],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [1, 4], [2, 5], [4, 5], [4, 6], [5, 7], [6, 7],
    ],
  },
  {
    id: 'hercules',
    name: 'Hercules',
    stars: [
      [34, 28], [50, 24], [66, 28], [72, 44], [58, 52], [42, 52], [28, 44], [50, 68],
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [4, 7], [5, 7],
    ],
  },
]

function toSvg({ name, stars, edges }) {
  const pad = 8
  const lines = edges
    .map(([a, b]) => {
      const [x1, y1] = stars[a]
      const [x2, y2] = stars[b]
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`
    })
    .join('\n    ')
  const dots = stars
    .map(([x, y], index) => `<circle cx="${x}" cy="${y}" r="${index === 0 ? 2.8 : 2.2}" />`)
    .join('\n    ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${name}">
  <title>${name}</title>
  <rect x="${pad}" y="${pad}" width="${100 - pad * 2}" height="${100 - pad * 2}" fill="none"/>
  <g fill="#ffffff" stroke="#ffffff" stroke-width="1.35" stroke-linecap="round" opacity="0.95">
    ${lines}
    ${dots}
  </g>
</svg>
`
}

await mkdir(outDir, { recursive: true })

const manifest = []

for (const item of constellations) {
  const svg = toSvg(item)
  const filename = `${item.id}.svg`
  await writeFile(path.join(outDir, filename), svg, 'utf8')
  manifest.push({
    id: item.id,
    name: item.name,
    file: `/StarImages/${filename}`,
    starCount: item.stars.length,
  })
}

await writeFile(
  path.join(outDir, 'manifest.json'),
  `${JSON.stringify({ constellations: manifest }, null, 2)}\n`,
  'utf8'
)

await writeFile(dataPath, `${JSON.stringify({ constellations }, null, 2)}\n`, 'utf8')

console.log(`Wrote ${manifest.length} constellation SVGs to ${outDir}`)
console.log(`Wrote pattern data to ${dataPath}`)
