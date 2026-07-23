# Decisions.md

# AspAIre Decisions

## Purpose

This document records important product, architecture, and process decisions for AspAIre.

Conversation is useful for exploration. This document is the durable record of decisions once they have been made.

---

# Decision File Size Policy

To keep decision history readable, decision records should be split into additional files after every 25 documented decisions.

This file remains the primary entry point and should keep:

* The purpose and decision format
* The complete decision index
* The active decision volume
* Links or references to archived decision volumes

When the project reaches `ASP-0026`, create:

```text
docs/00-Project/Decisions-0026-0050.md
```

Move full decision records `ASP-0026` through `ASP-0050` into that file as they are written. Continue the same pattern for later ranges:

```text
docs/00-Project/Decisions-0051-0075.md
docs/00-Project/Decisions-0076-0100.md
```

The decision index in this file should continue listing every decision across all volumes so there is one place to scan project history.

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
| ASP-0009 | Accepted | 2026-07-22 | Initial product domains are documented as first-class domain contracts |
| ASP-0010 | Accepted | 2026-07-22 | Project documents define product direction, sequencing, and decision history |
| ASP-0011 | Accepted | 2026-07-22 | Architecture documents define platform boundaries and subsystem contracts |
| ASP-0012 | Accepted | 2026-07-22 | Development documents define contribution, testing, and implementation standards |
| ASP-0013 | Accepted | 2026-07-22 | Reference documents define implementation-aligned technical inventories |
| ASP-0014 | Accepted | 2026-07-22 | AspAIre MVP is defined as a focused profile-resume-job-analysis-tracking workflow |
| ASP-0015 | Accepted | 2026-07-22 | Conversation documents are scoped by domain and domain object ID |
| ASP-0016 | Accepted | 2026-07-22 | Google OAuth is the MVP sign-in provider and GitHub OAuth is optional |
| ASP-0017 | Accepted | 2026-07-22 | JWT issuer and audience are explicit environment-defined service identifiers |
| ASP-0018 | Accepted | 2026-07-22 | Email/password authentication is disabled by default for the MVP |
| ASP-0019 | Accepted | 2026-07-23 | Default AI reference data is managed by an idempotent seed script |

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

# ASP-0009: Initial Product Domains Are Documented as First-Class Domain Contracts

## Status

Accepted

## Date

2026-07-22

## Context

AspAIre's documentation-first workflow requires stable domain references before implementation begins. The project foundations identify independent product domains that should be built as vertical slices on top of the inherited platform.

The `docs/02-Domains` folder has been created to define these domains before implementation. The domain set includes Career Profile, Resume Library, Resume Analysis, Job Search, Saved Jobs, Application Tracking, AI Workspace, Interview Preparation, Market Research, and User Preferences.

## Decision

AspAIre will maintain a first-class domain contract document for each initial product domain in `docs/02-Domains`.

Each domain contract should describe the domain purpose, ownership, user capabilities, core concepts, data model direction, authorization rules, GraphQL/API direction, repository direction, UI direction, AI usage, validation, privacy, testing expectations, integration points, initial implementation slice, open questions, and definition of done.

## Rationale

Domain contracts give future implementation work a shared product and architecture reference. They preserve boundaries between related domains, clarify how AI participates without owning business data, and keep feature planning aligned with the vertical-slice development model.

Market Research is included as a first-class domain because it appears in the product vision and roadmap as a distinct capability for company, role, skill, compensation, and market-pattern exploration.

## Consequences

* Domain implementation should start from the relevant `docs/02-Domains` contract.
* Domain docs should evolve alongside implementation and remain aligned with reference docs.
* Changes to the initial domain set should update `Foundations.md`, roadmap documentation where needed, and this decision record if the product boundary changes materially.
* Market Research should be treated as separate from AI Workspace when persisted research topics, outputs, notes, and domain links need first-class ownership.

---

# ASP-0010: Project Documents Define Product Direction, Sequencing, and Decision History

## Status

Accepted

## Date

2026-07-22

## Context

AspAIre needs a stable project-level documentation area that records product identity, mission, roadmap, and accepted decisions separately from architecture, domain contracts, implementation standards, and reference inventories.

