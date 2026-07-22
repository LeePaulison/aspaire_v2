# AIWorkspace.md

# AI Workspace Domain

## Purpose

The AI Workspace domain provides a general AI-assisted surface for career research, planning, drafting, analysis, and coaching.

It should let users work with AI across their career context without turning AI into a disconnected chatbot. The workspace should use profile, resume, saved job, application, and preference context when appropriate and with clear user control.

---

# Domain Status

## Current State

The AI Workspace domain is partially inherited through Saigely conversation and AI preference capabilities, but AspAIre-specific career workspace behavior is planned and not yet implemented.

Inherited conversation persistence and streaming patterns should be reviewed before extending this domain.

## Roadmap Phase

AI Workspace belongs to Phase 8: AI Workspace and Research.

## Primary Outcome

Users can use AI for career-focused work while the system remains connected to AspAIre's structured career and job-search context.

---

# Domain Ownership

The Next.js web application owns AI Workspace business data and workflow state.

Ownership includes:

* Workspace conversations or sessions
* Saved AI outputs
* Context selection rules
* User-facing workflow state
* Validation
* Authorization
* Persistence
* GraphQL schema and resolvers
* User interface

The external AI server owns AI execution, OpenAI API calls, WebSocket streaming, and long-running AI operations.

---

# Product Goals

AI Workspace should:

* Provide practical career assistance across domains
* Reuse accumulated career context where appropriate
* Support drafting, research, analysis, planning, and coaching
* Keep AI output reviewable and user-controlled
* Avoid duplicating domain-specific workflows better handled elsewhere
* Preserve useful conversations or outputs as application data

AI Workspace should be a flexible surface, not the owner of every AI feature.

---

# User Capabilities

Initial capabilities should include:

* Start a career-focused AI conversation
* Continue prior conversations
* Select or understand which context is being used
* Ask questions about career profile, resumes, jobs, or applications
* Draft career materials
* Research roles, companies, and market topics
* Save useful outputs where appropriate

Later capabilities may include:

* Workflow-specific AI modes
* Long-running research tasks
* Saved research artifacts
* Context bundles
* Conversation-to-domain actions
* AI-generated planning sessions

---

# Core Concepts

## Workspace Conversation

A workspace conversation is an AI interaction focused on career work.

Expected fields include:

* Title
* User ID
* Created timestamp
* Updated timestamp
* Message history
* Context mode
* Related domain records

Inherited conversation storage should be evaluated before introducing a new persistence model.

## Workspace Message

A workspace message is a user, assistant, or system-visible turn in a conversation.

Expected fields include:

* Role
* Content
* Created timestamp
* Related context references
* AI model metadata where appropriate

Message storage may remain MongoDB if conversation-style document data continues to be the right fit.

## Context Bundle

A context bundle describes the structured data made available to an AI workflow.

Expected fields include:

* Career profile reference
* Resume references
* Saved job references
* Application references
* User preference references
* Context summary

Context bundles should avoid storing full private content unless needed for reproducibility or saved research.

## Saved Output

A saved output is an AI-generated artifact the user wants to keep.

Expected fields include:

* Title
* Output type
* Content
* Source conversation ID
* Related domain records
* Created timestamp

Saved outputs should be distinct from transient chat responses.

---

# Data Model Direction

AI Workspace may use both existing MongoDB conversation storage and PostgreSQL application metadata.

Expected storage direction:

* Conversation messages may remain in MongoDB if inherited patterns remain suitable
* Workspace metadata, saved outputs, and domain relationships should default to PostgreSQL where relational querying matters

Expected table or collection direction:

* `conversations` or AspAIre-specific conversation collection
* `ai_workspace_sessions`
* `ai_workspace_saved_outputs`
* `ai_workspace_context_references`

The inherited MongoDB database naming should be resolved during platform baseline work before committing to long-term workspace storage.

---

# Authorization Rules

AI Workspace data is private user-owned data.

Resolvers and repositories must:

* Require authentication for workspace operations
* Scope reads and writes to `context.user.id`
* Verify ownership of all referenced domain records
* Prevent users from accessing another user's conversations or saved outputs
* Avoid accepting `userId` from client input where it can be derived from the authenticated context

