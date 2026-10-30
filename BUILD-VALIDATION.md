# Neon CMS migration — validation and limitations

## Verified in package preparation environment

- `node scripts/verify-project.mjs` — passed (46 required files + all 120 cinematic frame images).
- `node scripts/test-cms.mjs` — passed (validation, draft visibility query, sitemap, admin checks and media upload structure).
- `node scripts/audit-migration.mjs` — passed (39 TS/TSX sources parsed/transpiled successfully, route guards, Neon DB auth/storage architecture checks).
- ZIP integrity and public assets SHA-256 comparison with input CMS ZIP — see final package audit.
- Cinematic visuals/Three.js/GSAP components and existing project text/assets not redesigned.

## NOT verified in this isolated environment

- Full `npm run build` / Next.js TypeScript type-check (npm registry unavailable with `EAI_AGAIN`); source parser checks **do not replace** a real type-check.
- Real Neon database, managed Auth sessions, SQL migration, login, screenshot upload and publish flow (requires your Neon project credentials and deployment).
- Live Lighthouse score. A remote database adds server latency; retest after deploying.

Do not deploy production CMS until both `npm run build` and one complete Neon admin add/save/publish/unpublish test pass. Never share or commit `.env.local`.
