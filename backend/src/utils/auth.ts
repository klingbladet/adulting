import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as authSchema from "../db/auth-schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  baseURL: "http://localhost:3001/api/auth",
  trustedOrigins: ["http://localhost:3000"],
  secret: process.env.BETTER_AUTH_SECRET,
});