# Frontend.md

# AspAIre Frontend Architecture

## Purpose

This document describes the frontend architecture for the AspAIre web application.

The frontend lives in `apps/web` and is inherited from Saigely. It should evolve into the AspAIre product interface while preserving the proven platform patterns already present.

---

# Technology Baseline

The web application uses:

* Next.js App Router
* React
* Tailwind CSS v4
* Radix UI
* next-themes
* Zustand
* GraphQL Yoga through the local `/api/graphql` route
* Better Auth client helpers
* Browser WebSocket connection to the external AI server

Current package versions are defined in `apps/web/package.json`.

---

# Application Structure

```text
apps/web/
├── app/
│   ├── (protected)/
│   ├── api/
│   ├── login/
│   ├── layout.js
│   └── page.js
├── components/
├── graphql/
├── hooks/
├── lib/
├── providers/
├── repositories/
├── store/
└── test/
```

The `app` directory owns routing. Shared UI lives in `components`. Client and server helpers live in `graphql`, `hooks`, `lib`, and `store`.

---

# Routing Model

The root layout is implemented in `apps/web/app/layout.js`.

It imports global styles, sets metadata, and wraps all pages in the shared `Providers` component.

Protected routes live under:

```text
apps/web/app/(protected)
```

The protected layout checks the current Better Auth session with `getSession`. Unauthenticated users are redirected to `/login`.

Future AspAIre product routes should use route groups intentionally:

* Public routes for unauthenticated product entry points
* Protected routes for user career workflows
* API routes only for application-owned server boundaries

---

# Providers

Shared client providers live in `apps/web/providers`.

The current provider stack uses `next-themes` through `ThemeProvider` with:

* `attribute="class"`
* system theme support
* transition suppression during theme changes

Additional providers should be added only when they are genuinely cross-cutting.

---

# UI Components

Shared UI components live in `apps/web/components`.

Current inherited component areas include:

* Chat components
* Markdown rendering
* Header and user menu UI

AspAIre should keep components close to their feature unless they are reused across domains.

Recommended organization:

* Domain-specific components live near the domain or feature area.
* Reusable primitives live under `components/ui`.
* Shared renderers, layout pieces, and cross-domain controls may live under named component folders.

---

# Client State

The app currently uses Zustand under `apps/web/store`.

Client state should be reserved for UI state or short-lived interaction state. Durable product state should be loaded through GraphQL and persisted by the application backend.

Avoid duplicating authoritative domain data in long-lived client stores unless there is a clear interaction need.

---

# GraphQL Usage

Frontend GraphQL helper functions live in folders under `apps/web/graphql`.

Current examples include:

* `graphql/conversation`
* `graphql/preference`
* `graphql/ai`
* `graphql/careerProfile`

Client-side requests use `authRequest`, which posts to `/api/graphql`.

Server-side authenticated requests can use `serverAuthRequest`.

Future domains should follow the same pattern: colocate query and mutation helper functions under a domain folder and keep GraphQL schema and resolver implementation separate from UI components.

---

# Career Profile UI

The Career Profile foundation route lives at:

```text
apps/web/app/(protected)/career-profile/page.js
```

The main client component lives at:

```text
apps/web/components/career-profile/CareerProfileClient.js
```

The UI is protected by the shared authenticated route group and uses GraphQL helpers to load and persist user-owned profile data.

The Career Profile page supports multiple profile variants. The left pane lists profiles and supports selection, edit, delete, and new-profile actions. The selected profile detail is display-only with a toolbar for edit, delete, and set-default actions. Editing opens a larger dialog that contains top-level profile fields plus experience, education, skills, projects, certifications, and preferences.

Narrative profile fields accept Markdown text in editable textareas and render saved content through the shared Markdown renderer. This keeps profile context readable while preserving plain text entry and storage.

Date-bearing section forms use native date pickers and React Hook Form with Yup validation for start/end date rules. Read-only profile displays show formatted date ranges when date values are available.

---

# AI Streaming Client

The browser connects directly to the external AI server using `NEXT_PUBLIC_WS_SERVER`.

The current streaming hook is `apps/web/hooks/useChatSocket.js`.

The client flow is:

1. Request a short-lived JWT from Better Auth.
2. Open a WebSocket connection to the configured AI server.
3. Send an `authenticate` message with the token.
4. Wait for `authenticated`.
5. Send `chat_message` payloads.
6. Render `chat_chunk` events as they arrive.
7. Handle `chat_complete` or error events.

The client refreshes authentication by closing the socket before token expiration and reconnecting.

---

# Styling

Global styles live in `apps/web/app/globals.css`.

The current stack uses Tailwind CSS v4 and CSS variables for theme-aware styling.

AspAIre UI should preserve the established theme model while replacing Saigely-specific product language and screens over time.

---

# Current Inheritance Notes

The frontend still contains Saigely branding and chat-first metadata.

Examples include:

* Root metadata in `apps/web/app/layout.js`
* Existing README language
* Current chat-focused protected route

During Phase 1 Platform Baseline, AspAIre should decide which inherited UI should remain as AI Workspace foundation and which should be renamed, moved, or replaced.
