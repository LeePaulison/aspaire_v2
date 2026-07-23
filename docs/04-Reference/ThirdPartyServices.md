# ThirdPartyServices.md

# AspAIre Third-Party Services Reference

## Purpose

This document lists external services used by the inherited AspAIre workspace.

It records service responsibilities and integration boundaries. It must not contain secret values.

---

# Service Inventory

| Service | Used By | Responsibility |
| --- | --- | --- |
| Vercel | Web application | Hosting Next.js application |
| Fly.io | AI server and MongoDB Community | Hosting AI WebSocket gateway and existing MongoDB server |
| Neon | Web application | PostgreSQL database |
| MongoDB Community | Web application | Conversation document storage |
| Amazon S3 | Web application | Private uploaded resume original storage |
| OpenAI | AI server | Responses API streaming |
| GitHub OAuth | Web application | User sign-in |
| Google OAuth | Web application | User sign-in |

---

# Vercel

Vercel hosts the Next.js web application.

The web app owns:

* UI routes
* Better Auth API
* Public JWKS endpoint
* GraphQL API
* Database access

Important integration points:

* Application origin
* OAuth callback URLs
* Environment variables
* Public `/api/auth/jwks`
* `/api/graphql`

---

# Fly.io

Fly.io currently hosts the inherited AI server.

The inherited Fly app name is:

```text
saigely-server
```

Fly.io also hosts the existing MongoDB Community server mentioned in project architecture.

AspAIre must decide whether the AI server should use a new Fly app, a renamed app, or the inherited app during transition.

---

# Neon

Neon provides PostgreSQL for relational application data.

Used for:

* Better Auth tables
* User preferences
* AI model configuration
* AI agent configuration
* Reasoning levels
* Verbosity levels
* Future structured AspAIre domain data

The web application connects through `DATABASE_URL`.

---

# MongoDB Community

MongoDB Community stores conversation-style document data.

Current inherited usage:

* Conversations
* Messages
* Conversation previews
* Conversation timestamps

The existing MongoDB Community server runs on Fly.io.

AspAIre needs:

* AspAIre-specific database
* Existing MongoDB Community connection URL in `MONGODB_URI`
* Explicit `MONGODB_DATABASE=aspaire`
* Optional AspAIre-specific least-privilege user for production hardening

---

# Amazon S3

Amazon S3 stores private uploaded resume original files for the Resume Library.

The web application owns:

* Upload route handling
* File validation
* S3 object key generation
* Resume and resume file metadata persistence
* Ownership checks before upload, download, delete, or signed URL creation

PostgreSQL remains the source of truth for resume ownership, resume metadata, uploaded file metadata, extracted text, and domain relationships.

S3 objects should use user- and resume-scoped keys:

```text
users/{userId}/resumes/{resumeId}/{safeFilename}
```

The bucket must remain private. Browser access should use short-lived signed URLs generated only after the application verifies authenticated ownership.

The current first upload slice sends the file to an authenticated Next.js route handler, which uploads the original object to S3 server-side and then persists `resume_files` metadata. Browser code never receives AWS credentials, bucket names, object keys, or signed URLs.

Resume deletion attempts to delete every associated uploaded original from S3 before deleting the PostgreSQL resume record and cascading file metadata. The deletion receipt reports whether uploaded-original cleanup completed without exposing storage internals.

Individual uploaded-original deletion follows the same ownership boundary: the web app verifies authenticated resume/file ownership, deletes the private S3 object, then deletes the `resume_files` metadata row.

User-facing deletion confirmations should describe private resume storage status without exposing S3 bucket names, object keys, AWS regions, or signed URLs.

Required environment variables are documented in `docs/04-Reference/Environment.md`.

---

# OpenAI

OpenAI is used by the AI server through the Responses API.

The AI server owns:

* OpenAI client initialization
* Request construction
* Streaming execution
* Stream timeout handling

The web application owns the user and product context used to shape AI requests.

---

# GitHub OAuth

GitHub OAuth is configured through Better Auth.

Required values:

* `GITHUB_CLIENT_ID`
* `GITHUB_CLIENT_SECRET`

Callback URLs must match the deployed AspAIre web origin.

---

# Google OAuth

Google OAuth is configured through Better Auth.

Required values:

* `GOOGLE_CLIENT_ID`
* `GOOGLE_CLIENT_SECRET`

Callback URLs must match the deployed AspAIre web origin.

---

# Transition Notes

The imported codebase and inherited operations docs still reference Saigely production services and URLs.

Those references should be treated as implementation history until AspAIre production service names, origins, database identities, and OAuth applications are finalized.

Do not reuse Saigely service names or credentials for AspAIre unless that choice is intentional and recorded in `docs/00-Project/Decisions.md`.
