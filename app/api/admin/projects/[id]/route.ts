import {adminContext} from "../../../../../lib/neon/admin";
import {updateProject} from "../../../../../lib/neon/repository";
import {apiError,reply,isSameOriginMutation} from "../../../../../lib/cms-api";
import {validateProject} from "../../../../../lib/cms-validation";
export const dynamic="force-dynamic";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 if (!isSameOriginMutation(req)) return reply({error:"Invalid request origin"},403);
 const ctx=await adminContext();if(!ctx)return reply({error:"Not authorized"},401);
 const {id}=await params;if(!uuid.test(id))return reply({error:"Invalid project ID"},400);
 try{const project=await updateProject(id,validateProject(await req.json()));
  return project?reply({project}):reply({error:"Project not found"},404);
 }catch(e){return apiError(e);}
}
export async function DELETE(_req:Request,{params}:{params:Promise<{id:string}>}){
 if (!isSameOriginMutation(_req)) return reply({error:"Invalid request origin"},403);
 const ctx=await adminContext();if(!ctx)return reply({error:"Not authorized"},401);
 const {id}=await params;if(!uuid.test(id))return reply({error:"Invalid project ID"},400);
 try{await ctx.sql`DELETE FROM portfolio_projects WHERE id=${id}::uuid`;return reply({success:true});}
 catch(e){return apiError(e);}
}
