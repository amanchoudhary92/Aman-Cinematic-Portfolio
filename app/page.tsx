import CinematicHome from "../components/CinematicHome";
import { getPublicProjects,getPublicSite } from "../lib/cms-data";
export const dynamic="force-dynamic";
export default async function HomePage() {
  const [projects,site]=await Promise.all([getPublicProjects(),getPublicSite()]);
  return <CinematicHome projects={projects.filter(p=>p.featured !== false)} site={site} />;
}
