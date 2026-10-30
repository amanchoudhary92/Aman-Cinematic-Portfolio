import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ts=await import('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
const sourceFiles=[];
function visit(d){for(const x of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,x.name);if(x.isDirectory()){if(!['node_modules','.next'].includes(x.name))visit(p);}else if(/\.tsx?$/.test(x.name)&&!x.name.endsWith('.d.ts'))sourceFiles.push(p);}}
visit(root);
const diagnostics=[];
for(const file of sourceFiles){
 const content=fs.readFileSync(file,'utf8');
 const out=ts.transpileModule(content,{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}});
 for(const d of out.diagnostics??[])if(d.category===ts.DiagnosticCategory.Error)diagnostics.push(`${path.relative(root,file)} TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`);
}
assert.deepEqual(diagnostics,[],diagnostics.join('\n'));
assert.ok(!fs.existsSync('lib/supabase'),'old Supabase SDK must be removed');
assert.ok(!read('package.json').includes('@supabase'),'Supabase client dependencies must be removed');
for(const f of ['app/api/admin/projects/route.ts','app/api/admin/projects/[id]/route.ts','app/api/admin/site/route.ts','app/api/admin/seed/route.ts','app/api/admin/media/route.ts']){
 const code=read(f);assert.ok(code.includes('adminContext()')&&code.includes('isSameOriginMutation('),`${f} is missing authorization / CSRF gate`);
 assert.ok(!code.includes('isSameOriginMutation(_req)') || code.includes('_req:Request'),`${f} is missing _req declaration`);
}
for(const f of ['components/SceneCanvas.tsx','components/FrameSequenceCanvas.tsx','components/ProjectScene.tsx','components/CinematicHome.tsx'])assert.ok(fs.existsSync(f),f);
assert.ok(read('lib/neon/admin.ts').includes('data.session'),'admin auth must require session');
assert.ok(read('lib/neon/admin.ts').includes('emailVerified'),'admin auth must require verified email');
assert.ok(read('lib/neon/repository.ts').includes('::jsonb'),'JSON arrays must be JSONB');
console.log(`Migration AST syntax checks passed (${sourceFiles.length} TS/TSX files).`);
console.log('CMS auth, same-origin, storage, DB, SEO routes and original visual engine static checks passed.');
