// Build a single web-ready Walk GLB from the 3 raw walk FBX files.
//
//   FBX (raw Tripo names) ──convert──▶ GLB (embedded textures)
//   ──rename nodes to clean names──▶ ──merge 3 clips into one doc──▶ Walk.glb
//
// Then compress separately with: npm run compress:character
//
// Usage: node scripts/build-walk.mjs

import { NodeIO } from '@gltf-transform/core'
import convert from 'fbx2gltf'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = 'public/arsenal/models/character/Walking'

// Raw mesh/node name (as exported by Tripo/CC) → clean name used by the rig.
const RAW2CLEAN = {
  meshes_0_: 'AlienSuit',
  tripo_node_4d858951: 'BodyMe',
  Retopo_tripo_node_7e7f03b6_f265_4054_bbac_ae75dd9ffd9f_001: 'GameDevHoodie',
  Retopo_tripo_node_6db2747a_119e_4cb8_87bc_108c3e5f9e27: 'GameDevPants',
  Retopo_tripo_node_7e7f03b6_f265_4054_bbac_ae75dd9ffd9f_001_003: 'GarbageHoodie',
  Retopo_tripo_node_6db2747a_119e_4cb8_87bc_108c3e5f9e27_003: 'GarbagePants',
  model_002: 'Glasses.001',
  Circle: 'Hat.001',
  Retopo_tripo_node_7e7f03b6_f265_4054_bbac_ae75dd9ffd9f_001_002: 'PsyHoodie',
  Retopo_tripo_node_6db2747a_119e_4cb8_87bc_108c3e5f9e27_002: 'PsyPants',
  tripo_mesh_4d1e2038: 'ShoesNike1',
  model: 'ShoesNike2',
  Retopo_tripo_node_7e7f03b6_f265_4054_bbac_ae75dd9ffd9f_001_001: 'TrumpHoodie',
  Retopo_tripo_node_6db2747a_119e_4cb8_87bc_108c3e5f9e27_001: 'TrumpPants',
}

const STATES = [
  { fbx: 'walk-relaxed-1start-379003.fbx', clip: 'Walk_Start' },
  { fbx: 'walk-relaxed-2loop-378986.fbx', clip: 'Walk_Loop' },
  { fbx: 'walk-relaxed-3end-378968.fbx', clip: 'Walk_End' },
]

const io = new NodeIO()

async function toGlb(state) {
  const out = join(DIR, state.fbx.replace(/\.fbx$/i, '.tmp.glb'))
  console.log(`convert ${state.fbx} → ${out}`)
  await convert(join(DIR, state.fbx), out)
  return out
}

/** Copy an animation's channels from `src` doc into `base` doc, matching nodes by name. */
function transferAnimation(base, src, nodeByName, clipName) {
  const buffer = base.getRoot().listBuffers()[0]
  const srcAnim = src.getRoot().listAnimations()[0]
  if (!srcAnim) return
  const anim = base.createAnimation(clipName)
  for (const channel of srcAnim.listChannels()) {
    const srcNode = channel.getTargetNode()
    const target = srcNode ? nodeByName.get(srcNode.getName()) : null
    if (!target) continue
    const s = channel.getSampler()
    const input = base
      .createAccessor()
      .setType('SCALAR')
      .setBuffer(buffer)
      .setArray(Float32Array.from(s.getInput().getArray()))
    const output = base
      .createAccessor()
      .setType(s.getOutput().getType())
      .setBuffer(buffer)
      .setArray(s.getOutput().getArray().slice())
    const sampler = base
      .createAnimationSampler()
      .setInput(input)
      .setOutput(output)
      .setInterpolation(s.getInterpolation())
    anim.addSampler(sampler)
    anim.addChannel(
      base
        .createAnimationChannel()
        .setTargetNode(target)
        .setTargetPath(channel.getTargetPath())
        .setSampler(sampler)
    )
  }
}

async function main() {
  const glbs = []
  for (const state of STATES) glbs.push({ ...state, glb: await toGlb(state) })

  // Base = first (start). Match nodes by their raw names BEFORE renaming.
  const base = await io.read(glbs[0].glb)
  const nodeByName = new Map(base.getRoot().listNodes().map((n) => [n.getName(), n]))

  base.getRoot().listAnimations()[0]?.setName(glbs[0].clip)

  for (const g of glbs.slice(1)) {
    const src = await io.read(g.glb)
    transferAnimation(base, src, nodeByName, g.clip)
  }

  // Rename wearable/body nodes to the clean rig names the configurator expects.
  let renamed = 0
  for (const node of base.getRoot().listNodes()) {
    const clean = RAW2CLEAN[node.getName()]
    if (clean) {
      node.setName(clean)
      renamed++
    }
  }

  const outPath = join(DIR, 'Walk.glb')
  await io.write(outPath, base)
  console.log(
    `\n✓ ${outPath}\n  clips: ${base
      .getRoot()
      .listAnimations()
      .map((a) => a.getName())
      .join(', ')}\n  renamed nodes: ${renamed}`
  )
  console.log('\nNext: npm run compress:character  (produces Walk.draco.glb)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
