# Saigely Operations Runbook

This runbook covers the production operation of Saigely and its OpenAI WebSocket Gateway. It is intentionally scoped to the current portfolio MVP deployment rather than a hypothetical multi-region SaaS platform.

## Production topology

| Component | Service | Production endpoint | Responsibility |
| --- | --- | --- | --- |
| Next.js application | Vercel | `https://saigely.vercel.app` | UI, OAuth sessions, JWT/JWKS, GraphQL, and data access |
| WebSocket gateway | Fly.io (`saigely-server`) | `https://saigely-server.fly.dev` / `wss://saigely-server.fly.dev/ws` | JWT verification, OpenAI streaming, and GraphQL persistence calls |
| Relational data | Neon Postgres | Not public | Users, sessions, signing keys, preferences, models, agents, and levels |
| Conversations | MongoDB | Not public | Conversations and messages |
| Model API | OpenAI | External dependency | Responses API streaming |
| Identity providers | GitHub and Google | External dependencies | OAuth sign-in |

The browser talks to Vercel over HTTPS and directly to the Fly gateway over WSS. The gateway depends on the Vercel application for its JWKS, GraphQL API, and application-origin readiness checks.

## Operator prerequisites

- Access to both repositories and their `main` branches.
- Authenticated `fly` CLI access to the `saigely-server` Fly application.
- Access to the Saigely project in Vercel. The repository is linked locally through `.vercel/project.json`.
- Access to Vercel, Fly, Neon, MongoDB, OpenAI, GitHub OAuth, and Google OAuth configuration when diagnosing provider-specific failures.
- Node.js versions supported by each repository: Node.js 20.9+ for Saigely and Node.js 22+ for the gateway.

Never paste secrets, authorization headers, JWTs, prompts, attachments, or model output into tickets, commits, or shared logs.

## Configuration inventory

This is an inventory of names and relationships, not a source of secret values. Hosting dashboards are the source of truth.

### Vercel application

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | Better Auth signing/encryption secret |
| `BETTER_AUTH_URL` | Canonical production application URL |
| `NEXT_PUBLIC_AUTH_URL` | Browser-visible application URL |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `DATABASE_URL` | Neon Postgres connection |
| `MONGODB_URI` | MongoDB connection |
| `NEXT_PUBLIC_WS_SERVER` | Browser-visible gateway WebSocket URL |
| `GRAPHQL_MAX_BODY_BYTES` | Optional GraphQL body limit |
| `GRAPHQL_REQUESTS_PER_MINUTE` | Optional per-instance GraphQL rate limit |

Production URL relationships:

```text
BETTER_AUTH_URL=https://saigely.vercel.app
NEXT_PUBLIC_AUTH_URL=https://saigely.vercel.app
NEXT_PUBLIC_WS_SERVER=wss://saigely-server.fly.dev/ws
```

### Fly gateway

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API access |
| `API_ORIGIN` | Vercel origin hosting `/api/graphql` |
| `CLIENT_ORIGIN` | Exact browser origin allowed to connect |
| `JWKS_URL` | Public Better Auth JWKS endpoint |
| `JWT_ISSUER`, `JWT_AUDIENCE` | JWT claim validation |
| `JWT_ALGORITHMS` | Optional algorithm allowlist; defaults to `RS256` |
| `CORS_ORIGIN` | Optional HTTP CORS origin; defaults to `CLIENT_ORIGIN` |
| Runtime limit and timeout variables | Documented in the gateway README |

Production integration relationships:

```text
API_ORIGIN=https://saigely.vercel.app
CLIENT_ORIGIN=https://saigely.vercel.app
JWKS_URL=https://saigely.vercel.app/api/auth/jwks
JWT_ISSUER=saigely-next
JWT_AUDIENCE=saigely-websocket
```

Changing an origin, JWKS URL, issuer, audience, OAuth callback, or public WebSocket URL is a coordinated change. Update both services as needed and verify authentication before considering it complete.

## Standard deployment

Deploy the gateway first when a release changes the protocol, authentication contract, GraphQL contract, readiness behavior, or integration configuration. This ensures the client never expects gateway behavior that is not yet available. A client-only UI change can be deployed independently.

### 1. Pre-deployment checks

In each changed repository:

```powershell
git status --short
git diff --check
npm test
```

For the Saigely client, also run:

```powershell
npm run lint
npm run build
```

Confirm that:

- the intended commits are on `main`;
- no secret or local environment file is staged;
- required configuration changes are already present in the appropriate hosting service;
- the current production services are healthy enough to distinguish a new regression from an existing incident.

### 2. Deploy the gateway

From the gateway repository:

```powershell
fly deploy
fly status --app saigely-server
fly checks list --app saigely-server
```

Do not proceed to a dependent client deployment until both probes succeed:

```powershell
Invoke-RestMethod https://saigely-server.fly.dev/health
Invoke-RestMethod https://saigely-server.fly.dev/ready
```

`/health` proves that the gateway process can serve HTTP. `/ready` proves that it can currently reach the dependencies required to accept useful chat traffic.

### 3. Deploy the client

