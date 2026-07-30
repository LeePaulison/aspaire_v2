# DatabaseSchema.md

# AspAIre Database Schema Reference

## Purpose

This document records the current database schema inventory for AspAIre.

It is a reference, not a migration plan. Future domain schema changes should update this document after implementation.

---

# Data Stores

AspAIre currently uses:

* Neon PostgreSQL through Drizzle ORM
* MongoDB Community on Fly.io through the MongoDB Node driver

The web application owns both data stores.

The AI server must access data through GraphQL, not direct database connections.

---

# PostgreSQL Schema Files

PostgreSQL schema definitions live in:

```text
apps/web/drizzle/*.js
apps/web/drizzle/*.ts
```

The schema barrel file is:

```text
apps/web/drizzle/schema.js
```

Current exported schema modules include:

* Better Auth schema from `drizzle/auth-schema.ts`
* `ai_agents`
* `ai_models`
* `application_events`
* `career_profiles`
* `career_profile_experience`
* `career_profile_education`
* `career_profile_skills`
* `career_profile_projects`
* `career_profile_certifications`
* `career_profile_preferences`
* `domain_preferences`
* `preferences`
* `reasoning_levels`
* `resume_analyses`
* `resume_files`
* `resumes`
* `saved_jobs`
* `verbosity_levels`

---

# Better Auth Tables

Defined in `apps/web/drizzle/auth-schema.ts`.

## `user`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `name` | text | Required |
| `email` | text | Required, unique |
| `email_verified` | boolean | Required, defaults false |
| `image` | text | Optional |
| `created_at` | timestamp | Required, defaults now |
| `updated_at` | timestamp | Required, updates on change |

## `session`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `expires_at` | timestamp | Required |
| `token` | text | Required, unique |
| `created_at` | timestamp | Required, defaults now |
| `updated_at` | timestamp | Required, updates on change |
| `ip_address` | text | Optional |
| `user_agent` | text | Optional |
| `user_id` | text | Required, references `user.id`, cascade delete |

Index:

* `session_userId_idx` on `user_id`

## `account`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `account_id` | text | Required |
| `provider_id` | text | Required |
| `user_id` | text | Required, references `user.id`, cascade delete |
| `access_token` | text | Optional |
| `refresh_token` | text | Optional |
| `id_token` | text | Optional |
| `access_token_expires_at` | timestamp | Optional |
| `refresh_token_expires_at` | timestamp | Optional |
| `scope` | text | Optional |
| `password` | text | Optional |
| `created_at` | timestamp | Required, defaults now |
| `updated_at` | timestamp | Required, updates on change |

Index:

* `account_userId_idx` on `user_id`

## `verification`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `identifier` | text | Required |
| `value` | text | Required |
| `expires_at` | timestamp | Required |
| `created_at` | timestamp | Required, defaults now |
| `updated_at` | timestamp | Required, updates on change |

Index:

* `verification_identifier_idx` on `identifier`

## `jwks`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `public_key` | text | Required |
| `private_key` | text | Required |
| `created_at` | timestamp | Required, defaults now |
| `expires_at` | timestamp | Optional |

---

# AI Configuration Tables

## `preferences`

Defined in `apps/web/drizzle/preferences.js`.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | text | Primary key |
| `theme` | text | Required, defaults `dark` |
| `default_model_id` | text | Required, defaults `gpt-4.1-mini` |
| `temperature` | real | Required, defaults `0.7` |
| `default_reasoning_id` | text | Required, defaults `medium` |
| `default_verbosity_id` | text | Required, defaults `medium` |
| `default_agent_id` | text | Required, defaults `assistant` |
| `created_at` | timestamp with timezone | Defaults now |
| `updated_at` | timestamp with timezone | Defaults now |

## `ai_models`

Defined in `apps/web/drizzle/aiModels.js`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `name` | text | Required |
| `provider` | text | Required |
| `description` | text | Required |
| `enabled` | boolean | Required, defaults true |
| `supports_temperature` | boolean | Required, defaults false |
| `supports_reasoning` | boolean | Required, defaults false |
| `supports_verbosity` | boolean | Required, defaults false |
| `supports_streaming` | boolean | Required, defaults false |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `ai_agents`

Defined in `apps/web/drizzle/aiAgents.js`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `category` | text | Required |
| `domain` | text | Required, defaults `general` |
| `workflow_type` | text | Required, defaults `chat` |
| `name` | text | Required |
| `description` | text | Required |
| `default_model_id` | text | Optional |
| `context_policy` | text | Required, defaults `none` |
| `tool_policy` | text | Required, defaults `none` |
| `system_prompt` | text | Required |
| `prompt_version` | integer | Required, defaults `1` |
| `enabled` | boolean | Required, defaults true |
| `sort_order` | integer | Required, defaults `0` |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `domain_preferences`

Defined in `apps/web/drizzle/domainPreferences.js`.

