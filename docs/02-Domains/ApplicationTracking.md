# ApplicationTracking.md

# Application Tracking Domain

## Purpose

The Application Tracking domain turns saved job opportunities into an actionable job-search pipeline.

It helps users understand where each opportunity stands, what has happened, what needs attention, and what should happen next.

Application Tracking should reduce the need for external spreadsheets, scattered notes, and memory-driven follow-up management.

---

# Domain Status

## Current State

The Application Tracking domain is planned but not yet implemented.

No production application schema, repository, GraphQL operations, pipeline UI, activity workflow, or reminder workflow currently exists for this domain.

## Roadmap Phase

Application Tracking belongs to Phase 7: Application Tracking.

## Primary Outcome

Users can track application stages, submitted materials, important dates, notes, interactions, and next actions for saved job opportunities.

---

# Domain Ownership

The Next.js web application owns the Application Tracking domain.

Ownership includes:

* Application records
* Pipeline stages
* Activity and note records
* Resume-to-application relationships
* Follow-up and next-action fields
* Validation
* Authorization
* Persistence
* GraphQL schema and resolvers
* User interface
* Business rules

The external AI server may suggest next actions, summarize activity, or help draft follow-up material, but persisted application state belongs to the web application.

---

# Product Goals

Application Tracking should:

* Show the current state of the user's job search
* Connect applications to saved jobs and submitted resumes
* Preserve important dates and interactions
* Surface follow-ups and next actions
* Support simple pipeline management without becoming recruiter ATS software
* Help AI workflows understand application-specific context

The user should be able to answer: "What is happening with this opportunity, and what should I do next?"

---

# User Capabilities

Initial capabilities should include:

* Create an application from a saved job
* View application pipeline
* View application detail
* Update application stage
* Record application date
* Attach submitted resume
* Add notes
* Record interactions
* Set follow-up date or next action
* Archive or close applications

Later capabilities may include:

* Activity timeline
* Interview event tracking
* Offer tracking
* Follow-up draft generation
* Application health or stale-state detection
* Pipeline analytics
* Calendar integration

---

# Core Concepts

## Application

An application is the user's active or historical pursuit of a saved job.

Expected fields include:

* Saved job ID
* Current stage
* Applied date
* Submitted resume ID
* Source URL
* Contact name
* Contact email
* Next action
* Follow-up date
* Closed date
* Closed reason
* Created timestamp
* Updated timestamp

An application should reference a saved job rather than duplicating the full opportunity model.

## Application Stage

Application stage describes where the opportunity sits in the user's pipeline.

Initial stages may include:

* Interested
* Applied
* Recruiter Screen
* Interviewing
* Offer
* Rejected
* Withdrawn
* Closed

The first implementation can use a fixed stage list. Custom stages may be considered later if real usage requires them.

## Activity

An activity records an event or interaction related to an application.

Expected fields include:

* Activity type
* Title
* Notes
* Occurred date
* Related contact
* Created timestamp

Activity types may include application submitted, recruiter message, phone screen, interview, follow-up sent, assessment, offer, rejection, and user note.

## Next Action

Next action records what the user intends to do next.

Expected fields include:

* Action text
* Due date
* Completion status
* Completed timestamp

Next actions should begin as simple fields. A full task system should wait until the workflow proves it needs one.

## Application Outcome

Application outcome records how an opportunity ended.

Expected fields include:

* Outcome status
* Closed date
* Reason
* Notes

Outcomes should support useful review later without forcing the user into heavy data entry.

---

# Data Model Direction

Application Tracking data should default to PostgreSQL through Drizzle because it is structured, relational, user-owned application data.

Expected table direction:

* `applications`
* `application_activities`
* `application_notes`
* `application_next_actions`

Each table should include:

* Stable primary key
* Owning `user_id`
* Timestamps
* Relationship to saved job ID
* Relationship to resume ID where appropriate
* Stage or status fields where appropriate

The first implementation can keep notes and next action fields on the application record if separate tables add more complexity than value.

---

# Authorization Rules

Application data is private user-owned data.

Resolvers and repositories must:

* Require authentication for all application operations
* Scope reads and writes to `context.user.id`
* Verify ownership of referenced saved jobs
* Verify ownership of referenced resumes
* Prevent users from accessing another user's application records
* Avoid accepting `userId` from client input where it can be derived from the authenticated context

