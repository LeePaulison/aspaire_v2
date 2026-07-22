# Architecture.md

# AspAIre Architecture

## Purpose

This document describes the top-level architecture for AspAIre.

It explains the system shape, major components, ownership boundaries, and request flows. More detailed subsystem behavior belongs in the focused architecture documents for frontend, authentication, GraphQL, AI server, database, and deployment.

---

# Architectural Summary

AspAIre is an npm workspace with two application services:

* `apps/web`: the Next.js application
* `apps/ai-server`: the external AI execution and WebSocket streaming server

The architecture is inherited from Saigely and is being carried forward as AspAIre's platform foundation.

The core rule is:

> The Next.js application owns the business. The external AI server owns AI execution.

Business workflows, domain data, persistence, authentication configuration, GraphQL operations, repositories, and user-facing UI belong to the web application.

OpenAI Responses API calls, token-by-token streaming, WebSocket connection handling, stream resilience, and long-running AI execution belong to the AI server.

---

# Workspace Structure

```text
aspaire/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── drizzle/
│   │   ├── graphql/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── providers/
│   │   ├── repositories/
│   │   ├── store/
│   │   └── test/
│   │
│   └── ai-server/
│       ├── lib/
│       ├── repositories/
│       ├── test/
│       ├── server.js
│       └── websocket.js
│
├── docs/
│   ├── 00-Project/
│   └── 01-Architecture/
│
└── package.json
```

The root `package.json` defines the npm workspace and delegates development, build, lint, and test scripts to the app packages.

---

# System Components

## Web Application

Location: `apps/web`

The web application is a Next.js App Router application. It owns:

* User interface
* Protected and public routes
* Better Auth configuration
* Session handling
* JWT/JWKS issuance for service authentication
* GraphQL API
* Domain resolvers
* Repositories
* Database access
* User and product data persistence
* Client-side WebSocket usage

Current inherited application capabilities include authenticated chat, AI preferences, conversation persistence, GraphQL operations, and streaming client integration.

AspAIre domains will be added to this application as vertical slices.

---

## AI Server

Location: `apps/ai-server`

The AI server is a Node.js service that exposes HTTP health endpoints and a WebSocket endpoint for streaming AI responses.

It owns:

* WebSocket upgrade handling at `/ws`
* Exact browser origin enforcement
* JWT verification against the web application's JWKS
* OpenAI Responses API integration
* Streaming response events to the browser
* AI stream timeout handling
* WebSocket heartbeat cleanup
* AI-related rate and payload limits
* AI gateway health and readiness checks

The AI server does not own business data. When it needs application state, it calls the web application's GraphQL API using the authenticated user's bearer token.

---

## Data Stores

The web application currently uses two data stores:

* PostgreSQL through Neon and Drizzle ORM
* MongoDB Community for conversation-style document data

PostgreSQL access is initialized in `apps/web/lib/db/neon.js`, using `DATABASE_URL`.

Drizzle schema files live in `apps/web/drizzle`, including Better Auth schema, AI preference/configuration tables, and MVP product domain tables.

MongoDB access is initialized in `apps/web/lib/db/mongo.js`, using `MONGODB_URI`.

The MongoDB helper defaults to the `aspaire` database and can be overridden with `MONGODB_DATABASE`. AspAIre should use an AspAIre-specific MongoDB user and database on the existing MongoDB Community server running on Fly.io.

Both data stores are application-owned dependencies. The AI server does not connect directly to PostgreSQL or MongoDB.

---

## GraphQL API

The GraphQL API is exposed by the web application at:

```text
/api/graphql
```

It is implemented with GraphQL Yoga in `apps/web/app/api/graphql/route.js`.

The API owns:

* Schema assembly
* Resolver execution
* Request context creation
* Session and bearer-token authentication context
* Request validation
* GraphQL rate limiting
* Domain API access for the frontend and AI server

GraphQL schemas live in `apps/web/graphql/schemas`.

Resolvers live in `apps/web/graphql/resolvers`.

Frontend GraphQL helper functions live in domain folders under `apps/web/graphql`.

---

# Core Boundary

## Next.js Owns Business

The web application owns business concerns:

* Product domains
* Domain validation
* Authorization decisions
* Database schema
* Repositories
* GraphQL schema and resolvers
* User workflows
* UI state and navigation
* Persistence of AI outputs when those outputs become product data

Examples of future AspAIre business domains include career profile, resume library, job search, saved jobs, application tracking, interview preparation, AI workspace, and market research.

---

## AI Server Owns AI Execution

The AI server owns execution concerns:

* OpenAI client usage
* Streaming AI responses
* WebSocket protocol handling
* AI request timeouts
* AI gateway readiness
* Per-connection AI workflow execution

The AI server may fetch user preferences, model configuration, agent configuration, conversation history, or future career context through GraphQL. It must not become the system of record for that data.

---

# Authentication Model

The web application uses Better Auth with:

* Email and password authentication
* GitHub OAuth
* Google OAuth
* Drizzle-backed persistence
* JWT plugin support
* RS256 JWKS for service verification

The web application accepts two authentication modes for GraphQL context:

* Browser session cookies through Better Auth
* Bearer JWTs verified against the application's JWKS

The AI server verifies the same class of bearer JWT against the web application's JWKS before accepting authenticated WebSocket messages.

Current inherited JWT defaults still use Saigely identifiers:

* Issuer: `saigely-next`
* Audience: `saigely-websocket`

These identifiers should be reviewed during AspAIre platform baseline work and either intentionally retained for compatibility or renamed in a coordinated application and gateway change.

---

# Request Flows

