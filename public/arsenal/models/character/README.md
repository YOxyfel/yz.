# Character Outfit Configurator — Asset Spec

A single rigged character (you) with swappable wearables, plus playable
animations. One `.glb` per animation; each contains the full character with
ALL wearable meshes present and a shared skeleton.

## Folder layout

```
character/
  Sitting/
    Sitting_Character.glb          ← source export (large)
    Sitting_Character.draco.glb    ← web file (generated, ~7x smaller)
  Walking/
    Walk.glb                       ← (to add) single GLB, 3 clips
  poster.png                       ← optional mobile/low-power fallback
```

The viewer loads the `.draco.glb` web files. Generate them from the raw
exports with:

```
npm run compress:character
```

This compresses every `*.glb` (skipping already-compressed `*.draco.glb`) to a
Draco + WebP `*.draco.glb` next to it. Then point the matching entry in
`app/components/portfolio/character-config.ts` at the `.draco.glb`.

## Mesh names (critical — must match the config)

The outfit system maps each region/variant to **exact mesh names**. The current
Sitting export uses these clean names — every animation export MUST reuse the
**same names and the same skeleton**:

```
BodyMe            ← base body, always visible (hidden only by a solo suit)
GameDevHoodie / TrumpHoodie / GarbageHoodie / PsyHoodie
GameDevPants  / TrumpPants  / GarbagePants  / PsyPants
ShoesNike1 / ShoesNike2
Glasses.001
Hat.001
AlienSuit         ← full-body "solo" suit (hides body + all wearables)
```

If a new export uses different mesh names, the toggles won't map. Re-export
through the SAME Blender file that produced the Sitting model so the names and
rig are identical. (FBX with raw Tripo names like `Retopo_tripo_node_...` will
NOT work — convert/rename to the names above and export GLB.)

## Animations

Each animation is its own `.glb` with the full character + shared rig.

- **One single armature/skeleton** for the body AND every wearable.
- **In-place / no root motion** preferred so the character stays centered.
- Consistent frame rate (24 or 30 fps); reasonable bone count for the web.
- Tell the dev, per clip: **loops** vs **plays once**, and the **default**.

### Walking (3 states → one "Walk" button)

Export the 3 walk states as a **single `Walk.glb` with 3 named clips** so they
can auto-chain on one model (start → loop → end):

```
Walk_Start   ← plays once (ease-in from standing)
Walk_Loop    ← loops (the walk cycle)
Walk_End     ← plays once (ease-out to standing)
```

(3 separate GLBs would each reload the whole character and can't crossfade
cleanly — one file with 3 clips is strongly preferred.)

**Only have FBX?** Drop the 3 raw walk `.fbx` files in `Walking/` and run:

```
node scripts/build-walk.mjs      # FBX → GLB, renames Tripo nodes → clean names,
                                 # merges the 3 clips into Walking/Walk.glb
npm run compress:character public/arsenal/models/character/Walking/Walk.glb
```

`build-walk.mjs` maps the raw Tripo mesh/node names back to the clean rig names
(via the `RAW2CLEAN` table inside it) so the outfit toggles work on the walk too.
If you re-export with new Tripo IDs, update that table.

## Export settings (Blender → glTF 2.0)

- Format: **glTF Binary (.glb)**
- Include **Materials** + **Images** (textures embedded)
- **Animation: ON** — push each Action to an NLA track so all clips export
- All wearables skinned to the same armature, pre-fitted to the bind pose
- Don't pre-compress in Blender — run `npm run compress:character` instead
