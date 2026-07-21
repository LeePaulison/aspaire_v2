# Decisions.md

# AspAIre Decisions

## Purpose

This document records important product, architecture, and process decisions for AspAIre.

Conversation is useful for exploration. This document is the durable record of decisions once they have been made.

---

# Decision Format

Each decision should include:

* Status
* Date
* Context
* Decision
* Rationale
* Consequences

Decision statuses:

* Proposed
* Accepted
* Superseded
* Rejected

---

# Decision Index

| ID | Status | Date | Decision |
| --- | --- | --- | --- |
| ASP-0001 | Accepted | 2026-07-21 | AspAIre builds on Saigely instead of starting greenfield |
| ASP-0002 | Accepted | 2026-07-21 | Documentation is the project source of truth |
| ASP-0003 | Accepted | 2026-07-21 | The Next.js application owns business logic and data |
| ASP-0004 | Accepted | 2026-07-21 | The external AI server owns AI execution and streaming |
| ASP-0005 | Accepted | 2026-07-21 | Features are built as vertical slices |
| ASP-0006 | Accepted | 2026-07-21 | AI is treated as a platform capability |
| ASP-0007 | Accepted | 2026-07-21 | Durable career context is prioritized before advanced intelligence |
| ASP-0008 | Accepted | 2026-07-21 | AspAIre is a user-facing career platform, not an employer job board |

---

# ASP-0001: AspAIre Builds on Saigely Instead of Starting Greenfield

## Status

Accepted

## Date

2026-07-21

## Context

AspAIre is the successor to Saigely. Saigely reached MVP completion and already proved major platform concerns through implementation, including authentication, AI integration, real-time communication, and deployment experimentation.

Starting AspAIre from scratch would risk revisiting solved infrastructure concerns before the career product domains have been implemented.

## Decision

AspAIre will build on the completed Saigely architecture rather than starting as a greenfield application.

## Rationale

The existing architecture provides a proven technical baseline. Reusing it allows development effort to focus on AspAIre's career platform domains instead of rebuilding foundational infrastructure.

## Consequences

* Existing platform patterns should be understood before introducing alternatives.
* Architecture changes should require a clear product or technical reason.
* Early work should include documenting inherited platform behavior so future implementation is not dependent on memory or code archaeology.

---

# ASP-0002: Documentation Is the Project Source of Truth

## Status

Accepted

## Date

2026-07-21

## Context

AspAIre will involve product, architecture, implementation, and AI workflow decisions over time. Conversation history is useful for developing ideas but is not a reliable long-term reference.

## Decision

Project documentation will be the authoritative source of truth for finalized decisions and project direction.

## Rationale

Documentation keeps the project understandable across time, conversations, and contributors. It allows future development to proceed from stable references instead of rediscovering prior reasoning.

## Consequences

* Significant decisions should be recorded in the relevant project document.
* Domain and architecture docs should evolve alongside implementation.
* Conversation can remain exploratory, but finalized choices should move into documentation.

---

# ASP-0003: The Next.js Application Owns Business Logic and Data

## Status

Accepted

## Date

2026-07-21

## Context

AspAIre includes an external AI server inherited from Saigely, but the product domains require durable business data, user workflows, authorization, validation, persistence, and application state.

## Decision

The Next.js application owns business logic, business data, persistence, user workflows, authorization boundaries, and application state.

## Rationale

Keeping business ownership in the application preserves a clear domain model and prevents the AI execution layer from becoming an accidental backend.

## Consequences

* Product domains should be implemented in the Next.js application.
* PostgreSQL, Drizzle, repositories, GraphQL operations, and validation belong to the application layer.
* The AI server should not become the source of truth for user data or product workflows.

---

# ASP-0004: The External AI Server Owns AI Execution and Streaming

## Status

Accepted

## Date

2026-07-21

## Context

AspAIre uses a dedicated external Node.js server for OpenAI Responses API integration, streaming AI responses, WebSocket communication, and long-running AI operations.

