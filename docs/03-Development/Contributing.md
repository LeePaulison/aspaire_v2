# Contributing.md

# AspAIre Contributing Guide

## Purpose

This document describes the expected development workflow for AspAIre.

AspAIre is documentation-first and architecture-conscious. Contributions should preserve the project boundaries established in the project and architecture documentation.

---

# Before Starting Work

Read the relevant docs before changing code:

* `docs/00-Project/Foundations.md`
* `docs/00-Project/Vision.md`
* `docs/00-Project/Roadmap.md`
* `docs/00-Project/Decisions.md`
* Relevant architecture docs in `docs/01-Architecture`
* Relevant domain docs once they exist

For code work, inspect the surrounding implementation before choosing an approach.

---

# Development Workflow

Use the standard lifecycle:

1. Define or refine the requirement.
2. Identify the affected domain or platform area.
3. Review existing docs and code patterns.
4. Make the smallest coherent change.
5. Add or update tests where risk warrants.
6. Update documentation when decisions or contracts changed.
7. Run relevant checks.
8. Summarize what changed and what remains.

---

# Working in Vertical Slices

Feature work should usually be delivered as a vertical slice.

For a domain feature, consider whether the change needs:

* Data schema
* Repository
* GraphQL schema
* Resolver
* UI
* AI integration
* Tests
* Documentation

Avoid building disconnected partial systems.

---

# Workspace Commands

Root scripts delegate to app workspaces:

```powershell
npm run dev:web
npm run dev:ai
npm run build:web
npm run start:web
npm run start:ai
npm run lint
npm test
npm run test:web
npm run test:ai
```

Run the narrowest checks that prove the change, then broaden when the change crosses boundaries.

---

# Documentation Workflow

Documentation is the project source of truth.

Update docs when work changes:

* Architecture
* Product direction
* Domain behavior
* Data ownership
* API contracts
* AI server behavior
* Environment variables
* Deployment expectations
* Testing expectations

Decisions that materially affect the project should be recorded in `docs/00-Project/Decisions.md`.

---

# Branch and Commit Hygiene

Keep changes focused.

Do not mix unrelated refactors with feature work.

Do not commit secrets or local environment files.

Review `git status --short` before committing or handing off work.

---

# Secrets

Never commit or document secret values.

This includes:

* `BETTER_AUTH_SECRET`
* OAuth secrets
* `DATABASE_URL`
* `MONGODB_URI`
* `OPENAI_API_KEY`
* JWTs
* Cookies

Documentation may include variable names and required relationships between values.

---

# Review Checklist

Before considering work complete, check:

* The change follows the documented architecture boundary.
* User-owned data is authorized and scoped.
* Persistence goes through repositories.
* GraphQL contracts are documented if changed.
* AI server changes do not create business-data ownership.
* Tests were added or intentionally skipped based on risk.
* Relevant docs were updated.
* No secrets or local files are included.

---

# Current Transition Notes

The codebase still contains inherited Saigely naming and operational references.

Renaming should be done intentionally, especially when it affects:

* JWT issuer
* JWT audience
* OAuth callback URLs
* Public application origin
* WebSocket server URL
* Fly app names
* MongoDB database names and users

Coordinated platform changes should be documented before implementation.
