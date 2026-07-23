# Environment.md

# AspAIre Environment Reference

## Purpose

This document lists the environment variables currently used by the AspAIre workspace.

It records names, ownership, and purpose. It must not contain secret values.

---

# Web Application Variables

Defined by `apps/web/.env.example`.

## Required Authentication

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | Better Auth secret material |
| `BETTER_AUTH_URL` | Canonical application URL used by Better Auth |
| `NEXT_PUBLIC_AUTH_URL` | Browser-visible application URL |
| `JWT_ISSUER` | JWT issuer used by Better Auth and GraphQL bearer-token verification; recommended value is `aspaire-web` |
| `JWT_AUDIENCE` | JWT audience used by Better Auth and GraphQL bearer-token verification; recommended value is `aspaire-ai-server` |
| `ENABLE_EMAIL_PASSWORD_AUTH` | Server-side flag for Better Auth email/password login; default MVP value is `false` |

## Required WebSocket Integration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_WS_SERVER` | Browser-visible WebSocket URL for the AI server |

## OAuth

| Variable | Purpose |
| --- | --- |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `NEXT_PUBLIC_ENABLE_GITHUB_AUTH` | Browser-visible flag for showing GitHub sign-in; defaults should be `false` for the MVP |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH` | Browser-visible flag for showing Google sign-in; defaults should be `true` for the MVP |

Google OAuth is required for the MVP sign-in path. GitHub OAuth is optional.

Email/password authentication is disabled for the MVP unless `ENABLE_EMAIL_PASSWORD_AUTH=true`.

## Required Data

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection used by Drizzle |
| `MONGODB_URI` | MongoDB connection for conversation document data |
| `MONGODB_DATABASE` | MongoDB database selected by the web app; defaults to `aspaire` |

## Resume File Storage

Required when uploaded resume originals are enabled.

| Variable | Purpose |
| --- | --- |
| `AWS_REGION` | AWS region for the resume file bucket |
| `AWS_ACCESS_KEY_ID` | Access key for S3 resume file operations |
| `AWS_SECRET_ACCESS_KEY` | Secret key for S3 resume file operations |
| `S3_RESUME_BUCKET` | Private bucket used for uploaded resume originals |

The existing AspAIre resume bucket is expected to be configured through `S3_RESUME_BUCKET`; do not hardcode bucket names in source.

Optional upload support values:

| Variable | Purpose | Default |
| --- | --- | --- |
| `AWS_SESSION_TOKEN` | Session token when using temporary AWS credentials | empty |
| `RESUME_UPLOAD_MAX_BYTES` | Maximum uploaded resume original size | `5242880` |

## Optional Data and Tooling

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL_UNPOOLED` | Unpooled PostgreSQL connection for migrations, maintenance, or tooling that should not use pooled connections |

## GraphQL Limits

Used by the GraphQL route though not currently listed in `apps/web/.env.example`.

| Variable | Purpose | Default |
| --- | --- | --- |
| `GRAPHQL_MAX_BODY_BYTES` | Maximum GraphQL request body size | `1048576` |
| `GRAPHQL_REQUESTS_PER_MINUTE` | Per-instance GraphQL rate limit | `120` |

---

# AI Server Variables

Defined by `apps/ai-server/.env.example`.

## Runtime

| Variable | Purpose | Default |
| --- | --- | --- |
| `HOST` | Host interface for HTTP server | `0.0.0.0` in code, example uses `localhost` |
| `PORT` | HTTP and WebSocket port | `8080` |

## OpenAI

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API key used by the AI server |

## Application Integration

| Variable | Purpose |
| --- | --- |
| `API_ORIGIN` | Origin hosting the web app GraphQL API |
| `CLIENT_ORIGIN` | Exact browser origin allowed to connect to WebSocket |
| `CORS_ORIGIN` | Optional HTTP CORS origin; defaults to `CLIENT_ORIGIN` |
| `JWKS_URL` | Full JWKS URL or origin that resolves to `/api/auth/jwks` |
| `NEXTJS_ORIGIN` | Legacy compatibility fallback for `API_ORIGIN` and `CLIENT_ORIGIN` |

