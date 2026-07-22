# JobSearch.md

# Job Search Domain

## Purpose

The Job Search domain helps users discover, import, evaluate, and organize job opportunities before deciding which roles to save and track.

It is the discovery and intake side of AspAIre's opportunity workflow. It should help users find relevant roles, generate better search terms, capture postings from external sources, and move promising opportunities into Saved Jobs.

Job Search should reduce the friction of finding and recording opportunities without turning AspAIre into an employer-facing job board.

---

# Domain Status

## Current State

The Job Search domain is planned but not yet implemented.

No production job search schema, repository, GraphQL operations, external search integration, import workflow, or job search UI currently exists for this domain.

## Roadmap Phase

Job Search belongs to Phase 4: Job Search and Saved Jobs.

## Primary Outcome

Users can discover or enter job opportunities, evaluate basic relevance, and save promising roles into AspAIre for later analysis and tracking.

---

# Domain Ownership

The Next.js web application owns the Job Search domain.

Ownership includes:

* Search workflows
* Search query history if persisted
* Manual job entry
* Job import and normalization
* Validation
* Authorization
* Persistence for application-owned search records
* GraphQL schema and resolvers
* User interface
* Business rules
* AI-context preparation

External job boards, search APIs, or scraping services are not owned by AspAIre. If third-party job discovery is introduced, AspAIre should store only the data needed for the user's workflow and document provider constraints.

---

# Product Goals

Job Search should:

* Help users find roles that fit their skills, goals, and preferences
* Support manual entry when external discovery is unavailable or insufficient
* Preserve enough posting information to create useful saved jobs
* Generate better search terms using career profile context
* Reduce repeated search setup across job boards
* Keep the product focused on the user-side job search workflow

The domain should make discovery practical, but Saved Jobs should remain the durable opportunity system of record.

---

# User Capabilities

Initial capabilities should include:

* Manually enter a job opportunity
* Paste a job description or posting text
* Capture source URL and source name
* Extract or enter company and role information
* Review imported job details before saving
* Save an opportunity to Saved Jobs
* Generate search keywords or Boolean-style search terms
* View recent search or import activity if persisted

Later capabilities may include:

* Search external job providers from inside AspAIre
* Import jobs from supported job board URLs
* De-duplicate imported opportunities
* Rank discovered jobs by preference fit
* Save search templates
* Track job market patterns across searches
* Alert users to stale postings or repeated companies

---

# Core Concepts

## Job Search Query

A job search query represents the user's search intent.

Expected fields include:

* Search text
* Target roles
* Target locations
* Remote or work-mode preferences
* Employment type
* Seniority level
* Industry or company filters
* Created timestamp

Search queries may be transient in the first implementation. Persist them only if they support useful history, saved searches, or later personalization.

## Search Term Suggestion

A search term suggestion is an AI-assisted or rule-based recommendation for where and how to search.

Expected fields include:

* Suggested term
* Search intent
* Source context
* Target role or skill
* Created timestamp

Search term suggestions should be reviewable and editable by the user before use.

## Job Import

A job import represents a user-provided or externally fetched posting before it becomes a saved job.

Expected fields include:

* Source URL
* Source name
* Raw posting text
* Extracted title
* Extracted company
* Extracted location
* Extracted work mode
* Extracted employment type
* Extracted compensation text
* Extraction status

Imports should be treated as drafts until the user chooses to save them.

## Job Search Result

A job search result represents an opportunity returned by a search provider or parsed from an import flow.

Expected fields include:

* External identifier if available
* Source provider
* Source URL
* Title
* Company
* Location
* Posted date if available
* Short description
* Relevance signals if available

Search results may be transient unless the user saves the job.

## Search Provider

A search provider is an external source used for discovery.

Examples may include job board APIs, company career sites, or user-pasted postings. Provider-specific behavior should be isolated so the domain model does not depend on one vendor.

---

# Data Model Direction

Job Search data should default to PostgreSQL through Drizzle only when the data needs to persist.

The first implementation may avoid a large search schema by supporting manual job entry and import-to-saved-job workflows. Search results from external providers can remain transient until saved.

Expected table direction if persistence is needed:

* `job_search_queries`
* `job_search_imports`
* `job_search_results`
* `job_search_term_suggestions`

Each persisted table should include:

* Stable primary key
* Owning `user_id`
* Timestamps
* Source metadata
* Status fields where appropriate

The durable opportunity record belongs to Saved Jobs. Job Search should not duplicate the saved job data model unless a snapshot is needed for import review or provider troubleshooting.

---

# Authorization Rules

Job Search data is user-owned when persisted.

Resolvers and repositories must:

* Require authentication for persisted search and import operations
* Scope reads and writes to `context.user.id`
* Prevent users from accessing another user's saved searches, imports, or suggestions
* Avoid accepting `userId` from client input where it can be derived from the authenticated context
* Verify ownership before converting an import or result into a saved job

External search results that are not persisted should still be handled through authenticated workflows if they use user profile context or private preferences.

---

# GraphQL API Direction

The Job Search domain should expose operations for generating search terms, importing job text, and creating saved jobs from reviewed input.