The normal production path is a push to `main`, which triggers the linked Vercel project:

```powershell
git push origin main
```

Use the Vercel dashboard or the commit status in GitHub to wait for completion. With an authenticated Vercel CLI, recent deployments and build details are also available through:

```powershell
vercel list --prod
vercel inspect <deployment-url> --wait
vercel inspect <deployment-url> --logs
```

Do not treat a successful build as proof that runtime configuration, authentication, databases, or the gateway integration work.

### 4. Post-deployment smoke test

Run the unauthenticated checks:

```powershell
$homeResponse = Invoke-WebRequest https://saigely.vercel.app/ -UseBasicParsing
$loginResponse = Invoke-WebRequest https://saigely.vercel.app/login -UseBasicParsing
$graphqlResponse = Invoke-WebRequest `
  https://saigely.vercel.app/api/graphql `
  -Method Post `
  -ContentType 'application/json' `
  -Body '{"query":"query Smoke { __typename }"}' `
  -UseBasicParsing
$readyResponse = Invoke-WebRequest `
  https://saigely-server.fly.dev/ready `
  -UseBasicParsing

[pscustomobject]@{
  HomeStatus = $homeResponse.StatusCode
  LoginStatus = $loginResponse.StatusCode
  ContentSecurityPolicy = [bool]$homeResponse.Headers['Content-Security-Policy']
  GraphqlStatus = $graphqlResponse.StatusCode
  GraphqlRequestId = [bool]$graphqlResponse.Headers['X-Request-ID']
  GatewayReadyStatus = $readyResponse.StatusCode
  GatewayReadyBody = $readyResponse.Content
}
```

Expected results:

- home and login return `200`;
- the home response has a Content Security Policy;
- GraphQL returns `200`, `{"data":{"__typename":"Query"}}`, and `X-Request-ID`;
- gateway readiness returns `200` with every check equal to `ok`.

Then perform one authenticated browser check:

1. Sign out and refresh the application.
2. Sign in with GitHub or Google.
3. Confirm the conversation list and preferences load.
4. Open Settings and confirm model and agent selections are populated.
5. Send a harmless sample prompt.
6. Confirm output streams, completes, and persists after a refresh.
7. Check the browser console for unexpected errors.

Avoid using sensitive prompts or attachments for an operational test.

## Health and readiness

### `GET /health`

A successful response means the Node.js gateway process is alive and serving HTTP. It does not test OpenAI, authentication, GraphQL, or the application.

Expected response:

```json
{"status":"ok"}
```

### `GET /ready`

A successful response means all currently required access points passed their checks:

```json
{
  "status": "ready",
  "checkedAt": "<timestamp>",
  "checks": {
    "openai": "ok",
    "jwks": "ok",
    "graphql": "ok",
    "application": "ok"
  }
}
```

| Check | What it establishes | First places to investigate |
| --- | --- | --- |
| `openai` | The configured API key can reach OpenAI | OpenAI status, key validity, billing/project access, Fly secret |
| `jwks` | The Better Auth public keys are reachable and parseable | Vercel deployment, `/api/auth/jwks`, `JWKS_URL`, deployment protection |
| `graphql` | The application GraphQL readiness query succeeds | Vercel runtime logs, GraphQL route, Neon, MongoDB, `API_ORIGIN` |
| `application` | The configured application origin responds | Vercel status, DNS, `API_ORIGIN` |

Readiness results are briefly cached. After correcting a dependency, allow the configured `READINESS_CACHE_MS` interval before treating one stale response as a failed recovery.

## Logs and diagnostics

### Gateway

```powershell
fly logs --app saigely-server
fly status --app saigely-server
fly checks list --app saigely-server
fly releases --app saigely-server --image
```

Gateway logs are structured JSON. Useful fields include `requestId`, `connectionId`, `userId`, event message, duration, close code, and error metadata. Prompt text, streamed content, tokens, and authorization values should not appear.

### Vercel application

```powershell
vercel logs --environment production --level error --since 1h
vercel logs --environment production --expand --limit 20
vercel inspect <deployment-url> --logs
```

GraphQL responses include `X-Request-ID`; GraphQL runtime logs include the same request ID. Use it to locate the corresponding Vercel event.

Gateway WebSocket request IDs and Vercel GraphQL request IDs are currently service-local and are not automatically propagated end to end. To investigate a request across services, correlate a narrow timestamp window with the gateway `connectionId`, gateway `requestId`, authenticated `userId`, and relevant Vercel GraphQL events. Do not use or expose the user's JWT for correlation.

## Incident guide

### Application does not load

1. Check the Vercel deployment and production domain.
2. Request `/` and `/login` directly.
3. Inspect recent Vercel runtime errors and the latest deployment build logs.
4. If only authenticated pages fail, investigate Better Auth and database connectivity rather than the static home response.

### Sign-in or session fails

1. Confirm `BETTER_AUTH_URL` and `NEXT_PUBLIC_AUTH_URL` match the production origin.
2. Confirm the provider callback URLs still target the production `/api/auth/callback/<provider>` routes.
3. Check Vercel logs for Better Auth, Postgres, or provider errors.
4. Confirm provider credentials are present in the Production environment.
5. Test the public JWKS endpoint separately if sign-in succeeds but the gateway rejects authentication.

### Chat stays disconnected or repeatedly reconnects

1. Check `/health`, then `/ready`.
2. Confirm `NEXT_PUBLIC_WS_SERVER` uses `wss://saigely-server.fly.dev/ws`.
3. Confirm `CLIENT_ORIGIN` exactly matches `https://saigely.vercel.app`.
4. Review gateway logs for origin rejection, authentication timeout, JWT validation, capacity, or rate-limit events.
5. If authentication is rejected, compare the configured JWKS URL, issuer, audience, and algorithms across both services.

