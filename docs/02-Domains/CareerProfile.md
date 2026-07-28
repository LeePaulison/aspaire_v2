# CareerProfile.md

# Career Profile Domain

## Purpose

The Career Profile domain defines the durable representation of a user's professional identity in AspAIre.

It is the first product domain because it creates reusable career context for later domains, including resume library, resume analysis, saved jobs, application tracking, interview preparation, AI workspace, and market research.

The profile should help the user describe who they are professionally, what they have done, what they can do, and what they are looking for next.

In first-run setup, Career Profile is the primary path for users who do not have a resume. For users who do have a resume, the profile may begin as a reviewed draft generated from imported resume content rather than as a blank manual form.

---

# Domain Status

## Current State

The Career Profile foundation slice is implemented.

Current implementation includes PostgreSQL schema, repository access, GraphQL operations, and a protected multi-profile UI.

## Roadmap Phase

Career Profile belongs to Phase 2: Career Profile Foundation.

## Primary Outcome

Users can create and maintain a structured career profile that becomes the primary source of reusable career context across AspAIre.

---

# Domain Ownership

The Next.js web application owns the Career Profile domain.

Ownership includes:

* Profile data model
* Validation
* Authorization
* Persistence
* GraphQL schema and resolvers
* User interface
* Business rules
* AI-context preparation

The external AI server may use career profile context for AI execution, but it must request that context through GraphQL. It must not read profile data directly from the database.

---

# Product Goals

The Career Profile should:

* Give the user one reliable place to maintain their career context
* Provide a manual first-run path for users without a resume
* Capture structured information that can power later product workflows
* Support both quick onboarding and deeper profile refinement over time
* Support reviewed profile drafting from resume content when available
* Provide AI workflows with better context than a single resume upload
* Reduce repeated data entry across resumes, applications, interviews, and research

The profile should feel useful even before every field is complete.

---

# User Capabilities

Implemented capabilities include:

* Create multiple focused career profile variants
* Select, edit, delete, and set a default career profile
* Start setup manually when the user does not have a resume
* Review and edit a draft profile generated from imported resume content
* View the selected profile in a read-only display
* Edit profile sections in a large review dialog
* Save professional summary information
* Add and manage work experience
* Add and manage education
* Add and manage skills
* Add and manage projects
* Add and manage certifications
* Record career goals
* Record job preferences
* Record location and work-mode preferences

The foundation UI supports Markdown-formatted text in narrative fields. Users edit Markdown in plain textareas, and saved content is rendered with the shared Markdown renderer.

Later capabilities may include:

* AI-assisted profile drafting from resume data
* Profile completeness suggestions
* Skill normalization and grouping
* Career positioning recommendations
* Market-informed profile insights
* Resume-profile consistency checks

---

# Core Concepts

## Profile

The profile is the user's top-level career record.

It should contain high-level professional identity fields and own the profile sections associated with the user.

Expected fields include:

* Current or target professional headline
* Professional summary
* Primary career level
* Primary role family or discipline
* Years of experience
* Career goals
* Job preferences
* Visibility or sharing settings if needed later

## Work Experience

Work experience represents employment, contract, freelance, or other professional history.

Expected fields include:

* Company
* Title
* Location
* Work mode
* Start date as an optional date
* End date as an optional date
* Current-role flag
* Description
* Responsibilities
* Achievements
* Technologies or skills used

Experience entries should support ordering and should not require every detail before saving.

## Education

Education represents formal academic history and relevant training programs.

Expected fields include:

* Institution
* Degree or program
* Field of study
* Start date as an optional date
* End date as an optional date
* Completion status
* Notes

## Skills

Skills represent reusable capabilities that can be used for matching, search, analysis, and AI context.

Expected fields include:

* Name
* Category
* Proficiency or confidence level
* Years of experience
* Evidence or notes
* Source

Skill categories may include technical skills, tools, domain knowledge, languages, leadership skills, communication skills, and industry knowledge.

## Projects

Projects represent notable work that may or may not belong to a single employer.

Expected fields include:

* Name
* Role
* Description
* Outcomes
* Technologies or skills used
* Link
* Start date as an optional date
* End date as an optional date

Projects should be available as reusable evidence for resumes, interview preparation, and AI-assisted career storytelling.

## Certifications

Certifications represent credentials, licenses, and completed professional programs.

