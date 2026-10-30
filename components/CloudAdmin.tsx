"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "../lib/neon/client";
import type { PublicSite, ProjectRecord } from "../lib/cms-data";
import type { ProjectSceneKey } from "../lib/projects";
import { ORIGINAL_SCENES, isOriginalCaseStudy, resolveProjectScene } from "../lib/scene-ownership";

type Draft = {
  id: string; slug:string; number:string; title:string; displayTitle:string; category:string;
  scene:ProjectSceneKey; summary:string; challenge:string; approach:string; outcome:string;
  role:string;year:string;stack:string[];
  images:{src:string;label:string;note:string;width:number;height:number}[];
  github:string; live:string; published:boolean;featured:boolean; position:number;
  seoTitle:string;seoDescription:string;
  architecture:string[];decisions:Array<{title:string;body:string}>;
  features:Array<{title:string;body:string}>;challengeNote:string;
};
// The three original V5.9 scenes are owned by their specific projects only.
// New projects choose from independent, brand-neutral 3D category scenes.
const SCENES: {value:ProjectSceneKey;label:string}[] = [
  {value:"platform",label:"Platform / Web App"}, {value:"security",label:"Security / AI"},
  {value:"ecommerce",label:"Ecommerce / Product"}, {value:"backend",label:"Backend / API"},
  {value:"abstract",label:"Abstract System"}, {value:"portfolio",label:"Portfolio / Creative"},
  {value:"minimal",label:"Minimal / Clean"},
];
function fromRow(r:ProjectRecord):Draft{return{
  id:r.id, slug:r.slug,number:r.number,title:r.title,displayTitle:r.display_title,
  category:r.category,scene:r.scene as ProjectSceneKey,summary:r.summary,challenge:r.challenge,
  approach:r.approach,outcome:r.outcome,role:r.role,year:r.year,stack:r.stack||[],
  images:r.images||[],github:r.github||"",live:r.live||"",published:r.published,
  featured:r.featured,position:r.position,seoTitle:r.seo_title||"",seoDescription:r.seo_description||"",
  architecture:r.architecture||[],decisions:r.decisions||[],features:r.features||[],challengeNote:r.challenge_note||"",
};}
function newDraft():Draft{return{
  id:`draft-${crypto.randomUUID()}`,slug:"",number:"00",title:"",displayTitle:"",category:"SOFTWARE DEVELOPMENT / CASE STUDY",
  scene:"abstract",summary:"",challenge:"",approach:"",outcome:"",role:"Full-Stack Development",
  year:String(new Date().getFullYear()),stack:[],images:[],github:"",live:"",
  published:false,featured:false,position:100,seoTitle:"",seoDescription:"",
  architecture:[],decisions:[],features:[],challengeNote:"",
};}
function slugify(v:string){return v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function parseStory(raw:string){return raw.split("\n").map(line=>{
  const index=line.indexOf("|");
  return index<0?{title:line.trim(),body:""}:{title:line.slice(0,index).trim(),body:line.slice(index+1).trim()};
}).filter(x=>x.title||x.body);}
async function api<T>(url:string,init?:RequestInit):Promise<T>{
  const res=await fetch(url,{...init,cache:"no-store",headers:{...(init?.body instanceof FormData?{}:{"Content-Type":"application/json"}),...(init?.headers||{})}});
  const body=await res.json().catch(()=>({error:"Invalid response"}));
  if(!res.ok)throw new Error(body.error || `Request failed (${res.status})`);
  return body as T;
}
export default function CloudAdmin({configured}:{configured:boolean}){
  const [email,setEmail]=useState("");const [password,setPassword]=useState("");
  const [registerMode,setRegisterMode]=useState(false);
  const [verifyMode,setVerifyMode]=useState(false);
  const [verificationCode,setVerificationCode]=useState("");
  const [authed,setAuthed]=useState(false);const [checking,setChecking]=useState(true);
  const [message,setMessage]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  const [tab,setTab]=useState<"projects"|"profile"|"seo">("projects");
  const [items,setItems]=useState<Draft[]>([]);const [selectedId,setSelectedId]=useState("");
  const [site,setSite]=useState<PublicSite|null>(null);const [dirty,setDirty]=useState(false);
  const current=useMemo(()=>items.find(x=>x.id===selectedId),[items,selectedId]);
  const load=useCallback(async()=>{
    const result=await api<{projects:ProjectRecord[];site:PublicSite;email:string}>("/api/admin/bootstrap");
    const list=result.projects.map(fromRow);
    setItems(list);setSite(result.site);setEmail(result.email||"");setAuthed(true);
    setSelectedId(prev=>list.some(p=>p.id===prev)?prev:(list[0]?.id||""));setDirty(false);
  },[]);
  useEffect(()=>{if(!configured){setChecking(false);return;}
    let cancelled=false;
    (async()=>{try{await load();}catch{/* login screen if not authorized */}
      finally{if(!cancelled)setChecking(false);}})();
    return()=>{cancelled=true;};
  },[configured,load]);
  useEffect(()=>{
    if(!dirty)return;
    const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue="";};
    window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);
  },[dirty]);
  async function run(fn:()=>Promise<void>){setBusy(true);setMessage("");setError("");
    try{await fn();}catch(e){setError(e instanceof Error?e.message:"Action failed");}
    finally{setBusy(false);}}
  async function login(e:React.FormEvent<HTMLFormElement>){e.preventDefault();await run(async()=>{
    const {error}=await authClient.signIn.email({email,password});
    if(error){
      if(/email.{0,20}not.{0,20}verif|verif.{0,20}email/i.test(error.message || "")) setVerifyMode(true);
      throw error;
    }
    try { await load(); }
    catch(e){ await authClient.signOut();throw new Error("Signed in, but admin access is not approved. Verify your email and the NEON_ADMIN_EMAIL/portfolio_admins allowlist."); }
    setPassword("");setMessage("Signed in successfully.");
  });}
  async function register(e:React.FormEvent<HTMLFormElement>){e.preventDefault();await run(async()=>{
    if(password.length<12)throw new Error("Use at least 12 characters for your admin password.");
    const {error}=await authClient.signUp.email({email,password,name:"Aman"});
    if(error)throw error;
    setRegisterMode(false);setPassword("");setVerifyMode(true);
    setMessage("Account created. Enter the verification code sent to your email.");
  });}
  async function verifyEmail(e:React.FormEvent<HTMLFormElement>){e.preventDefault();await run(async()=>{
    const otp=verificationCode.trim();
    if(!/^\d{6}$/.test(otp))throw new Error("Enter the 6-digit verification code from your email.");
    const {error}=await authClient.emailOtp.verifyEmail({email:email.trim(),otp});
    if(error)throw error;
    setVerifyMode(false);setRegisterMode(false);setVerificationCode("");setPassword("");
    setMessage("Email verified successfully. Sign in with your password to access the CMS.");
  });}
  async function resendVerificationCode(){await run(async()=>{
    const {error}=await authClient.emailOtp.sendVerificationOtp({email:email.trim(),type:"email-verification"});
    if(error)throw error;
    setVerificationCode("");setMessage("A new verification code was sent. Use the latest code from your inbox.");
  });}
  async function logout(){await run(async()=>{
    await authClient.signOut();
    setAuthed(false);setItems([]);setSite(null);setSelectedId("");setDirty(false);
  });}
  function patchCurrent<K extends keyof Draft>(key:K,value:Draft[K]){
    setItems(old=>old.map(p=>p.id===selectedId?{...p,[key]:value}:p));setDirty(true);setMessage("");}
  function patchSite<K extends keyof PublicSite>(key:K,value:PublicSite[K]){
    setSite(prev=>prev?{...prev,[key]:value}:prev);setDirty(true);setMessage("");}
  async function add(){
    if(dirty){
      if(!window.confirm("Discard unsaved edits and create a new project?"))return;
      try{ await load(); }catch(e){setError(e instanceof Error?e.message:"Unable to reload projects");return;}
    }
    const x=newDraft();setItems(old=>[...old.filter(p=>!p.id.startsWith("draft-")),x]);setSelectedId(x.id);setTab("projects");setDirty(true);
  }
  async function select(id:string){
    if(dirty){
      if(!window.confirm("Discard unsaved changes and switch? You can save before switching."))return;
      await run(async()=>{await load();setSelectedId(id);});
      return;
    }
    setSelectedId(id);
  }
  async function seed(){await run(async()=>{
    const res=await api<{imported:number}>("/api/admin/seed",{method:"POST"});await load();
    setMessage(`Imported ${res.imported} original case studies without overwriting existing projects.`);
  });}
  async function saveProject(mode:"keep"|"publish"|"unpublish"="keep"){
    if(!current)return;
    await run(async()=>{
      const updated={...current,published:mode==="keep"?current.published:mode==="publish"};
      if(!updated.slug)throw new Error("Add a slug or use Generate from Title.");
      if(!updated.title.trim())throw new Error("Project title is required.");
      const fresh=updated.id.startsWith("draft-");
      const result=await api<{project:ProjectRecord}>(fresh?"/api/admin/projects":`/api/admin/projects/${updated.id}`,{
        method:fresh?"POST":"PATCH",body:JSON.stringify(updated),
      });
      const saved=fromRow(result.project);
      setItems(old=>old.map(p=>p.id===current.id?saved:p));setSelectedId(saved.id);
      setDirty(false);setMessage(mode==="publish"?"Project published. Public pages and sitemap now read this entry.":mode==="unpublish"?"Project unpublished. Public pages no longer show it.":"Changes saved to Neon Postgres.");
    });}
  async function remove(){if(!current)return;
    if(current.id.startsWith("draft-")){setItems(old=>old.filter(x=>x.id!==current.id));setSelectedId(items.find(x=>x.id!==current.id)?.id||"");setDirty(false);return;}
    if(!window.confirm(`Delete "${current.title}" permanently? This cannot be undone.`))return;
    await run(async()=>{await api(`/api/admin/projects/${current.id}`,{method:"DELETE"});await load();setMessage("Project deleted.");});}
  async function saveSite(){if(!site)return;await run(async()=>{
    await api("/api/admin/site",{method:"PUT",body:JSON.stringify(site)});
    setDirty(false);setMessage("Profile and SEO saved. Public metadata updates on the next request.");
  });}
  async function upload(e:React.ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file||!current)return;
    e.target.value="";await run(async()=>{
      const fd=new FormData();fd.append("file",file);
      const result=await api<{url:string}>("/api/admin/media",{method:"POST",body:fd});
      const src=result.url;
      const image={src,label:file.name.replace(/\.[^.]+$/,""),note:"",width:1200,height:800};
      // Image dimensions used for Next/Image to preserve layout.
      const dimensions=await new Promise<{width:number;height:number}>(resolve=>{
        const img=new Image();img.onload=()=>resolve({width:img.naturalWidth,height:img.naturalHeight});
        img.onerror=()=>resolve({width:1200,height:800});img.src=src;
      });
      patchCurrent("images",[...current.images,{...image,...dimensions}]);
      setMessage("Image uploaded to Neon Object Storage. Click Save Changes to attach it to this project.");
    });}
  if(!configured)return <main className="admin-login-shell"><section className="admin-login-card"><h1>Connect Neon.</h1><p>Configure DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET and NEON_ADMIN_EMAIL in .env.local, run the Neon SQL migration and allowlist your verified admin email.</p><p>See NEON-CMS-SETUP.md in this ZIP.</p></section></main>;
  if(checking)return <main className="admin-login-shell"><p className="mono">VERIFYING SECURE SESSION…</p></main>;
  if(!authed&&verifyMode)return <main className="admin-login-shell"><section className="admin-login-card">
    <p className="eyebrow mono">AMAN / SECURE CLOUD CMS</p><h1>Verify your<br/><span>email.</span></h1>
    <p>Enter the six-digit code Neon sent to your email address. Never share the code.</p>
    <form className="admin-login-form" onSubmit={verifyEmail}>
      <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label>
      <label>Verification code<input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={verificationCode} onChange={e=>setVerificationCode(e.target.value.replace(/\D/g, "").slice(0,6))} required placeholder="6-digit code"/></label>
      <button disabled={busy} type="submit">{busy?"VERIFYING...":"VERIFY EMAIL ↗"}</button>
    </form>
    <button type="button" disabled={busy||!email.trim()} onClick={resendVerificationCode}>RESEND VERIFICATION CODE</button>
    <button type="button" disabled={busy} onClick={()=>{setVerifyMode(false);setVerificationCode("");setError("");setMessage("");setRegisterMode(false);}}>BACK TO SIGN IN</button>
    {message&&<p className="admin-alert" role="status">{message}</p>}
    {error&&<p className="admin-alert admin-alert--error" role="alert">{error}</p>}
    <p className="admin-login-note mono">Codes expire. If verification fails, request a new code.</p>
  </section></main>;
  if(!authed)return <main className="admin-login-shell"><section className="admin-login-card">
    <p className="eyebrow mono">AMAN / SECURE CLOUD CMS</p><h1>Content system<br/><span>access.</span></h1>
    <p>Neon Managed Auth login. Verify your email and add it to portfolio_admins.</p>
    <form className="admin-login-form" onSubmit={registerMode?register:login}>
      <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete={registerMode?"new-password":"current-password"}/></label>
      <button disabled={busy} type="submit">{busy?"WORKING...":registerMode?"CREATE ACCOUNT ↗":"SIGN IN SECURELY ↗"}</button>
    </form>
    <button type="button" disabled={busy} onClick={()=>{setRegisterMode(x=>!x);setError("");setMessage("");}}>
      {registerMode?"BACK TO SIGN IN":"FIRST TIME? CREATE VERIFIED ACCOUNT"}
    </button>
    <button type="button" disabled={busy} onClick={()=>{setRegisterMode(false);setVerifyMode(true);setVerificationCode("");setError("");setMessage("");}}>
      ALREADY HAVE A CODE? VERIFY EMAIL
    </button>
    {message&&<p className="admin-alert" role="status">{message}</p>}
    {error&&<p className="admin-alert admin-alert--error" role="alert">{error}</p>}
    <p className="admin-login-note mono">No default password. Create and verify your account using Neon Auth.</p>
  </section></main>;
  return <main className="admin-shell admin-cloud">
    <header className="admin-topbar"><a className="brand" href="/">AMAN.</a><div><span className="mono">{email}</span><a href="/" target="_blank" rel="noreferrer">VIEW SITE ↗</a><button type="button" disabled={busy} onClick={logout}>SIGN OUT</button></div></header>
    <div className="admin-cloud-head"><div><p className="eyebrow mono">NEON CLOUD / CONTENT STUDIO</p><h1>Portfolio CMS.</h1><p>Save, publish and manage case studies while preserving the original cinematic frontend.</p></div><div className="admin-cloud-status mono">{dirty?"UNSAVED EDITS":"SAVED / SYNCED"}</div></div>
    {message&&<div className="admin-alert" role="status">{message}</div>}{error&&<div className="admin-alert admin-alert--error" role="alert">{error}</div>}
    <nav className="admin-cloud-tabs" aria-label="CMS sections">
      <button className={tab==="projects"?"is-active":""} onClick={()=>setTab("projects")}>PROJECTS</button>
      <button className={tab==="profile"?"is-active":""} onClick={()=>setTab("profile")}>PROFILE</button>
      <button className={tab==="seo"?"is-active":""} onClick={()=>setTab("seo")}>SEO</button>
    </nav>
    {tab==="projects"&&<div className="admin-cloud-layout">
      <aside className="admin-cloud-sidebar"><div className="admin-cloud-side-head"><b>PROJECTS ({items.length})</b><button onClick={add} disabled={busy}>ADD +</button></div>
        {items.map(p=><button key={p.id} onClick={()=>select(p.id)} className={p.id===selectedId?"is-active":""}><span>{p.title||"New Project"}</span><small>{p.published?"PUBLISHED":"DRAFT"} · {p.slug||"NO SLUG"}</small></button>)}
        <div className="admin-cloud-import"><p>First-time migration from your V5.9 portfolio:</p><button onClick={seed} disabled={busy}>IMPORT ORIGINAL 3 PROJECTS</button></div>
      </aside>
      <section className="admin-panel admin-cloud-editor">
        {!current?<div><h2>No project selected.</h2><p>Import your three existing case studies, or add a new project.</p></div>:
        <><div className="admin-panel-head"><div><p className="eyebrow mono">CASE STUDY EDITOR</p><h2>{current.title||"New Project"}</h2></div><span className={current.published?"admin-cloud-published":"admin-cloud-draft"}>{current.published?"PUBLISHED":"DRAFT"}</span></div>
        <div className="admin-form-grid">
          <label>Project title<input value={current.title} onChange={e=>patchCurrent("title",e.target.value)}/></label>
          <label>Slug<input value={current.slug} onChange={e=>patchCurrent("slug",e.target.value)} onBlur={()=>current.slug&&patchCurrent("slug",slugify(current.slug))} placeholder="my-project"/></label>
          <div className="admin-field-full"><button type="button" onClick={()=>patchCurrent("slug",slugify(current.title)||"new-project")}>GENERATE SLUG FROM TITLE</button><p className="mono">Slug stays editable. Changing it after publishing changes the page URL; update old links manually.</p></div>
          <label>Number<input value={current.number} onChange={e=>patchCurrent("number",e.target.value)}/></label>
          <label>Display title<input value={current.displayTitle} onChange={e=>patchCurrent("displayTitle",e.target.value)}/></label>
          <label>Category<input value={current.category} onChange={e=>patchCurrent("category",e.target.value)}/></label>
          <label>Role<input value={current.role} onChange={e=>patchCurrent("role",e.target.value)}/></label>
          <label>Year<input value={current.year} onChange={e=>patchCurrent("year",e.target.value)}/></label>
          <label>Position<input type="number" value={current.position} onChange={e=>patchCurrent("position",Number(e.target.value)||0)}/></label>
          <label>Live URL<input value={current.live} onChange={e=>patchCurrent("live",e.target.value)}/></label>
          <label>GitHub URL<input value={current.github} onChange={e=>patchCurrent("github",e.target.value)}/></label>
          <div className="admin-field-full admin-cloud-toggle"><label><input type="checkbox" checked={current.featured} onChange={e=>patchCurrent("featured",e.target.checked)}/> Feature on homepage</label></div>
          <div className="admin-field-full"><p className="mono">VISUAL SCENE / SAME V5.9 3D ENGINE</p>
            {isOriginalCaseStudy(current.slug) ? <p className="mono" role="status">ORIGINAL SCENE RESERVED · {ORIGINAL_SCENES[current.slug]?.toUpperCase()} — exclusive to this case study. Existing 3D artwork remains unchanged.</p> : <>
              <p className="mono">Independent 3D themes. None will copy Campus Hub, CodeShield AI or Mistvale artwork.</p>
              <div className="admin-scene-picker" role="radiogroup" aria-label="Visual scene">
                {SCENES.map(x=><button type="button" key={x.value} role="radio" aria-checked={x.value===resolveProjectScene(current.slug,current.scene)} className={x.value===resolveProjectScene(current.slug,current.scene)?"is-active":""} onClick={()=>patchCurrent("scene",x.value)}>{x.label}</button>)}
              </div>
              {current.scene!==resolveProjectScene(current.slug,current.scene)&&<p className="mono">Legacy scene automatically mapped to a unique category model on save.</p>}
            </>}
          </div>
          {(["summary","challenge","approach","outcome"] as const).map(key=><label key={key} className="admin-field-full">{key.toUpperCase()}<textarea rows={4} value={current[key]} onChange={e=>patchCurrent(key,e.target.value)}/></label>)}
          <label className="admin-field-full">TECH STACK (one per line)<textarea rows={5} key={`${current.id}-stack`} defaultValue={current.stack.join("\n")} onChange={e=>patchCurrent("stack",e.target.value.split("\n").filter(Boolean))}/></label>
          <div className="admin-field-full admin-cloud-story"><h3>Case Study Details</h3><p>New projects use these details instead of copying another project's engineering narrative.</p></div>
          <label className="admin-field-full">ARCHITECTURE STEPS (one per line)<textarea rows={5} key={`${current.id}-architecture`} defaultValue={current.architecture.join("\n")} onChange={e=>patchCurrent("architecture",e.target.value.split("\n").map(x=>x.trim()).filter(Boolean))} placeholder="Browser → API → Database"/></label>
          <label className="admin-field-full">ENGINEERING DECISIONS (one per line: Title | Explanation)<textarea rows={5} key={`${current.id}-decisions`} defaultValue={current.decisions.map(x=>`${x.title} | ${x.body}`).join("\n")} onChange={e=>patchCurrent("decisions",parseStory(e.target.value))} placeholder="Authentication | Protected endpoints with server-side auth"/></label>
          <label className="admin-field-full">FEATURES (one per line: Title | Explanation)<textarea rows={5} key={`${current.id}-features`} defaultValue={current.features.map(x=>`${x.title} | ${x.body}`).join("\n")} onChange={e=>patchCurrent("features",parseStory(e.target.value))} placeholder="Project Search | Filter projects by category"/></label>
          <label className="admin-field-full">MAIN CHALLENGE NOTE<textarea rows={3} value={current.challengeNote} onChange={e=>patchCurrent("challengeNote",e.target.value)}/></label>
          <label>SEO title<input value={current.seoTitle} onChange={e=>patchCurrent("seoTitle",e.target.value)}/></label>
          <label>SEO description<input value={current.seoDescription} onChange={e=>patchCurrent("seoDescription",e.target.value)}/></label>
          <div className="admin-field-full admin-cloud-media"><h3>Project Screenshots</h3><p>PNG / JPEG / WebP / AVIF, maximum 4 MB. Images are uploaded to Neon Object Storage.</p>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={upload} disabled={busy}/>
            <div className="admin-cloud-images">{current.images.map((img,i)=><div key={`${img.src}-${i}`}><a href={img.src} target="_blank" rel="noreferrer">{img.label||`Image ${i+1}`} ↗</a><input aria-label={`Image ${i+1} label`} value={img.label} placeholder="Label" onChange={e=>patchCurrent("images",current.images.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/><input aria-label={`Image ${i+1} caption`} value={img.note} placeholder="Description" onChange={e=>patchCurrent("images",current.images.map((x,j)=>j===i?{...x,note:e.target.value}:x))}/><button type="button" onClick={()=>patchCurrent("images",current.images.filter((_,j)=>j!==i))}>REMOVE REFERENCE</button></div>)}</div>
          </div>
          <div className="admin-field-full admin-cloud-actions">
            <button type="button" disabled={busy} onClick={()=>saveProject("keep")}>SAVE CHANGES</button>
            <button type="button" disabled={busy} onClick={()=>saveProject("publish")}>PUBLISH ↗</button>
            {current.published&&<button type="button" disabled={busy} onClick={()=>saveProject("unpublish")}>UNPUBLISH</button>}
            <button type="button" className="admin-danger" disabled={busy} onClick={remove}>DELETE</button>
          </div>
        </div></>}
      </section>
    </div>}
    {(tab==="profile"||tab==="seo")&&site&&<section className="admin-panel admin-cloud-site"><h2>{tab==="profile"?"Profile and social links":"Search engine optimization"}</h2><div className="admin-form-grid">
      {tab==="profile"&&(["publicName","shortName","title","location","email","github","linkedin"] as const).map(key=><label key={key}>{key.toUpperCase()}<input value={site[key]} onChange={e=>patchSite(key,e.target.value)}/></label>)}
      <label className="admin-field-full">SEO / PROFILE DESCRIPTION<textarea rows={5} value={site.description} onChange={e=>patchSite("description",e.target.value)}/></label>
      {tab==="seo"&&<label className="admin-field-full">KEYWORDS (one per line)<textarea rows={10} defaultValue={site.keywords.join("\n")} onChange={e=>patchSite("keywords",e.target.value.split("\n").filter(Boolean))}/></label>}
      <div className="admin-field-full admin-cloud-actions"><button disabled={busy} onClick={saveSite}>SAVE TO NEON</button></div>
    </div></section>}
  </main>;
}
