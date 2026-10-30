import { neonAuth } from "./lib/neon/auth";

// Neon Auth keeps its signed session cookie fresh for protected CMS APIs.
// /admin itself is the sign-in page, and must never redirect to itself.
export default neonAuth.middleware({ loginUrl: "/admin" });
export const config = { matcher: ["/api/admin/:path*"] };
