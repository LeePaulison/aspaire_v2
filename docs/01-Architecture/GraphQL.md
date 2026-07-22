# GraphQL.md

# AspAIre GraphQL Architecture

## Purpose

This document describes the GraphQL API architecture used by AspAIre.

GraphQL is the application API boundary for product data, frontend operations, and authenticated AI server callbacks.

---

# Technology Baseline

The web application uses:

* GraphQL Yoga
* GraphQL Tools schema loading and merging
* File-based `.graphql` schema modules
* Resolver modules
* Context-based authentication
* Repository-backed data access

The API endpoint is:

```text
/api/graphql
```

The route implementation lives in:

```text
apps/web/app/api/graphql/route.js
```

---

# API Ownership

The GraphQL API belongs to the Next.js web application.

It owns:

* Application schema
* Domain operations
* Resolver authorization
* Request context
* Validation and rate limiting
* Data access through repositories
* Persistence rules for AI-generated outputs

The AI server consumes GraphQL. It does not define application schema or bypass repositories.

---

# File Layout

```text
apps/web/graphql/
├── ai/
├── conversation/
├── preference/
├── resolvers/
├── schemas/
├── authRequest.js
├── context.js
└── serverAuthRequest.js
```

Schemas live in `graphql/schemas`.

Resolvers live in `graphql/resolvers`.

Frontend helper functions live in domain folders such as `graphql/conversation` and `graphql/preference`.

---

# Request Handling

The GraphQL route performs:

1. Request ID creation
2. Rate limit key calculation
3. Request rate limiting
4. Request validation
5. GraphQL Yoga execution
6. Response request ID header assignment
7. No-store cache headers
8. Structured request logging

Request validation is implemented in `apps/web/lib/security/graphqlRequest.js`.

Rate limiting is implemented in `apps/web/lib/security/rateLimiter.js`.

---

# Authentication Context

Context creation is implemented in `apps/web/graphql/context.js`.

GraphQL context supports:

* Better Auth session cookies
* Bearer JWTs verified against the app JWKS

Resolvers receive:

* `authenticated`
* `user`
* `session`
* `requestId`

Resolvers must reject unauthenticated access for user-owned data.

---

# Resolver Pattern

Resolvers should:

* Validate authentication and authorization first
* Keep business rules explicit
* Delegate persistence to repositories
* Avoid direct database access from UI code
* Scope user-owned reads and writes to `context.user.id`
* Return domain-shaped data, not raw database internals

Current inherited resolvers cover preferences, AI models, AI agents, reasoning levels, verbosity levels, and conversations.

---

# Schema Pattern

GraphQL schema files are loaded from:

```text
graphql/schemas/**/*.graphql
```

`next.config.mjs` includes this path for output file tracing on the `/api/graphql` route.

Future domain schemas should be added as focused `.graphql` files and merged through the existing schema loader.

---

# AI Server Callbacks

The AI server calls `/api/graphql` using the authenticated user's bearer token.

Current callback responsibilities include:

* Loading user preferences
* Loading AI model configuration
* Loading AI agent configuration
* Saving completed conversation turns

Future AI workflows should follow the same rule: the AI server may request or submit data through GraphQL, but the web application owns schema, validation, authorization, and persistence.

---

# Domain Expansion

Each AspAIre domain should add GraphQL operations as part of its vertical slice.

A typical domain API slice should include:

* Domain schema file
* Resolver module
* Repository module
* Client/server helper functions where needed
* Tests for resolver authorization and important business behavior

