# CareerEvidence.md

# Career Evidence Domain

## Purpose

The Career Evidence domain defines the durable proof layer behind AspAIre's resume, profile, analysis, and interview workflows.

Career Evidence captures the projects, achievements, outcomes, skills, tools, responsibilities, and proof points that show what the user has actually done.

It exists because AspAIre's differentiator is not only comparing a resume to a job. It is comparing:

```text
What the job asks for
vs.
What the resume says
vs.
What the user has actually done
```

Career Evidence is the bridge between Career Profile and Resume Library. It helps a resume generate a reviewed profile draft, helps a profile generate editable resume Markdown, and helps the user see what evidence is missing, inconsistent, or underused.

Parsed resume content should never be silently discarded. Content can be classified, moved into `Additional Notes`, marked ambiguous, or left for user review, but the system should not drop extracted text simply because it does not fit a known field.

---

# Domain Status

## Current State

The bidirectional Resume Library and Career Profile draft loop is implemented as the first Phase 4 slice. The broader Career Evidence domain remains open.

Current implemented behavior includes:

* Resume-to-profile draft generation from an owned Resume Library record with stored resume text
* AI-assisted structured output through the resume-parser WebSocket workflow
* Editable Career Profile draft review before durable profile creation
* Contact and social information captured as structured profile contact info
* Preservation of unclassified or ambiguous resume content in `Additional Notes`
* Single GraphQL acceptance mutation that creates the reviewed Career Profile variant and sections
* Profile-to-resume Markdown generation from an accepted Career Profile
* Editable Resume Markdown review before durable Resume Library creation
* Client-session-scoped draft state by default

Some evidence-like data currently lives inside Career Profile sections such as work experience, skills, projects, and achievements. The current Phase 4 slice derives from those profile sections instead of adding first-class Career Evidence tables.

Accepted evidence may later be persisted as first-class records when it needs review state, reuse, linking, or direct management. Resume-profile alignment suggestions and dedicated evidence management remain open.

## Roadmap Phase

Career Evidence belongs to Phase 4: Career Evidence and Resume-Profile Linkage.

## Primary Outcome

Users can turn resumes and profile information into reviewed, reusable career evidence, then use that evidence to improve resume Markdown, strengthen profile context, and prepare for later job fit analysis.

---

# Domain Ownership

The Next.js web application owns the Career Evidence domain.

Ownership includes:

* Evidence data model
* Resume-profile linkage workflow state
* Draft and review records where persisted
* Validation
* Authorization
* Persistence
* GraphQL schema and resolvers
* User interface
* Business rules
* AI-context preparation

The external AI server may help extract, summarize, format, or compare evidence, but it must receive input through application-owned workflows. It must not become the source of truth for evidence, profile, or resume data.

---

# Product Goals

Career Evidence should:

* Make the user's real experience reusable across AspAIre
* Connect Resume Library and Career Profile through reviewed workflows
* Help users identify missing or underused proof points
* Support resume generation from accepted profile and evidence
* Support profile drafting from uploaded or pasted resume content
* Preserve user control before generated content becomes durable data
* Provide stronger inputs for future resume-to-job fit analysis

The domain should make AspAIre feel like a career system that understands evidence, not just a document editor.

---

# User Capabilities

Implemented draft-loop capabilities:

* Review a Career Profile draft generated from a resume
* Review editable resume Markdown generated from a Career Profile
* Accept or dismiss generated profile and resume content before persistence
* Preserve ambiguous or unclassified resume-derived content in `Additional Notes`
* Save durable profile or resume records only after explicit user acceptance

Remaining Phase 4 capabilities include:

* Identify projects, skills, achievements, and outcomes found in profile or resume content
* Compare resume text against Career Profile and evidence
* See evidence that is missing, inconsistent, or underused in a resume

Later capabilities may include:

* Manage a dedicated career evidence inventory
* Normalize skills and evidence across multiple resumes
* Link proof points to specific jobs, interviews, or applications
* Track which evidence appears in which resume version
* Generate interview talking points from selected evidence
* Rate evidence strength for target roles
* Suggest new evidence based on job market patterns

---

# Core Concepts

## Career Evidence

Career evidence is a user-owned proof point that supports professional positioning.

Expected fields may include:

* Title
* Evidence type
* Summary
* Detailed description
* Related role or employer
* Related project
* Skills and tools demonstrated
* Outcomes or metrics
* Time period
* Source
* Confidence or review status