Expected fields include:

* Name
* Issuer
* Issue date as an optional date
* Expiration date as an optional date
* Credential ID
* Credential URL
* Notes

## Career Goals

Career goals describe what the user wants next.

Expected fields include:

* Target roles
* Target industries
* Desired responsibilities
* Growth goals
* Skills to develop
* Constraints or dealbreakers
* Time horizon

## Job Preferences

Job preferences describe what makes an opportunity attractive or unsuitable.

Expected fields include:

* Preferred employment types
* Preferred seniority levels
* Preferred compensation range
* Preferred company stage or size
* Preferred industries
* Work authorization notes
* Travel preferences

Compensation and authorization fields should be handled carefully and may be deferred until there is a clear UX and privacy need.

## Location and Work Mode Preferences

Location preferences describe where and how the user wants to work.

Expected fields include:

* Current location
* Target locations
* Remote preference
* Hybrid preference
* On-site preference
* Willingness to relocate
* Time zone preferences

---

# Data Model Direction

Career Profile data should default to PostgreSQL through Drizzle because it is structured, relational, user-owned application data.

The schema favors clarity over premature normalization. Profile sections are focused relational tables tied to the owning profile. Highly variable narrative content can be stored as text fields or JSON only where that reduces unnecessary schema churn.

Expected table direction:

* `career_profiles`
* `career_profile_experience`
* `career_profile_education`
* `career_profile_skills`
* `career_profile_projects`
* `career_profile_certifications`
* `career_profile_preferences`

Each table should include:

* Stable primary key
* Owning profile reference
* Timestamps
* Soft ordering where the user controls list order
* Enough denormalized display fields to support straightforward UI rendering

AspAIre supports multiple career profile variants per authenticated user. Exactly one profile can be marked default. Profile variants prevent one durable profile from becoming bloated by unrelated professional identities or resume directions.

---

# Authorization Rules

Career Profile data is private user-owned data.

Resolvers and repositories must:

* Require authentication for all profile operations
* Scope reads and writes to `context.user.id`
* Prevent users from reading, editing, or deleting another user's profile data
* Avoid accepting `userId` from client input where it can be derived from the authenticated context

If profile sharing is introduced later, it should be designed as an explicit feature with separate visibility and access rules.

---

# GraphQL API Direction

The Career Profile domain should expose focused GraphQL operations rather than a single unstructured profile blob.

Implemented queries:

* `careerProfiles`
* `careerProfile`

Implemented foundation mutations:

* `createCareerProfile`
* `deleteCareerProfile`
* `updateCareerProfileSummary`
* `upsertCareerExperience`
* `deleteCareerExperience`
* `upsertCareerEducation`
* `deleteCareerEducation`
* `upsertCareerSkill`
* `deleteCareerSkill`
* `upsertCareerProject`
* `deleteCareerProject`
* `upsertCareerCertification`
* `deleteCareerCertification`
* `updateCareerPreferences`

Deferred mutation candidates include:

* `reorderCareerExperience`
* `reorderCareerEducation`
* `reorderCareerSkill`
* `reorderCareerProject`
* `reorderCareerCertification`

Resolvers should validate authentication first, then delegate persistence to a career profile repository.

---

# Repository Direction

The repository should own all persistence behavior for the domain.

Expected repository responsibilities include:

* Fetch the authenticated user's full profile
* List the authenticated user's profile variants
* Create the initial profile
* Delete non-final profiles and preserve a default profile
* Update top-level profile fields
* Add, update, delete, and reorder profile sections
* Enforce user scoping at the query layer
* Return domain-shaped objects suitable for GraphQL resolvers

The repository should not prepare AI prompts. AI context preparation should live in a separate application-layer helper so persistence remains independent from AI use cases.

---

# UI Direction

The initial Career Profile UI should support progressive completion.

Implemented views:

* Profile overview
* Profile variant selection
* New profile form
* Display-only selected profile detail
* Toolbar actions for edit, delete, and set default
* Edit dialog covering profile summary, experience, education, skills, projects, certifications, and preferences

The current foundation route is:

```text
/career-profile
```

It supports progressive editing of summary, experience, education, skills, projects, certifications, and job/location preferences. The selected profile page is read-only; durable edits happen through explicit form submissions in the edit dialog.

The UI should be practical and work-focused. It should prioritize scanning, editing, completeness, and reuse rather than a marketing-style profile page.

