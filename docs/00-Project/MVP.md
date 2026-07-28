# AspAIre MVP

## Purpose

This document defines the AspAIre minimum viable product and the development path for building it.

The MVP is not the full roadmap. It is the smallest coherent product version that proves AspAIre's core value: helping a user manage career context, job opportunities, resume material, and AI-assisted fit analysis in one connected workspace.

---

# MVP Thesis

AspAIre's MVP should prove that a solo user can move from scattered job-search work to a structured AI-assisted workflow.

The MVP succeeds if a user can:

* Maintain reusable career context
* Store resume content
* Save job opportunities
* Compare a resume and career profile against a job
* Receive practical AI guidance
* Track the next state of an opportunity

The MVP should feel like an early career operating system, not a generic chatbot and not a disconnected collection of forms.

---

# Target User

The MVP is built for one primary user type:

* A professional actively applying to jobs or preparing to apply

This user likely has:

* One or more existing resumes
* A need to tailor materials for specific roles
* Several job postings they want to compare
* A desire to stay organized without building a spreadsheet
* A willingness to paste or manually enter job information if automation is not available yet

The MVP should also be useful to the developer as the first real user.

---

# Product Scope

The MVP should deliver one complete workflow:

1. The user signs in.
2. The user is guided through a first-run start flow.
3. The user adds resume content or, if they do not have a resume, creates a career profile manually.
4. The user reviews or creates durable career profile context.
5. The user saves a job opportunity.
6. The user runs an AI-assisted fit analysis.
7. The user reviews actionable recommendations.
8. The user tracks the opportunity status and next action.

This workflow intentionally compresses several roadmap phases into one thin vertical product slice.

---

# First-Run Flow

The MVP should use a guided start flow after sign-in rather than sending new users directly to AI Workspace.

The lead question should be:

```text
Do you have a resume?
```

Primary path:

```text
Yes -> Resume Input -> Profile Draft Review -> Next Task
```

Main alternate path:

```text
No -> Career Profile Setup -> Resume Later -> Next Task
```

Secondary routes may include:

* Analyze a job
* Track applications
* Open AI Workspace
* Skip for now

`Skip for now` should land on Home or Dashboard, not AI Workspace. The skipped state should show useful empty-state actions such as adding a resume, building a career profile, saving a job, running fit analysis, tracking applications, and opening AI Workspace.

AI Workspace should be reachable with one click, but it should be secondary to domain workflows. Domain pages own durable profile, resume, job, analysis, and application records. AI Workspace supports open-ended career work and can suggest domain actions, but it should not become the default product starting point.

---

# Core MVP Domains

## Career Profile

Career Profile is the durable user context layer.

MVP capabilities:

* Create and edit multiple profile variants per authenticated user
* Select a profile, delete non-final profiles, and set a default profile
* Store professional headline and summary
* Store work experience
* Store education
* Store skills
* Store projects
* Store certifications and awards
* Store career goals
* Store job and location preferences
* Validate date-bearing sections before save
* Display formatted dates when available

MVP constraints:

* No public sharing
* No AI auto-editing of profile data without user review

## Resume Library

Resume Library stores the user's application material.

MVP capabilities:

* Create resume records manually
* Store resume title, target role, notes, and full resume text
* View resume list and resume detail
* Edit resume content
* Mark one resume as primary if useful for analysis defaults

MVP constraints:

* File upload can be deferred
* PDF or DOCX parsing can be deferred
* Resume template generation can be deferred
* Version history can be simple or omitted initially

## Saved Jobs

Saved Jobs stores opportunities the user wants to evaluate.

MVP capabilities:

* Save a job manually from pasted posting content
* Store title, company, location, work mode, source URL, description, notes, interest level, and status
* View saved job list
* View job detail
* Edit job fields

MVP constraints:

* No job board aggregation
* No scraping
* No browser extension
* No employer accounts

## Resume Analysis

Resume Analysis is the first workflow where AspAIre's accumulated context becomes visibly useful.

MVP capabilities:

