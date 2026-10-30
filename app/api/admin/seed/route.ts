import {adminContext} from "../../../../lib/neon/admin";
import {insertProject} from "../../../../lib/neon/repository";
import {apiError,reply,isSameOriginMutation} from "../../../../lib/cms-api";
import {projects} from "../../../../lib/projects";
import {seedSite} from "../../../../lib/cms-data";
import {validateProject} from "../../../../lib/cms-validation";
export const dynamic="force-dynamic";
export async function POST(req:Request){
 if (!isSameOriginMutation(req)) return reply({error:"Invalid request origin"},403);
 const ctx=await adminContext();if(!ctx)return reply({error:"Not authorized"},401);
 try{
  const existing=await ctx.sql`SELECT slug FROM portfolio_projects`;
  const slugs=new Set(existing.map(p=>p.slug as string));
  let imported=0;
  for(const [i,p] of projects.entries()){
   if(slugs.has(p.slug))continue;
   await insertProject(validateProject({...p,published:true,featured:true,position:i*10}));
   imported++;
  }
  await ctx.sql`INSERT INTO portfolio_settings(key,value) VALUES('site',${JSON.stringify(seedSite())}::jsonb) ON CONFLICT(key) DO NOTHING`;
  await ctx.sql`INSERT INTO portfolio_settings(key,value) VALUES('initialised','true'::jsonb) ON CONFLICT(key) DO UPDATE SET value=excluded.value`;
  return reply({success:true,imported});
 }catch(e){return apiError(e);}
}
