import {randomUUID} from "node:crypto";
import {adminContext} from "../../../../lib/neon/admin";
import {storage,PutObjectCommand} from "../../../../lib/neon/storage";
import {apiError,reply,isSameOriginMutation} from "../../../../lib/cms-api";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const allowed=new Map([["image/png","png"],["image/jpeg","jpg"],["image/webp","webp"],["image/avif","avif"]]);
function matchesMagic(bytes:Uint8Array,type:string){
 if(type==="image/png")return bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
 if(type==="image/jpeg")return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(type==="image/webp")return String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";
 if(type==="image/avif")return String.fromCharCode(...bytes.slice(4,8))==="ftyp";
 return false;
}
export async function POST(req:Request){
 if (!isSameOriginMutation(req)) return reply({error:"Invalid request origin"},403);
 const ctx=await adminContext();if(!ctx)return reply({error:"Not authorized"},401);
 try{
  const form=await req.formData();const file=form.get("file");
  if(!(file instanceof File))return reply({error:"Choose an image"},400);
  const ext=allowed.get(file.type);
  if(!ext)return reply({error:"Only PNG, JPEG, WebP, AVIF supported"},400);
  if(!file.size||file.size>4*1024*1024)return reply({error:"Image must be 1 byte to 4 MB"},400);
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(!matchesMagic(bytes,file.type))return reply({error:"Image contents do not match MIME type"},400);
  const filename=`${randomUUID()}.${ext}`;
  const {client,bucket}=storage();
  await client.send(new PutObjectCommand({Bucket:bucket,Key:`portfolio/${filename}`,Body:bytes,ContentType:file.type,CacheControl:"public, max-age=31536000, immutable"}));
  return reply({url:`/api/media/${filename}`,path:`portfolio/${filename}`});
 }catch(e){return apiError(e);}
}
