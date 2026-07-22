# MongoDBCommunity.md

# AspAIre MongoDB Community Setup

## Purpose

This document records the MongoDB Community setup expected by AspAIre.

MongoDB is reserved for conversation-style document data in the MVP. Structured product data such as career profiles, resumes, saved jobs, analyses, and application tracking belongs in PostgreSQL.

AspAIre can reuse the existing MongoDB Community server and connection URL inherited from the Saigely setup. Data separation comes from selecting the AspAIre database name.

---

# Database

AspAIre should use its own MongoDB database on the existing MongoDB Community connection:

```text
aspaire
```

The web app selects this database with:

```text
MONGODB_DATABASE=aspaire
```

If `MONGODB_DATABASE` is not set, the code defaults to `aspaire`.

---

# Application User

The existing MongoDB Community connection can be used if its credentials have read/write access to the `aspaire` database.

For production hardening, create a least-privilege application user for the AspAIre database.

Recommended username:

```text
aspaire_app
```

Grant the user read/write access only to the `aspaire` database.

Do not reuse inherited Saigely users for AspAIre production data unless that is an intentional transition decision.

---

# Environment Variables

The web application needs:

```text
MONGODB_URI=
MONGODB_DATABASE=aspaire
```

The original MongoDB Community connection URL may be used for `MONGODB_URI`. The `MONGODB_DATABASE` value remains the explicit application-side selector.

Do not commit passwords, full production connection strings, or Fly.io secrets to the repository.

---

# Collections

## `conversations`

Current MVP use:

* AI workspace conversation transcripts
* User and assistant messages
* Conversation timestamps

Required ownership field:

```text
userId
```

Conversation metadata:

| Field | Notes |
| --- | --- |
| `domain` | Conversation domain, defaults to `general` for legacy and unscoped conversations |
| `domainId` | Optional domain object identifier used to list conversations for a specific profile, resume, job, analysis, or workflow object |

Suggested indexes:

```text
{ userId: 1, updatedAt: -1 }
{ userId: 1, domain: 1, domainId: 1, updatedAt: -1 }
{ userId: 1, _id: 1 }
```

---

# Setup Checklist

1. Reuse the existing MongoDB Community connection URL for `MONGODB_URI`.
2. Create or select the `aspaire` database.
3. Confirm the configured MongoDB user has read/write access to `aspaire`.
4. Set `MONGODB_DATABASE=aspaire`.
5. Confirm conversations are created under `aspaire.conversations`.
6. Create a narrower `aspaire_app` user later if production hardening requires it.
