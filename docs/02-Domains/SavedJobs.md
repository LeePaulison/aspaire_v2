# SavedJobs.md

# Saved Jobs Domain

## Purpose

The Saved Jobs domain stores job opportunities the user wants to evaluate, revisit, analyze, or track.

It is the durable opportunity record in AspAIre. Saved Jobs preserve role details, company information, source metadata, posting text, user notes, interest signals, and AI-generated summaries where appropriate.

Saved Jobs should turn scattered postings into a reliable collection of opportunities that can connect to resume analysis, application tracking, interview preparation, and market research.

---

# Domain Status

## Current State

The Saved Jobs domain is planned but not yet implemented.

No production saved job schema, repository, GraphQL operations, job detail UI, or saved jobs workflow currently exists for this domain.

## Roadmap Phase

Saved Jobs belongs to Phase 4: Job Search and Saved Jobs.

## Primary Outcome

Users can save, view, organize, and understand job opportunities that can later be analyzed, tracked, and connected to applications.

---

# Domain Ownership

The Next.js web application owns the Saved Jobs domain.

Ownership includes:

* Saved job data model
* Company and role metadata
* Posting text and source metadata
* User notes and interest state
* Validation
* Authorization
* Persistence
* GraphQL schema and resolvers
* User interface
* Business rules
* AI-generated summaries and fit signals once persisted

The external AI server may summarize or analyze saved job content, but saved job records and persisted AI outputs belong to the web application.

---

# Product Goals

Saved Jobs should:

* Give users one reliable place to keep opportunities they care about
* Preserve enough posting detail for future analysis and preparation
* Make saved opportunities easy to scan, filter, and revisit
* Support notes, interest level, and lightweight status before application tracking
* Connect opportunities to resumes, analyses, and applications
* Preserve source metadata so users can return to the original posting

Saved Jobs should be useful before the user formally applies.

---

# User Capabilities

Initial capabilities should include:

* Save a job opportunity
* View saved jobs list
* View saved job detail
* Edit job details
* Add and edit user notes
* Track interest level
* Store source URL and posting metadata
* Archive or delete saved jobs
* Identify duplicate or similar saved jobs where practical

Later capabilities may include:

* AI-generated job summaries
* AI-generated fit signals
* Attach preferred resume
* Convert saved job into an application
* Track follow-up reminders
* Compare saved jobs
* Organize jobs by tags or custom lists
* Surface stale postings or missing next actions

---

# Core Concepts

## Saved Job

A saved job is a user-owned opportunity record.

Expected fields include:

* Job title
* Company name
* Location
* Work mode
* Employment type
* Seniority level
* Compensation text or range
* Source URL
* Source name
* Posting text
* Posting date if available
* Saved timestamp
* Updated timestamp
* Status
* Interest level

Saved jobs should tolerate incomplete data because job postings vary widely in quality and structure.

## Company Snapshot

A company snapshot captures company information relevant to a saved opportunity.

Expected fields include:

* Company name
* Website
* Industry
* Company size
* Headquarters or primary location
* Notes

The initial implementation can store company fields directly on the saved job. A normalized company model should wait until there is a clear need to manage companies independently.

## Posting Snapshot

A posting snapshot preserves the role information available when the user saved the opportunity.

Expected fields include:

* Raw posting text
* Extracted responsibilities
* Extracted requirements
* Extracted benefits
* Extracted compensation text
* Posted date
* Closing date if available

The snapshot matters because external job postings can change or disappear.

## User Notes

User notes capture the user's own evaluation and context.

Expected fields include:

* Notes text
* Interest rationale
* Questions to research
* Concerns or dealbreakers
* Follow-up thoughts

Notes can begin as a field on the saved job. Separate note records may be introduced later if history, timestamps, or activity streams become important.

## Saved Job Status

Saved job status describes the user's relationship to the opportunity before or outside formal application tracking.

Initial statuses may include:

* Saved
* Interested
* Researching
* Applied
* Archived

Once Application Tracking exists, application stage should belong there. Saved job status should not become a duplicate application pipeline.

## Interest Level

Interest level gives the user a quick prioritization signal.

Initial values may include:

* Low
* Medium
* High

Interest level should remain user-controlled. AI may suggest prioritization later, but the user owns the final signal.

---

# Data Model Direction

Saved Jobs data should default to PostgreSQL through Drizzle because it is structured, relational, user-owned application data.

Expected table direction:

* `saved_jobs`
* `saved_job_notes`
* `saved_job_summaries`
* `saved_job_tags`

Each table should include:

* Stable primary key
* Owning `user_id`
* Timestamps
* Source metadata
* Status fields where appropriate
* Relationship fields for future resume analyses and applications

The initial implementation can keep notes, summary, and tags on the saved job record if separate tables would add complexity without immediate value.

---

# Authorization Rules

Saved job data is private user-owned data.

Resolvers and repositories must:

* Require authentication for all saved job operations
* Scope reads and writes to `context.user.id`
* Prevent users from accessing another user's saved jobs, notes, summaries, or derived analysis
* Avoid accepting `userId` from client input where it can be derived from the authenticated context
* Verify ownership before linking saved jobs to resume analysis or applications

Any future shared job lists or exports should be designed as explicit sharing features with separate access rules.

---

# GraphQL API Direction

The Saved Jobs domain should expose operations for list, detail, creation, updates, and lifecycle actions.

