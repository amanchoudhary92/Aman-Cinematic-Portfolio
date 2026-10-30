# Aman Cinematic Portfolio — V5.9 Visual Master + Neon Cloud CMS

V5.9 visual master preserved: 120 cinematic frames, 3D scenes, scroll manifesto and Engineering Philosophy motion, project case studies, layout and mobile behavior. Only data, authentication and media plumbing changed.

## Start here
Read **NEON-CMS-SETUP.md**. Neon Free: PostgreSQL + Managed Auth + Object Storage. The SQL migration is in `neon/migrations/001_portfolio_cms.sql`.

```powershell
npm install
npm run verify
npm run test:cms
npm run build
npm start
```

Without Neon credentials, homepage safely renders the V5.9 original projects, and `/admin` shows a setup screen. With a blank configured database, original three projects also render until the initial seed has run. **Import original three projects** in Admin after migrations/login. Draft/unpublished projects remain hidden from the public site and sitemap.

Admin uses a *verified Neon Auth email*, a server-side exact-email allowlist (`NEON_ADMIN_EMAIL`) and the `portfolio_admins` database table. There is no default password. Never expose `DATABASE_URL`, auth cookie secret, S3 credentials, or server keys to the browser.

Project CMS supports Draft/Publish/Unpublish/Delete, title/slug, content/stack/architecture/features/decisions, images, featured flag, profile/social links, and SEO metadata. 8 existing 3D scene variants are available; new projects do not inherit unrelated old project case-study copy.

SEO: Set `NEXT_PUBLIC_SITE_URL` for canonical metadata, dynamic published-only sitemap and structured data. Public SEO identity **Aman Choudhary**, homepage hero still **HI, I'M AMAN**. LinkedIn: https://www.linkedin.com/in/aman-c-1887143b1.

**Verification boundary:** Source-level checks and ZIP integrity run without credentials; full Next.js build and live Neon end-to-end testing require dependency installation and a configured Neon account. A Lighthouse performance number is not guaranteed by changing CMS backend.
