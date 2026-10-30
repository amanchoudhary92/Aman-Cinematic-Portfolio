import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const required = [
  "package.json",
  "app/page.tsx",
  "app/layout.tsx",
  "app/globals.css",
  "app/work/[slug]/page.tsx",
  "app/projects/page.tsx",
  "components/CinematicHome.tsx",
  "components/FrameSequenceCanvas.tsx",
  "components/SceneCanvas.tsx",
  "components/SiteHeader.tsx",
  "components/ProjectScene.tsx",
  "components/ProjectCaseStudy.tsx",
  "components/ProjectsIndex.tsx",
  "lib/projects.ts",
  "lib/site.ts",
  "app/robots.ts",
  "app/sitemap.ts",
  "app/opengraph-image.tsx",
  "app/admin/page.tsx",
  "components/CloudAdmin.tsx",
  "proxy.ts",
  "lib/neon/auth.ts",
  "lib/neon/repository.ts",
  "app/api/auth/[...path]/route.ts",
  "app/api/media/[key]/route.ts",
  "lib/cms-data.ts",
  "app/api/admin/projects/route.ts",
  "app/api/admin/bootstrap/route.ts",
  "app/api/admin/media/route.ts",
  "neon/migrations/001_portfolio_cms.sql",
  ".env.example",
  "public/images/aman-hero.webp",
  "public/images/aman-about.webp",
  "public/projects/campus-dashboard.webp",
  "public/projects/campus-upload.webp",
  "public/projects/campus-moderation.webp",
  "public/projects/campus-audit.webp",
  "public/projects/campus-users.webp",
  "public/projects/campus-profile.webp",
  "public/projects/mistvale-home.webp",
  "public/projects/mistvale-shop.webp",
  "public/projects/mistvale-product.webp",
  "public/projects/mistvale-footer.webp",
  "public/Aman-Resume.pdf",
  "public/frames/aman/frame-001.webp",
  "public/frames/aman/frame-120.webp"
];

const missing = required.filter((file) => !existsSync(resolve(process.cwd(), file)));
const frameDir = resolve(process.cwd(), "public/frames/aman");
const frameCount = existsSync(frameDir)
  ? readdirSync(frameDir).filter((name) => /^frame-\d{3}\.webp$/.test(name)).length
  : 0;

if (frameCount !== 120) {
  missing.push(`frame sequence count is ${frameCount}; expected 120`);
}

if (missing.length) {
  console.error("\nPortfolio verification failed:\n");
  for (const file of missing) console.error(` - ${file}`);
  console.error("\nRe-extract the complete ZIP and run npm install again.\n");
  process.exit(1);
}

console.log(`Portfolio verification passed (${required.length} required files + ${frameCount} cinematic frames).`);
