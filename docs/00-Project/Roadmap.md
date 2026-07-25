# Roadmap.md

# AspAIre Roadmap

## Roadmap Purpose

This roadmap defines the intended sequence for building AspAIre from its Saigely foundation into an AI-powered career platform.

The roadmap is not a task tracker. It is a product and architecture sequencing guide. Detailed implementation work should be captured in domain docs, architecture docs, issues, or feature plans as needed.

---

# Roadmap Principles

## Preserve the Platform Foundation

AspAIre should reuse the proven Saigely architecture wherever possible.

Authentication, routing, theming, AI communication, WebSocket streaming, data access, and GraphQL infrastructure should be treated as platform capabilities unless a specific project need requires revision.

---

## Build Vertical Slices

Each major product capability should be built as a complete vertical slice.

A complete slice may include:

* Database schema
* Repository
* GraphQL/API surface
* Validation
* Business logic
* User interface
* AI integration where relevant
* Tests where appropriate
* Documentation updates

---

## Establish Shared Context Early

AspAIre becomes more valuable as career context accumulates.

The roadmap should prioritize foundational user data, resume data, resume-profile linkage, saved jobs, and application state before advanced recommendation and automation features.

---

## Keep AI Connected to Workflow

AI work should be tied to user goals and product domains.

The platform should avoid building isolated AI experiences before the core career workflow can provide meaningful context.

---

# Phase 0: Project Orientation and Documentation

## Goal

Establish AspAIre's project identity, boundaries, and source-of-truth documentation before implementation begins.

## Outcomes

* Project foundations documented
* Product vision documented
* Roadmap documented
* Initial architectural decisions captured
* Documentation hierarchy established
* Saigely inheritance and boundaries understood

## Key Documents

* `docs/00-Project/Foundations.md`
* `docs/00-Project/Vision.md`
* `docs/00-Project/Roadmap.md`
* `docs/00-Project/Decisions.md`

## Exit Criteria

The project has enough documentation to guide architecture and feature planning without relying on conversation history.

---

# Phase 1: Platform Baseline

## Goal

Bring the inherited Saigely architecture into alignment with AspAIre's product direction.

## Outcomes

* Application shell verified
* Authentication flow verified
* Theme system verified
* GraphQL infrastructure verified
* Database setup verified
* Repository patterns verified
* AI server integration boundary documented
* Development and environment documentation created

## Core Work

* Audit the inherited frontend structure
* Document application routing and layout conventions
* Confirm Better Auth session handling
* Confirm Drizzle and PostgreSQL setup
* Confirm GraphQL schema and resolver patterns
* Confirm AI server connection and streaming expectations
* Document environment variables and local setup

## Exit Criteria

The team can confidently build AspAIre features on top of the existing platform without rediscovering Saigely architecture through code archaeology.

---

# Phase 2: Career Profile Foundation

## Goal

Create the durable user career context that future domains and AI workflows can reuse.

## Outcomes

* Career profile domain documented
* Career profile data model implemented
* Profile repository implemented
* GraphQL/API operations implemented
* Profile creation and editing UI implemented
* Basic validation implemented
* Profile context available to AI workflows

## Core Capabilities

* Professional summary
* Work experience
* Education
* Skills
* Projects
* Certifications
* Career goals
* Job preferences
* Location and work-mode preferences

## Exit Criteria

Users can create and maintain a structured career profile that becomes the primary source of reusable career context.

---

# Phase 3: Resume Library

## Status

MVP foundation slice complete. Full SaaS phase remains open.

## Goal

Allow users to store, manage, and reuse resume records and uploaded original files.

## Outcomes

* Resume library domain documented
* Resume data model implemented
* Resume upload or entry workflow implemented
* Resume repository implemented
* GraphQL/API operations implemented
* Resume list and detail UI implemented
* Resume parsing strategy documented
* Resume metadata and uploaded-original lifecycle supported

## Core Capabilities

* Store multiple resumes
* Capture resume text
* Upload PDF, DOCX, and plain text originals
* Extract plain resume text from supported uploaded originals
* Associate resumes with career profile context
* Preserve analysis history for future phases

