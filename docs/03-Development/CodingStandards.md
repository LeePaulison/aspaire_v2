# CodingStandards.md

# AspAIre Coding Standards

## Purpose

This document defines coding standards for AspAIre development.

The goal is to keep the project clear, maintainable, and consistent with the inherited Saigely architecture while AspAIre product domains are added.

---

# General Principles

## Preserve Proven Platform Patterns

AspAIre inherits working platform patterns from Saigely.

Before introducing a new pattern, check whether the existing application already has an equivalent approach for:

* Routing
* Authentication
* GraphQL
* Repositories
* Database access
* WebSocket streaming
* Testing
* Logging

Prefer extending established patterns over introducing parallel conventions.

---

## Build Vertical Slices

Feature work should be delivered as complete vertical slices when practical.

A typical slice includes:

* Drizzle schema or MongoDB document shape
* Repository
* GraphQL schema
* Resolver
* Validation
* Authorization
* UI
* Tests where appropriate
* Documentation updates

Avoid scattering partial scaffolding across many domains before a usable workflow exists.

---

## Keep Ownership Boundaries Clear

The Next.js web application owns product domains, business logic, data persistence, GraphQL, and user workflows.

The AI server owns AI execution, WebSocket streaming, and OpenAI integration.

The AI server must not bypass GraphQL to read or write application data.

---

# Language and Module Style

The imported codebase primarily uses JavaScript modules.

Current conventions include:

* ESM syntax
* `.js` files for application runtime modules
* `.ts` currently only where required by inherited Better Auth schema tooling
* `@/*` import alias in the web app
* Named exports for shared helpers and repositories

Do not convert modules to TypeScript or introduce a new build layer without a documented decision.

---

# Imports

Use the web app alias for app-local imports:

```js
import { auth } from "@/lib/auth";
```

Use relative imports where the existing package already does so, especially in the AI server.

Group imports by broad source:

* Node built-ins
* External packages
* Application modules

Avoid import churn unrelated to the change being made.

---

# Repositories

Repositories own persistence access.

Resolvers and UI code should not directly access Neon, Drizzle, MongoDB, or collections.

Repository functions should:

* Accept explicit input objects for multi-field operations
* Scope user-owned reads and writes by `userId`
* Validate storage IDs before querying where relevant
* Return domain-shaped values
* Avoid leaking raw persistence details beyond the repository boundary

---

# GraphQL Resolvers

Resolvers should:

* Check authentication first
* Enforce ownership before returning user-owned data
* Delegate persistence to repositories
* Keep business rules readable and explicit
* Return stable application errors where appropriate

Resolver tests should cover authorization boundaries for user-owned data.

---

# Environment Variables

Environment variables should be documented by name and purpose only.

Never commit:

* Secrets
* Full database URLs
* OAuth secrets
* OpenAI API keys
* JWTs
* Session cookies

Use `.env.example` files for names and shape, not values.

---

# Logging

Logs should be useful for diagnosis without exposing sensitive data.

Do not log:

* Authorization headers
* Cookies
* JWTs
* Secrets
* Prompt content
* User-uploaded content
* Full model output

Both services already use structured loggers that redact sensitive fields. Preserve that behavior.

---

# Error Handling

User-facing errors should be stable and understandable.

Internal errors may be logged with sanitized metadata.

Production GraphQL errors are masked by GraphQL Yoga configuration. Do not rely on raw exception messages as user-facing API behavior.

---

# Formatting

Follow the style already present in the surrounding file.

Current style is pragmatic JavaScript with:

* Semicolons
* Double quotes
* Two-space indentation in JSON
* Readable early returns
* Small helper functions where they clarify behavior

Avoid large formatting-only changes unless formatting is the task.

---

# Documentation Updates

Documentation should be updated when a change affects:

* Product direction
* Architecture
* Domain ownership
* Data model
* GraphQL contract
* AI server contract
* Environment variables
* Deployment procedure
* Testing strategy

Documentation should record settled decisions, not every idea considered.