Career Evidence should support read, update, and delete management directly in Phase 4. Users should not create evidence from a blank standalone inventory screen in the first version. New evidence should enter through resume parsing, profile review, resume generation, or alignment workflows, then become directly manageable after it exists.

Initial evidence types may include:

* Project
* Work experience
* Skill evidence
* Certification
* Award

## Project

A project is a substantial body of work that can support resume bullets, profile context, and interview answers.

Expected fields may include:

* Name
* Role
* Context
* Actions taken
* Outcomes
* Technologies or skills used
* Links
* Related experience entry

Projects may begin inside Career Profile and become first-class evidence if the workflow needs richer linking, reuse, or analysis.

## Proof Point

A proof point is a smaller, reusable unit of evidence.

Examples include:

* Improved a process
* Led a migration
* Reduced cost
* Built a feature
* Mentored a teammate
* Managed a stakeholder relationship
* Learned or applied a tool

Proof points should be easy to reuse in resumes, cover letters, fit analysis, and interview preparation.

## Evidence Source

Evidence source describes where the evidence came from.

Initial sources may include:

* User-entered profile content
* Uploaded resume
* Manual resume text
* AI-extracted draft
* User-created evidence record

Evidence extracted by AI should remain draft or suggested until the user reviews it.

## Resume-Profile Link

A resume-profile link describes a relationship between stored resume content and accepted career context.

Examples include:

* A resume bullet maps to a profile experience
* A resume omits a relevant project
* A profile skill appears weakly in the resume
* A resume includes claims not yet represented in the profile
* A profile project could strengthen an executive summary

## Review Draft

A review draft is AI-generated or parsed content waiting for user acceptance.

Expected draft types include:

* Resume-to-profile draft
* Profile-to-resume Markdown draft
* Resume Markdown formatting draft
* Evidence extraction draft
* Resume-profile alignment suggestions

Review drafts should be editable where useful and should never silently overwrite durable data.

---

# Data Model Direction

Career Evidence data should default to PostgreSQL through Drizzle because it is structured, relational, user-owned application data.

Expected table direction:

* `career_evidence`
* `career_evidence_skills`
* `career_evidence_sources`
* `resume_profile_links`
* `career_evidence_review_drafts`

Phase 4 may also choose to extend existing Career Profile tables before adding every new table. The implementation should avoid over-normalizing until the workflow proves which evidence objects need first-class ownership.

Current implementation uses existing Career Profile and Resume Library tables. Review drafts live in client session state and are persisted only when accepted as Career Profile variants or Resume Library records.

Accepted evidence may later be persisted as first-class records. Derived evidence can still be generated from Career Profile sections when useful, but durable evidence records are needed for linking, reuse, review status, and resume-profile alignment history.

Each table should include:

* Stable primary key
* Owning `user_id`
* Timestamps
* Source references where applicable
* Review status where applicable
* Relationship fields to profile, resume, experience, skill, or project records

Draft content should not become durable profile or resume truth until the user accepts it.

Rejected or unaccepted drafts should not be retained in PostgreSQL by default. They may live only for the active browser session. If persistence is needed for recovery, prefer client-side IndexedDB before introducing server-side draft retention.

---

# Authorization Rules

Career Evidence data is private user-owned data.

Resolvers and repositories must:

* Require authentication for all evidence operations
* Scope reads and writes to `context.user.id`
* Verify ownership of referenced resumes and profile records
* Prevent users from accessing another user's evidence, drafts, or linkage records
* Avoid accepting `userId` from client input where it can be derived from the authenticated context

AI workflows must receive only application-approved context for the authenticated user.

---

# GraphQL API Direction

Initial query direction:

* `careerEvidence`
* `careerEvidenceItem`
* `resumeProfileLinks`
* `careerEvidenceReviewDraft`
* `resumeProfileAlignment`

Initial mutation direction:

* `createCareerEvidence`
* `updateCareerEvidence`
* `deleteCareerEvidence`
* `createResumeToProfileDraft`
* `createProfileToResumeDraft`
* `createResumeMarkdownDraft`
* `acceptCareerEvidenceDraft`
* `rejectCareerEvidenceDraft`
* `acceptResumeMarkdownDraft`
* `dismissResumeProfileSuggestion`

The first implementation may use narrower operations if the Phase 4 UI can remain complete without exposing every concept immediately.

