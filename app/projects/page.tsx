import type { Metadata } from "next";
import ProjectsIndex from "../../components/ProjectsIndex";
import { siteUrl } from "../../lib/site";
import {getPublicProjects,getPublicSite} from "../../lib/cms-data";

export async function generateMetadata():Promise<Metadata> {
const site=await getPublicSite();
return {
  title: "Software Development Projects",
  description:`Explore full-stack, security and frontend engineering case studies by ${site.publicName}.`,
  keywords: [
    `${site.publicName} projects`,
    "software development projects",
    "full stack developer projects",
    "Next.js projects",
    "backend developer projects",
    "web security projects",
    "developer portfolio projects",
  ],
  ...(siteUrl ? { alternates: { canonical: "/projects" } } : {}),
  openGraph: {
    title: `Software Development Projects | ${site.publicName}`,
    description: `Full-stack, security tooling and frontend engineering case studies by ${site.publicName}.`,
    ...(siteUrl ? { url: `${siteUrl}/projects` } : {}),
  },
};
}

export const dynamic="force-dynamic";
export default async function ProjectsPage() {
  return <ProjectsIndex projects={await getPublicProjects()} />;
}
