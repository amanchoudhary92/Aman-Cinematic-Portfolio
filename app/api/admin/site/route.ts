import {adminContext} from "../../../../lib/neon/admin";
import {apiError,reply,isSameOriginMutation} from "../../../../lib/cms-api";
import {validateSite} from "../../../../lib/cms-validation";
import {seedSite} from "../../../../lib/cms-data";
export const dynamic="force-dynamic";
export async function PUT(req:Request){
 if (!isSameOriginMutation(req)) return reply({error:"Invalid request origin"},403);
 const ctx=await adminContext();if(!ctx)return reply({error:"Not authorized"},401);
 try{const value=validateSite(await req.json(),seedSite());
  await ctx.sql`INSERT INTO portfolio_settings(key,value) VALUES('site',${JSON.stringify(value)}::jsonb)
   ON CONFLICT(key) DO UPDATE SET value=excluded.value`;
  return reply({success:true,site:value});
 }catch(e){return apiError(e);}
}
