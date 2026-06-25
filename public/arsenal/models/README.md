# Arsenal 3D Prop Assets

Drop the files for each prop into its folder here, then wire the paths in
`app/components/portfolio/arsenal-props.ts` and flip `status` to `'ready'`.

## Folders

| Folder            | Prop slot      | Title                |
| ----------------- | -------------- | -------------------- |
| `prop-slot-01/`   | `prop-slot-01` | Hard-surface weapon  |
| `prop-slot-02/`   | `prop-slot-02` | Character bust       |
| `prop-slot-03/`   | `prop-slot-03` | Environment shrine   |

## Files per prop (suggested names)

| File             | Field in PropAsset | Required for                              |
| ---------------- | ------------------ | ----------------------------------------- |
| `model.glb`      | `glb`              | Orbit, Wireframe, Beauty, Swipe · Live    |
| `beauty.png`     | `beauty`           | Swipe · Stills, Swipe · Hybrid            |
| `wireframe.png`  | `wireframe`        | Swipe · Stills                            |
| `poster.png`     | `poster`           | Thumbnail + mobile / performance fallback |

- The only file required to enable the live 3D viewer is `model.glb`.
- Beauty / wireframe stills are optional and unlock the swipe-compare modes.
- Images can be `.png`, `.jpg`, or `.webp`.

## Wiring example

In `app/components/portfolio/arsenal-props.ts`, use the `arsenalPath` helper
(it URL-encodes spaces) so paths resolve under `public/arsenal/`:

```ts
{
  id: 'prop-slot-01',
  title: 'Hard-surface weapon',
  category: 'Weapons',
  description: '…',
  tags: ['Hard-surface', 'PBR', 'Blender'],
  status: 'ready',
  glb: arsenalPath('models', 'prop-slot-01', 'model.glb'),
  beauty: arsenalPath('models', 'prop-slot-01', 'beauty.png'),
  wireframe: arsenalPath('models', 'prop-slot-01', 'wireframe.png'),
  poster: arsenalPath('models', 'prop-slot-01', 'poster.png'),
},
```