The client uses bounded automatic reconnection for transient or abnormal closures. Reconnection can mask a short interruption, but repeated attempts indicate an unresolved dependency or configuration problem.

### Chat connects but a request fails before streaming

1. Find the gateway request by time and `connectionId`.
2. Look for preference, model, agent, validation, rate-limit, payload-size, or GraphQL errors.
3. Check Vercel GraphQL logs and both databases if configuration could not be loaded.
4. Check the OpenAI readiness result and provider status.

### Streaming starts but does not complete

1. Look for a stream-idle timeout, OpenAI error, socket close, or application persistence failure in gateway logs.
2. Confirm `/ready` still passes.
3. Check Vercel GraphQL logs and MongoDB connectivity for completion-time persistence errors.
4. Refresh the conversation only after recording the relevant time and IDs; persistence may have failed even though partial text was visible in the browser.

### Conversation completes but is missing after refresh

1. Review the gateway completion/persistence event.
2. Inspect Vercel GraphQL logs for the save mutation.
3. Check MongoDB connectivity and ownership validation.
4. Do not manually edit conversation records during diagnosis unless data repair is explicitly required and backed up.

### `/health` succeeds but `/ready` fails

The process is alive but cannot safely serve full chat traffic. Use the individual readiness keys to isolate the dependency. Restarting the Machine is unlikely to fix a bad secret, mismatched origin, expired/revoked key, provider outage, or broken application deployment.

## Rollback

Rollback the service that introduced the regression. If a release changed a shared contract and compatibility is uncertain, restore the client first to stop new incompatible requests, then restore the gateway.

### Vercel rollback

Inspect recent production deployments:

```powershell
vercel list --prod
vercel inspect <bad-deployment-url>
vercel inspect <bad-deployment-url> --logs
```

Restore the immediately previous production deployment:

```powershell
vercel rollback
vercel rollback status
```

Plan capabilities determine whether an arbitrary older deployment can be selected with `vercel rollback <deployment-url>`. A known-good deployment can alternatively be promoted if the account supports it. After rollback, repeat the HTTP and authenticated smoke tests. A Vercel routing rollback does not change Git history; follow it with a corrective or revert commit so the next push does not reintroduce the failure.

### Fly rollback

Fly rollback is a redeployment of a known-good image, not a separate rollback command:

```powershell
fly releases --app saigely-server --image
fly deploy --app saigely-server --image <known-good-image-reference>
```

Then verify:

```powershell
fly status --app saigely-server
fly checks list --app saigely-server
Invoke-RestMethod https://saigely-server.fly.dev/health
Invoke-RestMethod https://saigely-server.fly.dev/ready
```

Redeploying an older image does not restore previous Fly secrets, `fly.toml` settings, scaling, or external data. Reconcile configuration separately when it was part of the incident. Registry images are not guaranteed to be retained forever.

## Secret and configuration changes

- Change one integration boundary at a time when practical.
- Record which service and environment were changed, but never record the value.
- Redeploy or restart only when required by the hosting service.
- Repeat readiness, authentication, and streaming checks after any OpenAI key, OAuth credential, Better Auth secret, database URL, origin, JWKS, issuer, or audience change.
- Treat `BETTER_AUTH_SECRET` rotation as potentially session-invalidating.
- Coordinate any JWT issuer, audience, algorithm, or JWKS change across the application and gateway.

## Current MVP limitations

- No automated uptime alerting or paging is configured.
- No distributed tracing or shared end-to-end request ID spans Vercel and Fly.
- GraphQL and gateway rate limits are process-local and are supplemental rather than distributed enforcement.
- Readiness is dependency-oriented but is not a substitute for an authenticated streaming synthetic check.
- Operational verification includes a manual authenticated browser step.
- Rollback procedures restore application code/images, not database state or previous secret values.

These are acceptable constraints for the portfolio MVP, but they should be revisited before treating Saigely as a service with formal availability or incident-response commitments.

## Platform references

- [Fly deploy documentation](https://fly.io/docs/launch/deploy/)
- [Fly rollback guide](https://fly.io/docs/blueprints/rollback-guide/)
- [Fly health checks](https://fly.io/docs/reference/health-checks/)
- [Vercel deployment inspection](https://vercel.com/docs/cli/inspect)
- [Vercel runtime logs](https://vercel.com/docs/cli/logs)
- [Vercel production rollback](https://vercel.com/docs/deployments/rollback-production-deployment)