## Browser Page Flow

```text
Browser
  -> Next.js route
  -> Server component or client component
  -> GraphQL helper where needed
  -> /api/graphql
  -> Resolver
  -> Repository
  -> PostgreSQL or MongoDB
```

This flow is used for normal product data access and server-rendered or client-rendered application screens.

---

## GraphQL Flow

```text
Browser or AI server
  -> /api/graphql
  -> GraphQL request validation
  -> Rate limit check
  -> Context creation
  -> Session or JWT authentication
  -> Resolver
  -> Repository
  -> PostgreSQL or MongoDB
```

GraphQL is the application API boundary for both browser interactions and AI server callbacks.

---

## AI Streaming Flow

```text
Browser
  -> Better Auth token request
  -> WebSocket connection to AI server /ws
  -> authenticate message with bearer token
  -> AI server verifies token against web JWKS
  -> Browser sends chat request
  -> AI server fetches needed context through /api/graphql
  -> AI server calls OpenAI Responses API with streaming
  -> AI server streams deltas to browser
  -> AI server persists conversation output through /api/graphql
```

The browser connects directly to the AI server for streaming. The AI server calls back to the application for business data and persistence.

---

## Readiness Flow

The AI server exposes:

* `/health`: process-level liveness
* `/ready`: dependency readiness

Readiness checks include:

* OpenAI API access
* JWKS reachability
* GraphQL API reachability
* Application origin reachability

This makes the gateway's runtime dependencies explicit.

---

# Domain Architecture

AspAIre domains should be implemented as vertical slices in the web application.

A typical domain slice should include:

* Drizzle schema
* Repository
* GraphQL schema
* GraphQL resolver
* Validation and authorization behavior
* UI routes and components
* Tests appropriate to the risk of the slice
* Documentation updates

Domains should remain independent where practical while using shared platform services for authentication, data access, GraphQL, theming, and AI communication.

---

# Data Ownership Rules

## Application Data

The web application owns persisted business data, including:

* User accounts and sessions
* User preferences
* Conversation history
* Career profile data
* Resume data
* Saved jobs
* Application tracking data
* Interview preparation data
* Market research data

The AI server may request this data through GraphQL when needed for AI execution.

---

## Relational Data

PostgreSQL is used for relational application data.

Current inherited relational data includes:

* Better Auth users, accounts, sessions, verification records, and signing keys
* User preferences
* AI models
* AI agents
* Reasoning levels
* Verbosity levels

Future structured AspAIre domain data should default to PostgreSQL unless document storage is clearly a better fit.

---

## Document Data

MongoDB is used for conversation-style document data.

Current inherited document data includes:

* Conversations
* User messages
* Assistant messages
* Conversation previews and timestamps

MongoDB is hosted as a MongoDB Community server on Fly.io.

AspAIre should use its own MongoDB database and user rather than continuing to rely on the inherited `saigely` database name. The user and database setup should be documented in the database and deployment references without recording secret values.

---

## AI Outputs

AI output is transient while streaming.

AI output becomes application data only when the web application persists it. The AI server may initiate persistence by calling GraphQL, but the application decides the schema, validation, authorization, and storage behavior.

---

## Configuration Data

AI model, agent, reasoning, verbosity, and preference configuration currently lives in the web application database and repositories.

The AI server reads this configuration through GraphQL so that model selection and prompt construction are driven by application-owned state.

---

# Cross-Cutting Concerns

## Security

Current platform security mechanisms include:

* Better Auth session management
* RS256 JWT verification through JWKS
* Exact WebSocket origin checks
* GraphQL request validation
* GraphQL rate limiting
* WebSocket payload limits
* WebSocket authentication deadlines
* WebSocket message rate limits
* Content Security Policy and security headers in Next.js
* Structured log redaction of sensitive fields

Security-sensitive behavior should be documented in detail in `Authentication.md`, `AI-Server.md`, and `Deployment.md`.

---

## Observability

Both services use structured logging with request identifiers.

The web GraphQL route sets `X-Request-ID` and logs request completion.

The AI server uses request and connection identifiers for HTTP and WebSocket lifecycle events.

End-to-end request correlation is currently limited and should be revisited if production observability requirements increase.

---

## Testing

Both workspaces use Node's built-in test runner through `node --test`.

Current tests cover areas such as:

* Conversation repositories and resolvers
* GraphQL request security
* Rate limiting
* Reconnect behavior
* Security headers
* AI server configuration
* WebSocket connection handling
* GraphQL requests from the AI server
* Gateway readiness

Future domain tests should follow the risk and surface area of each vertical slice.

---

# Current Inheritance Notes

The imported codebase still contains Saigely naming in README files, operations documentation, JWT defaults, and deployed URL examples.

This is expected during the transition from Saigely to AspAIre.

During Phase 1 Platform Baseline, the project should decide which inherited names are compatibility details and which should be renamed to AspAIre. Any rename affecting JWT issuer, audience, OAuth callback URLs, public origins, or WebSocket URLs must be coordinated across both services.

The MongoDB helper now defaults to the `aspaire` database. AspAIre should still create and document an AspAIre-specific MongoDB database and user on the existing Fly.io MongoDB Community server, then set `MONGODB_URI` and `MONGODB_DATABASE` in the web application environment.

---

# What This Document Does Not Cover

This document is the system overview. It intentionally does not fully specify:

* Route and layout conventions
* Component design patterns
* Full authentication configuration
* Complete GraphQL schema conventions
* Complete database schema
* AI server WebSocket protocol details
* Environment variable reference
* Deployment runbooks

Those details belong in the focused architecture and reference documents.