Ownership checks are especially important because applications connect multiple private domain records.

---

# GraphQL API Direction

Initial query direction:

* `applications`
* `application`
* `applicationsByStage`
* `applicationsForSavedJob`

Initial mutation direction:

* `createApplication`
* `updateApplication`
* `updateApplicationStage`
* `deleteApplication`
* `archiveApplication`
* `addApplicationActivity`
* `updateApplicationActivity`
* `deleteApplicationActivity`
* `updateApplicationNextAction`
* `markApplicationNextActionComplete`

Resolvers should validate authentication and referenced-record ownership first, then delegate persistence to an application repository.

---

# Repository Direction

Expected repository responsibilities include:

* Create applications from saved jobs
* List applications for an authenticated user
* Fetch application detail by ID and user ID
* Update stage, dates, resume links, and next actions
* Add, update, and delete activity records
* Archive or close applications
* Return domain-shaped objects suitable for GraphQL resolvers

The repository should not generate AI recommendations. AI next-action suggestions should be orchestrated separately and saved only after user review where appropriate.

---

# UI Direction

Expected views:

* Application pipeline
* Application list
* Application detail
* Create application from saved job
* Stage update controls
* Activity timeline
* Notes and next-action editor

Useful interface patterns include:

* Dense pipeline columns or grouped lists
* Stage filters
* Clear saved job and company context
* Submitted resume indicator
* Follow-up date visibility
* Empty state that points to Saved Jobs
* Fast stage updates

The UI should be operational and scannable, built for repeated use.

---

# AI Usage

Initial AI-adjacent uses include:

* Suggesting next actions from application stage and activity
* Drafting follow-up notes
* Summarizing application history
* Preparing context for interview workflows

Potential later AI features include:

* Detecting stale applications
* Recommending prioritized follow-ups
* Generating application pipeline insights
* Suggesting resume variants for active applications

AI should assist the user's workflow without changing stages or sending outreach automatically.

---

# Validation Rules

Recommended rules:

* Saved job ID should be required
* Referenced saved job must belong to the authenticated user
* Submitted resume, if present, must belong to the authenticated user
* Stage should come from a known allowlist
* Applied date should not be in the unreasonable future
* Follow-up date should be optional
* Closed date should be present when an application is closed where practical
* Duplicate active applications for the same saved job should warn or block intentionally

---

# Privacy and Sensitivity

The application should avoid logging:

* Application notes
* Recruiter or contact details
* Full activity history
* Follow-up drafts
* AI prompts containing private application context

Calendar or email integrations should be designed separately with explicit user consent.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Repository user scoping
* Resolver authentication checks
* Saved job ownership validation
* Resume ownership validation
* Creating and updating applications
* Stage transitions
* Activity creation and deletion
* Duplicate application behavior
* UI behavior for empty, active, grouped, and closed states where practical

---

# Integration Points

Application Tracking should eventually integrate with:

* Saved Jobs for source opportunities
* Resume Library for submitted materials
* Resume Analysis for fit and revision history
* Interview Preparation for scheduled or expected interviews
* AI Workspace for drafting and planning
* User Preferences for notification and workflow defaults

---

# Initial Implementation Slice

Recommended scope:

* Create application from saved job
* Pipeline or grouped list view
* Application detail
* Stage updates
* Submitted resume link
* Notes and next action
* Basic activity records
* Repository
* GraphQL query and mutations
* Tests for authorization, ownership, persistence, and stage behavior

Calendar integrations, analytics, and automated reminders can follow later.

---

# Open Questions

* Should Saved Jobs have an `Applied` status before Application Tracking exists?
* Should application stages be fixed or user-customizable?
* Should notes be a single field, activity entries, or both?
* Should next actions be simple fields or separate task records?
* How should duplicate applications for one saved job be handled?
* What application context should be available to AI workflows by default?

---

# Definition of Done

The Application Tracking domain is complete for its foundation phase when:

* Authenticated users can create and manage applications from saved jobs
* Application data persists in application-owned storage
* GraphQL operations enforce authentication and ownership
* Users can update stages, notes, activities, and next actions
* The UI supports pipeline review and application detail workflows
* Tests cover important authorization, ownership, and persistence paths
* Database and GraphQL reference docs are updated to match the implementation
