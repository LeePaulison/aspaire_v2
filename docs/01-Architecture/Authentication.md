# Authentication.md

# AspAIre Authentication Architecture

## Purpose

This document describes authentication and identity boundaries for AspAIre.

Authentication is owned by the Next.js web application. The external AI server verifies short-lived JWTs issued by the web application but does not own identity.

---

# Technology Baseline

The web application uses Better Auth with:

* Drizzle adapter
* PostgreSQL persistence
* Email and password authentication
* GitHub OAuth
* Google OAuth
* JWT plugin
* RS256 JWKS support

Runtime configuration lives primarily in `apps/web/lib/auth.js`.

Auth database schema lives in `apps/web/drizzle/auth-schema.ts`.

The auth API route is:

```text
apps/web/app/api/auth/[...all]/route.js
```

---

# Ownership

The web application owns:

* User accounts
* Sessions
* OAuth provider configuration
* Better Auth API routes
* JWKS issuance
* Session-aware route protection
* GraphQL authentication context

The AI server owns:

* WebSocket token verification
* JWT issuer, audience, and algorithm enforcement
* Rejecting unauthenticated WebSocket connections

The AI server does not create users, sessions, or application authorization rules.

---

# Session Authentication

Browser session authentication uses Better Auth cookies.

Protected routes call `getSession` from `apps/web/lib/auth/getSession.js`.

The protected route group at `apps/web/app/(protected)` redirects unauthenticated users to `/login`.

GraphQL context also checks Better Auth session state when a request includes browser cookies.

---

# JWT Authentication

The Better Auth JWT plugin issues short-lived JWTs for service-style authentication.

The browser requests a token before opening the AI WebSocket connection.

The AI server verifies the JWT against the web application's JWKS endpoint.

The same JWT is forwarded from the AI server to `/api/graphql` when the AI server needs user-scoped data or needs to persist results.

---

# GraphQL Authentication Context

GraphQL context is created in `apps/web/graphql/context.js`.

It supports two authentication modes:

* Better Auth session cookies
* Bearer tokens verified against the web application's JWKS

The context object includes:

* `requestId`
* `authenticated`
* `session`
* `user`

Resolvers must enforce authorization using this context before reading or mutating user data.

---

# Current JWT Claims

AspAIre defines JWT issuer and audience through environment variables:

```text
JWT_ISSUER=aspaire-web
JWT_AUDIENCE=aspaire-ai-server
algorithm: RS256
expiration: 5m
```

The recommended issuer identifies the web application as the token issuer. The recommended audience identifies the AI server as the intended verifier/consumer.

Changing issuer or audience is a coordinated change across:

* Better Auth JWT configuration
* GraphQL bearer-token verification
* AI server environment
* Deployed gateway secrets
* Any existing clients expecting the old claims

---

# OAuth Providers

The current inherited app supports:

* GitHub OAuth
* Google OAuth

Provider credentials are supplied through environment variables.

OAuth callback URLs are tied to the deployed application origin and must be updated when moving from Saigely production origins to AspAIre production origins.

---

# Security Expectations

Authentication-sensitive implementation should preserve:

* Short-lived AI service tokens
* RS256 signing
* Public JWKS verification
* Server-side session checks for protected routes
* Resolver-level authorization
* No token or cookie values in logs
* Coordinated configuration changes for origins, issuer, audience, and JWKS URL

---

# Phase 1 Review Items

AspAIre should review:

* Whether email/password auth remains enabled
* Which OAuth providers are required for the initial product
* OAuth app callback URLs for AspAIre environments
* Better Auth secret and key material setup
* Deployment exposure of `/api/auth/jwks`
