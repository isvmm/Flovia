import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "build-time-fallback-secret-for-vercel",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["*"],
  advanced: {
    crossOriginCookies: {
      enabled: true,
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    disableCSRFCheck: true,
  },
});