Current implemented GraphQL surface is intentionally narrower:

* Resume-to-profile draft acceptance uses `createCareerProfileFromDraft`.
* Profile-to-resume draft acceptance uses the existing `createResume`.
* Unaccepted drafts are not persisted server-side.

Resolvers should validate authentication and referenced-record ownership before delegating persistence or AI workflow orchestration.

---

# Repository Direction

Expected repository responsibilities include:

* List evidence for an authenticated user
* Fetch evidence detail by ID and user ID
* Create and update evidence records
* Persist review drafts and statuses
* Link evidence to profile and resume records
* Store accepted or dismissed alignment suggestions where needed
* Enforce user scoping
* Return domain-shaped objects suitable for GraphQL resolvers

The repository should not call AI directly. AI orchestration should live in an application-layer workflow that prepares context, calls the AI server, validates output shape, and persists reviewable drafts.

---

# UI Direction

Phase 4 UI should make the resume-profile relationship clear.

Expected views:

* Resume-to-profile draft review (implemented from Resume Library)
* Profile-to-resume Markdown draft review (implemented from Career Profile)
* Resume Markdown formatting review after upload or parse
* Resume-profile alignment suggestions
* Evidence list or evidence panel where useful
* Accept, edit, reject, and dismiss actions

Useful interface patterns include:

* True dialog or dedicated review surface for generated Markdown
* Editable Markdown textarea
* Markdown preview
* Side-by-side source and draft where practical
* Clear labels for draft, accepted, and dismissed content
* No silent overwrites
* Empty states that route users to resume input or profile setup

Generated resume text should use basic Markdown so it makes visual sense in the app:

```text
# Name
## Summary
## Skills
## Experience
## Projects
## Education
```

The current profile-to-resume flow uses one deterministic general Markdown structure derived from the accepted Career Profile. Format directions such as Executive or Technical remain future refinements and should be treated as simple content structures, not templates.

A broad resume template picker, template marketplace, or export-ready design system is out of scope for Phase 4 unless explicitly requested.

Recommended Markdown structure:

```markdown
# Candidate Name

## Summary

Short positioning summary.

## Skills

- Skill or tool
- Skill or tool

## Experience

### Role Title, Company
_Start Date - End Date_

- Impact bullet with evidence.
- Impact bullet with evidence.

## Projects

### Project Name

- Outcome, scope, or contribution.

## Certifications and Awards

- Certification or award, issuer, year.

## Education

- Degree or program, institution, year.

## Additional Notes

Any useful content that does not cleanly fit yet.
```

This structure should be treated as a starting convention, not a strict schema. Users can edit freely. AI workflows should preserve recognizable headings where possible so later parsing and alignment can work, but the app should not reject user-authored Markdown just because it differs from the suggested structure.

`Additional Notes` is the holding section for inferred, ambiguous, unused, or unknown resume-derived content that should not be discarded.

When parsing or formatting a resume, every meaningful piece of extracted content should appear somewhere in the review draft. If the system cannot confidently place it, it belongs in `Additional Notes`.

---

# AI Usage

Career Evidence is an AI-assisted domain, but AI output must remain reviewable.

Implemented AI-adjacent uses include:

* Generate Career Profile draft from resume content (implemented through resume-parser structured output)
* Generate resume Markdown from accepted Career Profile and evidence (implemented deterministically in the web app)

Remaining AI uses include:

* Parse resume content into editable Markdown draft
* Identify projects, skills, outcomes, and proof points in profile or resume text
* Compare profile/evidence against resume content
* Suggest missing, inconsistent, or underused evidence

AI-generated changes should not mutate Career Profile or Resume Library data without explicit user acceptance.

The AI server owns execution for AI-assisted resume-to-profile drafting. The web application owns context selection, client-session draft review state, and final data mutation. Profile-to-resume Markdown generation currently runs deterministically in the web app.

Uploaded resume raw extraction should not be stored separately from accepted Markdown in Phase 4. Uploaded resume cards may expose a control to generate Markdown from the uploaded original or extracted text, but accepted `resume_text` remains the durable editable content.

---

# Validation Rules

Recommended rules:

* Evidence title or summary should be required when saved as a durable record
* Evidence type should come from a known allowlist
* Referenced resume and profile records must belong to the authenticated user
* Draft content should have reasonable length limits
* Markdown drafts should be editable plain text
* Accepted resume drafts must produce non-empty resume text
* Review actions should be idempotent where practical
* Dismissed suggestions should not delete source evidence

