# ResumeLibrary.md

# Resume Library Domain

## Purpose

The Resume Library domain stores and manages the user's resume assets in AspAIre.

It gives users a reliable place to maintain multiple resume versions, preserve extracted resume content, and connect resume materials to job opportunities, analysis workflows, applications, and interview preparation.

The resume library should make resumes durable product data, not temporary uploads used by a single AI interaction.

---

# Domain Status

## Current State

The Resume Library domain is planned but not yet implemented.

No production resume schema, repository, GraphQL operations, file handling workflow, parsing workflow, or resume library UI currently exists for this domain.

## Roadmap Phase

Resume Library belongs to Phase 3: Resume Library.

## Primary Outcome

Users can store, view, manage, and reuse multiple resume versions that support later analysis, tailoring, application tracking, and AI workflows.

---

# Domain Ownership

The Next.js web application owns the Resume Library domain.

Ownership includes:

* Resume metadata
* Resume text and structured sections
* File upload and storage decisions
* Validation
* Authorization
* Persistence
* GraphQL schema and resolvers
* User interface
* Business rules
* AI-context preparation

The external AI server may parse, summarize, or analyze resume content when requested, but it must receive input through application-owned workflows and return results through GraphQL or another documented application boundary. It must not become the source of truth for resume data.

---

# Product Goals

The Resume Library should:

* Let users maintain more than one resume version
* Preserve resume content for reuse across the job search
* Support upload, manual entry, or imported text depending on implementation scope
* Make resume versions easy to compare, label, and select
* Provide reliable input to resume analysis and application workflows
* Avoid forcing users to repeatedly upload the same resume for every AI task

The library should feel like a practical document workspace, not a generic file bucket.

---

# User Capabilities

Initial capabilities should include:

* Add a resume
* View resume list
* View resume detail
* Rename or retitle a resume
* Edit resume metadata
* Store resume text
* Mark one resume as primary
* Archive or delete a resume
* Track when a resume was created and last updated
* Preserve enough content for future analysis

Later capabilities may include:

* Upload PDF, DOCX, or plain text resume files
* Extract structured resume sections
* Generate a resume from career profile data
* Duplicate a resume as a new version
* Compare resume versions
* Attach resumes to applications
* Track resume usage across saved jobs and applications
* AI-assisted resume cleanup and tailoring

---

# Core Concepts

## Resume

A resume is a user-owned career document stored in AspAIre.

Expected fields include:

* Title
* Description or notes
* Primary flag
* Status
* Source type
* Original filename
* Plain text content
* Structured content
* Created timestamp
* Updated timestamp

The initial implementation may support text-first resume entry before file upload is introduced.

## Resume Version

A resume version represents a distinct iteration of a resume.

Versioning may be explicit through a separate table or implicit through separate resume records with parent-child metadata. The first implementation should decide whether true version history is needed immediately or whether duplicating resumes as independent records is sufficient.

Expected fields include:

* Parent resume ID if applicable
* Version label
* Version notes
* Resume content snapshot
* Created timestamp
* Created-from source

## Resume File

A resume file is the uploaded artifact associated with a resume.

Expected fields include:

* Storage key or file reference
* Original filename
* MIME type
* File size
* Upload timestamp
* Text extraction status
* Parsing status

File storage should be documented before implementation. PostgreSQL should store metadata, not large binary file content.

## Extracted Content

Extracted content is the resume text and structured section data derived from a resume file or manual entry.

Expected sections include:

* Summary
* Experience
* Education
* Skills
* Projects
* Certifications
* Other sections

Structured extraction should preserve the source text when practical so AI and analysis workflows can reference the user's actual resume language.

## Resume Status

Resume status helps distinguish active materials from old or draft assets.

Initial statuses may include:

* Draft
* Active
* Archived

Only one resume may be primary at a time for a user.

---

# Data Model Direction

Resume Library data should default to PostgreSQL through Drizzle for user-owned metadata, structured content, relationships, and analysis links.

Large uploaded files should use a documented file storage strategy rather than being stored directly in PostgreSQL. If file upload is deferred, the first implementation can store resume text and metadata only.

Expected table direction:

* `resumes`
* `resume_versions`
* `resume_files`
* `resume_sections`

Each table should include:

* Stable primary key
* Owning `user_id`
* Timestamps
* Resume or version relationship fields
* Status fields where appropriate
* Source and extraction metadata where appropriate

The first implementation should avoid overbuilding version control. A clear duplicate-as-new-version workflow may be enough until real user behavior proves deeper history is needed.

---

# Authorization Rules

Resume data is private user-owned data.

Resolvers and repositories must:

* Require authentication for all resume operations
* Scope reads and writes to `context.user.id`
* Prevent users from accessing another user's resume content, metadata, files, or extracted text
* Avoid accepting `userId` from client input where it can be derived from the authenticated context
* Enforce ownership before linking resumes to analysis results, saved jobs, or applications

Resume content may include sensitive personal information and should be treated with the same care as profile data.

---

# GraphQL API Direction

The Resume Library domain should expose operations for list, detail, creation, update, and lifecycle actions.

Initial query direction:

