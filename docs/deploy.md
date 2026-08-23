# Deploy

Two Vercel projects and one worker process.

| What | Where | Deploys from |
|---|---|---|
| Patchlet dashboard, console and API | Vercel project `patchlet-v2` | this repository, `main` |
| Not Mistral, the demo host app | Vercel project `not-mistral` | the `not-mistral` repository, `main` |
| The escalation worker | any machine with `uv`, including a laptop | run by hand, see below |

Both Vercel projects sit in the same personal team and auto-deploy on a push to `main`.

## Vercel project `patchlet-v2`

Root directory `apps/web`. Build command `npm run build` at the repository root so the widget is
built and copied into `apps/web/public/widget.js` before Next builds. Node 20 or newer.

Environment variables, all as plain environment variables on the project (Production and Preview):

| Variable | Notes |
|---|---|
| `MISTRAL_API_KEY` | secret |
| `SUPABASE_URL` | |
| `SUPABASE_SERVICE_ROLE_KEY` | secret, server-side only |
| `SUPABASE_ANON_KEY` | not read by the app today, set it for completeness |
| `GITHUB_TOKEN` | secret, fine-grained, contents/issues/pull-requests on the target repository only |
| `VERCEL_TOKEN` | secret, used to watch the target project's deployments |
| `PATCHLET_PROJECT_SLUG` | `not-mistral` |
| `ESCALATION_ENGINE` | `mistral`, or `local` to fall back to the worker's own runner |
| `MISTRAL_WORKFLOW_NAME` | `patchlet-missing-feature` |
| `MISTRAL_DEPLOYMENT_NAME` | `patchlet-worker` |
| `NEXT_PUBLIC_APP_URL` | the production origin, for example `https://patchlet-v2.vercel.app` |
| `TARGET_VERCEL_PROJECT` | `not-mistral` |
| `SLACK_WEBHOOK_URL` | optional |

`DATABASE_URL` is **not** needed on Vercel. It is only used by `npm run db:migrate`, which you run
from your own machine against the same database.

Migrations are not run at build time on purpose, so a failed deploy can never leave the schema half
applied. Run them yourself before deploying a schema change:

```bash
npm run db:migrate
npm run db:seed
```

## Vercel project `not-mistral`

Root directory is that repository's root, default Next build. It needs only two variables, both
public, and both pointing at the deployed dashboard:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_PATCHLET_WIDGET_URL` | `https://<dashboard origin>/widget.js` |
| `NEXT_PUBLIC_PATCHLET_KEY` | the seeded project's embed key, printed by `npm run db:seed` |

With either unset the host app renders no widget, which is the correct behaviour for a preview
deployment.

## The worker

The worker is a long-running Python process, not a serverless function, because it holds a durable
workflow's task queue open and waits for a human approval that may take minutes. It runs anywhere
with `uv` installed, a laptop included.

```bash
cd services/worker
uv sync
uv run python worker.py
```

It needs `MISTRAL_API_KEY`, `DEPLOYMENT_NAME` (matching `MISTRAL_DEPLOYMENT_NAME` on the dashboard),
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_TOKEN` and `VERCEL_TOKEN` in its environment.
Setting only `api_key=` in code is not enough; the environment variables must be present.

For the fallback path, run `uv run python local_runner.py` instead and set `ESCALATION_ENGINE=local`
on the dashboard. The runner polls the `escalation` table for queued local rows and executes the same
steps in order, so the console cannot tell the difference.

Details of the workflow's steps are in `services/worker/README.md`.

## Checks after a deploy

```bash
curl https://<dashboard origin>/api/health     # {"ok":true,"db":true,"mistral":true}
curl -I https://<dashboard origin>/widget.js   # 200, application/javascript
```

Then open the host app and confirm the launcher appears in the corner.
