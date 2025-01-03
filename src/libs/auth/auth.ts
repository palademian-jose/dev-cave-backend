import { betterAuth } from "better-auth";
import {openAPI} from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../../database";
import { account, session, user, verification } from "../../schemas/auth-schema";
export const auth = betterAuth({
  plugins: [
    openAPI(),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user, account, verification, session
    }
  }),
  emailAndPassword: {  
    enabled: true
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
  ],
});