import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const validation=ts.transpileModule(read('lib/cms-validation.ts'),{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},
  fileName:'lib/cms-validation.ts',reportDiagnostics:true
});
assert.equal(validation.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length||0,0);
const ownership=ts.transpileModule(read('lib/scene-ownership.ts'),{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},
  fileName:'lib/scene-ownership.ts',reportDiagnostics:true
});
assert.equal(ownership.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length||0,0);
const owner={};vm.runInNewContext(ownership.outputText,{exports:owner});
const exp={};vm.runInNewContext(validation.outputText,{exports:exp, URL,
  require:(id)=>{assert.equal(id,'./scene-ownership');return owner;}
});
// Three original V5.9 sculptures are owned by their projects, never selectable by a new project.
assert.equal(owner.resolveProjectScene('campus-hub','abstract'),'campus');
assert.equal(owner.resolveProjectScene('codeshield-ai','backend'),'codeshield');
assert.equal(owner.resolveProjectScene('mistvale-tea','ecommerce'),'mistvale');
assert.equal(owner.resolveProjectScene('brand-new-project','campus'),'platform');
assert.equal(owner.resolveProjectScene('brand-new-project','codeshield'),'security');
assert.equal(owner.resolveProjectScene('brand-new-project','mistvale'),'ecommerce');
for(const theme of ['platform','security','ecommerce','backend','abstract','portfolio','minimal']) {
  assert.equal(owner.resolveProjectScene('brand-new-project',theme),theme);
}
assert.equal(exp.validateProject({slug:'my-security-project',title:'Security Project',scene:'codeshield'}).scene,'security');
assert.equal(exp.validateProject({slug:'my-campus-project',title:'Campus Project',scene:'campus'}).scene,'platform');
assert.equal(exp.validateProject({slug:'my-tea-project',title:'Tea Project',scene:'mistvale'}).scene,'ecommerce');
assert.equal(exp.validateProject({slug:'mistvale-tea',title:'Mistvale',scene:'abstract'}).scene,'mistvale');
assert.ok(!read('components/CloudAdmin.tsx').includes('value:"campus",label:'),'reserved originals hidden from presets');
assert.ok(read('components/ProjectScene.tsx').includes('addGenericScene('),'generic scenes must not fall back to original 3D');
const base={slug:'new-portfolio',title:'New Portfolio',displayTitle:'NEW PORTFOLIO',scene:'backend',stack:['Next.js'],images:[],published:false};
const valid=exp.validateProject(base);
assert.equal(valid.slug,'new-portfolio');
assert.equal(valid.scene,'backend');
assert.equal(valid.published,false);
assert.equal(valid.github,null);
assert.throws(()=>exp.validateProject({...base,slug:'new project'}),/slug/);
assert.throws(()=>exp.validateProject({...base,title:''}),/title/);
assert.equal(exp.validateProject({...base,scene:'unknown'}).scene,'abstract');
assert.equal(exp.validateProject({...base,github:'javascript:alert(1)'}).github,null);
assert.equal(exp.validateProject({...base,architecture:['UI','API'],decisions:[{title:'VALIDATE',body:'Server validation'}]}).decisions[0].title,'VALIDATE');
assert.throws(()=>exp.validateProject({...base,images:[{src:'data:image/svg+xml,<svg/>',label:'x'}]}),/Image/);
const site=exp.validateSite({email:'example@example.com',github:'https://github.com/hello',linkedin:'https://www.linkedin.com/in/example',keywords:['engineer']},{publicName:'Aman',shortName:'Aman',title:'Engineer',location:'Delhi',email:'x@y.com',github:'https://github.com/x',linkedin:'https://linkedin.com/in/x',description:'x',keywords:[]});
assert.equal(site.linkedin,'https://www.linkedin.com/in/example');
assert.throws(()=>exp.validateSite({email:'not-an-email'},site),/email/);
const sql=read('neon/migrations/001_portfolio_cms.sql');
for(const p of ['portfolio_admins','portfolio_projects','portfolio_settings','published BOOLEAN','CREATE INDEX'])assert.ok(sql.includes(p),p);
const loader=read('lib/cms-data.ts');
assert.ok(loader.includes('WHERE published=true'),'drafts must not be returned by public loader');
assert.ok(read('app/sitemap.ts').includes('getPublicProjects()'),'sitemap must be dynamic');
for(const file of ['components/CinematicHome.tsx','components/ProjectCaseStudy.tsx','components/ProjectsIndex.tsx']){
 const src=read(file);assert.ok(!src.includes('import { projects,'),`${file} should use server supplied projects`);
}
const admin=read('components/CloudAdmin.tsx');
assert.ok(admin.includes('selectedId'), 'stable id project selection');
assert.ok(admin.includes('SAVE CHANGES') && admin.includes('PUBLISH ↗'));
assert.ok(!admin.includes('localStorage'), 'no browser-only content storage');
assert.ok(read('lib/neon/admin.ts').includes('portfolio_admins'),'verified session must check admin allowlist');
assert.ok(read('lib/neon/admin.ts').includes('emailVerified'),'verified email must be required');
assert.ok(read('lib/cms-api.ts').includes('isSameOriginMutation'),'state changes require same-origin');
assert.ok(read('lib/neon/repository.ts').includes('::jsonb'),'project collections stored in JSONB');
assert.ok(!read('app/api/admin/projects/route.ts').includes('supabase'),'must not call Supabase');
assert.ok(read('app/api/admin/media/route.ts').includes('PutObjectCommand'),'uploads must use Neon storage');
console.log('CMS smoke checks passed: validators, reserved original scenes, independent theme scenes, Neon admin allowlist, routes, cloud save/publish.');