The `docs/00-Project` folder contains Foundations, Vision, Roadmap, and Decisions documents.

## Decision

AspAIre will maintain `docs/00-Project` as the authoritative project-level documentation area.

Project documents define the product direction, platform philosophy, roadmap sequencing, documentation hierarchy, and durable decision history.

## Rationale

Project-level decisions should be easy to find without mixing them into implementation references or domain-specific planning. This keeps the project understandable across conversations and gives future work a clear source for why AspAIre exists, what it is building toward, and which decisions have been accepted.

## Consequences

* Product direction and roadmap changes should update `docs/00-Project`.
* Material decisions should be recorded in `Decisions.md`.
* Project documents should stay focused on direction and decisions rather than detailed implementation inventory.
* Other documentation areas should align with project-level decisions.

---

# ASP-0011: Architecture Documents Define Platform Boundaries and Subsystem Contracts

## Status

Accepted

## Date

2026-07-22

## Context

AspAIre inherits a working Saigely platform with clear subsystem concerns, including the Next.js web application, external AI server, authentication, GraphQL, database access, frontend structure, and deployment.

These platform boundaries need durable documentation so product domains can be implemented without rediscovering inherited architecture through code archaeology.

## Decision

AspAIre will maintain `docs/01-Architecture` as the authoritative architecture documentation area.

Architecture documents define platform ownership boundaries, subsystem responsibilities, request flows, security posture, data ownership rules, and integration contracts for the inherited and evolving system.

## Rationale

Architecture documentation keeps platform concerns separate from product domain contracts. It preserves the core rule that the Next.js application owns business data and workflows while the external AI server owns AI execution and streaming.

## Consequences

* Platform or subsystem changes should update the relevant architecture document.
* Domain docs should reference architecture boundaries rather than redefining them.
* AI server, GraphQL, authentication, database, frontend, and deployment behavior should remain documented in focused architecture files.
* Architecture documents should describe current and intended system behavior at a level useful for implementation planning.

---

# ASP-0012: Development Documents Define Contribution, Testing, and Implementation Standards

## Status

Accepted

## Date

2026-07-22

## Context

AspAIre development should remain consistent with inherited Saigely patterns while product domains are added as vertical slices.

The project needs durable guidance for coding standards, component patterns, contribution workflow, and testing expectations.

## Decision

AspAIre will maintain `docs/03-Development` as the authoritative development-practice documentation area.

Development documents define implementation standards, component guidance, testing approach, and contribution expectations.

## Rationale

Development guidance should be separate from product direction, architecture contracts, and reference inventories. This allows contributors to understand how work should be implemented without turning architecture or domain docs into style guides.

## Consequences

* Changes to coding conventions, testing strategy, contribution flow, or component standards should update `docs/03-Development`.
* Domain implementation should follow development standards unless a documented decision creates an exception.
* Development docs should stay practical and implementation-facing.
* Standards should prefer existing project patterns over new conventions without a documented reason.

---

# ASP-0013: Reference Documents Define Implementation-Aligned Technical Inventories

## Status

Accepted

## Date

2026-07-22

## Context

AspAIre needs stable technical references for details that should match implementation state, including database schema, GraphQL schema, environment variables, and third-party services.

These references are different from architecture documents because they are inventories and lookup materials rather than design explanations.

## Decision

AspAIre will maintain `docs/04-Reference` as the authoritative technical reference documentation area.

Reference documents define implementation-aligned inventories for schemas, environment variables, third-party services, and other operational facts that need to stay current with the codebase.

## Rationale

Reference documentation helps developers inspect the system quickly without reading implementation code or higher-level architecture prose. Keeping reference material separate makes it easier to update factual inventories when implementation changes.

## Consequences

* Database, GraphQL, environment, and third-party service changes should update the relevant reference document.
* Reference docs should describe actual or intentionally planned implementation details clearly.
* Reference docs should not store secrets, credentials, tokens, or private deployment values.
* Architecture and domain docs should link conceptually to references when exact inventories are needed.

---

# ASP-0014: AspAIre MVP Is Defined as a Focused Profile-Resume-Job-Analysis-Tracking Workflow

## Status

Accepted

## Date

2026-07-22

## Context

