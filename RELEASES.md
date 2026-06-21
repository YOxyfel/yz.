# Release history

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

```bash
git checkout v1.0 -- .
git clean -fd -e .env.local -e node_modules -e .next -e .vercel
npm install
npm run build
```

To restore the entire tree exactly (hard reset):

```bash
git reset --hard v1.0
```

Then redeploy: `npx vercel --prod`
