import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

const MAX_NAME_LENGTH = 100;

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
    // Sign-up answers the same way for new and existing emails (no account enumeration).
    // Users sign in after registering, so no session is created at sign-up.
    autoSignIn: false,
  },
  rateLimit: {
    enabled: true, // Better Auth turns this on only in production by default
    window: 10,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 10, max: 3 },
      "/sign-up/email": { window: 10, max: 3 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const name = String(user.name ?? "").trim();
          if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
            throw new APIError("BAD_REQUEST", {
              message: `Name must be 1 to ${MAX_NAME_LENGTH} characters`,
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()], // must stay the last plugin
});
