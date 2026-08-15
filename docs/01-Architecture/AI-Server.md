# AI-Server.md

# AspAIre AI Server Architecture

## Purpose

This document describes the external AI server used by AspAIre.

The AI server is a dedicated Node.js service for authenticated WebSocket streaming and OpenAI Responses API execution. It is not the application backend.

---

# Technology Baseline

The AI server lives in:

```text
apps/ai-server
```

It uses:

* Node.js
* `ws`
* `jose`
* OpenAI Node SDK
* dotenv
* Node's built-in test runner

The main entry points are:

* `server.js`
* `websocket.js`
* `lib/websocket/connectionHandler.js`
* `lib/openai/chat.js`

---

# Responsibilities

The AI server owns:

* HTTP process startup
* `/health`
* `/ready`
* WebSocket upgrades at `/ws`
* Exact client origin checks
* JWT verification against the web application's JWKS
* WebSocket authentication protocol
* OpenAI Responses API streaming
* Stream idle timeout handling
* WebSocket heartbeat cleanup
* Payload, connection, and message-rate limits
* Calling GraphQL for application-owned context and persistence

It does not own:

* Users
* Sessions
* Product domains
* Database schemas
* Business authorization
* Long-term application data

---

# Runtime Flow

```text
Browser
  -> opens WebSocket to /ws
  -> sends authenticate message with JWT
  -> AI server verifies JWT against web JWKS
  -> browser sends chat_message
  -> AI server loads preferences/model/agent through GraphQL
  -> AI server calls OpenAI Responses API
  -> AI server streams chat_chunk events
  -> AI server saves completed turn through GraphQL
  -> AI server sends chat_complete
```

---

# WebSocket Protocol

The first valid client message must be:

```json
{
  "type": "authenticate",
  "payload": {
    "token": "<jwt>"
  }
}
```

Successful authentication returns:

```json
{ "type": "authenticated" }
```

Chat requests use:

```json
{
  "type": "chat_message",
  "payload": {
    "content": "...",
    "conversationId": null,
    "agentId": "assistant",
    "domain": "general",
    "workflowType": "chat"
  }
}
```

Streaming deltas use `chat_chunk`.

Completed responses use `chat_complete`.

Request failures use `error`; authentication failures use `authentication_error`.

---

# GraphQL Dependency

The AI server calls the web application's `/api/graphql` endpoint through repository modules in `apps/ai-server/repositories`.

Current GraphQL-backed operations include:

* `getPreferences`
* `getAiModelById`
* `getAiAgentById`
* `getDomainPreference`
* `saveConversationTurn`

The user's bearer token is forwarded to GraphQL.

This preserves the application boundary: the AI server asks the application for user-scoped data and persistence instead of connecting directly to databases.

---

# OpenAI Integration

OpenAI integration lives in `apps/ai-server/lib/openai`.

`createChatStream` builds a Responses API request with:

* System prompt
* User message
* Selected model
* Optional temperature
* Optional reasoning effort
* Optional text verbosity
* Optional strict structured-output JSON schema from a domain workflow preference
* Streaming enabled

Model capability flags determine which optional OpenAI request fields are sent.

Domain workflows can provide product-level runtime defaults through `domain_preferences`.
The current resume-to-career-profile draft workflow uses the `resume-parser` agent with the
`career_evidence.resume_to_career_profile_draft` preference and a strict response schema.
The AI server converts that stored schema into the OpenAI Responses API `text.format`
shape before streaming the structured response back to the web app.

---

# Health and Readiness

The AI server exposes:

* `GET /health`
* `GET /ready`

`/health` confirms the process can serve HTTP.

`/ready` checks:

* OpenAI API reachability
* JWKS reachability and key presence
* GraphQL reachability
* Application origin reachability

Readiness results are cached briefly to reduce repeated dependency calls.

---

# Configuration

Configuration is read in `apps/ai-server/lib/config.js`.

Important variables include:

* `HOST`
* `PORT`
* `OPENAI_API_KEY`
* `API_ORIGIN`
* `CLIENT_ORIGIN`
* `CORS_ORIGIN`
* `JWKS_URL`
* `JWT_ISSUER`
* `JWT_AUDIENCE`
* `JWT_ALGORITHMS`
* `MAX_PAYLOAD_BYTES`
* `MESSAGES_PER_MINUTE`
* `MAX_CONNECTIONS`
* `AUTHENTICATION_TIMEOUT_MS`
* `GRAPHQL_TIMEOUT_MS`
* `STREAM_IDLE_TIMEOUT_MS`
* `HEARTBEAT_INTERVAL_MS`
* `READINESS_TIMEOUT_MS`
* `READINESS_CACHE_MS`

---

# Security Controls

Current controls include:

* Exact WebSocket origin matching
* JWT issuer, audience, and algorithm validation
* Remote JWKS verification
* Authentication deadline
* Payload size limit
* Message rate limit
* Connection limit
* One in-flight chat request per connection
* Stream idle timeout
* Heartbeat cleanup
* Disabled WebSocket compression
* Structured log redaction

---

# Current Inheritance Notes

The Fly app and examples still use Saigely names such as `saigely-server`.

AspAIre should decide whether to create a new Fly application for the AI server or rename/reconfigure the inherited one. Any production rename must be coordinated with `NEXT_PUBLIC_WS_SERVER`, `CLIENT_ORIGIN`, `API_ORIGIN`, JWKS configuration, and deployment documentation.
