import type { MetadataRoute } from "next";
import { getPublicProjects } from "../lib/cms-data";
import { siteUrl } from "../lib/site";
export const dynamic="force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const projects=await getPublicProjects();
  return [
    {url:siteUrl,lastModified:new Date(),changeFrequency:"monthly",priority:1},
    {url:`${siteUrl}/projects`,lastModified:new Date(),changeFrequency:"monthly",priority:0.9},
    ...projects.map(p=>({url:`${siteUrl}/work/${p.slug}`,lastModified:p.updatedAt ? new Date(p.updatedAt) : new Date(),changeFrequency:"monthly" as const,priority:0.8}))
  ];
}
