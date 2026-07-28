# GraphQLSchema.md

# AspAIre GraphQL Schema Reference

## Purpose

This document records the current GraphQL schema inventory for AspAIre.

The GraphQL API is exposed by the web application at:

```text
/api/graphql
```

---

# Schema Files

GraphQL SDL files live in:

```text
apps/web/graphql/schemas
```

Current files:

* `root.graphql`
* `user.graphql`
* `conversation.graphql`
* `preferences.graphql`
* `aiModels.graphql`
* `aiAgents.graphql`
* `careerProfile.graphql`
* `resume.graphql`
* `reasoningLevels.graphql`
* `verbosityLevels.graphql`

Schemas are loaded and merged by `apps/web/graphql/schemas/index.js`.

---

# Root Types

`root.graphql` defines empty root types:

```graphql
type Query
type Mutation
```

Feature schema files extend these roots.

---

# User Schema

Types:

* `User`
* `Me`

Queries:

* `me: Me`

Purpose:

* Expose current authentication state and basic user data.

---

# Conversation Schema

Types:

* `Message`
* `ConversationSummary`
* `Conversation`
* `SaveConversationTurnPayload`

Inputs:

* `SaveConversationTurnInput`

Queries:

* `conversations(domain: String, domainId: String): [ConversationSummary!]!`
* `conversation(id: ID!): Conversation`

Mutations:

* `saveConversationTurn(input: SaveConversationTurnInput!): SaveConversationTurnPayload!`
* `deleteConversation(id: ID!): Boolean!`

Purpose:

* Read, append, create, and delete authenticated user conversations.
* Scope conversation lists by user, domain, and domain object ID.
* Support AI server persistence after streamed responses complete.

---

# Preferences Schema

Types:

* `Preferences`

Inputs:

* `UpdatePreferencesInput`

Queries:

* `preferences: Preferences`

Mutations:

* `updatePreferences(input: UpdatePreferencesInput!): Preferences`

Purpose:

* Store and update user defaults for theme, model, agent, temperature, reasoning, and verbosity.

---

# AI Models Schema

Types:

* `AiModel`

Queries:

* `aiModels: [AiModel!]!`

Purpose:

* Expose available AI models and capability flags used by the UI and AI server.

---

# AI Agents Schema

Types:

* `AiAgent`
* `AiAgentConfiguration`

Queries:

* `aiAgents: [AiAgent!]!`
* `aiAgentConfiguration(agentId: String!): AiAgentConfiguration`

Purpose:

* Expose user-facing AI agent metadata.
* Include MVP-oriented agent domain, workflow, context policy, tool policy, prompt version, enabled state, and ordering metadata.
* Expose selected agent system prompt configuration to authenticated AI server calls.

---

# Career Profile Schema

Types:

* `CareerProfile`
* `CareerExperience`
* `CareerEducation`
* `CareerSkill`
* `CareerProject`
* `CareerCertification`
* `CareerProfilePreferences`

Inputs:

* `UpdateCareerProfileSummaryInput`
* `UpsertCareerExperienceInput`
* `UpsertCareerEducationInput`
* `UpsertCareerSkillInput`
* `UpsertCareerProjectInput`
* `UpsertCareerCertificationInput`
* `UpdateCareerPreferencesInput`

Queries:

* `careerProfiles: [CareerProfile!]!`
* `careerProfile(profileId: String): CareerProfile`

Mutations:

* `createCareerProfile(input: CreateCareerProfileInput): CareerProfile!`
* `deleteCareerProfile(profileId: String!): [CareerProfile!]!`
* `updateCareerProfileSummary(input: UpdateCareerProfileSummaryInput!): CareerProfile!`
* `upsertCareerExperience(input: UpsertCareerExperienceInput!): CareerProfile!`
* `deleteCareerExperience(experienceId: String!): CareerProfile!`
* `upsertCareerEducation(input: UpsertCareerEducationInput!): CareerProfile!`
* `deleteCareerEducation(educationId: String!): CareerProfile!`
* `upsertCareerSkill(input: UpsertCareerSkillInput!): CareerProfile!`
* `deleteCareerSkill(skillId: String!): CareerProfile!`
* `upsertCareerProject(input: UpsertCareerProjectInput!): CareerProfile!`
* `deleteCareerProject(projectId: String!): CareerProfile!`
* `upsertCareerCertification(input: UpsertCareerCertificationInput!): CareerProfile!`
* `deleteCareerCertification(certificationId: String!): CareerProfile!`
* `updateCareerPreferences(input: UpdateCareerPreferencesInput!): CareerProfile!`

Purpose:

* Create, list, read, update, and delete authenticated user career profile variants.
* Support multiple profile variants per authenticated user while preserving exactly one default profile where profiles exist.
* Manage profile name, focus, default state, summary, additional notes, experience, education, skills, projects, certifications, and job/location preferences.
* Expose date-bearing fields as nullable strings backed by PostgreSQL `date` columns.
* Preserve user ownership by deriving `userId` from GraphQL context rather than client input.

---

# Resume Schema

Types:

* `Resume`
* `ResumeFile`
* `ResumeDeletionReceipt`

Inputs:

* `CreateResumeInput`
* `UpdateResumeInput`

Queries:

* `resumes(includeArchived: Boolean): [Resume!]!`
* `resume(resumeId: String!): Resume`
* `primaryResume: Resume`

Mutations:

* `createResume(input: CreateResumeInput!): Resume!`
* `updateResume(resumeId: String!, input: UpdateResumeInput!): Resume`
* `setPrimaryResume(resumeId: String!): Resume`
* `archiveResume(resumeId: String!): Resume`
* `restoreResume(resumeId: String!): Resume`
* `deleteResumeFile(resumeId: String!, fileId: String!): Resume`
* `deleteResume(resumeId: String!): ResumeDeletionReceipt`

Purpose:

* Create, read, update, archive, restore, and delete authenticated user resume records.
* Delete individual uploaded-original files while returning the updated resume.
* Store manual resume text plus metadata for future analysis workflows.
* Expose non-sensitive uploaded-original metadata through `Resume.files` while keeping storage keys private.
* Preserve user ownership by deriving `userId` from GraphQL context rather than client input.

---

# Reasoning Levels Schema

Types:

* `ReasoningLevel`

Queries:

* `reasoningLevels: [ReasoningLevel!]!`

Purpose:

* Expose reasoning effort options for models that support reasoning controls.

---

# Verbosity Levels Schema

Types:

* `VerbosityLevel`

Queries:

* `verbosityLevels: [VerbosityLevel!]!`

Purpose:

* Expose text verbosity options for models that support verbosity controls.

---

# Resolver Inventory

Resolvers are composed in:

```text
apps/web/graphql/resolvers/index.js
```

Current resolver modules:

* `preferences.js`
* `aiAgents.js`
* `aiModel.js`
* `reasoningLevels.js`
* `verbosityLevel.js`
* `conversations.js`
* `careerProfile.js`
* `resumes.js`

---

# Authentication Expectations

User-owned operations must use GraphQL context authentication.

Current context supports:

* Better Auth session cookies
* Bearer JWTs verified against the app JWKS

The AI server uses bearer JWTs when calling GraphQL.

---

# Future Schema Updates

Future AspAIre domains should update this file when adding or changing GraphQL types, queries, mutations, or ownership rules.

Domain schema additions should also be documented in the corresponding domain document.
