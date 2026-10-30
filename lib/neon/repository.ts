import "server-only";
import { database } from "./db";
import type { ProjectRecord } from "../cms-data";
import type { validateProject } from "../cms-validation";

type ValidProject = ReturnType<typeof validateProject>;

export async function insertProject(p: ValidProject): Promise<ProjectRecord> {
 const sql=database();
 const rows=await sql`INSERT INTO portfolio_projects
 (slug,number,title,display_title,category,scene,summary,challenge,approach,outcome,role,year,
 stack,images,github,live,published,featured,position,seo_title,seo_description,architecture,decisions,features,challenge_note)
 VALUES (${p.slug},${p.number},${p.title},${p.display_title},${p.category},${p.scene},${p.summary},${p.challenge},${p.approach},${p.outcome},${p.role},${p.year},
 ${JSON.stringify(p.stack)}::jsonb,${JSON.stringify(p.images)}::jsonb,${p.github},${p.live},${p.published},${p.featured},${p.position},${p.seo_title},${p.seo_description},${JSON.stringify(p.architecture)}::jsonb,${JSON.stringify(p.decisions)}::jsonb,${JSON.stringify(p.features)}::jsonb,${p.challenge_note}) RETURNING *`;
 return rows[0] as ProjectRecord;
}
export async function updateProject(id: string,p: ValidProject): Promise<ProjectRecord | null> {
 const sql=database();
 const rows=await sql`UPDATE portfolio_projects SET
 slug=${p.slug},number=${p.number},title=${p.title},display_title=${p.display_title},category=${p.category},scene=${p.scene},
 summary=${p.summary},challenge=${p.challenge},approach=${p.approach},outcome=${p.outcome},role=${p.role},year=${p.year},
 stack=${JSON.stringify(p.stack)}::jsonb,images=${JSON.stringify(p.images)}::jsonb,github=${p.github},live=${p.live},
 published=${p.published},featured=${p.featured},position=${p.position},seo_title=${p.seo_title},seo_description=${p.seo_description},
 architecture=${JSON.stringify(p.architecture)}::jsonb,decisions=${JSON.stringify(p.decisions)}::jsonb,features=${JSON.stringify(p.features)}::jsonb,challenge_note=${p.challenge_note}
 WHERE id=${id}::uuid RETURNING *`;
 return (rows[0] as ProjectRecord | undefined) || null;
}