Initial query direction:

* `jobSearchImports`
* `jobSearchImport`
* `jobSearchTermSuggestions`

Initial mutation direction:

* `generateJobSearchTerms`
* `createJobSearchImport`
* `updateJobSearchImport`
* `deleteJobSearchImport`
* `extractJobDetailsFromImport`
* `saveJobFromImport`

If external search providers are introduced, provider-backed search operations should be designed with rate limits, provider errors, caching, and result freshness in mind.

Resolvers should validate authentication first, then delegate persistence to job search and saved job repositories as appropriate.

---

# Repository Direction

The repository should own persistence behavior for search records and imports.

Expected repository responsibilities include:

* Create and update job import records
* List imports for an authenticated user
* Fetch import detail by ID and user ID
* Save generated search term suggestions if persistence is needed
* Delete or archive imports
* Return domain-shaped objects suitable for GraphQL resolvers

The repository should not own saved job persistence. Converting reviewed import data into a saved job should call the Saved Jobs repository through an application-layer workflow.

---

# UI Direction

The initial Job Search UI should focus on job intake and practical discovery support.

Expected views:

* Manual job entry
* Paste/import job posting
* Import review
* Search term generator
* Recent imports if persisted

Useful interface patterns include:

* Clear source URL and posting text inputs
* Extracted field review before saving
* Editable generated search terms
* Save-to-Saved-Jobs action
* Duplicate warning if a similar saved job already exists
* Empty state that encourages manual entry or search term generation

The UI should not require external search integration before the user can record opportunities.

---

# AI Usage

Job Search can use AI to improve discovery and intake, but AI should remain tied to user action.

Initial AI-adjacent uses include:

* Generating search terms from career profile and preferences
* Extracting structured fields from pasted job posting text
* Summarizing imported postings before saving
* Identifying possible role level, work mode, or required skills

Potential later AI features include:

* Ranking search results by user fit
* Suggesting adjacent role titles
* Detecting recurring market patterns
* Recommending companies or search channels
* Building saved search templates

AI-generated extraction should be reviewable before it creates durable saved job records.

---

# Validation Rules

Initial validation should protect data quality and avoid brittle imports.

Recommended rules:

* Manual job title should be required before saving to Saved Jobs
* Company name should be required before saving where available
* Source URL should be validated when present
* Pasted job text should have minimum and maximum length limits
* Search term generation should tolerate incomplete career profiles
* Import extraction should preserve raw text when available
* Duplicate detection should warn rather than block unless there is a clear exact match

Validation should occur before creating durable saved job records.

---

# Privacy and Sensitivity

Job Search may use private career profile and preference context to generate search terms or rank opportunities.

The application should avoid logging:

* Full pasted job descriptions
* Private career profile context used for search generation
* AI prompts containing user preferences
* Provider tokens or API credentials
* Full AI outputs derived from private user context

Any third-party provider integration should document what user data is sent outside AspAIre.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Repository user scoping for persisted imports
* Resolver authentication checks
* Creating and updating imports
* Converting an import into a saved job
* Source URL and posting text validation
* Duplicate warning behavior where practical
* AI extraction failure states if AI extraction is included
* UI behavior for manual entry, import review, and empty states where practical

Testing should prioritize the import-to-saved-job boundary because that is where transient discovery data becomes durable product data.

---

# Integration Points

Job Search should eventually integrate with:

* Career Profile for search terms and preference-aware discovery
* Saved Jobs for durable opportunity storage
* Resume Analysis for later fit evaluation
* Application Tracking for converting saved opportunities into pipeline items
* AI Workspace for exploratory research and search strategy
* Market Research for recurring trends across searches
* User Preferences for search defaults

The domain should feed Saved Jobs without becoming the long-term owner of opportunity records.

---

# Initial Implementation Slice

The first implementation slice should support useful job intake without depending on external search APIs.

Recommended scope:

* Manual job entry
* Paste/import job posting text
* Review extracted or manually entered job details
* Save reviewed job into Saved Jobs
* Generate basic search term suggestions from profile and preferences
* Repository for persisted imports if import drafts are saved
* GraphQL operations for import and save workflows
* Basic tests for authorization, validation, and import-to-saved-job behavior

External provider search, saved search templates, and result ranking can follow after the core intake workflow is stable.

---

# Open Questions

These questions should be resolved before or during implementation:

* Should the first version persist import drafts or only create saved jobs?
* Should AI extraction be included in the first job intake slice?
* Which external search providers, if any, should be considered later?
* Should generated search terms be saved as history?
* What duplicate detection rules should run before saving a job?
* How much raw posting text should be retained after saving?
* What user profile fields should be used for search term generation by default?

---

# Definition of Done

The Job Search domain is complete for its foundation phase when:

* Authenticated users can manually enter or import job opportunity details
* Users can review job details before saving
* Reviewed opportunities can become Saved Jobs
* GraphQL operations enforce authentication and ownership
* Search term generation or search support works with available profile context
* The UI supports job intake without requiring an external provider
* Tests cover important authorization, validation, and conversion paths
* Database and GraphQL reference docs are updated to match the implementation

