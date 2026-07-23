# Saigely

Saigely is a full-stack AI chat application built with Next.js. It combines OAuth authentication, configurable AI preferences, persistent conversation history, Markdown rendering, file attachments, and token-by-token response streaming.

The Next.js application owns the UI, authentication, GraphQL API, and data access. The separate [OpenAI WebSocket Gateway](https://github.com/LeePaulison/openai-websocket-gateway) handles OpenAI response streaming and calls the application's authenticated GraphQL API to load preferences and persist completed turns.

Production: [saigely.vercel.app](https://saigely.vercel.app)

## Features

- Streaming AI responses over authenticated WebSockets
- GitHub and Google OAuth through Better Auth
- Persistent conversations and messages
- Per-user model, agent, temperature, reasoning, verbosity, and theme preferences
- Markdown, syntax-highlighted code, tables, and text-file attachments
- Responsive conversation sidebar and chat composer
- Light, dark, and system themes
- Short-lived RS256 JWTs for service-to-service authentication

## Technology

### Next.js application

- Next.js 16 App Router and React 19
- Tailwind CSS 4 and Radix UI
- Better Auth with its JWT/JWKS plugin
- GraphQL Yoga and GraphQL Tools
- Drizzle ORM with Neon Postgres
- MongoDB
- Zustand

### OpenAI WebSocket Gateway

The separately maintained [OpenAI WebSocket Gateway](https://github.com/LeePaulison/openai-websocket-gateway) is a small Node.js service using:

- `ws` for WebSocket connections
- `jose` for JWT verification against the app's public JWKS
- OpenAI Responses API for streamed model output
- The Saigely GraphQL API for preferences, model/agent configuration, and persistence

The gateway is currently hosted on Fly.io; the Next.js application is hosted on Vercel.

## Architecture

```text
Browser
  |
  +-- HTTPS --> Next.js on Vercel
  |               |-- Better Auth: sessions, OAuth, JWT/JWKS
  |               |-- GraphQL Yoga: application API
  |               |-- Neon Postgres: users, sessions, preferences,
  |               |                   models, agents, and levels
  |               `-- MongoDB: conversations and messages
  |
  `-- WSS ----> OpenAI WebSocket Gateway on Fly.io
                  |-- verifies JWT using the Vercel JWKS endpoint
                  |-- streams responses from OpenAI
                  `-- calls Vercel GraphQL with the user's bearer token
```

### Authentication flow

1. The user signs in with GitHub or Google through Better Auth.
2. The browser receives a secure session cookie.
3. Before opening the chat socket, the browser requests a short-lived JWT from Better Auth.
4. The gateway verifies the JWT against `/api/auth/jwks`, including the issuer and audience.
5. The same JWT is forwarded to GraphQL when the service reads user configuration or saves a conversation turn.

Default JWT claims expected by both projects:

```text
issuer:   aspaire-web
audience: aspaire-ai-server
algorithm: RS256
```

## Data ownership

### Neon Postgres

- Better Auth users, accounts, sessions, verification records, and signing keys
- User preferences
- Available AI models and agents
- Reasoning and verbosity levels

### MongoDB

- Conversations
- User and assistant messages
- Conversation previews and timestamps

## Repository layout

```text
app/             Next.js pages, protected routes, and API route handlers
components/      Chat, Markdown, settings, header, and menu UI
drizzle/         Postgres table definitions and seed data
graphql/         Schema, resolvers, context, and client/server request helpers
hooks/           WebSocket and preference-selection hooks
lib/             Better Auth, database clients, and chat utilities
repositories/    Neon and MongoDB data-access functions
store/           Zustand stores
providers/       Client-side providers
```

## Local development

### Prerequisites

- Node.js 20.9 or newer
- A Neon Postgres database with the Saigely schema and configuration data
- A MongoDB database
- GitHub and/or Google OAuth applications
- The [OpenAI WebSocket Gateway](https://github.com/LeePaulison/openai-websocket-gateway) running locally or at a reachable URL
- An OpenAI API key configured in the gateway

### Install and run

```bash
npm install
npm run dev
```

The Next.js development server runs at `http://localhost:3000` by default.

### Application environment

Create `.env.local` in the repository root. Local environment files are ignored by both Git and Vercel deployments.

```env
# Better Auth
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Data
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb+srv://...

# Browser-to-streaming-service connection
NEXT_PUBLIC_WS_SERVER=ws://localhost:8080/ws

# Optional API protection limits (defaults shown)
GRAPHQL_MAX_BODY_BYTES=1048576
GRAPHQL_REQUESTS_PER_MINUTE=120
```

OAuth callback URLs for local development are:

```text
http://localhost:3000/api/auth/callback/github
http://localhost:3000/api/auth/callback/google
```

### Gateway environment

Configure the OpenAI WebSocket Gateway separately:

```env
HOST=0.0.0.0
PORT=8080
OPENAI_API_KEY=
API_ORIGIN=http://localhost:3000
CLIENT_ORIGIN=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
JWKS_URL=http://localhost:3000/api/auth/jwks
JWT_ISSUER=aspaire-web
JWT_AUDIENCE=aspaire-ai-server
```

`API_ORIGIN` and `JWKS_URL` must be reachable from the gateway. In a hosted environment they cannot point to `localhost`; they must use the deployed Next.js origin. `CLIENT_ORIGIN` identifies the browser origin allowed to connect.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve a completed production build |
| `npm run lint` | Run ESLint |

## Production deployment

The current production topology is:

- Next.js application: Vercel
- OpenAI WebSocket Gateway: Fly.io
- Relational database: Neon Postgres
- Conversation database: MongoDB

Vercel needs the application environment variables above, scoped to Production. Production additionally uses:

```env
BETTER_AUTH_URL=https://saigely.vercel.app
NEXT_PUBLIC_AUTH_URL=https://saigely.vercel.app
NEXT_PUBLIC_WS_SERVER=wss://saigely-server.fly.dev/ws
```

The Fly-hosted gateway must use matching origins and authentication settings:

```env
API_ORIGIN=https://saigely.vercel.app
CLIENT_ORIGIN=https://saigely.vercel.app
JWKS_URL=https://saigely.vercel.app/api/auth/jwks
JWT_ISSUER=aspaire-web
JWT_AUDIENCE=aspaire-ai-server
```

The Vercel JWKS endpoint must be publicly reachable by Fly. Vercel Preview Deployment Protection blocks that request, so the public Production origin is used for the current integration.

## Operations

The [production operations runbook](docs/operations.md) documents deployment order, health and readiness interpretation, smoke tests, logging, incident diagnosis, and rollback across Vercel and Fly.io.

## Current scope

Saigely is an MVP and portfolio project rather than a production SaaS offering. Its emphasis is a maintainable full-stack architecture, authenticated service boundaries, configurable AI behavior, and a polished streaming chat experience.

## Security and observability

Saigely assigns correlation IDs to GraphQL requests, emits structured JSON request logs without prompt or token data, masks GraphQL errors in production, disables production GraphiQL, applies request body and best-effort per-IP rate limits, and returns non-cacheable API responses. Browser responses include a Content Security Policy, clickjacking protection, MIME sniffing protection, a restrictive permissions policy, and a bounded referrer policy.

The application-level GraphQL limiter is process-local and therefore supplemental on serverless infrastructure. Production deployments should also configure rate limiting at the hosting edge for enforcement across all instances.

## License

This project is currently not licensed for public use.
