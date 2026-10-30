import {adminContext} from "../../../../lib/neon/admin";
import {insertProject} from "../../../../lib/neon/repository";
import {apiError,reply,isSameOriginMutation} from "../../../../lib/cms-api";
import {validateProject} from "../../../../lib/cms-validation";
export const dynamic="force-dynamic";
export async function POST(req:Request){
 if (!isSameOriginMutation(req)) return reply({error:"Invalid request origin"},403);
 const ctx=await adminContext();if(!ctx)return reply({error:"Not authorized"},401);
 try{const record=validateProject(await req.json());const project=await insertProject(record);return reply({project},201);}
 catch(e){return apiError(e);}
}
