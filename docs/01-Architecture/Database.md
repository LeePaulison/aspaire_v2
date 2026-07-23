# Database.md

# AspAIre Database Architecture

## Purpose

This document describes AspAIre's data storage architecture.

The web application owns all application data. The AI server accesses application data only through GraphQL.

---

# Data Store Summary

AspAIre currently inherits two data stores from Saigely:

* Neon PostgreSQL for relational application data
* MongoDB Community on Fly.io for conversation-style document data

Both are application-owned dependencies of `apps/web`.

---

# PostgreSQL

PostgreSQL is accessed through Neon and Drizzle ORM.

The connection helper is:

```text
apps/web/lib/db/neon.js
```

It requires:

```text
DATABASE_URL
```

Drizzle schema files live in:

```text
apps/web/drizzle
```

The Better Auth schema lives with the other Drizzle schema files:

```text
apps/web/drizzle/auth-schema.ts
```

Drizzle Kit configuration lives in:

```text
apps/web/drizzle.config.js
```

`drizzle-kit push` directly applies schema changes to the configured database. Treat it as a manual, destructive-capable operation and review the target database before running it.

---

# Current Relational Data

Current inherited relational data includes:

* Better Auth users
* Accounts
* Sessions
* Verification records
* JWKS signing keys
* User preferences
* AI models
* AI agents
* Reasoning levels
* Verbosity levels

Future structured AspAIre domain data should default to PostgreSQL unless there is a clear reason to use document storage.

---

# Default Reference Data

AspAIre requires default AI reference rows before the chat workspace and preference controls are fully usable.

The default reference data includes:

* AI models
* AI agents
* Reasoning levels
* Verbosity levels

The default AI model rows currently include:

* GPT-5.6 Sol
* GPT-5.6 Terra
* GPT-5.6 Luna
* GPT-5.5
* GPT-5.1
* GPT-5 Mini
* GPT-4.1
* GPT-4.1 Mini

Model descriptions should remain concise, user-facing, and cost-aware when a model is materially more expensive than nearby alternatives.

Create or refresh these rows with:

```text
npm run seed:defaults
```

The root script delegates to the web workspace script:

```text
apps/web/scripts/createDefaultAiData.js
```

The seed command is idempotent. It uses upsert behavior so rerunning it updates known default records rather than inserting duplicates.

Run this command after initial schema setup, local database resets, or intentional changes to the default AI model, agent, reasoning, or verbosity definitions.

Because the script writes to PostgreSQL through `DATABASE_URL`, confirm the target environment before running it.

---

# MongoDB

MongoDB is accessed through the MongoDB Node driver.

The connection helper is:

```text
apps/web/lib/db/mongo.js
```

It requires:

```text
MONGODB_URI
```

The helper defaults to:

```text
aspaire
```

as the database name. This can be overridden with:

```text
MONGODB_DATABASE
```

---

# Current Document Data

Current inherited MongoDB document data includes:

* Conversations
* User messages
* Assistant messages
* Conversation previews
* Conversation timestamps

The current repository is:

```text
apps/web/repositories/conversationRepository.js
```

It uses the `conversations` collection and scopes user conversation lists and deletion by `userId`.

---

# Data Ownership Rules

The web application owns:

* Schema design
* Repository access
* Validation
* Authorization
* Persistence
* Migrations or setup procedures
* Environment variable use

The AI server must not connect directly to PostgreSQL or MongoDB.

If the AI server needs data, it must call GraphQL using the authenticated user's bearer token.

---

# AspAIre MongoDB Setup Requirement

AspAIre can reuse the existing MongoDB Community connection URL from the inherited setup.

The setup should use:

* An AspAIre database
* The existing `MONGODB_URI`
* `MONGODB_DATABASE=aspaire`

For production hardening, AspAIre can later add:

* An AspAIre MongoDB user
* Least-privilege permissions for the AspAIre database

Do not record passwords or full connection strings in documentation.

The code now defaults to `aspaire`; production should still set `MONGODB_DATABASE=aspaire` explicitly.

---

# Future Domain Guidance

Use PostgreSQL for:

* Career profile
* Resume metadata
* Saved jobs
* Application tracking
* User preferences
* Structured domain relationships

Consider MongoDB for:

* Long-form conversation transcripts
* AI workspace thread documents
* Research artifacts with flexible nested structure

Document-storage use should be intentional, not accidental.
