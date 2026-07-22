# Foundations.md

# AspAIre Foundations

## Project Status

AspAIre is **not** a greenfield application.

It is the successor to **Saigely**, which serves as the completed technical foundation. Saigely reached MVP completion and proved the architecture through implementation, authentication, AI integration, real-time communication, and deployment experimentation.

AspAIre builds upon that foundation rather than replacing it.

---

# Mission

AspAIre is an AI-powered career platform focused on helping professionals discover opportunities, manage their job search, and leverage AI throughout the hiring process.

The objective is to provide a cohesive workflow that combines job discovery, career management, resume optimization, interview preparation, and AI assistance into a single application.

---

# Platform Philosophy

The platform follows several guiding principles.

## Build on Proven Architecture

Infrastructure that has already been solved should not be redesigned without a compelling reason.

Authentication, routing, AI communication, data access, theming, and project structure are considered stable platform concerns.

---

## Separate Platform from Domain

The platform provides reusable capabilities.

### Platform Services

* Authentication
* AI communication
* WebSocket streaming
* Theme management
* User settings
* Data repositories
* GraphQL infrastructure

### Product Domains

AspAIre implements business domains on top of those capabilities.

Examples include:

* Job Search
* Resume Library
* Career Profile
* Application Tracking
* Interview Preparation
* AI Workspace
* Market Research

---

## Feature-First Development

Development proceeds in complete vertical slices.

Each feature should include:

* Database schema
* Repository
* GraphQL/API
* Validation
* Business logic
* User interface
* Testing (where appropriate)

Avoid partially implementing multiple systems simultaneously.

---

## AI as a Platform Capability

Artificial Intelligence is treated as a platform service rather than a standalone feature.

Multiple domains consume AI functionality through a common interface.

Examples include:

* Resume parsing
* Job summarization
* Cover letter generation
* Interview coaching
* Search term generation
* Career analysis
* Market research

---

## Maintainability over Cleverness

Architecture should prioritize clarity and extensibility.

Simple, explicit solutions are preferred over abstractions introduced without demonstrated need.

---

# Technical Baseline

AspAIre inherits the completed Saigely architecture.

## Frontend

* Next.js (App Router)
* React
* Tailwind CSS v4
* shadcn/ui
* Radix UI

---

## Authentication

* Better Auth
* Server-side session management

---

## Data

* PostgreSQL
* Drizzle ORM

---

## API Layer

* GraphQL

---

## AI Server

A dedicated external Node.js server is responsible for:

* OpenAI Responses API integration
* Streaming AI responses
* WebSocket communication
* Long-running AI operations

The AI server is **not** the application backend.

Business data remains owned by the Next.js application.

---

## AI Provider

* OpenAI Responses API
* Streaming support

---

# Architectural Boundary

The system follows one fundamental architectural rule:

> **The Next.js application owns the business. The external AI server owns AI execution.**

Business logic, persistence, user workflows, and application state belong to the Next.js application.

The external AI server exists solely to execute AI workloads and stream results back to the application.

---

# Initial Product Domains

The application consists of independent business domains that share common platform services.

1. Career Profile
2. Resume Library
3. Resume Analysis
4. Job Search
5. Saved Jobs
6. Application Tracking
7. AI Workspace
8. Interview Preparation
9. Market Research
10. User Preferences

Each domain should remain as independent as practical while leveraging the shared platform.

---

# Source of Truth

Project decisions should be recorded in project documentation rather than relying on conversation history.

Conversation history exists to explore ideas and make decisions.

Project documentation exists to preserve those decisions.

Once documented, project documentation becomes the authoritative reference for future development.

## Documentation Philosophy

AspAIre is developed using a **documentation-first** approach.

Conversations are used to explore ideas, evaluate alternatives, and reach architectural or implementation decisions. Once a decision has been finalized, it should be recorded in the appropriate project document.

Project documentation—not conversation history—is the long-term source of truth.

This approach ensures that the project remains understandable, maintainable, and independent of any individual conversation.

### Documentation Hierarchy

```
docs/
├── 00-Project/
│   ├── Foundations.md
│   ├── Vision.md
│   ├── Roadmap.md
│   └── Decisions.md
│
├── 01-Architecture/
│   ├── Architecture.md
│   ├── Frontend.md
│   ├── Authentication.md
│   ├── GraphQL.md
│   ├── AI-Server.md
│   ├── Database.md
│   └── Deployment.md
│
├── 02-Domains/
│   ├── CareerProfile.md
│   ├── ResumeLibrary.md
│   ├── ResumeAnalysis.md
│   ├── JobSearch.md
│   ├── SavedJobs.md
│   ├── ApplicationTracking.md
│   ├── InterviewPreparation.md
│   ├── AIWorkspace.md
│   ├── MarketResearch.md
│   └── UserPreferences.md
│
├── 03-Development/
│   ├── CodingStandards.md
│   ├── ComponentGuide.md
│   ├── Testing.md
│   └── Contributing.md
│
└── 04-Reference/
    ├── DatabaseSchema.md
    ├── GraphQLSchema.md
    ├── Environment.md
    └── ThirdPartyServices.md
```

### Development Workflow

Every significant feature follows the same lifecycle:

1. Define or refine the requirements.
2. Design the architecture.
3. Challenge assumptions and evaluate trade-offs.
4. Document the final decision.
5. Implement the feature.
6. Update documentation to reflect the implementation.

Documentation should evolve alongside the codebase so that a new developer—or a future version of ourselves—can understand the project without relying on historical conversations.
