import "server-only";
import { cache } from "react";
import type { PortfolioProject, ProjectSceneKey } from "./projects";
import { projects as seedProjects } from "./projects";
import { SITE } from "./site";
import { database } from "./neon/db";
import { resolveProjectScene } from "./scene-ownership";

export type PublicSite = {
  publicName: string; shortName: string; title: string; location: string;
  email: string; github: string; linkedin: string; description: string; keywords: string[];
};
export type CloudProject = PortfolioProject & {
  id?: string; published?: boolean; featured?: boolean; position?: number;
  seoTitle?: string; seoDescription?: string; updatedAt?: string;
};
export type ProjectRecord = {
  id: string; slug: string; number: string; title: string; display_title: string;
  category: string; scene: string; summary: string; challenge: string; approach: string;
  outcome: string; role: string; year: string; stack: string[];
  images: PortfolioProject["images"]; github: string | null; live: string | null;
  published: boolean; featured: boolean; position: number;
  seo_title: string | null; seo_description: string | null;
  architecture?: string[]; decisions?: Array<{title:string;body:string}>;
  features?: Array<{title:string;body:string}>; challenge_note?: string | null;
  updated_at?: string;
};
const scenes: ProjectSceneKey[] = ["campus","codeshield","mistvale","platform","security","ecommerce","backend","abstract","portfolio","minimal"];
export function toProject(r: ProjectRecord): CloudProject {
  return {
    id: r.id, slug: r.slug, number: r.number, title: r.title, displayTitle: r.display_title,
    category: r.category, scene: resolveProjectScene(r.slug, scenes.includes(r.scene as ProjectSceneKey) ? r.scene as ProjectSceneKey : "abstract"),
    summary: r.summary, challenge: r.challenge, approach: r.approach, outcome: r.outcome,
    role: r.role, year: r.year, stack: Array.isArray(r.stack) ? r.stack : [],
    images: Array.isArray(r.images) ? r.images : [],
    ...(r.github ? { github: r.github } : {}), ...(r.live ? { live: r.live } : {}),
    published: r.published, featured: r.featured, position: r.position,
    seoTitle: r.seo_title || "", seoDescription: r.seo_description || "", updatedAt:r.updated_at,
    architecture: Array.isArray(r.architecture) ? r.architecture : [],
    decisions: Array.isArray(r.decisions) ? r.decisions : [],
    features: Array.isArray(r.features) ? r.features : [],
    challengeNote: r.challenge_note || "",
  };
}
export function seedSite(): PublicSite {
  return { publicName: SITE.publicName, shortName: SITE.shortName, title: SITE.title,
    location: SITE.location, email: SITE.email, github: SITE.github, linkedin: SITE.linkedin,
    description: SITE.description, keywords: [...SITE.keywords] };
}
export const getPublicSite = cache(async function getPublicSite(): Promise<PublicSite> {
  if (!process.env.DATABASE_URL) return seedSite();
  try {
    const sql=database();
    const rows=await sql`SELECT value FROM portfolio_settings WHERE key='site' LIMIT 1`;
    if (!rows.length || !rows[0].value || typeof rows[0].value!=="object") return seedSite();
    const v=rows[0].value as Partial<PublicSite>;
    const base=seedSite();
    return {
      publicName:typeof v.publicName==="string"?v.publicName:base.publicName,
      shortName:typeof v.shortName==="string"?v.shortName:base.shortName,
      title:typeof v.title==="string"?v.title:base.title,
      location:typeof v.location==="string"?v.location:base.location,
      email:typeof v.email==="string"?v.email:base.email,
      github:typeof v.github==="string"?v.github:base.github,
      linkedin:typeof v.linkedin==="string"?v.linkedin:base.linkedin,
      description:typeof v.description==="string"?v.description:base.description,
      keywords:Array.isArray(v.keywords)?v.keywords.filter((x):x is string=>typeof x==="string"):base.keywords,
    };
  } catch(e){console.error("Neon site query failed",e);return seedSite();}
});
export const getPublicProjects = cache(async function getPublicProjects(): Promise<CloudProject[]> {
  if (!process.env.DATABASE_URL) return seedProjects.map(p=>({...p,published:true,featured:true}));
  try {
    const sql=database();
    const rows=await sql`SELECT * FROM portfolio_projects WHERE published=true ORDER BY position ASC,created_at ASC`;
    if (!rows.length) {
      const [all,initialised]=await Promise.all([
        sql`SELECT id FROM portfolio_projects LIMIT 1`,
        sql`SELECT value FROM portfolio_settings WHERE key='initialised' LIMIT 1`,
      ]);
      if (!all.length && !initialised.length) {
        // Preserve original V5.9 showcase until initial data import has run.
        return seedProjects.map(p=>({...p,published:true,featured:true}));
      }
    }
    return (rows as unknown as ProjectRecord[]).map(toProject);
  } catch(e){
    console.error("Neon published project query failed",e);
    return []; // fail closed; never reveal private drafts
  }
});
export async function getPublicProject(slug:string):Promise<CloudProject|undefined>{
  return (await getPublicProjects()).find(x=>x.slug===slug);
}