## JWT

| Variable | Purpose | Default |
| --- | --- | --- |
| `JWT_ISSUER` | Expected JWT issuer | Required; use `aspaire-web` |
| `JWT_AUDIENCE` | Expected JWT audience | Required; use `aspaire-ai-server` |
| `JWT_ALGORITHMS` | Allowed JWT algorithms | `RS256` |

## Limits and Timeouts

| Variable | Purpose | Default |
| --- | --- | --- |
| `MAX_PAYLOAD_BYTES` | Maximum WebSocket payload size | `655360` |
| `MESSAGES_PER_MINUTE` | Message rate limit | `30` |
| `MAX_CONNECTIONS` | Maximum simultaneous WebSocket connections | `1000` |
| `AUTHENTICATION_TIMEOUT_MS` | Time allowed for initial authentication | `10000` |
| `GRAPHQL_TIMEOUT_MS` | Timeout for AI server GraphQL calls | `10000` |
| `STREAM_IDLE_TIMEOUT_MS` | Maximum wait between stream events | `120000` |
| `HEARTBEAT_INTERVAL_MS` | WebSocket heartbeat interval | `30000` |
| `READINESS_TIMEOUT_MS` | Timeout for readiness dependency checks | `5000` |
| `READINESS_CACHE_MS` | Cache duration for successful readiness checks | `30000` |

---

# Coordinated Values

These values must be kept consistent across services:

| Relationship | Requirement |
| --- | --- |
| Web `NEXT_PUBLIC_WS_SERVER` | Must point to AI server `/ws` |
| AI `CLIENT_ORIGIN` | Must exactly match the browser web origin |
| AI `API_ORIGIN` | Must point to the deployed web application origin |
| AI `JWKS_URL` | Must reach the web application's public JWKS |
| Web JWT issuer/audience | Must match AI server `JWT_ISSUER=aspaire-web` and `JWT_AUDIENCE=aspaire-ai-server` |

---

# AspAIre Baseline Items

AspAIre should review:

* AspAIre production origin
* AspAIre AI server origin

---

# Removed Web Legacy Variables

The following inherited web variables are not used by current application code and should not be included in `apps/web/.env.example`:

| Variable | Replacement or reason |
| --- | --- |
| `NEXT_PUBLIC_WS_SERVER_PORT` | Use full `NEXT_PUBLIC_WS_SERVER` URL instead |
| `NEXT_PUBLIC_API_URL` | Current frontend GraphQL calls use local app routes and server helpers |
| `AUTH_SERVER_URL` | Current auth flow uses Better Auth app URLs |
| `SERVER_URL` | Current web-to-AI integration uses `NEXT_PUBLIC_WS_SERVER`; AI server origins live in `apps/ai-server/.env.example` |

---

# Setup Commands and Callback URLs

## Better Auth Secret

Generate `BETTER_AUTH_SECRET` with:

```text
npx auth secret
```

Better Auth also accepts any high-entropy secret of at least 32 characters, such as one generated by:

```text
openssl rand -base64 32
```

## OAuth Callback URLs

Use these local callback URLs when creating development OAuth clients:

| Provider | Local callback URL |
| --- | --- |
| GitHub | `http://localhost:3000/api/auth/callback/github` |
| Google | `http://localhost:3000/api/auth/callback/google` |

Production OAuth apps should use the same callback paths on the production AspAIre web origin.

OAuth providers are registered only when both server-side credentials for that provider exist. The login page separately uses public flags to decide which provider buttons to show:

```text
NEXT_PUBLIC_ENABLE_GITHUB_AUTH=false
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true
```

GitHub OAuth is optional for the MVP. Google OAuth is the preferred MVP sign-in provider.
