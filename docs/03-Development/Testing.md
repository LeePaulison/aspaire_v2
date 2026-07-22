# Testing.md

# AspAIre Testing Guide

## Purpose

This document describes AspAIre's testing approach.

Testing should scale with risk. The project should preserve the focused tests inherited from Saigely and expand coverage as AspAIre domains are implemented.

---

# Test Runner

Both packages currently use Node's built-in test runner:

```text
node --test
```

Root scripts include:

* `npm test`
* `npm run test:web`
* `npm run test:ai`

The web app also has:

* `npm run lint`
* `npm run build`

---

# Current Test Locations

Web tests live in:

```text
apps/web/test
```

AI server tests live in:

```text
apps/ai-server/test
```

---

# Current Coverage Areas

Inherited web tests cover:

* Conversation repository behavior
* Conversation resolver authorization
* GraphQL request validation
* Rate limiting
* Reconnect behavior
* Security headers
* Text attachment serialization

Inherited AI server tests cover:

* Configuration parsing
* WebSocket connection handling
* GraphQL request behavior
* Logger redaction
* Rate limiting
* Readiness checks

---

# What to Test

Prioritize tests for:

* Authorization boundaries
* User-owned data access
* Repository behavior
* Resolver behavior
* Request validation
* AI server protocol behavior
* Persistence edge cases
* Data ownership checks
* Security-sensitive behavior

UI tests should be added when user-facing workflows become complex enough that component-only or resolver tests are insufficient.

---

# Resolver Tests

Resolver tests should verify:

* Unauthenticated access behavior
* Ownership checks
* Repository inputs
* Important success outputs
* Important failure modes

Use injected repository fakes where possible to avoid unnecessary database dependency.

---

# Repository Tests

Repository tests should verify:

* ID validation
* Query scoping
* Insert and update shapes
* Delete ownership constraints
* Returned domain values

Where database integration is not available, keep pure behavior tests focused and document remaining integration risk.

---

# AI Server Tests

AI server tests should verify:

* Authentication must happen first
* Invalid JWTs are rejected
* Unauthenticated sockets time out
* Invalid payloads fail predictably
* Stream chunks are forwarded
* Completed turns are persisted through GraphQL
* Upstream failures return stable client errors
* Concurrent in-flight messages are rejected
* Payload and message-rate limits are enforced
* Stalled streams time out and clean up

---

# Security Tests

Security-sensitive changes should include tests where practical.

Examples:

* GraphQL body limits
* Production GraphQL restrictions
* Rate limits
* Security headers
* JWT claim handling
* Origin validation
* Log redaction

---

# Manual Verification

Some workflows require manual verification until broader browser automation exists.

Manual checks may include:

* Sign in
* Protected route redirect
* Preferences load
* WebSocket connects
* AI response streams
* Conversation persists after refresh
* Theme switching

Manual verification should be reported clearly when automated tests do not cover the behavior.

---

# Test Expectations by Change Type

Documentation-only changes do not require tests.

Small UI copy changes may require only visual/manual review.

Resolver, repository, or security changes should usually include automated tests.

AI server protocol changes should include AI server tests.

Cross-service contract changes should include tests where possible plus manual end-to-end verification.