Initial query direction:

* `savedJobs`
* `savedJob`
* `savedJobBySourceUrl`

Initial mutation direction:

* `createSavedJob`
* `updateSavedJob`
* `deleteSavedJob`
* `archiveSavedJob`
* `restoreSavedJob`
* `updateSavedJobNotes`
* `updateSavedJobInterest`
* `summarizeSavedJob`

If AI summarization is deferred, `summarizeSavedJob` can be added later. The first slice should not depend on AI summary generation to make saved jobs useful.

Resolvers should validate authentication first, then delegate persistence to a saved jobs repository.

---

# Repository Direction

The repository should own all persistence behavior for saved jobs.

Expected repository responsibilities include:

* List saved jobs for an authenticated user
* Fetch saved job detail by ID and user ID
* Create saved jobs from manual entry or job imports
* Update saved job fields
* Update notes and interest level
* Archive, restore, or delete saved jobs
* Check possible duplicates by source URL or normalized title and company
* Return domain-shaped objects suitable for GraphQL resolvers

The repository should not call AI services directly. AI summarization should be coordinated by an application-layer workflow and persisted through the repository after validation.

---

# UI Direction

The initial Saved Jobs UI should make opportunities easy to scan and revisit.

Expected views:

* Saved jobs list
* Saved job detail
* Add saved job
* Edit saved job
* Notes editor
* Archived saved jobs view or filter

Useful interface patterns include:

* Dense, scannable list rows
* Status and interest filters
* Company, title, location, and source display
* Clear source link
* Notes preview
* Actions for analyze, apply, archive, and edit
* Empty state that points users toward job intake

The UI should prioritize repeated review and comparison over decorative presentation.

---

# AI Usage

Saved Jobs can use AI to make postings easier to understand and compare.

Initial AI-adjacent uses include:

* Summarizing long job descriptions
* Extracting responsibilities, requirements, and skills
* Highlighting possible fit signals from career profile context
* Suggesting questions to research before applying

Potential later AI features include:

* Prioritizing saved jobs
* Detecting missing resume evidence for a role
* Suggesting application next actions
* Generating interview prep starting points
* Identifying recurring skills across saved jobs

AI-generated summaries and signals should be reviewable and clearly separate from user-entered notes.

---

# Validation Rules

Initial validation should protect opportunity quality without rejecting imperfect postings.

Recommended rules:

* Job title should be required
* Company name should be required where known
* Source URL should be validated when present
* Posting text should have a reasonable maximum length
* Interest level should come from a known allowlist
* Status should come from a known allowlist
* Duplicate source URLs should warn or update rather than silently create duplicates
* Archived jobs should remain readable unless deleted

Validation should support manual entry and imported jobs with partial data.

---

# Privacy and Sensitivity

Saved Jobs may contain private notes, career preferences, and AI-derived fit information.

The application should avoid logging:

* Full posting text
* User notes
* AI prompts containing career profile or resume context
* AI outputs derived from private user context
* Compensation expectations or work authorization details

Source URLs and public job metadata are less sensitive, but logs should still avoid unnecessary user activity trails.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Repository user scoping
* Resolver authentication checks
* Creating, updating, listing, and fetching saved jobs
* Notes and interest updates
* Archive, restore, and delete behavior
* Duplicate source URL handling where practical
* Ownership checks before analysis or application links
* UI behavior for empty, active, filtered, and archived states where practical

Testing should prioritize authorization, persistence correctness, and the conversion boundary from job intake to saved job.

---

# Integration Points

Saved Jobs should eventually integrate with:

* Job Search for import and discovery workflows
* Career Profile for fit signals and search preferences
* Resume Library for selecting relevant resume assets
* Resume Analysis for resume-to-job comparison
* Application Tracking for converting saved roles into pipeline items
* Interview Preparation for role-specific preparation
* AI Workspace for company and role research
* Market Research for patterns across saved opportunities

Saved Jobs should be the durable opportunity source that downstream workflows reference by ID.

---

# Initial Implementation Slice

The first implementation slice should create a usable opportunity library.

Recommended scope:

* Create saved job from manual entry or job import
* Saved jobs list
* Saved job detail
* Edit core job fields
* Notes and interest level
* Archive or delete behavior
* Repository
* GraphQL query and mutations
* Basic tests for authorization, persistence, validation, and duplicate handling

AI summaries, tags, and application conversion can follow once saved opportunities are stable.

---

# Open Questions

These questions should be resolved before or during implementation:

* Should company data be normalized immediately or stored on each saved job first?
* Should notes be a single field or separate timestamped records?
* Which statuses belong to Saved Jobs before Application Tracking exists?
* Should duplicate source URLs block creation or present a merge/update flow?
* Should AI job summaries ship in the first saved jobs slice?
* How much raw posting text should be retained?
* Should saved jobs support tags in the first version?

---

# Definition of Done

The Saved Jobs domain is complete for its foundation phase when:

* Authenticated users can save and manage job opportunities
* Saved job data persists in application-owned storage
* GraphQL operations enforce authentication and ownership
* The UI supports list, detail, edit, notes, and archive workflows
* Saved jobs can be referenced by future analysis and application workflows
* Duplicate handling is intentional and documented
* Tests cover important authorization, persistence, and validation paths
* Database and GraphQL reference docs are updated to match the implementation