AspAIre has a broad long-term roadmap that includes career profile, resume library, saved jobs, resume analysis, application tracking, interview preparation, AI workspace, market research, personalization, and release readiness.

As a solo-developer project, treating each roadmap phase as a full product build before proving the core loop would create too much scope and delay useful feedback.

## Decision

AspAIre's MVP will be defined as a focused workflow where an authenticated user can create career context, store resume content, save a job opportunity, run AI-assisted resume-to-job fit analysis, and track the opportunity's status and next action.

The authoritative MVP scope and development sequence are documented in `docs/00-Project/MVP.md`.

## Rationale

This MVP compresses the most important early domains into one coherent vertical slice. It proves the product's central promise while avoiding premature investment in job scraping, employer workflows, document parsing, calendar integrations, autonomous application flows, and advanced personalization.

## Consequences

* MVP implementation should prioritize the profile-resume-job-analysis-tracking loop over isolated roadmap phases.
* Manual job and resume entry are acceptable for the MVP if they keep development focused.
* AI work should first prove value through fit analysis using persisted user context.
* Post-MVP features should be chosen based on real usage of the core workflow.

---

# ASP-0015: Conversation Documents Are Scoped by Domain and Domain Object ID

## Status

Accepted

## Date

2026-07-22

## Context

AspAIre inherits MongoDB-backed conversation persistence from Saigely. The inherited document model stores conversations by `userId` with an array of message turns.

AspAIre's MVP introduces domain-specific workflows such as career profile, resume library, saved jobs, resume analysis, application tracking, and interview preparation. These workflows need a way to list conversations for a specific user and a specific domain object, such as conversations attached to a saved job or resume analysis.

## Decision

AspAIre conversation documents will include conversation-level domain metadata:

* `domain`
* `domainId`

Message turns will remain simple role/content/timestamp records. Domain scoping belongs to the conversation document, not to each message.

Conversation lists may be queried by authenticated `userId` plus optional `domain` and `domainId` filters.

## Rationale

Conversation-level scoping matches how MongoDB stores the conversation as a document. It enables efficient user/domain conversation lists without duplicating metadata across every turn.

Keeping messages unchanged preserves compatibility with inherited conversations and avoids making the turn schema carry workflow ownership concerns.

## Consequences

* New scoped conversations should store `domain` and `domainId` on the conversation document.
* Legacy conversations without domain metadata resolve as `domain: general` and `domainId: null`.
* MongoDB indexes should support `userId`, `domain`, `domainId`, and `updatedAt` lookups.
* Domain-specific product slices can attach conversations to their own records without changing the message schema.
* If future workflows need mixed-domain conversations, the project should revisit this decision before adding message-level domain fields.

---

# ASP-0016: Google OAuth Is the MVP Sign-In Provider and GitHub OAuth Is Optional

## Status

Accepted

## Date

2026-07-22

## Context

AspAIre uses Better Auth for authentication and inherited OAuth support for GitHub and Google. GitHub OAuth setup creates friction because callback URI changes require additional credential work. Google OAuth is sufficient for the MVP sign-in path.

## Decision

Google OAuth will be the primary MVP sign-in provider.

GitHub OAuth will remain supported by the codebase but optional. OAuth providers are registered only when their server-side client ID and client secret are both present. The login UI uses public feature flags to decide which provider buttons to show.

## Rationale

This keeps MVP authentication simple while preserving the ability to re-enable GitHub later. Conditional provider registration prevents missing optional credentials from breaking local development or deployment.

## Consequences

* Local MVP setup only requires Google OAuth credentials.
* GitHub OAuth credentials can be omitted.
* GitHub sign-in should remain hidden unless explicitly enabled.
* Environment documentation should distinguish server-side provider credentials from browser-visible login button flags.

---

# ASP-0017: JWT Issuer and Audience Are Explicit Environment-Defined Service Identifiers

## Status

Accepted

## Date

2026-07-22

## Context

AspAIre inherited Saigely JWT issuer and audience values. The web application issues short-lived JWTs through Better Auth, GraphQL verifies bearer tokens from the AI server, and the AI server verifies browser-provided tokens before accepting WebSocket chat traffic.