Stores product-level AI runtime defaults for domain workflows. These defaults are not per-user preferences; they describe how a domain workflow should run unless a request explicitly overrides them.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `domain` | text | Required |
| `workflow_type` | text | Required |
| `agent_id` | text | Optional, references `ai_agents.id`, set null on delete |
| `default_model_id` | text | Optional, references `ai_models.id`, set null on delete |
| `temperature` | real | Optional |
| `default_reasoning_id` | text | Optional, references `reasoning_levels.id`, set null on delete |
| `default_verbosity_id` | text | Optional, references `verbosity_levels.id`, set null on delete |
| `response_format` | text | Required, defaults `text` |
| `response_schema` | jsonb | Optional |
| `enabled` | boolean | Required, defaults true |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

Indexes:

* `domain_preferences_domain_workflow_unique` on `domain`, `workflow_type`

## `reasoning_levels`

Defined in `apps/web/drizzle/reasoningLevels.js`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `name` | text | Required |
| `description` | text | Required |
| `enabled` | boolean | Required, defaults true |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `verbosity_levels`

Defined in `apps/web/drizzle/verbosityLevels.js`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `name` | text | Required |
| `description` | text | Required |
| `enabled` | boolean | Required, defaults true |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

---

# MVP Product Tables

Defined in `apps/web/drizzle/*.js`.

## `career_profiles`

Durable career profile variants for authenticated users. A user may have multiple profiles, with at most one marked default.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `user_id` | text | Required, references `user.id`, cascade delete |
| `name` | text | Required, defaults `Default Profile` |
| `focus` | text | Required, defaults empty |
| `is_default` | boolean | Required, defaults false; at most one default profile per user |
| `headline` | text | Required, defaults empty |
| `summary` | text | Required, defaults empty |
| `career_goals` | text | Required, defaults empty |
| `additional_notes` | text | Required, defaults empty; review holding field for ambiguous or unplaced career context |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

Indexes:

* `career_profiles_user_id_default_unique` on `user_id` where `is_default = true`
* `career_profiles_user_id_idx` on `user_id`

## `career_profile_experience`

Stores work experience rows for a career profile.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `profile_id` | text | Required, references `career_profiles.id`, cascade delete |
| `company` | text | Required, defaults empty |
| `title` | text | Required, defaults empty |
| `location` | text | Required, defaults empty |
| `start_date` | date | Optional |
| `end_date` | date | Optional |
| `is_current` | boolean | Required, defaults false |
| `description` | text | Required, defaults empty |
| `achievements` | jsonb | Required, defaults empty array |
| `sort_order` | integer | Required, defaults `0` |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `career_profile_education`

Stores education rows for a career profile.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `profile_id` | text | Required, references `career_profiles.id`, cascade delete |
| `institution` | text | Required, defaults empty |
| `degree` | text | Required, defaults empty |
| `field_of_study` | text | Required, defaults empty |
| `start_date` | date | Optional |
| `end_date` | date | Optional |
| `notes` | text | Required, defaults empty |
| `sort_order` | integer | Required, defaults `0` |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `career_profile_skills`

Stores skill rows for a career profile.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `profile_id` | text | Required, references `career_profiles.id`, cascade delete |
| `name` | text | Required |
| `category` | text | Required, defaults `General` |
| `proficiency` | text | Required, defaults empty |
| `evidence` | text | Required, defaults empty |
| `sort_order` | integer | Required, defaults `0` |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `career_profile_projects`

Stores notable projects for a career profile.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `profile_id` | text | Required, references `career_profiles.id`, cascade delete |
| `name` | text | Required |
| `role` | text | Required, defaults empty |
| `description` | text | Required, defaults empty |
| `outcomes` | text | Required, defaults empty |
| `technologies` | jsonb | Required, defaults empty array |
| `link` | text | Required, defaults empty |
| `start_date` | date | Optional |
| `end_date` | date | Optional |
| `sort_order` | integer | Required, defaults `0` |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `career_profile_certifications`

Stores certifications, credentials, awards, and similar career proof points for a career profile.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `profile_id` | text | Required, references `career_profiles.id`, cascade delete |
| `name` | text | Required |
| `issuer` | text | Required, defaults empty |
| `issue_date` | date | Optional |
| `expiration_date` | date | Optional |
| `credential_id` | text | Required, defaults empty |
| `credential_url` | text | Required, defaults empty |
| `notes` | text | Required, defaults empty |
| `sort_order` | integer | Required, defaults `0` |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `career_profile_preferences`

Stores job and location preferences for a career profile.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `profile_id` | text | Required, references `career_profiles.id`, cascade delete, unique |
| `target_roles` | jsonb | Required, defaults empty array |
| `target_industries` | jsonb | Required, defaults empty array |
| `locations` | jsonb | Required, defaults empty array |
| `work_modes` | jsonb | Required, defaults empty array |
| `compensation_goals` | text | Required, defaults empty |
| `constraints` | text | Required, defaults empty |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `resumes`

