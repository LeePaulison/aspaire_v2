/**
 * Better Auth migration configuration.
 *
 * This file exists solely for the Better Auth CLI to discover the
 * authentication configuration when generating and applying database
 * migrations. The application runtime uses auth.js.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/neon"; // your drizzle instance

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
});
