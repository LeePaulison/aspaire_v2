import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";

import { db } from "@/lib/db/neon";
import * as schema from "@/drizzle/auth-schema"

function requireEnvironmentValue(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined.`);
  }

  return value;
}

const socialProviders = {};

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  };
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

const jwtIssuer = requireEnvironmentValue("JWT_ISSUER");
const jwtAudience = requireEnvironmentValue("JWT_AUDIENCE");

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),

  emailAndPassword: {
    enabled: process.env.ENABLE_EMAIL_PASSWORD_AUTH === "true",
  },

  socialProviders,

  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "RS256",
          modulusLength: 2048,
        },
      },
      jwt: {
        issuer: jwtIssuer,
        audience: jwtAudience,
        expirationTime: "5m",
      },
      disableSettingJwtHeader: true,
    }),
  ],
});
