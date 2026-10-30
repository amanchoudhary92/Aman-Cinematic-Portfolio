import { NextResponse } from "next/server";
import { storage,GetObjectCommand } from "../../../../lib/neon/storage";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const valid=/^[a-f0-9-]{36}\.(?:png|jpg|webp|avif)$/i;
export async function GET(_request:Request,{params}:{params:Promise<{key:string}>}) {
  const {key}=await params;
  if(!valid.test(key))return new NextResponse("Not found",{status:404});
  try {
    const {client,bucket}=storage();
    const object=await client.send(new GetObjectCommand({Bucket:bucket,Key:`portfolio/${key}`}));
    if(!object.Body)return new NextResponse("Not found",{status:404});
    const bytes=await object.Body.transformToByteArray();
    const array=new Uint8Array(bytes.length);array.set(bytes);
    return new NextResponse(array.buffer,{headers:{
      "Content-Type":object.ContentType || "application/octet-stream",
      "Content-Length":String(bytes.length),
      "Cache-Control":"public, max-age=31536000, immutable",
      "X-Content-Type-Options":"nosniff",
    }});
  }catch(err){
    console.error("Neon media fetch failed:",err instanceof Error?err.message:"unknown");
    return new NextResponse("Not found",{status:404});
  }
}