The AI server must authenticate WebSocket requests and fetch application data through GraphQL.

---

# GraphQL API Direction

Initial query direction:

* `aiWorkspaceConversations`
* `aiWorkspaceConversation`
* `aiWorkspaceSavedOutputs`
* `aiWorkspaceContextPreview`

Initial mutation direction:

* `createAIWorkspaceConversation`
* `updateAIWorkspaceConversationTitle`
* `deleteAIWorkspaceConversation`
* `saveAIWorkspaceOutput`
* `deleteAIWorkspaceOutput`
* `prepareAIWorkspaceContext`

Streaming message exchange may continue to use the inherited WebSocket pattern rather than GraphQL mutations for every token.

---

# Repository Direction

Expected repository responsibilities include:

* List and fetch workspace conversations
* Save conversation metadata
* Persist messages if owned by the web app path
* Save AI outputs
* Track related domain records
* Enforce user scoping
* Return domain-shaped objects suitable for GraphQL resolvers

AI execution should remain in the AI server. Repositories should store results and metadata, not call OpenAI.

---

# UI Direction

Expected views:

* AI workspace conversation surface
* Conversation history
* Context selector or context preview
* Saved outputs list
* Saved output detail

Useful interface patterns include:

* Clear message stream
* Visible context scope
* Quick actions tied to career workflows
* Save output action
* Links to related profile, resume, job, or application records
* Recoverable streaming failure state

The UI should make AI feel connected to the workspace without hiding the user's underlying domain data.

---

# AI Usage

AI Workspace is the broadest AI-facing domain.

Initial AI uses include:

* Career Q&A using profile context
* Company and role research
* Resume and cover letter drafting support
* Search term generation support
* Interview brainstorming
* Application next-action planning

Potential later AI features include:

* Long-running research workflows
* Multi-step career planning
* Saved research synthesis
* Cross-domain recommendations

AI-generated content should be reviewable and should not mutate domain records without explicit user action.

---

# Validation Rules

Recommended rules:

* Conversation title length should be limited
* Message content should have maximum length limits
* Context references must belong to the authenticated user
* Saved output type should come from a known allowlist
* Empty messages should not be sent
* Streaming requests should respect payload and rate limits

---

# Privacy and Sensitivity

The application should avoid logging:

* Full message content
* Full prompts
* Full AI outputs
* Private career profile, resume, job, or application context
* Authorization headers, cookies, or tokens

The UI should make context use understandable, especially when AI is using private profile or resume content.

---

# Testing Expectations

Initial implementation should include focused tests for:

* Conversation user scoping
* Saved output user scoping
* Resolver authentication checks
* Context ownership validation
* Saved output creation and deletion
* WebSocket integration behavior where touched
* UI behavior for empty, streaming, completed, and failed states where practical

---

# Integration Points

AI Workspace should eventually integrate with:

* Career Profile for durable user background
* Resume Library for document context
* Saved Jobs for opportunity context
* Resume Analysis for recommendations and gaps
* Application Tracking for next actions
* Interview Preparation for coaching
* Market Research for research workflows
* User Preferences for AI defaults

---

# Initial Implementation Slice

Recommended scope:

* Confirm inherited conversation persistence strategy
* Career-focused conversation surface
* Conversation history
* Context preview for selected domain records
* Save useful AI output
* GraphQL operations for metadata and saved outputs
* WebSocket streaming through the inherited AI server
* Tests for authentication, ownership, and persistence behavior

Advanced agent workflows and long-running research can follow later.

---

# Open Questions

* Should AspAIre reuse inherited conversation collections or create new workspace-specific records?
* What context should AI Workspace include by default?
* Should context selection be explicit for every conversation?
* Which AI outputs deserve first-class saved artifacts?
* How should workspace conversations link back to domain records?
* How much conversation content should be available to future AI workflows?

---

# Definition of Done

The AI Workspace domain is complete for its foundation phase when:

* Authenticated users can use a career-focused AI workspace
* Conversation or workspace state persists according to documented storage rules
* GraphQL and WebSocket flows enforce authentication and ownership
* Users can understand or control relevant context use
* Useful AI outputs can be saved
* Tests cover important authorization, context, and persistence paths
* Database and GraphQL reference docs are updated to match the implementation

