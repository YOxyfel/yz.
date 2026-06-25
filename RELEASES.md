# Release history

## V3.0.3 (`v3.0.3`)

**Saved:** remove non-functional Lab FX controls from the 3D Props chamber.

| | |
|---|---|
| **Git tag** | `v3.0.3` |
| **Production URL** | https://yanezhekov.dev |

### What this version includes

- Removed the "Lab FX (Full/Reduced/Off)" + "Chamber FX" buttons from the 3D Props
  (Character Forge) chamber — the character configurator never consumed those
  prefs, so the controls did nothing. Its own controls (wireframe, swipe,
  auto-spin, animation clips) remain.
- Concept Art keeps the controls (they drive parallax / qi overlays); Audio keeps
  its own FX toggle; Spotlight never had them.
- Narrowed `LabFxControls` to the art lab (dropped the dead props branch).

### Revert to V3.0.3

```powershell
cd D:\999.Personal\Website\website
git checkout v3.0.3 -- .
git clean -fd -e .env.local -e node_modules -e .next -e .vercel
npm install
npm run build
```

Or hard reset: `git reset --hard v3.0.3`

---

## V3.0.2 (`v3.0.2`)

**Saved:** fix 3D character viewer failing to load on some machines.

| | |
|---|---|
| **Git tag** | `v3.0.2` |
| **Production URL** | https://yanezhekov.dev |

### What this version includes

- Self-hosted the Draco decoder in `public/draco/` and pointed `useGLTF` at it,
  instead of drei's default `gstatic.com` CDN (which can be blocked/unreachable
  on some networks and left the `.draco.glb` models unable to decode → blank viewer)
- Desktop opt-in: the "View in 3D" button now appears on any machine where the
  viewer doesn't auto-mount (low-tier / integrated-GPU desktops, not just mobile)
- Error boundary around the canvas with a "Retry" fallback (clears the loader
  cache) instead of a silent blank on load failure
- Hardened the legacy prop viewer with the same self-hosted decoder

### Revert to V3.0.2

```powershell
cd D:\999.Personal\Website\website
git checkout v3.0.2 -- .
git clean -fd -e .env.local -e node_modules -e .next -e .vercel
npm install
npm run build
```

Or hard reset: `git reset --hard v3.0.2`

---

## V3.0.1 (`v3.0.1`)

**Saved:** Arsenal lab selector redesigned as a clear segmented tab bar.

| | |
|---|---|
| **Git tag** | `v3.0.1` |
| **Production URL** | https://yanezhekov.dev |

### What this version includes

- Desktop Arsenal labs (Spotlight / 3D Props / Concept Art / Audio) rebuilt as
  full-width segmented tabs with index + icon + label, so they read as navigation
  instead of metadata badges
- Strong active state (cyan fill + glow + underline indicator) and hover lift
- "Select a lab · NN disciplines" cue; prev/next + counter moved beside the active
  lab's title/description
- Compact (mobile/tablet) carousel nav unchanged

### Revert to V3.0.1

```powershell
cd D:\999.Personal\Website\website
git checkout v3.0.1 -- .
git clean -fd -e .env.local -e node_modules -e .next -e .vercel
npm install
npm run build
```

Or hard reset: `git reset --hard v3.0.1`

---

## V3.0.0 (`v3.0.0`)

**Saved:** interactive 3D character configurator in the Arsenal — outfits, animations, and wireframe inspection.

| | |
|---|---|
| **Git tag** | `v3.0.0` |
| **Production URL** | https://yanezhekov.dev |

### What this version includes

- Real-time 3D character rig (`@react-three/fiber`) with one skeleton driving every wearable
- Swappable wearables via overlaid cycle rows — head (glasses/hat combos), hoodie, pants, shoes
- Mandatory hoodie; Alien suit as a full-body solo replacement (hides body + all wearables)
- Animations: Sit & Talk, plus a Walk built from raw FBX (auto-chained Walk_Start → Walk_Loop)
- FBX → GLB pipeline (`scripts/build-walk.mjs`): converts, remaps Tripo node names to the clean rig, and merges the 3 walk clips into one file
- Draco + WebP compression (`npm run compress:character`): sitting 79 MB → 11.7 MB, walk 67 MB → 7.9 MB
- Wireframe view = solid clay fill + cyan wireframe overlay (not textured)
- Wireframe-swipe reveal with a grab-only divider; rotate + right-click pan + zoom in every mode
- Per-animation backgrounds; bone-based framing for the 0.01-scale CC armature
- Only compressed `*.draco.glb` assets are committed; raw FBX/textures/GLBs are git-ignored

### Revert to V3.0.0

```powershell
cd D:\999.Personal\Website\website
git checkout v3.0.0 -- .
git clean -fd -e .env.local -e node_modules -e .next -e .vercel
npm install
npm run build
```

Or hard reset: `git reset --hard v3.0.0`

---

## V2.4.0 (`v2.4.0`)

**Saved:** scroll performance, lazy sections, and smarter FX defaults.

| | |
|---|---|
| **Git tag** | `v2.4.0` |
| **Production URL** | https://yanezhekov.dev |

