# Release history

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
