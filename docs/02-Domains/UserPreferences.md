# UserPreferences.md

# User Preferences Domain

## Purpose

The User Preferences domain manages user-specific settings that shape the AspAIre experience.

It includes inherited AI and theme preferences as well as future career workflow preferences such as search defaults, work-mode defaults, notification preferences, and personalization settings.

User Preferences should make AspAIre feel consistent and personal without scattering preference logic across product domains.

---

# Domain Status

## Current State

User Preferences are partially implemented through inherited Saigely preference capabilities.

Current inherited behavior includes theme and AI preference storage. AspAIre-specific career workflow preferences are planned but not yet implemented.

## Roadmap Phase

User Preferences is an initial product domain and becomes more important during Phase 9: Personalization and Intelligence.

## Primary Outcome

Users can manage application, AI, and career workflow defaults that influence their experience across AspAIre.

---

# Domain Ownership

The Next.js web application owns the User Preferences domain.

Ownership includes:

* Preference data model
* Validation
* Authorization
* Persistence
* GraphQL schema and resolvers
* User interface
* Business rules

The external AI server may read AI-related preferences through GraphQL, but preferences remain application-owned data.

---

# Product Goals

User Preferences should:

* Preserve stable settings across sessions
* Keep theme and AI defaults user-controlled
* Support career workflow defaults
* Improve search, analysis, and AI behavior without repeated input
* Provide a clear boundary for personalization settings
* Avoid hiding important decisions in implicit AI behavior

Preferences should support the workflow without becoming a heavy configuration system.

---

# User Capabilities

Initial capabilities should include:

* View current preferences
* Update theme preference
* Update default AI model and behavior preferences
* Update job search defaults
* Update work-mode and location defaults where appropriate
* Update notification or reminder preferences once supported
* Reset preferences to defaults where useful

Later capabilities may include:

* Personalization controls
* Recommendation feedback settings
* Default resume selection rules
* Saved search defaults
* AI context-sharing defaults
* Export and data controls

---

# Core Concepts

## Application Preferences

Application preferences affect the general product experience.

Expected fields include:

* Theme
* Default landing area
* Date and display preferences
* UI density where useful

Current inherited theme behavior should be preserved unless a documented decision changes it.

## AI Preferences

AI preferences affect AI model usage and response behavior.

Expected fields include:

* Default model ID
* Temperature
* Default reasoning level
* Default verbosity level
* Default agent ID

Existing AI preference schema should be reviewed before expanding this area.

## Career Workflow Preferences

Career workflow preferences affect search, analysis, and job management defaults.

Expected fields include:

* Target role defaults
* Preferred locations
* Work-mode preference
* Employment type preference
* Default salary visibility or handling if supported
* Preferred resume ID if supported

Some of this information overlaps with Career Profile. Career goals and job preferences that describe the user should remain in Career Profile. Settings that tune product behavior belong in User Preferences.

## Notification Preferences

Notification preferences describe how and when AspAIre should remind the user about follow-ups or stale work.

Expected fields include:

* Follow-up reminder preference
* Stale application reminder preference
* Notification channel if integrations exist
* Quiet hours if needed later

Notification behavior should be deferred until reminders or integrations exist.

## Personalization Preferences

Personalization preferences describe how accumulated context can influence recommendations.

Expected fields include:

* Recommendation enablement
* AI context defaults
* Saved-job prioritization preferences
* Research personalization defaults

These should be explicit when they affect AI behavior or recommendation ranking.

---

# Data Model Direction

User Preferences data should default to PostgreSQL through Drizzle.

Existing inherited table direction:

* `preferences`
* `ai_models`
* `ai_agents`
* `reasoning_levels`
* `verbosity_levels`

Future table direction may include:

* `career_workflow_preferences`
* `notification_preferences`
* `personalization_preferences`

The first implementation should avoid fragmenting preferences into many tables unless the domain boundaries require it. A single preferences table may remain appropriate until career workflow settings become large or independently managed.

---

# Authorization Rules

User preferences are private user-owned data.

Resolvers and repositories must:

* Require authentication for preference operations
* Scope reads and writes to `context.user.id`
* Prevent users from accessing another user's preferences
* Avoid accepting `userId` from client input where it can be derived from the authenticated context

