# InterviewPreparation.md

# Interview Preparation Domain

## Purpose

The Interview Preparation domain helps users prepare for interviews using their career profile, resume materials, saved jobs, application history, and company or role context.

It should turn a target opportunity into practical preparation: likely questions, talking points, answer outlines, areas to study, and notes the user can revisit.

---

# Domain Status

## Current State

The Interview Preparation domain is planned but not yet implemented.

No production interview prep schema, repository, GraphQL operations, AI workflow, or preparation UI currently exists for this domain.

## Roadmap Phase

Interview Preparation belongs to Phase 8: Interview Preparation.

## Primary Outcome

Users can prepare for specific interviews with guidance that reflects both the target role and their own background.

---

# Domain Ownership

The Next.js web application owns the Interview Preparation domain.

Ownership includes:

* Interview preparation records
* Question sets
* Talking points
* Practice notes and answer drafts
* Validation
* Authorization
* Persistence
* GraphQL schema and resolvers
* User interface
* Business rules

The external AI server may generate question sets, coaching notes, and practice feedback, but persisted interview preparation data belongs to the web application.

---

# Product Goals

Interview Preparation should:

* Help users prepare for specific roles and companies
* Use career profile and resume context to personalize guidance
* Generate likely interview questions
* Help users form evidence-backed answer outlines
* Preserve preparation history
* Connect preparation to saved jobs and applications

The domain should leave users more prepared, not just give them generic interview advice.

---

# User Capabilities

Initial capabilities should include:

* Create interview prep for a saved job or application
* View prep sessions
* Generate likely questions
* Create answer notes or drafts
* Record talking points
* Identify areas to study
* Save company and role research notes
* Mark preparation items complete

Later capabilities may include:

* Mock interview practice
* Answer feedback
* STAR answer builder
* Interview format-specific prep
* Recruiter screen prep
* Behavioral and technical question grouping
* Prep history across companies or roles

---

# Core Concepts

## Prep Session

A prep session represents a preparation workspace for a specific interview target.

Expected fields include:

* Saved job ID
* Application ID if applicable
* Title
* Interview type
* Scheduled date
* Status
* Created timestamp
* Updated timestamp

Prep sessions should be useful even when a user does not have a scheduled interview date yet.

## Question Set

A question set contains likely or practice questions.

Expected fields include:

* Prep session ID
* Category
* Question text
* Rationale
* Priority
* Source context
* Created timestamp

Categories may include behavioral, role-specific, technical, company, recruiter screen, leadership, and compensation.

## Answer Draft

An answer draft captures the user's preparation for a question.

Expected fields include:

* Question ID
* Draft text
* Notes
* STAR components where applicable
* Updated timestamp

Answer drafts are user-owned material. AI may help generate or critique them, but the user controls final content.

## Talking Point

A talking point is reusable evidence or positioning guidance.

Expected fields include:

* Topic
* Supporting evidence
* Related experience, project, resume, or skill
* Related job requirement
* Notes

Talking points should help connect the user's background to the target role.

## Study Item

A study item identifies a topic the user should review before the interview.

Expected fields include:

* Topic
* Reason
* Priority
* Status
* Notes

---

# Data Model Direction

Interview Preparation data should default to PostgreSQL through Drizzle because it is structured, relational, user-owned application data.

Expected table direction:

* `interview_prep_sessions`
* `interview_prep_questions`
* `interview_prep_answers`
* `interview_prep_talking_points`
* `interview_prep_study_items`

Each table should include:

* Stable primary key
* Owning `user_id`
* Timestamps
* Relationship to saved job or application ID
* Status fields where appropriate

The first implementation should keep prep data structured enough to render and revisit without trying to build a full coaching platform immediately.

---

# Authorization Rules

Interview preparation data is private user-owned data.

Resolvers and repositories must:

* Require authentication for all prep operations
* Scope reads and writes to `context.user.id`
* Verify ownership of referenced saved jobs and applications
* Prevent users from accessing another user's prep sessions
* Avoid accepting `userId` from client input where it can be derived from the authenticated context

---

# GraphQL API Direction

Initial query direction:

* `interviewPrepSessions`
* `interviewPrepSession`
* `interviewPrepForApplication`
* `interviewPrepForSavedJob`

