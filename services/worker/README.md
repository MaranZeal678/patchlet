# Patchlet worker

The worker turns an accepted feature request into a shipped change. It runs as a
[Mistral Workflows](https://docs.mistral.ai) worker (the `patchlet-missing-feature` workflow)
or, as a fallback, as a plain polling process with the same steps.

For one escalation it:

1. **Files the issue.** Asks `mistral-large-latest` for the priority (`low`, `medium` or `high`,
   recorded in the trace), makes sure the `patchlet` and `priority:<level>` labels exist on the
   repository, and labels the issue with both. Dedupes against open issues by title: a repeat
   raises the "Requested N times" line in the existing issue's body and adds a comment with the
   new user's words instead of filing twice. Otherwise it asks `mistral-large-latest` to call the
   GitHub MCP `create_issue` tool and executes that call through the remote MCP server, falling
   back to the REST API when MCP fails.
2. **Inspects the repository.** Shallow clone, reads `AGENTS.md`, ranks the source files by the
   request's keywords, and asks `mistral-large-latest` (JSON output) for the minimal set of 2 to 5
   files to change, with a reason each, plus acceptance criteria. New files are planned when needed.
3. **Drafts the implementation.** One `codestral-2508` call per file (existing contents supplied
   verbatim, whole-file output). Applies the files in the clone, then runs the gates: `npm ci`
   (cached `node_modules` under `~/.cache/patchlet/<repo>` keyed by the lockfile hash), `npm run
   typecheck`, `npm run build`. On failure the gate output goes back to the editor for the affected
   file (up to 3 repairs), then a fresh candidate is drafted (up to 2 candidates).
4. **Opens a draft pull request** on `patchlet/<issue>-<slug>` with one commit
   (`feat: <title>`, `Closes #<n>`), through MCP `create_pull_request` with a REST fallback, then
   comments on it with the gate results (`npm run typecheck` and `npm run build`, with durations)
   and a link to `NEXT_PUBLIC_APP_URL/console/activity`, and pauses with
   `wait_for_input(Approval, label="Merge this pull request?")`.
5. **After approval** marks the PR ready (GraphQL `markPullRequestReadyForReview`), waits for
   `mergeable`, squash-merges, and polls Vercel until the deployment for the merge commit is
   `READY`. After a rejection it closes the PR with a comment.

When `SLACK_WEBHOOK_URL` is set, one message goes out when the issue is filed and one when the
draft pull request opens.

Every step updates `escalation.status` and writes `trace_event` rows (source `workflow`) through
PostgREST, so the console's Activity page shows the run live. A heartbeat writes a `status` trace
event ("worker online") per project every 60 s.

## Layout

```
worker.py          Mistral Workflows entry point (heartbeat + run_worker)
local_runner.py    fallback engine: polls escalation rows, same steps, pause by polling `approval`
workflow.py        the InteractiveWorkflow definition
activities.py      the five activities (thin async wrappers around steps/pipeline.py)
heartbeat.py       the "worker online" trace event loop
models.py          Pydantic models: FeatureRequestInput, IssueRef, Plan, Draft, PrRef, Approval, Outcome
config.py          environment access
steps/pipeline.py  the five steps, shared by both engines
steps/db.py        PostgREST helpers (update_escalation, emit_trace, claim_queued_local, heartbeat)
steps/trace.py     the trace `detail` shapes the console renders
steps/github.py    REST + GraphQL client
steps/mcp_github.py  streamable-HTTP MCP client and the model-driven issue filing
steps/repo.py      clone, file tree, keyword ranking
steps/codegen.py   architect and editor prompts and model calls
steps/applier.py   atomic file apply with a path guard, gates, node_modules cache, unified diffs
steps/drafting.py  the draft / gate / repair / new-candidate loop
steps/deploy.py    Vercel deployment polling
steps/issue.py     issue and PR body builders
steps/slack.py     optional webhook
tests/             pytest suite and the fixture Next.js app
```

## Running

Python 3.12 and [uv](https://docs.astral.sh/uv/). `node` and `npm` must be on `PATH` for the gates.

```sh
cd services/worker
uv sync
```

Mistral Workflows engine (the dashboard starts executions with `ESCALATION_ENGINE=mistral`):

```sh
vault-exec uv run python worker.py
```

Fallback engine (the dashboard inserts `escalation` rows with `engine='local'`):

```sh
vault-exec uv run python local_runner.py
```

`vault-exec` is the local helper that injects the secrets. Without it, export the variables
yourself (see `.env.example`).

### Environment

| Variable | Required | Meaning |
|---|---|---|
| `MISTRAL_API_KEY` | yes | Mistral API key (models and the Workflows worker) |
| `DEPLOYMENT_NAME` | yes (worker.py) | Workflows deployment name; the dashboard's `MISTRAL_DEPLOYMENT_NAME` must match (`patchlet-worker`) |
| `SUPABASE_URL` | yes | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | service role key; the worker writes `escalation` and `trace_event` |
| `GITHUB_TOKEN` | yes | fine-grained PAT with contents, issues and pull requests read-write on the target repository |
| `VERCEL_TOKEN` | yes | token for the Vercel team that owns the target project |
| `TARGET_VERCEL_PROJECT` | no (`not-mistral`) | Vercel project name whose deployment the worker waits for |
| `SLACK_WEBHOOK_URL` | no | post a message when an issue and a draft PR exist |
| `PATCHLET_CACHE_DIR` | no (`~/.cache/patchlet`) | where cached `node_modules` live |

### Starting an execution by hand

```sh
curl -X POST https://api.mistral.ai/v1/workflows/patchlet-missing-feature/execute \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H "Content-Type: application/json" \
  -d '{"deployment_name":"patchlet-worker","input":{"escalation_id":"...","project_id":"...","repo_full_name":"AadiDahake/not-mistral","default_branch":"main","title":"Add dark mode","description":"...","area":"Header","quote":"How do I turn on dark mode?","rationale":"...","conversation_excerpt":"","site_url":"https://not-mistral.vercel.app"}}'
```

Then query `POST /v1/workflows/executions/{id}/queries` with `{"name":"__get_pending_inputs"}` and
submit `POST /v1/workflows/executions/{id}/updates` with
`{"name":"__submit_input","input":{"task_id":"...","input":{"approved":true,"note":""}}}`.

For the local engine, insert an `escalation` row with `engine='local'` and `status='queued'`; approve
by setting `approval` to `{"approved": true, "note": ""}`.

## Tests

```sh
uv run pytest                      # unit tests (no network)
vault-exec uv run pytest -s tests/test_codegen_e2e.py   # real Mistral calls against the fixture app
```

The end-to-end test drafts a dark-mode change in `tests/fixtures/mini-next-app` and asserts that
`npm run typecheck` and `npm run build` pass. It is skipped when `MISTRAL_API_KEY` is unset. The
first run installs the fixture's dependencies (about a minute); later runs reuse the cache.

## Troubleshooting

- **`uv run python -c "import workflow"` fails** - the workflow module must import cleanly outside
  the sandbox; check the traceback for a missing dependency and run `uv sync`.
- **The worker starts but executions never run** - `DEPLOYMENT_NAME` differs from the dashboard's
  `MISTRAL_DEPLOYMENT_NAME`, or `MISTRAL_API_KEY` is missing from the worker's environment
  (passing a key to `run_worker` alone is not enough).
- **`git clone failed` / 403 on `/contents`** - the `GITHUB_TOKEN` lacks the Contents permission
  on the target repository. Issues and pull requests need their own permissions too.
- **`npm ci failed`** - the cache under `~/.cache/patchlet/<repo>` is keyed by the lockfile hash;
  delete that directory to force a clean install. The gates need network access on the first run.
- **`npm run build` fails in the repair loop** - the trace shows the gate output and every repair.
  The run gives up after 2 candidates with 3 repairs each and marks the escalation `failed`.
- **No deployment found after 8 minutes** - the Vercel project is not linked to the repository, or
  `TARGET_VERCEL_PROJECT` names a different project. The worker matches `meta.githubCommitSha` to
  the squash-merge commit.
- **Worker shows offline in the console** - the heartbeat writes through PostgREST every 60 s;
  check `SUPABASE_URL` and the service role key.
- **Escalation stuck in `awaiting_approval`** - with the Mistral engine the dashboard submits
  `__submit_input`; with the local engine it must set `escalation.approval`. Both paths end with the
  worker writing `approval`, `status` and the trace.
