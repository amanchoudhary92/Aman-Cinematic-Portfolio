import "server-only";
import { neonAuth, isCloudConfigured } from "./auth";
import { database } from "./db";

export async function adminContext() {
  if (!isCloudConfigured()) return null;
  try {
    const raw: unknown = await neonAuth.getSession();
    // SDK versions can return {session,user} or {data:{session,user}}.
    if (!raw || typeof raw !== "object") return null;
    const outer = raw as Record<string, unknown>;
    const inner: unknown = outer.data && typeof outer.data === "object" ? outer.data : outer;
    if (!inner || typeof inner !== "object") return null;
    const data = inner as Record<string, unknown>;
    const user: unknown = data.user;
    if (!data.session || typeof data.session !== "object") return null;
    if (!user || typeof user !== "object") return null;
    const u = user as Record<string, unknown>;
    const email = typeof u.email === "string" ? u.email.trim().toLowerCase() : "";
    const id = typeof u.id === "string" ? u.id : "";
    const allowed = process.env.NEON_ADMIN_EMAIL?.trim().toLowerCase();
    if (!id || !email || !allowed || email !== allowed) return null;
    // Never grant admin access to an explicitly unverified email identity.
    if (u.emailVerified !== true && u.email_verified !== true) return null;
    const sql = database();
    const records = await sql`SELECT email FROM portfolio_admins WHERE email = ${email} LIMIT 1`;
    if (!records.length) return null;
    return { sql, user: { id, email } };
  } catch (err) {
    console.error("Neon admin authorization failed:", err instanceof Error ? err.message : "unknown error");
    return null;
  }
}