* Select a resume and saved job
* Include career profile context in the analysis request
* Generate fit summary, strengths, gaps, missing keywords, resume suggestions, and positioning guidance
* Persist analysis results
* Display analysis history for a job or resume

MVP constraints:

* Analysis can be text-first
* Scoring should be explainable and lightweight
* No automated resume rewrite is required for the first MVP

## Application Tracking

Application Tracking keeps the opportunity actionable.

MVP capabilities:

* Track status for a saved job
* Store application date
* Store next action
* Store follow-up date manually
* Store notes

MVP constraints:

* No calendar integration
* No automated reminders
* No email integration
* No recruiter or employer workflow

---

# Out of Scope

The MVP should not include:

* Public job board functionality
* Employer or recruiter accounts
* Autonomous job applications
* Automated job scraping
* Browser extensions
* Calendar or email integrations
* Payments and subscription management
* Team or organization accounts
* Advanced market research
* Interview simulation
* Resume template design system
* Full document import and parsing
* Multi-agent AI workflows
* Mobile app builds

These features may become future work only after the core loop is useful.

---

# MVP Development Strategy

The MVP should be built as a sequence of complete vertical slices.

Each slice should include the necessary:

* Database schema
* Repository
* GraphQL schema and resolver
* Validation
* UI
* Tests where risk justifies them
* Documentation updates

The product should remain usable after each slice, even if the workflow is incomplete.

---

# Development Sequence

## Slice 1: Platform Baseline Check

Goal:

Confirm the inherited platform is stable enough for MVP feature work.

Deliverables:

* Confirm local web app startup
* Confirm AI server startup path
* Confirm authentication flow
* Confirm GraphQL request path
* Confirm database configuration expectations
* Resolve or document inherited Saigely naming that blocks MVP work

Exit criteria:

* A developer can run the platform locally and build product slices confidently.

## Slice 2: Career Profile Foundation

Goal:

Create reusable career context.

Deliverables:

* Career profile database tables
* Career profile repository
* Career profile GraphQL operations
* Profile overview and edit UI
* Tests for ownership and persistence
* Updated database and GraphQL references

Exit criteria:

* An authenticated user can create, view, and edit their profile.

## Slice 3: Resume Library Text MVP

Status:

Complete for the foundation slice.

Goal:

Store resume content that can be used in analysis.

Deliverables:

* Resume database tables
* Resume repository
* Resume GraphQL operations
* Resume list, detail, create, and edit UI
* Resume text storage
* Uploaded original file attachment and deletion
* Plain text extraction from PDF, DOCX, and TXT originals
* Tests for ownership and persistence
* Updated domain and reference docs

Exit criteria:

* An authenticated user can maintain at least one resume record with full resume text.
* Uploaded originals can be attached to resume records and removed without exposing storage internals.
* Extracted upload text can populate empty or upload-sourced resumes without overwriting manually entered resume text.

## Slice 4: Saved Jobs MVP

Goal:

Store job opportunities manually.

Deliverables:

* Saved job database tables
* Saved job repository
* Saved job GraphQL operations
* Saved jobs list, detail, create, and edit UI
* Job status and interest fields
* Tests for ownership and persistence
* Updated domain and reference docs

Exit criteria:

* An authenticated user can save and manage job opportunities.

## Slice 5: Resume-to-Job Analysis

Goal:

Prove the core AI value loop.

Deliverables:

* Analysis database tables
* Analysis repository
* Analysis GraphQL operations
* AI workflow that receives profile, resume, and job context
* Analysis result persistence
* Analysis UI on job or resume detail views
* Tests for request authorization and result persistence
* Updated AI server and GraphQL docs where contracts change

Exit criteria:

* An authenticated user can run and review a persisted fit analysis for a selected resume and saved job.

## Slice 6: Application Tracking

Goal:

Turn saved jobs into an actionable pipeline.

Deliverables:

* Application tracking fields or tables
* Status update workflow
* Next action and follow-up date fields
* Notes support
* Pipeline or saved-job status view
* Tests for status updates and ownership
* Updated reference docs

Exit criteria:

* An authenticated user can track where each saved opportunity stands and what needs to happen next.

## Slice 7: MVP Polish and Release Readiness

