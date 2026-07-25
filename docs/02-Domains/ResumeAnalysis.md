# ResumeAnalysis.md

# Resume Analysis Domain

## Purpose

The Resume Analysis domain evaluates resume content against user goals, career profile context, job opportunities, and practical resume quality expectations.

It should help users understand how well a resume fits a target role and what changes would make the resume stronger.

Resume Analysis turns stored career materials and job context into actionable feedback rather than generic writing advice.

---

# Domain Status

## Current State

The Resume Analysis domain is planned but not yet implemented.

No production analysis schema, repository, GraphQL operations, AI workflow, or analysis UI currently exists for this domain.

## Roadmap Phase

Resume Analysis belongs to Phase 6: Resume Analysis and Fit Evaluation.

## Primary Outcome

Users can compare a resume against a job opportunity or career target and receive specific, reviewable guidance for improving fit, clarity, and positioning.

---

# Domain Ownership

The Next.js web application owns the Resume Analysis domain.

Ownership includes:

* Analysis request records
* Analysis result records
* Validation
* Authorization
* Persistence
* GraphQL schema and resolvers
* User interface
* Business rules
* Relationship to resumes, career profiles, and jobs

The external AI server owns AI execution and streaming for analysis generation. It must receive application-approved context and return analysis output through documented application-owned persistence workflows.

---

# Product Goals

Resume Analysis should:

* Help users evaluate resume fit for a specific opportunity
* Identify strengths, gaps, missing keywords, and weak positioning
* Provide concrete suggestions users can apply to their resume
* Preserve analysis history for later review
* Explain the basis of recommendations where practical
* Use career profile, resume, and job context together

Analysis should be useful enough to guide revision, not merely score the resume.

---

# User Capabilities

Initial capabilities should include:

* Start an analysis for a selected resume
* Analyze a resume against a saved job or pasted job description
* View fit summary
* View strengths
* View gaps
* View suggested improvements
* View keyword or skill alignment
* Save analysis results
* Re-run analysis after resume changes
* View previous analyses for a resume

Later capabilities may include:

* Compare multiple resumes against one job
* Compare one resume against multiple jobs
* Generate suggested bullet rewrites
* Turn recommendations into draft resume edits
* Track which recommendations were accepted or dismissed
* Build aggregate insights across many job analyses

---

# Core Concepts

## Analysis Request

An analysis request records the inputs and intent for a resume analysis.

Expected fields include:

* Resume ID
* Saved job ID if applicable
* Job description text if pasted manually
* Career profile snapshot reference or summary
* Analysis type
* Requested timestamp
* Requested by user ID
* Status

The request should preserve enough input metadata to explain what was analyzed without duplicating large private content unnecessarily.

## Analysis Result

An analysis result records the output of the analysis workflow.

Expected fields include:

* Request ID
* Overall fit summary
* Fit score or rating if supported
* Strengths
* Gaps
* Missing or underrepresented skills
* Keyword alignment
* Recommended changes
* Role-positioning guidance
* Created timestamp
* AI model or workflow metadata where appropriate

The result should be structured enough for UI rendering and future aggregation.

## Recommendation

A recommendation is a specific suggested change or action.

Expected fields include:

* Category
* Priority
* Recommendation text
* Rationale
* Related resume section
* Related job requirement
* User action status if tracked later

Recommendations should be actionable and tied to evidence where practical.

## Fit Signal

A fit signal describes a relationship between resume content and target-role needs.

Fit signals may include:

* Matching skills
* Missing skills
* Relevant achievements
* Weak evidence
* Seniority alignment
* Industry alignment
* Tool or technology overlap

Fit signals should support both concise summary views and deeper review.

## Analysis Status

Analysis status tracks the lifecycle of a request.

Initial statuses may include:

* Pending
* Running
* Completed
* Failed
* Canceled

The UI should make long-running or failed analysis states understandable.

---

# Data Model Direction

Resume Analysis data should default to PostgreSQL through Drizzle because analysis records are structured, user-owned application data linked to resumes, saved jobs, and applications.

Expected table direction:

* `resume_analysis_requests`
* `resume_analysis_results`
* `resume_analysis_recommendations`
* `resume_analysis_fit_signals`

Each table should include:

* Stable primary key
* Owning `user_id`
* Timestamps
* Relationship to resume ID
* Relationship to saved job ID where applicable
* Analysis status
* Structured output fields suitable for UI rendering

Large prompt payloads, full resume text, and full job descriptions should not be duplicated casually. Store references or snapshots only when necessary for reproducibility and user trust.

---

# Authorization Rules

Resume Analysis data is private user-owned data.

Resolvers and repositories must:

* Require authentication for all analysis operations
* Scope reads and writes to `context.user.id`
* Verify ownership of referenced resumes
* Verify ownership of referenced saved jobs or applications
* Prevent users from accessing another user's analysis results
* Avoid accepting `userId` from client input where it can be derived from the authenticated context

Before starting analysis, the application should confirm the authenticated user owns every referenced input.

---

# GraphQL API Direction

The Resume Analysis domain should expose operations for starting, reading, and listing analysis results.

Initial query direction:

* `resumeAnalyses`
* `resumeAnalysis`
* `resumeAnalysesForResume`
* `latestResumeAnalysisForJob`