## Exit Criteria

Users can maintain a usable resume library that supports later analysis, tailoring, and application workflows.

Completed MVP foundation behavior includes manual resume records, primary resume selection, archive and restore, resume deletion receipts, uploaded-original metadata, individual uploaded-original deletion, private S3 storage boundaries, and server-side text extraction that does not overwrite manually entered resume text.

The broader SaaS Resume Library phase still includes deeper resume versioning, structured section extraction, download links, richer resume comparison, resume-to-profile workflows, and AI-assisted resume improvement. Those remain future work and should not be treated as complete because the MVP foundation slice is complete.

---

# Phase 4: Career Evidence and Resume-Profile Linkage

## Goal

Connect Career Profile and Resume Library into a bidirectional, review-first workflow.

This phase should let a resume feed a career profile draft, let a career profile generate resume Markdown, and help users align what their resume says with what they have actually done.

## Outcomes

* Resume-to-profile draft workflow implemented
* Profile-to-resume Markdown draft workflow implemented
* Review and acceptance UI implemented for AI-generated or parsed content
* Career evidence and project proof points made usable for resume guidance
* Resume-profile consistency checks implemented
* Basic Markdown resume formatting supported without introducing a full template system
* Existing resume upload behavior adjusted so parsed Markdown is reviewed before becoming durable resume text where practical

## Core Capabilities

* User answers `Do you have a resume?`
* `Yes` path: add resume, parse or format it into reviewable Markdown, and generate a Career Profile draft for user review
* `No` path: build Career Profile first, then generate editable resume Markdown for user review
* Compare Resume Library content against Career Profile, projects, skills, and outcomes
* Surface missing, inconsistent, or underused career evidence
* Save durable profile or resume changes only after explicit user acceptance
* Use basic Markdown structure for generated or parsed resume text

## Exit Criteria

Users can move in both directions between resume and profile:

```text
Resume -> Career Profile draft
Career Profile -> Resume Markdown draft
```

Users can also review alignment suggestions that compare what the resume says against the accepted career profile, projects, skills, and outcomes.

The phase is complete when the user can create, review, edit, accept, or reject generated profile and resume content without silent overwrites. Basic format examples, such as an Executive resume format, may be supported when requested, but a broad resume template system remains out of scope.

---

# Phase 5: Job Search and Saved Jobs

## Goal

Enable users to discover, import, save, and organize job opportunities.

## Outcomes

* Job search and saved jobs domains documented
* Saved job data model implemented
* Job repository implemented
* GraphQL/API operations implemented
* Saved jobs UI implemented
* Job detail view implemented
* Basic job import or manual entry workflow implemented
* AI job summarization integrated where appropriate

## Core Capabilities

* Save job postings
* Store company and role information
* Capture source URLs and posting metadata
* Add user notes
* Track initial interest level
* Summarize job descriptions
* Preserve job text for later analysis

## Exit Criteria

Users can build a persistent collection of opportunities that can be analyzed, tracked, and connected to resumes.

---

# Phase 6: Resume Analysis and Fit Evaluation

## Goal

Use career, resume, and job context to provide practical fit analysis and improvement guidance.

## Outcomes

* Resume analysis domain documented
* Analysis data model implemented
* AI analysis workflow integrated
* Resume-to-job comparison implemented
* Fit summary UI implemented
* Recommendation display implemented
* Analysis history preserved

## Core Capabilities

* Compare resume content to a job description
* Identify strengths and gaps
* Suggest resume improvements
* Highlight missing skills or keywords
* Generate role-specific positioning guidance
* Save analysis results

## Exit Criteria

Users can evaluate how well a resume fits a target job and receive specific, actionable revision guidance.

---

# Phase 7: Application Tracking

## Goal

Turn saved jobs into a manageable application pipeline.

## Outcomes

* Application tracking domain documented
* Application status model implemented
* Application repository implemented
* GraphQL/API operations implemented
* Pipeline UI implemented
* Activity and note tracking implemented
* Follow-up and next-action fields implemented