Public AI model and agent configuration may be readable by authenticated users if already supported, but user-selected defaults remain private.

---

# GraphQL API Direction

Current inherited GraphQL operations should be reviewed before new operations are introduced.

Initial query direction:

* `preferences`
* `aiModels`
* `aiAgents`
* `reasoningLevels`
* `verbosityLevels`
* `careerWorkflowPreferences`

Initial mutation direction:

* `updatePreferences`
* `updateAIPreferences`
* `updateThemePreference`
* `updateCareerWorkflowPreferences`
* `resetPreferences`

The final operation names should follow existing GraphQL conventions and avoid duplicating inherited preference APIs.

---

# Repository Direction

Expected repository responsibilities include:

* Fetch preferences for an authenticated user
* Create default preferences when missing
* Update theme and AI preferences
* Update career workflow preferences
* Validate referenced AI configuration IDs
* Return domain-shaped objects suitable for GraphQL resolvers

The repository should not decide how AI prompts are built. It should provide preference values to application and AI-server workflows.

---

# UI Direction

Expected views:

* Settings overview
* Appearance preferences
* AI preferences
* Career workflow defaults
* Notification preferences when supported
* Personalization controls when supported

Useful interface patterns include:

* Segmented controls for theme or mode choices
* Select menus for AI defaults
* Toggles for enablement settings
* Compact forms for defaults
* Clear reset behavior

The UI should keep preferences understandable and avoid exposing implementation details as user-facing settings.

---

# AI Usage

User Preferences inform AI behavior but should not be treated as AI output.

Initial AI-adjacent uses include:

* Default model selection
* Default reasoning and verbosity behavior
* Default agent selection
* Career context defaults where supported

Potential later AI features include:

* Personalization controls for recommendations
* Feedback-driven ranking preferences
* Context-sharing defaults per workflow

AI workflows should respect preferences, but domains should still provide explicit context and user action boundaries.

---

# Validation Rules

Recommended rules:

* Theme should come from a known allowlist
* AI model ID should reference an enabled model
* Reasoning level should reference an enabled level
* Verbosity level should reference an enabled level
* Agent ID should reference an available agent
* Numeric settings such as temperature should stay within provider-supported bounds
* Career workflow defaults should tolerate incomplete profile data

---

# Privacy and Sensitivity

The application should avoid logging:

* Private preference values that reveal sensitive job-search constraints
* AI context-sharing defaults
* Notification channel details
* Authorization headers, cookies, or tokens

Preference changes should be logged only with sanitized metadata where useful.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Repository user scoping
* Resolver authentication checks
* Default preference creation
* Preference updates
* Invalid AI configuration IDs
* Theme validation
* AI server preference reads through GraphQL where touched
* UI behavior for loading, saved, invalid, and reset states where practical

---

# Integration Points

User Preferences should eventually integrate with:

* Career Profile for career goals and job preferences
* Job Search for default filters and search behavior
* Saved Jobs for prioritization defaults
* Resume Analysis for AI behavior and scoring preferences
* Application Tracking for reminders and workflow defaults
* AI Workspace for model, agent, and context defaults
* Market Research for personalization

---

# Initial Implementation Slice

Recommended scope:

* Audit inherited preference behavior
* Preserve existing theme and AI preferences
* Document current preference schema
* Add career workflow defaults only when needed by an implemented domain
* Settings UI aligned with inherited behavior
* Tests for preference loading, updating, and validation

This domain should expand incrementally as product workflows need real settings.

---

# Open Questions

* Which inherited preference fields should remain unchanged?
* Should career workflow defaults live here or in Career Profile?
* Should notification preferences exist before reminders exist?
* Should AI context-sharing defaults be global or per workflow?
* How should users reset preferences?
* Which AI settings should be exposed versus kept as platform configuration?

---

# Definition of Done

The User Preferences domain is complete for its foundation phase when:

* Authenticated users can view and update supported preferences
* Preferences persist in application-owned storage
* GraphQL operations enforce authentication and ownership
* AI server preference reads continue through GraphQL
* Settings UI reflects supported product behavior
* Tests cover important authorization, validation, and persistence paths
* Database and GraphQL reference docs are updated to match the implementation

