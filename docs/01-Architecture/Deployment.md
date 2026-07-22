# Deployment.md

# AspAIre Deployment Architecture

## Purpose

This document describes the deployment shape inherited from Saigely and the deployment decisions AspAIre needs to make during platform baseline work.

---

# Current Topology

The inherited production topology is:

* Next.js web application on Vercel
* AI WebSocket gateway on Fly.io
* Neon PostgreSQL
* MongoDB Community server on Fly.io
* OpenAI as external model provider
* GitHub and Google as OAuth providers

The browser communicates with:

* The web application over HTTPS
* The AI server directly over WSS

The AI server depends on the web application for:

* JWKS
* GraphQL
* Application readiness

---

# Web Application Deployment

The web app is deployed from:

```text
apps/web
```

The root workspace exposes scripts that delegate to the web package:

* `npm run dev:web`
* `npm run build:web`
* `npm run start:web`
* `npm run lint`
* `npm run test:web`

Important web environment variables include:

* `BETTER_AUTH_SECRET`
* `BETTER_AUTH_URL`
* `NEXT_PUBLIC_AUTH_URL`
* `GITHUB_CLIENT_ID`
* `GITHUB_CLIENT_SECRET`
* `GOOGLE_CLIENT_ID`
* `GOOGLE_CLIENT_SECRET`
* `DATABASE_URL`
* `DATABASE_URL_UNPOOLED`
* `MONGODB_URI`
* `NEXT_PUBLIC_WS_SERVER`
* `GRAPHQL_MAX_BODY_BYTES`
* `GRAPHQL_REQUESTS_PER_MINUTE`

---

# AI Server Deployment

The AI server is deployed from:

```text
apps/ai-server
```

It includes:

* `Dockerfile`
* `fly.toml`
* `server.js`
* `websocket.js`

The inherited Fly configuration still identifies the app as:

```text
saigely-server
```

AspAIre should decide whether to create a new Fly app, rename the existing app, or temporarily retain the inherited Fly app name for compatibility.

Important AI server environment variables include:

* `OPENAI_API_KEY`
* `API_ORIGIN`
* `CLIENT_ORIGIN`
* `CORS_ORIGIN`
* `JWKS_URL`
* `JWT_ISSUER`
* `JWT_AUDIENCE`
* `JWT_ALGORITHMS`
* Runtime limit and timeout variables

---

# Deployment Dependencies

The AI server depends on the web application being reachable at its configured `API_ORIGIN`.

The AI server must also be able to reach:

* `/api/auth/jwks`
* `/api/graphql`
* OpenAI API endpoints

The browser must be configured with the correct `NEXT_PUBLIC_WS_SERVER` value for the deployed AI server.

`CLIENT_ORIGIN` on the AI server must exactly match the browser origin.

---

# Deployment Order

When changing shared contracts, deploy carefully.

Deploy the AI server first when changes affect:

* WebSocket protocol
* Authentication contract
* JWT validation
* GraphQL callback expectations
* Readiness behavior
* Gateway runtime configuration

Client-only UI changes can usually deploy independently.

When changing origins, issuer, audience, JWKS URL, OAuth callbacks, or public WebSocket URLs, update both services in a coordinated release.

---

# Health and Smoke Testing

The AI server exposes:

* `/health`
* `/ready`

After deployment:

1. Check the web application loads.
2. Check `/login` loads.
3. Check `/api/graphql` responds to a basic query.
4. Check AI server `/health`.
5. Check AI server `/ready`.
6. Sign in through an OAuth provider.
7. Confirm preferences and conversation data load.
8. Send a harmless streaming prompt.
9. Refresh and confirm persisted output remains available.

---

# Secrets and Configuration

Secrets must live in hosting provider configuration, not documentation.

Documentation may record:

* Variable names
* Which service owns each variable
* Relationship between values
* Rotation or coordination requirements

Documentation must not record:

* Secret values
* Full database URLs
* OAuth client secrets
* OpenAI API keys
* JWTs
* Session cookies

---

# AspAIre Baseline Deployment Work

AspAIre should complete these deployment decisions during Phase 1:

* Decide production web origin
* Decide AI server Fly app name and public URL
* Create or configure AspAIre OAuth applications
* Create AspAIre-specific MongoDB user and database on the existing Fly.io MongoDB Community server
* Configure AspAIre `MONGODB_URI`
* Decide whether JWT issuer and audience are renamed
* Update Vercel/Fly secrets for AspAIre names and origins
* Update inherited Saigely operations docs or replace them with AspAIre runbooks

---

# Current Inheritance Notes

The imported operational documentation still references Saigely production endpoints.

Those references are useful as a working model, but they are not AspAIre's final deployment truth.

AspAIre deployment documentation should become authoritative once production origins, app names, database users, and secrets are finalized.