## Decision

The external AI server owns AI execution, streaming behavior, WebSocket communication for AI responses, and long-running AI operations.

## Rationale

AI execution has different runtime needs than ordinary application workflows. Keeping it in a dedicated service preserves the architectural boundary while allowing domains to consume AI through a common capability.

## Consequences

* The AI server executes AI workloads but does not own business data.
* The application passes appropriate context to AI workflows.
* AI results that need persistence should be saved by the application.
* Streaming contracts between the application and AI server should be documented.

---

# ASP-0005: Features Are Built as Vertical Slices

## Status

Accepted

## Date

2026-07-21

## Context

AspAIre has multiple related product domains, including career profile, resume library, job search, saved jobs, application tracking, interview preparation, AI workspace, and market research.

Building many partial systems at once would increase coordination cost and reduce the chance of completing usable workflows.

## Decision

AspAIre features should be developed as complete vertical slices.

## Rationale

Vertical slices produce usable functionality and force important integration decisions to surface early. They also align data model, API, business logic, UI, AI integration, and documentation around real workflows.

## Consequences

* Each major feature should include database, repository, API, validation, UI, and documentation work where relevant.
* Incomplete cross-domain scaffolding should be avoided unless it is necessary for the active slice.
* Testing should scale with the risk and surface area of the slice.

---

# ASP-0006: AI Is Treated as a Platform Capability

## Status

Accepted

## Date

2026-07-21

## Context

Multiple AspAIre domains will need AI assistance, including resume parsing, job summarization, cover letter generation, interview coaching, search term generation, career analysis, and market research.

## Decision

AI will be treated as a reusable platform capability instead of a standalone product feature.

## Rationale

A shared AI capability keeps integration patterns consistent and allows product domains to use AI with the right career and workflow context.

## Consequences

* Domains should consume AI through common interfaces where practical.
* AI features should remain tied to user workflows and product context.
* Prompting, streaming, persistence, and result handling should be documented as platform concerns.

---

# ASP-0007: Durable Career Context Is Prioritized Before Advanced Intelligence

## Status

Accepted

## Date

2026-07-21

## Context

AspAIre's long-term value depends on accumulated user career context, resume assets, saved jobs, application history, and preferences. Advanced personalization and recommendations are weaker without this context.

## Decision

The roadmap will prioritize durable context domains before advanced intelligence and recommendation features.

## Rationale

Building the context layer first gives later AI workflows meaningful input and avoids producing generic AI outputs disconnected from the user's career reality.

## Consequences

* Career profile, resume library, saved jobs, and application tracking should precede deeper personalization.
* AI workflows should progressively improve as more structured context becomes available.
* Recommendation features should wait until there is enough persisted data to support them.

---

# ASP-0008: AspAIre Is a User-Facing Career Platform, Not an Employer Job Board

## Status

Accepted

## Date

2026-07-21

## Context

AspAIre is focused on helping professionals discover opportunities, manage their job search, optimize materials, prepare for interviews, and use AI throughout the hiring process.

Employer-side workflows such as recruiter accounts, public job posting management, applicant review, or ATS functionality would significantly expand the product boundary.

## Decision

AspAIre will initially focus on job seekers and career-management users, not employer-side job board or recruiter workflows.

## Rationale

This keeps the product focused on the user's career workflow and avoids diluting the initial platform with a second customer type.

## Consequences

* Employer accounts, recruiter tools, and public job board management are out of scope initially.
* Saved jobs may reference external postings, but AspAIre does not need to host employer-created listings at the start.
* Future employer-side capabilities should only be considered if they support the core user-facing career workflow.

---

# Adding New Decisions

New decisions should be added when a choice materially affects:

* Product direction
* User experience
* Architecture
* Domain ownership
* Data model design
* AI server responsibilities
* External services
* Security or privacy posture
* Deployment expectations

Small implementation details do not need decision records unless they establish a pattern the project should continue following.