Goal:

Make the MVP reliable enough for sustained personal use and limited external feedback.

Deliverables:

* Empty states
* Loading and error states
* Navigation cleanup
* Basic responsive pass
* Accessibility pass for primary forms and buttons
* End-to-end manual test script
* Production environment checklist
* Updated README or operations notes

Exit criteria:

* The MVP can be used repeatedly without developer intervention for the core workflow.

---

# Data Model Direction

The MVP should default to PostgreSQL for structured product data.

Expected MVP tables include:

* `career_profiles`
* `career_profile_experience`
* `career_profile_education`
* `career_profile_skills`
* `career_profile_preferences`
* `resumes`
* `saved_jobs`
* `resume_analyses`
* `application_events` or application tracking fields on `saved_jobs`

MongoDB should remain limited to conversation-style data unless a specific MVP workflow clearly benefits from document storage.

---

# AI Boundary

The existing architecture remains in force:

> The Next.js application owns the business. The external AI server owns AI execution.

For the MVP:

* Career profile, resume, job, analysis, and application state are application-owned data.
* The AI server receives only the context needed to execute analysis.
* Persisted AI results are written through application-owned GraphQL operations.
* AI prompts should avoid including unnecessary sensitive data.
* AI output should be reviewable and traceable to the selected resume and job.

---

# UX Principles

The MVP should feel quiet, useful, and work-focused.

Important UX principles:

* Build the actual workspace, not a marketing landing page
* Start first-run users with resume-led guided routing
* Prioritize fast data entry and editing
* Support partial progress
* Make empty states productive
* Keep analysis results specific and actionable
* Keep status and next action visible
* Avoid requiring perfect data before the user receives value
* Keep AI Workspace accessible without making it the default front door

---

# Testing Expectations

MVP testing should focus on user ownership, persistence, and AI workflow boundaries.

Required test areas:

* Authenticated access for domain operations
* User scoping for profile, resumes, jobs, and analyses
* Repository create, read, update, and delete behavior
* GraphQL resolver authentication and validation
* Analysis result persistence
* Status and next-action updates

UI tests may be added where form behavior or workflow risk justifies them.

---

# MVP Acceptance Criteria

The MVP is complete when a real user can:

* Sign in
* Add resume text
* Create or review a career profile
* Save a job posting
* Run resume-to-job fit analysis using profile context
* Review actionable recommendations
* Track application status and next action
* Return later and continue from persisted data

The MVP should also have:

* Updated database reference documentation
* Updated GraphQL reference documentation
* Updated domain documentation for implemented behavior
* Focused automated tests for ownership and persistence
* A documented local setup and release-readiness path

---

# Success Signals

The MVP is working if:

* The developer uses it for real job-search planning
* Adding a new job and analyzing fit takes minutes, not an afternoon
* Analysis output is specific enough to guide resume changes
* Saved jobs and next actions reduce spreadsheet-like tracking
* The system becomes more useful as profile, resume, and job context accumulate

---

# Primary Risks

## Scope Creep

Risk:

The roadmap contains many attractive features that can dilute the MVP.

Response:

Defer everything that does not support the core profile-resume-job-analysis-tracking workflow.

## Data Model Overdesign

Risk:

Career and resume data can become deeply complex before the product proves usage.

Response:

Use clear structured tables where needed, but allow narrative text fields where they preserve momentum.

## AI Feature Drift

Risk:

AI work can become a general assistant instead of a workflow tool.

Response:

Tie the first AI workflow to selected profile, resume, and job records.

## Integration Distraction

Risk:

Job scraping, email, calendar, and document parsing can consume solo-developer time early.

Response:

Require manual input first. Automate only after the manual workflow is valuable.

---

# Post-MVP Candidates

After the MVP is useful, likely next candidates include:

* Resume upload and text extraction
* Resume tailoring drafts
* Interview preparation for saved jobs
* Job search keyword generation
* Company and role research
* Manual reminder improvements
* Better analysis comparison across jobs
* Profile drafting from resume content
* Deployment hardening

Post-MVP work should be selected based on real use of the MVP, not roadmap appeal alone.
