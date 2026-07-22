# MarketResearch.md

# Market Research Domain

## Purpose

The Market Research domain helps users understand roles, companies, industries, compensation signals, skill demand, hiring patterns, and career options.

Research should connect back to the user's goals and job-search decisions rather than existing as isolated browsing or generic AI output.

---

# Domain Status

## Current State

The Market Research domain is planned but not yet implemented.

No production market research schema, repository, GraphQL operations, AI workflow, external research integration, or research UI currently exists for this domain.

## Roadmap Phase

Market Research belongs to Phase 8: AI Workspace and Research.

## Primary Outcome

Users can perform and preserve career-relevant research that helps them choose roles, evaluate companies, understand market patterns, and improve search strategy.

---

# Domain Ownership

The Next.js web application owns persisted Market Research data and user workflows.

Ownership includes:

* Research topics
* Saved research notes or outputs
* Relationships to roles, companies, saved jobs, and career goals
* Validation
* Authorization
* Persistence
* GraphQL schema and resolvers
* User interface
* Business rules

The external AI server may execute AI research workflows, but persisted research records belong to the web application.

---

# Product Goals

Market Research should:

* Help users make better career and job-search decisions
* Connect research to career profile goals and preferences
* Preserve useful findings for later review
* Support company, role, industry, skill, and compensation exploration
* Identify recurring market patterns across saved jobs and searches
* Keep AI research grounded in user context and visible sources where available

The domain should answer: "What am I learning about the market, and how should it affect my search?"

---

# User Capabilities

Initial capabilities should include:

* Create a research topic
* Save research notes
* Save AI-generated research summaries
* Link research to saved jobs, companies, roles, or goals
* View prior research
* Search or filter saved research

Later capabilities may include:

* Company research workflows
* Role research workflows
* Skill-demand summaries
* Compensation research
* Market trend comparisons
* Research citations or source tracking
* Recurring insight generation from saved jobs

---

# Core Concepts

## Research Topic

A research topic represents a user question or area of investigation.

Expected fields include:

* Title
* Research type
* Prompt or question
* Status
* Created timestamp
* Updated timestamp

Research types may include company, role, industry, skill, compensation, location, and career path.

## Research Output

A research output is a saved result from AI-assisted or user-authored research.

Expected fields include:

* Topic ID
* Title
* Summary
* Findings
* Implications
* Sources or source notes where available
* Created timestamp

Research outputs should distinguish findings from user decisions or notes.

## Research Note

A research note captures the user's interpretation, questions, or decisions.

Expected fields include:

* Topic ID
* Note text
* Created timestamp
* Updated timestamp

## Research Link

A research link connects research to other domain records.

Expected relationships include:

* Career goal
* Saved job
* Application
* Company
* Resume analysis
* Search query

Relationships should be optional and user-scoped.

---

# Data Model Direction

Market Research data should default to PostgreSQL through Drizzle for saved topics, outputs, notes, and relationships.

Expected table direction:

* `market_research_topics`
* `market_research_outputs`
* `market_research_notes`
* `market_research_links`

Each table should include:

* Stable primary key
* Owning `user_id`
* Timestamps
* Research type or status fields where appropriate
* Relationship fields for linked domain records

If long-form research conversations are reused from AI Workspace, store conversation references rather than duplicating full message history.

---

# Authorization Rules

Market Research data is private user-owned data.

Resolvers and repositories must:

* Require authentication for all research operations
* Scope reads and writes to `context.user.id`
* Verify ownership of linked domain records
* Prevent users from accessing another user's research
* Avoid accepting `userId` from client input where it can be derived from the authenticated context

---

# GraphQL API Direction

Initial query direction:

* `marketResearchTopics`
* `marketResearchTopic`
* `marketResearchOutputs`
* `marketResearchForSavedJob`

Initial mutation direction:

* `createMarketResearchTopic`
* `updateMarketResearchTopic`
* `deleteMarketResearchTopic`
* `saveMarketResearchOutput`
* `updateMarketResearchOutput`
* `deleteMarketResearchOutput`
* `addMarketResearchNote`
* `updateMarketResearchNote`
* `deleteMarketResearchNote`
* `linkMarketResearchRecord`
* `unlinkMarketResearchRecord`

External source fetching, if added, should have separate provider and citation rules.

---

# Repository Direction

Expected repository responsibilities include:

* Create and update research topics
* List topics for an authenticated user
* Fetch topic detail by ID and user ID
* Save outputs and notes
* Manage links to domain records
* Enforce user scoping
* Return domain-shaped objects suitable for GraphQL resolvers

The repository should not browse the web or call AI services. Research execution should be coordinated by application-layer workflows and AI server calls.

---

# UI Direction

Expected views:

* Research topic list
* Research topic detail
* Create research topic
* Saved output detail
* Notes editor
* Linked records panel

Useful interface patterns include:

* Research type filters
* Compact saved findings
* Clear links to related jobs, applications, or goals
* Source notes where available
* Save from AI Workspace action
* Empty state that suggests useful research topics

The UI should help users reuse research, not bury it as conversation history.

---

# AI Usage

Initial AI uses include:

* Company research summaries
* Role and skill-demand exploration
* Search strategy suggestions
* Market pattern summaries from saved jobs
* Career path comparison

Potential later AI features include:

* Long-running research workflows
* Source-backed research reports
* Compensation trend summaries
* Personalized market recommendations
* Repeated pattern detection across job searches

AI-generated research should separate known facts, source-linked claims, and inferred guidance where practical.

---

# Validation Rules

Recommended rules:

* Research title should be required
* Research type should come from a known allowlist
* Linked records must belong to the authenticated user
* Research output length should have reasonable limits
* Source URLs should be validated when present
* Empty notes should not be saved

---

# Privacy and Sensitivity

The application should avoid logging:

* User research questions containing private career goals
* Full AI prompts
* Full AI research outputs
* Linked private domain context
* Compensation expectations or work authorization details

If external research providers are introduced, document what user context is sent to them.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Repository user scoping
* Resolver authentication checks
* Linked-record ownership validation
* Creating and updating research topics
* Saving outputs and notes
* Linking and unlinking domain records
* UI behavior for empty, linked, and populated research states where practical

---

# Integration Points

Market Research should eventually integrate with:

* Career Profile for goals and preferences
* Job Search for search strategy
* Saved Jobs for market pattern analysis
* Application Tracking for company and role context
* Interview Preparation for company research
* AI Workspace for research conversations
* User Preferences for defaults and personalization

---

# Initial Implementation Slice

Recommended scope:

* Create and manage research topics
* Save notes and AI-generated outputs
* Link research to saved jobs or career goals
* Research topic list and detail UI
* Repository
* GraphQL query and mutations
* Tests for authorization, ownership, persistence, and validation

Provider-backed live research and source citation workflows can follow later.

---

# Open Questions

* Should Market Research be a standalone domain in the first docs hierarchy?
* Should research begin inside AI Workspace or have its own first-class UI?
* What research types should be modeled first?
* Should sources be first-class records in the first slice?
* How should AI distinguish sourced facts from inference?
* Which linked records matter most in the first implementation?

---

# Definition of Done

The Market Research domain is complete for its foundation phase when:

* Authenticated users can create and save career-relevant research
* Research data persists in application-owned storage
* GraphQL operations enforce authentication and ownership
* Research can link to relevant user-owned domain records
* The UI supports topic review, notes, and saved outputs
* Tests cover important authorization, ownership, and persistence paths
* Database and GraphQL reference docs are updated to match the implementation

