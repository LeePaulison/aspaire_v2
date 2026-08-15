# AspAIre

AspAIre is an AI-assisted career workspace for turning a user's career context into practical job-search actions. The MVP focuses on a durable career profile, resume library, saved jobs, resume-to-job analysis, and application tracking.

The repository is a private npm workspace containing two services:

- `apps/web` — Next.js UI, authentication, GraphQL API, and application data access.
- `apps/ai-server` — authenticated WebSocket gateway for streaming OpenAI Responses API output and persisting completed turns through GraphQL.

## Product flow

```text
Career profile + resume + saved job
                |
                v
        Resume-to-job analysis
                |
                v
      Recommendations + next action
                |
                v
        Application tracking
```

## Architecture

```text
Browser
  |-- HTTPS --> Next.js web app
  |                |-- Better Auth and OAuth
  |                |-- GraphQL API
  |                |-- Neon PostgreSQL: structured application data
  |                `-- MongoDB: conversations and messages
  |
  `-- WSS ----> AI server
                   |-- verifies the user's JWT through the web app JWKS
                   |-- streams responses from OpenAI
                   `-- calls the web GraphQL API for configuration and persistence
```

The web application owns product and user data. The AI server owns AI execution and uses the web application's authenticated GraphQL contract for business operations.

## Requirements

- Node.js 22 or newer
- npm
- Neon PostgreSQL
- MongoDB
- An OpenAI API key
- Google OAuth credentials for the default MVP sign-in path
- AWS S3 credentials if resume original-file uploads are enabled

## Quick start

Install all workspace dependencies from the repository root:

```bash
npm install
```

Create the service environment files:

```bash
Copy-Item apps/web/.env.example apps/web/.env.local
Copy-Item apps/ai-server/.env.example apps/ai-server/.env
```

On macOS or Linux, use `cp` in place of `Copy-Item`.

Fill in the required values. For local development, the example files are already configured to connect the web app at `http://localhost:3000` to the AI server at `ws://localhost:8080/ws`.

Start the services in separate terminals:

```bash
npm run dev:ai
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000). The local OAuth callback URLs are:

- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

The AI server exposes:

- `/health` — lightweight process health check
- `/ready` — dependency readiness check
- `/ws` — authenticated WebSocket endpoint

## Common commands

Run these from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev:web` | Start the Next.js development server |
| `npm run dev:ai` | Start the AI WebSocket server in watch mode |
| `npm run build` | Build the web application |
| `npm run lint` | Run web linting |
| `npm test` | Run tests in all workspaces |
| `npm run test:web` | Run web application tests |
| `npm run test:ai` | Run AI server tests |
| `npm run seed:defaults` | Seed default AI models, agents, and preference levels |
| `npm run start:web` | Serve a completed web production build |
| `npm run start:ai` | Start the AI server in production mode |

## Configuration

Environment variable templates are maintained next to each service:

- [`apps/web/.env.example`](apps/web/.env.example)
- [`apps/ai-server/.env.example`](apps/ai-server/.env.example)

For the complete variable reference and coordinated JWT/origin requirements, see [`docs/04-Reference/Environment.md`](docs/04-Reference/Environment.md).

Never commit `.env` files, OAuth secrets, OpenAI keys, database credentials, or cloud-storage credentials.

## Documentation

- [Product brief](docs/00-Project/ProductBrief.md)
- [MVP scope and development sequence](docs/00-Project/MVP.md)
- [Architecture overview](docs/01-Architecture/Architecture.md)
- [Database architecture](docs/01-Architecture/Database.md)
- [GraphQL architecture](docs/01-Architecture/GraphQL.md)
- [Frontend architecture](docs/01-Architecture/Frontend.md)
- [Environment reference](docs/04-Reference/Environment.md)
- [Web application guide](apps/web/README.md)
- [AI server guide](apps/ai-server/README.md)

## Current scope

AspAIre is an MVP and personal product workspace. The current product direction intentionally defers job scraping, autonomous applications, employer accounts, calendar and email integrations, payments, public sharing, and mobile apps until the core profile-to-analysis-to-tracking workflow proves useful.

## License

This project is licensed under the [MIT License](LICENSE).
