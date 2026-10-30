import type { PortfolioProject, ProjectSceneKey } from "./projects";
import type { PublicSite } from "./cms-data";
import { resolveProjectScene } from "./scene-ownership";

const sceneKeys: ProjectSceneKey[] = ["campus","codeshield","mistvale","platform","security","ecommerce","backend","abstract","portfolio","minimal"];
const text = (x: unknown, max = 4000) => typeof x === "string" ? x.trim().slice(0, max) : "";
const validLink = (x: unknown) => {
  const v = text(x, 500);
  if (!v) return null;
  try { const u = new URL(v); return (u.protocol === "https:" || u.protocol === "http:") ? u.toString() : null; } catch { return null; }
};
const lines = (x: unknown, max=40, width=160) => Array.isArray(x) ? x.slice(0,max).map(v=>text(v,width)).filter(Boolean) : [];
const storyItems = (x: unknown) => Array.isArray(x) ? x.slice(0,16).map(raw=>{
  const v = (raw || {}) as Record<string,unknown>;
  return {title:text(v.title,150),body:text(v.body,1200)};
}).filter(x=>x.title && x.body) : [];
export function validateProject(x: unknown) {
  const v = (x || {}) as Record<string, unknown>;
  const slug = text(v.slug, 90).toLowerCase();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error("Enter a valid slug: lowercase letters, numbers, hyphens.");
  const title = text(v.title, 160);
  if (!title) throw new Error("Project title is required.");
  const rawImages = Array.isArray(v.images) ? v.images.slice(0, 24) : [];
  const images = rawImages.map((item: unknown) => {
    const im = (item || {}) as Record<string, unknown>;
    const src = text(im.src, 1024);
    if ((src.startsWith("//") || (!src.startsWith("/") && !validLink(src)))) throw new Error("Image must have a site-relative or HTTP(S) URL.");
    return { src, label:text(im.label,120), note:text(im.note,300),
      width:Math.max(1,Math.min(10000,Number(im.width)||1200)),
      height:Math.max(1,Math.min(10000,Number(im.height)||800)) };
  });
  const scene = resolveProjectScene(slug, sceneKeys.includes(v.scene as ProjectSceneKey) ? v.scene as ProjectSceneKey : "abstract");
  return {
    slug, number:text(v.number,8)||"00", title, display_title:text(v.displayTitle,180)||title.toUpperCase(),
    category:text(v.category,150), scene, summary:text(v.summary,3000), challenge:text(v.challenge,5000),
    approach:text(v.approach,5000), outcome:text(v.outcome,5000), role:text(v.role,300), year:text(v.year,12),
    stack:lines(v.stack), images, github:validLink(v.github), live:validLink(v.live),
    published:Boolean(v.published), featured:Boolean(v.featured), position:Number.isFinite(Number(v.position))?Math.trunc(Number(v.position)):0,
    seo_title:text(v.seoTitle,160)||null,seo_description:text(v.seoDescription,300)||null,
    architecture:lines(v.architecture,12,120),
    decisions:storyItems(v.decisions),features:storyItems(v.features),
    challenge_note:text(v.challengeNote,1200)||null,
  };
}
export function validateSite(x: unknown, base: PublicSite): PublicSite {
  const v = (x || {}) as Record<string, unknown>;
  const github = validLink(v.github), linkedin=validLink(v.linkedin);
  const email = text(v.email,254);
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid contact email.");
  return { publicName:text(v.publicName,120)||base.publicName,
    shortName:text(v.shortName,60)||base.shortName, title:text(v.title,160)||base.title,
    location:text(v.location,120), email,
    github:github||base.github,linkedin:linkedin||base.linkedin,
    description:text(v.description,600)||base.description,keywords:lines(v.keywords) };
}