Stores manually entered resume records for the text-first MVP.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `user_id` | text | Required, references `user.id`, cascade delete |
| `profile_id` | text | Optional, references `career_profiles.id`, set null on delete |
| `title` | text | Required |
| `target_role` | text | Required, defaults empty |
| `notes` | text | Required, defaults empty |
| `resume_text` | text | Required, defaults empty |
| `status` | text | Required, defaults `draft`; expected values are `draft`, `active`, `archived` |
| `source_type` | text | Required, defaults `manual`; expected values are `manual`, `upload` |
| `is_primary` | boolean | Required, defaults false |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

Indexes:

* `resumes_user_id_idx` on `user_id`
* `resumes_profile_id_idx` on `profile_id`
* `resumes_status_idx` on `status`

## `resume_files`

Stores uploaded resume original file metadata. S3 stores the binary file; PostgreSQL stores ownership, resume relationship, storage key, upload metadata, and extraction state.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `resume_id` | text | Required, references `resumes.id`, cascade delete |
| `user_id` | text | Required, references `user.id`, cascade delete |
| `original_filename` | text | Required uploaded original filename |
| `content_type` | text | Required uploaded original MIME type |
| `file_size` | integer | Required uploaded original size in bytes |
| `storage_key` | text | Required private S3 object key, never exposed through GraphQL |
| `text_extraction_status` | text | Required, defaults `pending`; expected values are `pending`, `completed`, `failed` |
| `uploaded_at` | timestamp with timezone | Required, defaults now |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

Indexes:

* `resume_files_resume_id_idx` on `resume_id`
* `resume_files_user_id_idx` on `user_id`

## `saved_jobs`

Stores manually saved job opportunities and MVP application tracking fields.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `user_id` | text | Required, references `user.id`, cascade delete |
| `title` | text | Required |
| `company` | text | Required, defaults empty |
| `location` | text | Required, defaults empty |
| `work_mode` | text | Required, defaults `unspecified` |
| `source_url` | text | Required, defaults empty |
| `description` | text | Required, defaults empty |
| `notes` | text | Required, defaults empty |
| `interest_level` | text | Required, defaults `medium` |
| `status` | text | Required, defaults `saved` |
| `application_date` | timestamp with timezone | Optional |
| `next_action` | text | Required, defaults empty |
| `follow_up_date` | timestamp with timezone | Optional |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `resume_analyses`

Persists resume-to-job fit analysis results.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `user_id` | text | Required, references `user.id`, cascade delete |
| `profile_id` | text | Optional, references `career_profiles.id`, set null on delete |
| `resume_id` | text | Required, references `resumes.id`, cascade delete |
| `saved_job_id` | text | Required, references `saved_jobs.id`, cascade delete |
| `status` | text | Required, defaults `completed` |
| `fit_score` | integer | Optional lightweight explainable score |
| `fit_summary` | text | Required, defaults empty |
| `strengths` | jsonb | Required, defaults empty array |
| `gaps` | jsonb | Required, defaults empty array |
| `missing_keywords` | jsonb | Required, defaults empty array |
| `resume_suggestions` | jsonb | Required, defaults empty array |
| `positioning_guidance` | text | Required, defaults empty |
| `model_id` | text | Required, defaults empty |
| `prompt_version` | integer | Required, defaults `1` |
| `raw_output` | jsonb | Optional raw model output |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

## `application_events`

Stores application timeline events for saved jobs.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key |
| `user_id` | text | Required, references `user.id`, cascade delete |
| `saved_job_id` | text | Required, references `saved_jobs.id`, cascade delete |
| `event_type` | text | Required |
| `occurred_at` | timestamp with timezone | Required, defaults now |
| `notes` | text | Required, defaults empty |
| `next_action` | text | Required, defaults empty |
| `created_at` | timestamp with timezone | Required, defaults now |
| `updated_at` | timestamp with timezone | Required, defaults now |

---

# MongoDB Collections

MongoDB access is defined in:

```text
apps/web/lib/db/mongo.js
```

The current default database name is:

```text
aspaire
```

It can be overridden with `MONGODB_DATABASE`.

## `conversations`

Used by:

```text
apps/web/repositories/conversationRepository.js
```

Current document shape:

| Field | Notes |
| --- | --- |
| `_id` | MongoDB ObjectId |
| `userId` | Owning application user ID |
| `domain` | Conversation domain, defaults to `general` for unscoped and legacy conversations |
| `domainId` | Optional domain object identifier for user/domain-scoped conversation lists |
| `createdAt` | Conversation creation timestamp |
| `updatedAt` | Last update timestamp |
| `messages` | Array of user and assistant message documents |

Message shape:

| Field | Notes |
| --- | --- |
| `role` | Message role, currently user or assistant |
| `content` | Message content |
| `createdAt` | Message timestamp |

---

# Baseline Review Items

Phase 1 should confirm:

* Whether AI configuration tables are fully migrated in the AspAIre database
* AspAIre MongoDB database and user creation on Fly.io
* Whether conversation storage remains MongoDB for AspAIre AI Workspace
