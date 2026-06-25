// Compress every character .glb into a Draco + WebP `.draco.glb` for the web.
//
// Usage:
//   npm run compress:character            # compress all *.glb in the character folder
//   node scripts/compress-character.mjs <input.glb> [output.glb]
//
// Requires @gltf-transform/cli (installed as a devDependency).

import { execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join, extname, basename, dirname } from 'node:path'

const CHARACTER_DIR = 'public/arsenal/models/character'
const TEXTURE_SIZE = '2048'

function compress(input, output) {
  console.log(`\n→ ${input}`)
  execFileSync(
    'npx',
    [
      'gltf-transform',
      'optimize',
      input,
      output,
      '--compress',
      'draco',
      '--texture-compress',
      'webp',
      '--texture-size',
      TEXTURE_SIZE,
    ],
    { stdio: 'inherit', shell: true }
  )
}

function findGlbs(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...findGlbs(full))
    } else if (extname(entry) === '.glb' && !entry.endsWith('.draco.glb')) {
      out.push(full)
    }
  }
  return out
}

const [, , inArg, outArg] = process.argv

if (inArg) {
  const output = outArg ?? join(dirname(inArg), `${basename(inArg, '.glb')}.draco.glb`)
  compress(inArg, output)
} else {
  const files = findGlbs(CHARACTER_DIR)
  if (files.length === 0) {
    console.log(`No uncompressed .glb files found under ${CHARACTER_DIR}`)
  }
  for (const file of files) {
    const output = join(dirname(file), `${basename(file, '.glb')}.draco.glb`)
    compress(file, output)
  }
}