### What this version includes

- Cinematic cosmic FX only on high-tier + Site FX Full; medium/lite while scrolling
- Constellations and heavy sky work only when Sky Lab is open
- Lazy-mounted Projects, Social Proof, Testimonials, and FAQ sections
- Split constellation chrome context so nav/dock don’t re-render on sky spawns
- Hardware-based Site FX defaults (high → Full, mid → Reduced, low/mobile → Off)
- Scroll FPS watchdog with adaptive tier downgrade; starship pause during scroll
- `backdrop-filter` disabled on fixed chrome while scrolling

### Revert to V2.4.0

```powershell
cd D:\999.Personal\Website\website
git checkout v2.4.0 -- .
git clean -fd -e .env.local -e node_modules -e .next -e .vercel
npm install
npm run build
```

Or hard reset: `git reset --hard v2.4.0`

---

## V2.3.0 (`v2.3.0`)

**Saved:** corner dock layout, scroll performance, and continued station polish.

| | |
|---|---|
| **Git tag** | `v2.3.0` |
| **Production URL** | https://v0-yanez.vercel.app |

### What this version includes

- Labeled Site FX / Sky Lab / Sky View dock on the nav row at ≥1720px; below that width, tools move into the menu
- Scroll performance: lighter cosmic FX while scrolling, shared scroll-idle signal, no starship remount on wheel
- Panel chrome cleanup, opt-in flip cards, hero/scroll fixes, and coming-soon project copy

### Revert to V2.3.0

```powershell
cd D:\999.Personal\Website\website
git checkout v2.3.0 -- .
git clean -fd -e .env.local -e node_modules -e .next -e .vercel
npm install
npm run build
```

Or hard reset: `git reset --hard v2.3.0`

---

## V1.1.1 (`v1.1.1`)

**Saved:** mobile nav, Sky Lab, and FX polish after V1.1.

| | |
|---|---|
| **Git tag** | `v1.1.1` |
| **Production URL** | https://v0-yanez.vercel.app |
| **Vercel deployment** | `dpl_9GNmH6iznCDi9PXcNtfNU2ZetySM` |

### What this version includes

- Mobile Sky Lab: FX-gated toggle, constellation names, planets, and starships
- Site FX dock moves into Sky Lab slot when Sky Lab is hidden on mobile
- Panel flip disabled when Site FX is off; block scroll limited to desktop
- Mobile nav hamburger drawer (fixed overflow and empty menu on open)

### Revert to V1.1.1

```powershell
cd D:\999.Personal\Website\website
git checkout v1.1.1 -- .
git clean -fd -e .env.local -e node_modules -e .next -e .vercel
npm install
npm run build
```

Or hard reset: `git reset --hard v1.1.1`

---

## V1.1 (`v1.1`)

**Saved:** optimization and polish pass after V1.0.

| | |
|---|---|
| **Git tag** | `v1.1` |
| **Production URL** | https://v0-yanez.vercel.app |
| **Vercel deployment** | `dpl_FfKNx9413YaBvC6YbUMCLPHDDRR6` |

### What this version includes

- Site FX tiers (off / reduced / full) wired to Sky Lab behavior
- Hero ↔ Game Projects block scroll with scroll buffer; normal scroll elsewhere
- Nav chart layout fixes; desktop inline nav; mobile drawer only on narrow screens
- Spotlight reel replay, volume sync on expand/collapse, spacebar play/pause
- Constellation pattern expansion, performance-adaptive FX, visual FX dock
- i18n updates for Site FX / Sky Lab copy

### Revert to V1.1

```powershell
cd D:\999.Personal\Website\website
git checkout v1.1 -- .
git clean -fd -e .env.local -e node_modules -e .next -e .vercel
npm install
npm run build
```

Or hard reset: `git reset --hard v1.1`

---

## V1.0 (`v1.0`)

**Saved:** baseline before optimization and polish pass.

| | |
|---|---|
| **Git tag** | `v1.0` |
| **Production URL** | https://v0-yanez.vercel.app |
| **Vercel deployment** | `dpl_8w4kn65CgKYkM9bT1XvnLWaUfH9b` |

### What this version includes

- Full portfolio (Sky Lab, Station themes, Arsenal chambers, audio VFX, web stack, etc.)
- Mobile Sky Lab, video theater fixes, card/shadow polish through this session
- Deployed and verified on Vercel

### Revert to V1.0

Ask in Cursor: **"revert to V1.0"**

Or run locally (discards uncommitted work):

```powershell
cd D:\999.Personal\Website\website
git checkout v1.0 -- .
git clean -fd -e .env.local -e node_modules -e .next -e .vercel
npm install
npm run build
```

If PowerShell says `git` is not recognized, run this **in the same terminal** (no restart needed):

```powershell
. .\scripts\refresh-path.ps1
```

Or use the project wrapper from the repo root:

```powershell
.\git.cmd status
.\git.cmd tag
```

To restore the entire tree exactly (hard reset):

```bash
git reset --hard v1.0
```

Then redeploy: `npx vercel --prod`
