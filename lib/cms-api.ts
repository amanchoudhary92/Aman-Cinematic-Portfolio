import { NextResponse } from "next/server";
export function reply(data: unknown, status=200) {
  return NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
}
export function apiError(e: unknown, fallback="Request failed") {
  const message = e instanceof Error ? e.message : fallback;
  return reply({ error: message },400);
}

// Reject cross-site mutations; admin browser requests must originate from this site.
export function isSameOriginMutation(req: Request): boolean {
  const raw=req.headers.get("origin");
  const host=req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!raw || !host) return false;
  try {return new URL(raw).host.toLowerCase()===host.toLowerCase();}catch{return false;}
}