* `resumes`
* `resume`
* `primaryResume`

Initial mutation direction:

* `createResume`
* `updateResume`
* `deleteResume`
* `archiveResume`
* `restoreResume`
* `setPrimaryResume`
* `duplicateResume`
* `updateResumeContent`
* `updateResumeSections`

If file upload is included in the first slice, upload mechanics should be designed separately because GraphQL file upload support has security and operational trade-offs. A signed upload URL or route-handler-based upload flow may be preferable.

Resolvers should validate authentication first, then delegate persistence to a resume repository.

---

# Repository Direction

The repository should own all persistence behavior for the domain.

Expected repository responsibilities include:

* List resumes for an authenticated user
* Fetch a resume detail by ID and user ID
* Create resume metadata and content records
* Update resume metadata
* Update resume text and structured sections
* Mark a resume as primary while clearing prior primary state
* Archive, restore, or delete resumes
* Duplicate a resume where supported
* Return domain-shaped objects suitable for GraphQL resolvers

The repository should not execute AI parsing or analysis. It may persist parsed results that have already been accepted by an application workflow.

---

# UI Direction

The initial Resume Library UI should make stored resumes easy to scan and manage.

Expected views:

* Resume list
* Resume detail
* Add resume
* Edit resume metadata
* Edit resume content
* Resume section review if structured extraction exists

Useful interface patterns include:

* Compact resume rows or cards
* Primary resume indicator
* Status filters
* Last-updated metadata
* Clear actions for edit, duplicate, archive, and analyze
* Empty state for users without resumes
* Preview of resume text or extracted sections

The UI should keep document management calm and efficient. It should not hide core actions behind AI-first flows.

---

# AI Usage

Resume Library provides important AI input, but the first implementation should treat AI as an assistant to the document workflow.

Initial AI-adjacent uses include:

* Extracting structured sections from uploaded resume text
* Summarizing resume strengths
* Preparing resume content for later resume analysis
* Helping users clean up formatting or wording

Potential later AI features include:

* Drafting a resume from the career profile
* Tailoring a resume toward a saved job
* Suggesting stronger bullet wording
* Detecting missing evidence or weak sections
* Comparing resume versions

AI-generated changes should be reviewable before they overwrite stored resume content.

---

# Validation Rules

Initial validation should protect resume quality and system safety.

Recommended rules:

* Resume title should be required
* Resume text should have a reasonable maximum length
* File type allowlist should be enforced if uploads are supported
* File size limits should be enforced if uploads are supported
* Empty resume content should be allowed only for drafts
* Only one primary resume should exist per user
* Archived resumes should not be selected for new applications by default

Validation should be shared where practical between GraphQL inputs, upload route handlers, and UI forms.

---

# Privacy and Sensitivity

Resume data contains sensitive career and contact information.

The application should avoid logging:

* Full resume text
* Uploaded file contents
* Personal contact details
* Work authorization details
* Compensation information
* AI prompts containing full resume content
* AI outputs derived from private resume content

Any file storage provider, upload route, or AI parsing workflow should be documented with clear data ownership and access boundaries.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Repository user scoping
* Resolver authentication checks
* Creating, updating, listing, and fetching resumes
* Primary resume uniqueness
* Archive and delete behavior
* Resume content validation
* File validation if upload support is included
* UI behavior for empty, draft, active, and archived states where practical

Testing should prioritize authorization and data integrity because resume content is private and reused by later workflows.

---

# Integration Points

Resume Library should eventually integrate with:

* Career Profile for generating or checking resume content against profile context
* Resume Analysis for fit evaluation and improvement guidance
* Saved Jobs for target-role context
* Application Tracking for recording which resume was submitted
* Interview Preparation for role-specific talking points
* AI Workspace for drafting, editing, and career storytelling

The domain should preserve resumes as durable assets while allowing other domains to reference them by ID.

---

# Initial Implementation Slice

The first implementation slice should be small and complete.

Recommended scope:

* Resume list and detail
* Manual resume creation with title, notes, status, and text content
* Primary resume selection
* Archive or delete behavior
* Repository
* GraphQL query and mutations
* Basic tests for authorization, persistence, and primary-resume behavior

File uploads, structured parsing, and true version history may follow once the text-first library is stable.

---

# Open Questions

These questions should be resolved before or during implementation:

* Should the first version support file upload, text entry, or both?
* What file storage provider should be used for uploaded resumes?
* Should resume versioning be explicit in the first slice?
* Should users be allowed to store multiple active resumes without one marked primary?
* Should structured extraction happen automatically or only when the user requests it?
* What resume content should be sent to AI workflows by default?
* Should archived resumes remain available for historical applications?

---

# Definition of Done

The Resume Library domain is complete for its foundation phase when:

* Authenticated users can create and manage resumes
* Resume metadata and content persist in application-owned storage
* GraphQL operations enforce authentication and ownership
* Users can identify a primary resume
* The UI supports empty, draft, active, and archived resume states
* Stored resumes can be referenced by future analysis and application workflows
* Tests cover important authorization and persistence paths
* Database and GraphQL reference docs are updated to match the implementation