Initial mutation direction:

* `startResumeAnalysis`
* `cancelResumeAnalysis`
* `deleteResumeAnalysis`
* `markResumeAnalysisRecommendationStatus`

The initial implementation may choose a simpler synchronous result flow if analysis is not yet long-running. If streaming or asynchronous analysis is used, lifecycle events and persistence rules should be documented before implementation.

Resolvers should validate authentication and input ownership first, then delegate persistence to a resume analysis repository and AI workflow orchestration helper.

---

# Repository Direction

The repository should own persistence behavior for analysis records.

Expected repository responsibilities include:

* Create analysis requests
* Update analysis status
* Save structured analysis results
* Save recommendations and fit signals
* List analyses for a user
* Fetch analysis detail by ID and user ID
* Delete or archive analysis results
* Return domain-shaped objects suitable for GraphQL resolvers

The repository should not call the AI server directly. AI orchestration should live in an application-layer workflow that coordinates repositories, GraphQL, and streaming behavior.

---

# UI Direction

The initial Resume Analysis UI should help users move from analysis to revision.

Expected views:

* Start analysis
* Analysis running state
* Analysis result summary
* Recommendation list
* Strengths and gaps
* Skill or keyword alignment
* Analysis history for a resume

Useful interface patterns include:

* Clear resume and target-job selection
* Fit summary with supporting details
* Prioritized recommendations
* Expandable rationale for recommendations
* Failed analysis recovery action
* Links back to the analyzed resume and job

The UI should avoid presenting a score without explanation. Scores may be useful, but the main value is specific guidance.

---

# AI Usage

Resume Analysis is an AI-assisted domain.

Initial AI uses include:

* Comparing resume text against a job description
* Identifying relevant strengths
* Identifying missing or weakly represented requirements
* Suggesting resume improvements
* Generating role-specific positioning guidance

Potential later AI features include:

* Drafting revised bullets
* Suggesting summary rewrites
* Comparing resume variants
* Creating cover letter input notes
* Producing interview preparation themes from analysis gaps

AI output should be persisted only after the application validates the request context and stores the result as user-owned data. AI-generated suggestions should remain reviewable and should not overwrite resume content automatically.

---

# Validation Rules

Initial validation should protect analysis quality and system safety.

Recommended rules:

* Resume ID should be required
* Referenced resume must belong to the authenticated user
* Saved job ID, if present, must belong to the authenticated user
* Pasted job description should have minimum and maximum length limits
* Analysis type should come from a known allowlist
* Empty resume content should not be analyzed
* Concurrent duplicate analysis requests may be limited

Validation should occur before AI execution begins.

---

# Privacy and Sensitivity

Resume Analysis may combine resume content, career profile data, job descriptions, and AI output.

The application should avoid logging:

* Full resume text
* Full career profile content
* Full job description text when user-provided
* Full prompts
* AI outputs derived from private user content
* Work authorization or compensation details

The UI should make it clear when private resume and profile data will be used for AI analysis.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Repository user scoping
* Resolver authentication checks
* Ownership validation for resumes and saved jobs
* Creating analysis requests
* Saving completed results
* Listing and fetching analysis history
* Failed analysis states
* Validation for missing or invalid input
* UI behavior for empty, running, completed, and failed states where practical

Tests should prioritize authorization, input ownership, and persistence of structured results.

---

# Integration Points

Resume Analysis should eventually integrate with:

* Career Profile for user background and target goals
* Resume Library for source resume content and version history
* Job Search and Saved Jobs for job description and requirements
* Application Tracking for application-specific resume decisions
* Interview Preparation for gap-based coaching and likely questions
* AI Workspace for deeper exploration of recommendations
* Market Research for recurring skill and role patterns

The domain should produce durable insights that downstream workflows can reference without re-running analysis unnecessarily.

---

# Initial Implementation Slice

The first implementation slice should focus on a complete resume-to-job analysis loop.

Recommended scope:

* Select one stored resume
* Analyze against a saved job or pasted job description
* Create analysis request and completed result records
* Store structured fit summary, strengths, gaps, and recommendations
* View analysis result
* View prior analyses for a resume
* Basic tests for authorization, ownership, persistence, and validation

Automatic resume editing, multi-resume comparison, and recommendation action tracking can follow once the core loop is stable.

---

# Open Questions

These questions should be resolved before or during implementation:

* Should the first analysis flow require a saved job or allow pasted job descriptions?
* Should analysis be synchronous, streamed, or asynchronous with status polling?
* Should fit scores be included in the first version?
* What analysis result shape is structured enough for UI and future aggregation?
* How much input context should be snapshotted for reproducibility?
* Should recommendations be individually trackable from the first slice?
* How should failed AI analysis attempts be retried or cleaned up?

---

# Definition of Done

The Resume Analysis domain is complete for its foundation phase when:

* Authenticated users can analyze an owned resume against an owned or provided target role
* Analysis requests and results persist in application-owned storage
* GraphQL operations enforce authentication and ownership
* Results include actionable strengths, gaps, and recommendations
* The UI supports starting analysis and reviewing completed results
* Failed analysis states are understandable and recoverable
* Tests cover important authorization, ownership, and persistence paths
* Database and GraphQL reference docs are updated to match the implementation