Useful interface patterns include:

* Section-based editing
* Dialog-based add and edit actions
* Empty states for incomplete sections
* Clear saved and unsaved states
* Lightweight validation feedback
* Reorder controls for list sections
* Date pickers and displayed date ranges for date-bearing sections

The profile should not require a long all-at-once form before the user can save progress.

---

# AI Usage

Career Profile is primarily an AI context source in the first implementation.

Initial AI-adjacent uses include:

* Supplying structured career context to resume analysis
* Supplying user background for interview preparation
* Supplying target-role and preference context for market research
* Helping the AI workspace answer career questions with user-specific context

Potential later AI features include:

* Drafting a professional summary from resume or profile sections
* Suggesting missing skills based on experience
* Extracting structured profile data from uploaded resumes
* Rewriting experience bullets for clarity and impact
* Identifying inconsistencies between profile and resumes

AI-generated changes should be reviewable before they become profile data.

Resume-derived profile drafts should be treated as suggestions, not truth. The user should review and accept the draft before it becomes the durable Career Profile record.

---

# Validation Rules

Initial validation should protect data quality without making profile creation brittle.

Recommended rules:

* Text fields should have reasonable length limits
* Date-bearing fields should use nullable `date` storage
* Date pickers should submit ISO `YYYY-MM-DD` values or blank values
* End date should not precede start date
* Current-role entries should not require an end date
* Certification expiration date should not precede issue date
* URLs should be validated when present
* Skill names should not be blank
* List item ordering should be numeric and user-scoped

Validation should be shared where practical between GraphQL inputs and UI forms. The current UI uses React Hook Form with Yup schemas for date-bearing Career Profile section validation.

---

# Privacy and Sensitivity

Career Profile data may include sensitive personal and professional information.

The application should avoid logging:

* Full profile content
* Work authorization details
* Compensation expectations
* Personal contact details
* AI prompt context containing profile content

Any future export, sharing, or AI-context feature should make it clear what profile information is being used.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Repository user scoping
* Resolver authentication checks
* Creating and updating profile data
* Multiple profile selection, defaulting, and deletion behavior
* Adding, editing, deleting, and reordering list sections
* Validation of dates, URLs, and required fields
* UI behavior for empty, partial, and populated profiles where practical

Testing should scale with the implemented surface area. The first slice should prioritize authorization, persistence correctness, and form behavior.

---

# Integration Points

Career Profile should eventually integrate with:

* Resume Library for profile-to-resume consistency and drafting
* Resume Analysis for user background and target positioning
* Job Search for search terms and preference filtering
* Saved Jobs for fit and relevance signals
* Application Tracking for application-specific positioning
* Interview Preparation for role-specific answer planning
* AI Workspace for general career guidance
* Market Research for personalized role and industry exploration

The domain should expose reusable context without becoming tightly coupled to every downstream workflow.

---

# Initial Implementation Slice

The first implementation slice should be intentionally small and complete.

Implemented foundation scope:

* Multiple profile variants per authenticated user
* Default profile selection
* Top-level profile fields
* Work experience
* Education
* Skills
* Projects
* Certifications and awards
* Career goals
* Job and location preferences
* Repository
* GraphQL query and mutations
* Profile selection, read-only overview, toolbar, and edit dialog UI

Focused automated tests for Career Profile authorization, persistence, and validation should be added as the slice hardens.

---

# Open Questions

These questions should be resolved before or during implementation:

* Which fields are required during first-run onboarding?
* Should compensation expectations be captured in the first version?
* Should work authorization be captured now or deferred?
* Should skills be free-form initially, normalized immediately, or normalized later?
* Should resume parsing be allowed to populate profile drafts before the resume library exists?
* What profile context should be sent to AI workflows by default?
* Which profile fields are safe and useful to prefill from an imported resume during first-run setup?

---

# Definition of Done

The Career Profile domain is complete for its foundation phase when:

* Authenticated users can create, select, edit, delete, and default career profiles
* Profile data persists in application-owned storage
* GraphQL operations enforce authentication and ownership
* The UI supports partial and complete profiles
* Date-bearing sections validate start/end ranges before submission
* Structured profile context can be retrieved for future AI workflows
* Tests cover the important authorization and persistence paths
* Database and GraphQL reference docs are updated to match the implementation