Initial mutation direction:

* `createInterviewPrepSession`
* `updateInterviewPrepSession`
* `deleteInterviewPrepSession`
* `generateInterviewQuestions`
* `addInterviewPrepQuestion`
* `updateInterviewPrepQuestion`
* `deleteInterviewPrepQuestion`
* `updateInterviewAnswerDraft`
* `addInterviewTalkingPoint`
* `updateInterviewTalkingPoint`
* `deleteInterviewTalkingPoint`
* `addInterviewStudyItem`
* `updateInterviewStudyItem`
* `deleteInterviewStudyItem`

Resolvers should validate authentication and referenced-record ownership first, then delegate persistence to an interview preparation repository.

---

# Repository Direction

Expected repository responsibilities include:

* Create and update prep sessions
* List prep sessions for an authenticated user
* Fetch prep session detail by ID and user ID
* Save generated question sets
* Manage answer drafts
* Manage talking points and study items
* Return domain-shaped objects suitable for GraphQL resolvers

The repository should not call AI services directly. AI generation should be coordinated by an application-layer workflow.

---

# UI Direction

Expected views:

* Prep session list
* Prep session detail
* Create prep from saved job or application
* Question set review
* Answer draft editor
* Talking points
* Study list

Useful interface patterns include:

* Clear role and company context
* Question grouping
* Editable answer notes
* Completion markers
* Links to related resume, saved job, and application
* Failed generation recovery state

The UI should feel like a focused prep workspace, not a static checklist.

---

# AI Usage

Initial AI uses include:

* Generating likely interview questions
* Creating role-specific talking points
* Drafting STAR-style answer outlines
* Identifying areas to study
* Summarizing company and role context

Potential later AI features include:

* Mock interview practice
* Answer critique
* Follow-up question generation
* Personalized coaching plans
* Interview debrief summaries

AI-generated material should be editable and should not replace the user's own voice.

---

# Validation Rules

Recommended rules:

* Prep session should reference a saved job or application where possible
* Referenced records must belong to the authenticated user
* Interview type should come from a known allowlist when present
* Scheduled date should be optional
* Question text should be required
* Answer drafts should have reasonable length limits
* Study item status should come from a known allowlist

---

# Privacy and Sensitivity

The application should avoid logging:

* Answer drafts
* Prep notes
* Full AI prompts
* Private profile or resume context
* Recruiter or interviewer details

Interview prep may include sensitive reflections about weaknesses, compensation, or work authorization. Treat it as private user-owned data.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Repository user scoping
* Resolver authentication checks
* Saved job and application ownership validation
* Creating and updating prep sessions
* Saving generated questions
* Managing answer drafts, talking points, and study items
* UI behavior for empty, generated, edited, and failed states where practical

---

# Integration Points

Interview Preparation should eventually integrate with:

* Career Profile for background and examples
* Resume Library for submitted resume context
* Saved Jobs for target role context
* Application Tracking for interview stage and activity
* Resume Analysis for gaps to address
* AI Workspace for coaching and research
* Market Research for company and role context

---

# Initial Implementation Slice

Recommended scope:

* Create prep session from saved job or application
* Generate and save likely questions
* Add answer notes
* Add talking points and study items
* View prep session detail
* Repository
* GraphQL query and mutations
* Tests for authorization, ownership, persistence, and validation

Mock interview simulation and answer scoring can follow later.

---

# Open Questions

* Should prep sessions require an application or allow saved-job-only preparation?
* Which interview types should be modeled first?
* Should generated questions be persisted immediately or only after user review?
* Should STAR answer structure be first-class in the first slice?
* What context should AI use by default for interview prep?
* Should prep sessions support multiple scheduled interviews?

---

# Definition of Done

The Interview Preparation domain is complete for its foundation phase when:

* Authenticated users can create prep sessions for owned opportunities
* Prep data persists in application-owned storage
* GraphQL operations enforce authentication and ownership
* Users can review questions, answer drafts, talking points, and study items
* AI-generated prep material is reviewable and editable
* Tests cover important authorization, ownership, and persistence paths
* Database and GraphQL reference docs are updated to match the implementation
