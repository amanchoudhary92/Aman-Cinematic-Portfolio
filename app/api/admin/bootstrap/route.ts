import { adminContext } from "../../../../lib/neon/admin";
import { reply } from "../../../../lib/cms-api";
import { seedSite } from "../../../../lib/cms-data";
export const dynamic="force-dynamic";
export async function GET(){
 const ctx=await adminContext();if(!ctx)return reply({error:"Not authorized"},401);
 try {
  const [projects,settings]=await Promise.all([
   ctx.sql`SELECT * FROM portfolio_projects ORDER BY position ASC,created_at ASC`,
   ctx.sql`SELECT value FROM portfolio_settings WHERE key='site' LIMIT 1`,
  ]);
  return reply({projects,site:settings[0]?.value||seedSite(),email:ctx.user.email});
 }catch(e){console.error("Admin bootstrap failed",e);return reply({error:"Unable to read CMS database. Check Neon migration."},500);}
}