## Core Capabilities

* Track application stages
* Record application dates
* Attach resumes to applications
* Store notes and interactions
* Track follow-up reminders manually
* Surface next actions

## Exit Criteria

Users can understand the state of their job search and manage applications without relying on external spreadsheets or scattered notes.

---

# Phase 8: Interview Preparation

## Goal

Help users prepare for interviews using their career profile, resume, and target opportunity context.

## Outcomes

* Interview preparation domain documented
* Interview prep data model implemented
* Role-specific prep workflow implemented
* AI-generated question sets implemented
* Practice notes and answer drafts supported
* Company and role research connected to preparation

## Core Capabilities

* Generate likely interview questions
* Prepare role-specific talking points
* Draft STAR-style answer outlines
* Identify areas to study
* Connect preparation to a saved job or application
* Preserve interview preparation history

## Exit Criteria

Users can prepare for specific interviews with guidance that reflects both the target role and their own background.

---

# Phase 9: AI Workspace and Research

## Goal

Provide a broader AI-assisted workspace for career research, planning, drafting, and analysis.

## Outcomes

* AI workspace domain documented
* Conversation or workspace persistence strategy implemented
* Research workflows defined
* Market research domain documented
* AI server long-running workflows integrated where needed
* Shared context rules documented

## Core Capabilities

* Career Q&A using profile context
* Company research
* Role research
* Market trend exploration
* Search term generation
* Cover letter drafting
* Career planning prompts
* Saved research outputs

## Exit Criteria

Users can use AI for broader career work while the system remains connected to AspAIre's structured career and job-search context.

---

# Phase 10: Personalization and Intelligence

## Goal

Use accumulated platform context to improve recommendations, prioritization, and user guidance.

## Outcomes

* User preference model refined
* Recommendation strategy documented
* Job prioritization signals implemented
* Resume and job insights improved
* Workflow next-action suggestions implemented
* Feedback loops introduced where appropriate

## Core Capabilities

* Recommend saved jobs to prioritize
* Suggest better search terms
* Identify recurring market patterns
* Recommend resume variants for roles
* Surface stale applications or missing follow-ups
* Personalize AI outputs based on user preferences

## Exit Criteria

AspAIre begins to feel like an intelligent career system rather than a passive database of job-search information.

---

# Phase 11: Polish, Reliability, and Release Readiness

## Goal

Harden the platform for consistent use and prepare for broader availability.

## Outcomes

* Core workflows tested end to end
* Error states improved
* Loading and streaming states refined
* Empty states polished
* Accessibility reviewed
* Performance reviewed
* Deployment process documented
* Production environment readiness verified

## Core Capabilities

* Reliable onboarding
* Smooth application workflows
* Stable AI streaming behavior
* Clear failure recovery
* Usable mobile and desktop layouts
* Documentation aligned with implementation

## Exit Criteria

AspAIre is ready for real users to manage their career workflow with confidence.

---

# Dependency Order

The roadmap intentionally sequences durable context before advanced intelligence.

1. Project documentation
2. Platform baseline
3. Career profile
4. Resume library
5. Career evidence and resume-profile linkage
6. Saved jobs
7. Resume and job analysis
8. Application tracking
9. Interview preparation
10. AI workspace and research
11. Personalization
12. Release readiness

Later phases may begin exploratory design earlier, but implementation should avoid depending on data or workflows that do not exist yet.

---

# Documentation Expectations

Each phase should update the project documentation as it progresses.

Relevant documents may include:

* Project decisions
* Architecture docs
* Domain docs
* Database schema reference
* GraphQL schema reference
* Environment documentation
* Testing documentation

Documentation should describe decisions that have been made, not every idea considered along the way.

---

# Roadmap Change Policy

The roadmap can change as the product becomes clearer.

Changes should be intentional and documented when they affect:

* Product sequencing
* Architectural boundaries
* Domain ownership
* Data model dependencies
* AI server responsibilities
* Release expectations

The roadmap should remain a living guide, but not a substitute for current implementation planning.