Validation should protect against malformed AI output before it reaches the review UI.

---

# Privacy and Sensitivity

Career Evidence may contain sensitive career details, employment history, accomplishments, compensation signals, work authorization information, and private project context.

The application should avoid logging:

* Full evidence descriptions
* Full resume text
* Full profile content
* Full generated drafts
* AI prompts containing private career data
* AI outputs derived from private career data

The UI should make it clear when profile, resume, or evidence context is being used to generate suggestions.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Repository user scoping
* Resolver authentication checks
* Ownership validation for resumes and profiles
* Draft creation and review status transitions
* Accepting a resume Markdown draft creates the intended authenticated user's Resume Library record
* Accepting a profile draft creates the authenticated user's Career Profile variant only
* Rejecting or dismissing drafts does not mutate durable data
* Validation of AI output shape before persistence
* UI behavior for draft review, edit, accept, reject, and error states where practical

Testing should prioritize authorization, explicit user acceptance, and no silent overwrites.

---

# Integration Points

Career Evidence integrates with:

* Career Profile for accepted professional identity, skills, projects, and goals
* Resume Library for resume text, uploaded originals, and generated Markdown drafts
* Resume Analysis for future job-fit recommendations based on accepted evidence
* Saved Jobs for later target-role context
* Application Tracking for submitted evidence and resume choices
* Interview Preparation for talking points and answer examples
* AI Workspace for exploratory career storytelling and drafting
* Market Research for skill and role pattern insights

Career Evidence should strengthen downstream workflows without making every domain depend on its internal tables.

---

# Initial Implementation Slice

Recommended Phase 4 scope:

* Resume-to-profile draft generation and review (implemented)
* Profile-to-resume Markdown generation and review (implemented)
* Reviewable parsed-resume Markdown draft after upload where practical
* Resume-profile alignment suggestions
* Basic evidence extraction from profile and resume text
* Explicit accept, edit, reject, and dismiss behavior
* Repository or application-layer persistence for drafts where needed
* GraphQL/API operations for the review workflows
* Tests for ownership, review state, and no silent overwrites

The implementation should start with the smallest workflow that proves the bidirectional loop:

```text
Resume -> Profile draft
Profile -> Resume Markdown draft
```

---

# Open Questions

These questions should be resolved before or during Phase 4 implementation:

* Should career evidence be persisted as first-class records immediately or initially derived from Career Profile sections?
* What Markdown structure is strict enough to be useful but flexible enough for editing?

Resolved Phase 4 answers:

* The first implemented slice derives evidence from Career Profile and Resume Library records. First-class Career Evidence persistence remains reserved for evidence that needs reuse, linking, or review state.
* Resume-derived profile drafts should prefill every profile field that can be reasonably inferred. Unused, unknown, or ambiguous content should go into a new Markdown holding field for review.
* Uploaded resume raw extraction should not be stored separately from accepted Markdown in Phase 4. Uploaded resume cards can expose a control to generate Markdown.
* Parsed resume content should never be silently discarded. Ambiguous or unclassified content should be preserved in `Additional Notes` for user review.
* Rejected or unaccepted drafts should be retained only for the active browser session by default. IndexedDB may be used if recovery is needed.
* Dedicated evidence inventory management is not part of the implemented draft-loop slice.
* First alignment categories are Skills, Projects, Work Experience, and Certificates/Awards.
* The first profile-to-resume flow uses a deterministic general Markdown structure. Executive and Technical format directions remain future refinements.
* Resume Markdown should use a permissive heading-based structure with Summary, Skills, Experience, Projects, Certifications and Awards, Education, and Additional Notes.

---

# Definition of Done

The Career Evidence domain is complete for its Phase 4 package when:

* Authenticated users can generate a Career Profile draft from an owned resume
* Authenticated users can generate editable resume Markdown from their accepted Career Profile and evidence
* Users can review, edit, accept, reject, or dismiss generated content before durable records change
* Resume-profile alignment suggestions identify missing, inconsistent, or underused evidence
* Generated resume text uses basic editable Markdown
* Broad templates remain out of scope unless explicitly requested
* GraphQL/API operations enforce authentication and ownership
* Tests cover important authorization, draft review, acceptance, and no-silent-overwrite paths
* Database and GraphQL reference docs are updated to match implemented persistence
