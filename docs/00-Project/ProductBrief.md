# AspAIre Product Brief

## Purpose

This is the short read for regaining the shape of AspAIre when the product starts to feel mentally scattered.

AspAIre is an AI-powered career workspace for professionals managing a job search. It helps users collect career context, manage resumes and opportunities, analyze fit, improve materials, and track what to do next.

The product should feel like a guided career operating system, not a generic AI chatbot and not a pile of disconnected tools.

---

# Product Thesis

AspAIre becomes valuable when career context accumulates.

The app should help the user build a reusable source of truth about:

* Who they are professionally
* What they have done
* What roles they want
* What resumes and materials they have
* What jobs they are considering
* What applications need attention

AI is useful because it works from that context and helps the user take the next practical step.

---

# Core Loop

The core loop is:

```text
Resume + Career Profile + Projects + Target Job
  -> Fit and gap analysis
  -> Evidence-backed recommendations
  -> Resume or positioning improvements
  -> Application status and next action
```

The important differentiator is the third layer of comparison:

```text
What the job asks for
vs.
What the resume says
vs.
What the user has actually done
```

AspAIre should surface useful proof points from the user's career profile, projects, and resume library. It should help the user decide what evidence to add, emphasize, revise, or prepare.

---

# First-Run Shape

New users should not start in blank chat.

The first-run flow should lead with:

```text
Do you have a resume?
```

Primary path:

```text
Yes -> Resume Input -> Profile Draft Review -> Next Task
```

Alternate path:

```text
No -> Career Profile Setup -> Resume Later -> Next Task
```

Other starts can exist, including job analysis, application tracking, AI Workspace, and skip. But resume input is the lead path because it is usually the fastest way to collect real career context.

`Skip for now` should land on Home or Dashboard, not AI Workspace.

---

# Product Surfaces

## Home or Dashboard

The neutral workspace landing page. It should show setup progress, next actions, recent work, and clear entry points.

## Resume Library

Stores resume versions and uploaded originals. This is the preferred first-run entry for users who already have a resume.

## Career Profile

The durable representation of the user's professional identity. It can be built manually or reviewed from resume-derived suggestions.

## Projects and Career Evidence

The proof layer. Projects, achievements, skills, and outcomes are what let AspAIre recommend stronger resume content and interview talking points.

## Saved Jobs

Stores opportunities the user wants to evaluate, apply to, or track.

## Resume Analysis

Compares resume, profile, projects, and target job. Produces specific gaps, strengths, missing proof points, and suggested next actions.

## Application Tracking

Turns saved jobs into a pipeline with status, notes, dates, and next actions.

## AI Workspace

One-click access for exploratory or cross-domain career work. It is useful, but secondary. Domain workflows own durable records.

---

# What AspAIre Is Not

AspAIre is not:

* A generic chatbot with career prompts
* A public job board
* An employer or recruiter ATS
* A fully autonomous application bot
* A resume template tool only
* A spreadsheet replacement only

It may eventually support job discovery, automation, and deeper AI workflows, but the center is the user's career context and job-search decision loop.

---

# Build Priority

When unsure what to build next, prefer the thing that strengthens the core loop:

1. Capture better career context.
2. Store or improve resume evidence.
3. Save and understand target jobs.
4. Compare the user against a real opportunity.
5. Recommend the next useful action.
6. Preserve the state so the user can return later.

If a feature does not improve that loop, it is probably secondary.

---

# MVP vs SaaS Phases

AspAIre uses MVP slices to prove thin, usable workflow foundations. These are not the same as full SaaS product phases.

When an MVP slice is complete, it means the smallest useful version of that workflow is usable and documented. It does not mean the broader SaaS domain is complete.

Current example:

* **Phase 3 MVP / Resume Library foundation:** complete.
* **Phase 3 SaaS / full Resume Library:** still open.

The completed MVP foundation supports manual resume records, uploaded originals, plain text extraction, primary resume selection, archive and delete behavior, and storage cleanup.

The broader SaaS Resume Library still includes deeper version history, structured section extraction, download links, richer comparison, resume-to-profile review workflows, and AI-assisted resume improvement.

Use this distinction whenever marking a phase done:

```text
MVP slice complete != SaaS phase complete
```

---

# Phase Status

| Phase | Area | MVP/Foundation Status | SaaS/Product Status |
| --- | --- | --- | --- |
| 0 | Project Orientation and Documentation | Complete | Living documentation continues |
| 1 | Platform Baseline | Complete enough for feature work | Ongoing hardening |
| 2 | Career Profile | Foundation complete | Broader profile intelligence remains open |
| 3 | Resume Library | Foundation complete | Full Resume Library remains open |
| 4 | Job Search and Saved Jobs | Not started | Not started |
| 5 | Resume Analysis and Fit Evaluation | Not started | Not started |
| 6 | Application Tracking | Not started | Not started |
| 7 | Interview Preparation | Not started | Not started |
| 8 | AI Workspace and Research | Inherited chat foundation exists | Career-specific workspace remains open |
| 9 | Personalization and Intelligence | Not started | Not started |
| 10 | Polish, Reliability, and Release Readiness | Not started | Not started |

Use this table as a quick orientation aid, not a detailed task tracker. The roadmap and domain docs remain the source for phase scope.
