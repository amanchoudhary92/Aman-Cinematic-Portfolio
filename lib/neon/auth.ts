import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

// The fallbacks are only used during offline/local build verification. Actual
// access is disabled unless all real environment variables are present.
export const neonAuth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || "https://auth-unconfigured.invalid",
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "NEON_AUTH_NOT_CONFIGURED_0000000000000000",
    sessionDataTtl: 60,
  },
});
export function isCloudConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.NEON_AUTH_BASE_URL &&
    process.env.NEON_AUTH_COOKIE_SECRET && process.env.NEON_ADMIN_EMAIL);
}
