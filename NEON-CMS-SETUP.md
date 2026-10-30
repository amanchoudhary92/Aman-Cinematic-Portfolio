# Aman V5.9 Neon Cloud CMS — Setup on Windows

## 0. Preserve your working site
Extract this full ZIP into a **new folder**. Keep the previous V5.9 visual master ZIP/folder as backup. Do not overwrite the existing live project before verifying. The public UI is unchanged; only the CMS backend differs.

## 1. Create a free Neon project
1. Open https://console.neon.tech/ and sign in.
2. Create project `aman-portfolio-cms` on the **Free** plan.
3. Pick a region nearest the actual web host when possible. Some Neon backend services may have regional restrictions—confirm Auth and Object Storage availability in the dashboard before choosing.
4. Click **Connect / Connection Details** and copy a pooled PostgreSQL `DATABASE_URL` containing `sslmode=require`. Never share this URL publicly—it contains a password.

## 2. Set up database schema
Open Neon **SQL Editor**, paste the entire file `neon/migrations/001_portfolio_cms.sql`, and run it. Verify tables `portfolio_projects`, `portfolio_settings`, `portfolio_admins` exist.

## 3. Enable Neon Managed Auth
1. Neon console → **Auth** → enable Managed Auth (Better Auth). Select email/password login if offered and enable email verification/delivery.
2. Copy the branch's **Auth base URL** (`NEON_AUTH_BASE_URL`). Set localhost:3000 as a trusted/local origin in Auth settings if required.
3. Choose the *email address you personally control*. After signing up through `/admin`, click its verification email link.
4. In Neon SQL Editor allowlist only that normalized email:

```sql
INSERT INTO portfolio_admins(email) VALUES ('YOUR_EMAIL@example.com') ON CONFLICT DO NOTHING;
```

5. Set the exact same address in `NEON_ADMIN_EMAIL`. **Both** that variable and the SQL allowlist are required. No shared/default `aman-admin` password exists.

## 4. Create .env.local
In PowerShell inside extracted portfolio folder:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Fill all required fields:

```env
DATABASE_URL=postgresql://...NEON-POOLER.../neondb?sslmode=require
NEON_AUTH_BASE_URL=https://.../neondb/auth
NEON_AUTH_COOKIE_SECRET=...random-long-secret...
NEON_ADMIN_EMAIL=YOUR_EMAIL@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Generate secret in PowerShell (not a password you type manually):

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Never use `NEXT_PUBLIC_` for secrets. Do not commit `.env.local` to GitHub.**

## 5. Optional — enable screenshot uploads with Neon Object Storage
In Neon console → **Storage**: create a private S3-compatible bucket named `portfolio-media` (if not already created). Neon exposes endpoint and S3 credentials; copy their values. Add to `.env.local`:

```env
AWS_ENDPOINT_URL_S3=https://YOUR-STORAGE-ENDPOINT
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
AWS_REGION=us-east-2
NEON_S3_BUCKET=portfolio-media
```

These are backend-only. Uploads go to `portfolio/<uuid>.<ext>` in the private bucket. Public portfolio images are safely served using `/api/media/<uuid>.<ext>`; file contents are checked and uploads capped at 4 MB. If storage is not configured, project content still works and uploading an image shows a setup error.

## 6. Install + production build
With Node.js 20.9+ installed, inside the new extracted folder:

```powershell
npm install
npm run verify
npm run test:cms
npm run build
npm start
```

Open `http://localhost:3000/admin`. Click **FIRST TIME? CREATE VERIFIED ACCOUNT**, use the exact allowlisted email, check email verification, then sign in. If you already created a verified Neon Auth user, sign in directly. If login succeeds but CMS refuses access, double-check verification, SQL allowlist and `NEON_ADMIN_EMAIL`.

## 7. Import original 3 projects
Click **IMPORT ORIGINAL 3 PROJECTS** once. This operation checks slugs and won't overwrite existing projects. Confirm `/projects`, `/work/campus-hub`, `/work/codeshield-ai`, `/work/mistvale-tea` render. Existing V5.9 visuals/frames remain unchanged.

## 8. Test the real CMS
Create a new dummy project, save as **Draft**. Verify it is *absent* from `/projects` and `/sitemap.xml`. Publish and refresh those pages—project should appear. Test slug editing without auto-reset, image upload (if configured), unpublish, profile updates, and deletion. Do not delete original three projects.

## 9. Deploy
Push source code (without `.env.local`) to a **private or public GitHub repo** and import into Vercel. Add all required environment variables to Vercel project settings; update `NEXT_PUBLIC_SITE_URL` to the final deployed HTTPS URL. Add the Vercel hostname/custom domain to Neon Auth trusted origins. Deploy, verify login, pages, media, sitemap, canonical URLs, Google Search Console and LinkedIn.

## Safety checks / limitations
- Neon Postgres credentials are server-only; public site never exposes them.
- CMS mutations require a verified Neon Auth session, exact server-side email allowlist, matching database allowlist, and same-origin requests.
- Published projects and SEO data are dynamically server-rendered; new published projects do not require source-code edits or an app rebuild.
- Private bucket screenshots are served through a public read-only image route. This route is intentionally public, because project screenshots must show to visitors. Do not upload personal/private photos.
- Neon Auth SDK is currently a **beta** integration. The package pins a specific version. If APIs change upstream, run build and review the official guide, rather than changing versions blindly.
- The full production build must be confirmed on your machine after `npm install`; live authentication and storage cannot be verified without your project configuration.
