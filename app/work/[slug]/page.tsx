import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectCaseStudy from "../../../components/ProjectCaseStudy";
import { getPublicProjects,getPublicSite } from "../../../lib/cms-data";
import { siteUrl } from "../../../lib/site";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const project=(await getPublicProjects()).find(x=>x.slug===slug);
  if(!project)return {robots:{index:false,follow:false}};
  const name=(await getPublicSite()).publicName;
  const description=project.seoDescription || `${project.summary} Case study by ${name}.`;
  return {title:project.seoTitle || `${project.title} | ${name}`,
    description, keywords:[project.title,...project.stack,name],
    alternates:{canonical:`/work/${project.slug}`},
    openGraph:{type:"article",title:`${project.title} | ${name}`,description,
      url:`${siteUrl}/work/${project.slug}`,
      ...(project.images[0] ? { images:[{url:project.images[0].src,width:project.images[0].width,height:project.images[0].height,alt:`${project.title} screenshot`}] }: {})}};
}
export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const [list,site]=await Promise.all([getPublicProjects(),getPublicSite()]);
  const project=list.find(x=>x.slug===slug);
  if(!project) return notFound();
  const schema={"@context":"https://schema.org","@type":"SoftwareSourceCode",name:project.title,
    description:project.summary,creator:{"@type":"Person",name:site.publicName,sameAs:[site.github,site.linkedin]},
    url:`${siteUrl}/work/${project.slug}`,
    ...(project.github?{codeRepository:project.github}:{}),programmingLanguage:project.stack};
  return <><ProjectCaseStudy project={project} projects={list}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\u003c")}} />
  </>;
}