These values must match across services. Hardcoded claim values make environment transitions harder and risk retaining inherited product names.

## Decision

JWT issuer and audience will be required environment variables in both services.

Recommended MVP values:

```text
JWT_ISSUER=aspaire-web
JWT_AUDIENCE=aspaire-ai-server
```

Runtime code should read these values from environment variables rather than hardcoding them.

## Rationale

Environment-defined service identifiers make the authentication contract explicit and coordinated across web and AI server deployments.

Using stable service names instead of origins avoids changing JWT claims for every deployment URL while still clearly identifying the issuer and intended audience.

## Consequences

* Web and AI server environments must define matching `JWT_ISSUER` and `JWT_AUDIENCE` values.
* Changing either value requires a coordinated deployment.
* Missing values should fail fast rather than silently falling back to inherited names.
* Documentation and examples should use `aspaire-web` and `aspaire-ai-server` for the MVP.

---

# ASP-0018: Email/Password Authentication Is Disabled by Default for the MVP

## Status

Accepted

## Date

2026-07-22

## Context

AspAIre's MVP sign-in path is Google OAuth. GitHub OAuth remains optional, and the current login UI does not provide an email/password flow.

Leaving email/password authentication enabled without a supported UI, password reset flow, verification policy, and account-management experience would create an unused authentication surface.

## Decision

Email/password authentication will be disabled by default for the MVP.

It may be enabled explicitly with:

```text
ENABLE_EMAIL_PASSWORD_AUTH=true
```

## Rationale

OAuth-only MVP authentication reduces setup and security scope while preserving a straightforward user sign-in path.

Keeping email/password behind an environment flag allows future development without removing Better Auth support entirely.

## Consequences

* MVP local setup should use Google OAuth.
* Email/password routes should not be treated as an active user-facing feature unless explicitly enabled.
* Enabling email/password later should include UI, validation, password reset/recovery, and documentation work.
* Auth documentation should make the default disabled state clear.

---

# ASP-0019: Default AI Reference Data Is Managed by an Idempotent Seed Script

## Status

Accepted

## Date

2026-07-23

## Context

AspAIre depends on baseline AI reference data for the chat workspace and user preferences. The relevant records include AI models, AI agents, reasoning levels, and verbosity levels.

These records are application-owned relational data, but they are closer to configurable reference data than user-created domain records. Local development and new database setup need a repeatable way to create or refresh them without manually editing tables.

The default AI model catalog should balance current frontier capability with practical cost control for a career workspace. GPT-5.6 models are available for current frontier quality, but GPT-5.5 remains a strong prior-frontier option that may be a better value for many workflows.

## Decision

AspAIre will manage default AI reference data through an idempotent npm seed command:

```text
npm run seed:defaults
```

The command runs the web workspace seed script and creates or updates:

* Default AI models
* Default AI agents
* Default reasoning levels
* Default verbosity levels

The default model seed should include:

* GPT-5.6 Sol as the highest capability and highest cost option
* GPT-5.6 Terra as a balanced current GPT-5.6 option
* GPT-5.6 Luna as the cost-effective GPT-5.6 option
* GPT-5.5 as a strong prior-frontier value option
* GPT-5.1 and GPT-5 Mini as stable fallback and cost-conscious options
* GPT-4.1 and GPT-4.1 Mini for non-reasoning compatibility

Seed behavior should use upsert semantics so the command can be rerun safely during local setup, baseline repair, and controlled reference-data updates.

## Rationale

An explicit seed command makes database baseline setup predictable and keeps required AI options aligned with the application code. Idempotent behavior avoids duplicate records and lets developers refresh reference data after schema pushes, database resets, or default prompt/model changes.

Keeping this functionality in the web workspace preserves the architecture rule that the Next.js application owns business data and persistence.

## Consequences

* New local databases should run `npm run seed:defaults` after schema setup.
* Changes to default AI models, agents, reasoning levels, or verbosity levels should update the seed source and related documentation.
* Model descriptions should stay concise, user-facing, and cost-aware where cost materially affects model choice.
* The AI server should continue consuming these values through GraphQL and must not seed or own the data directly.
* The seed command writes to the configured `DATABASE_URL`, so developers must verify the target environment before running it.

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
