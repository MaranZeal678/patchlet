# Contracts

The data model, the shared types, the HTTP API and the agent's behaviour. Parts of the system are
built against this file in parallel, so it wins over local preference. Change it in the same commit
as the code that depends on it.

## 1. Data model

Supabase Postgres with the `vector` extension. The full statement list is
`supabase/migrations/0001_init.sql`; it drops the previous objects first and is safe to re-run.

Row level security is enabled on every table with no policies. The application connects only with
the service role, which bypasses RLS. Nothing else is granted access.

```sql
create table project (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,               -- 'not-mistral'
  name text not null,
  embed_key text not null unique,          -- public widget key, 'pk_' || 24 hex chars
  site_url text,                           -- 'https://not-mistral.vercel.app'
  repo_full_name text,                     -- 'AadiDahake/not-mistral'
  repo_default_branch text default 'main',
  settings jsonb not null default '{}',    -- {docsThreshold:0.70, interfaceThreshold:0.5, voice:"en_paul_neutral"}
  created_at timestamptz not null default now()
);

create table document (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project on delete cascade,
  title text not null,
  source_kind text not null,               -- 'upload' | 'url' | 'text'
  source_ref text,                         -- filename or url
  mime text,
  status text not null default 'pending',  -- pending | processing | ready | failed
  page_count int,
  mean_confidence real,                    -- OCR confidence 0..1, null when not OCR'd
  chunk_count int not null default 0,
  error text,
  created_at timestamptz not null default now()
);

create table chunk (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references document on delete cascade,
  project_id uuid not null references project on delete cascade,
  ordinal int not null,
  heading text,
  content text not null,
  page int,
  block_type text,
  confidence real,                         -- per-block OCR confidence, null for text sources
  embedding vector(1024) not null,
  created_at timestamptz not null default now()
);

create table conversation (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project on delete cascade,
  page_url text,
  page_title text,
  created_at timestamptz not null default now()
);

create table message (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversation on delete cascade,
  role text not null,                      -- 'user' | 'assistant'
  content text not null,
  steps jsonb,                             -- Step[] when the answer had guidance
  probes jsonb,                            -- ProbeResult[]
  verdict jsonb,                           -- Verdict
  feature_request jsonb,                   -- FeatureRequest when escalation was offered
  created_at timestamptz not null default now()
);

create table escalation (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project on delete cascade,
  conversation_id uuid references conversation on delete set null,
  message_id uuid references message on delete set null,
  request jsonb not null,                  -- FeatureRequest
  engine text not null,                    -- 'mistral' | 'local'
  execution_id text,                       -- Mistral workflow execution id
  status text not null default 'queued',
  -- queued | filing | inspecting | drafting | pr_open | awaiting_approval
  -- | approved | rejected | merging | deploying | shipped | failed
  issue_url text, issue_number int,
  pr_url text, pr_number int, branch text,
  deployment_url text,
  approval jsonb,                          -- {approved, note, decidedAt}
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table trace_event (
  id bigserial primary key,                -- the SSE event id and cursor
  project_id uuid not null references project on delete cascade,
  conversation_id uuid references conversation on delete cascade,
  escalation_id uuid references escalation on delete cascade,
  source text not null,                    -- 'agent' | 'workflow'
  kind text not null,                      -- 'probe' | 'verdict' | 'decision' | 'model'
                                           -- | 'tool' | 'artifact' | 'pause' | 'status' | 'error'
  status text not null default 'ok',       -- 'running' | 'ok' | 'failed'
  title text not null,
  detail jsonb,                            -- free-form, rendered per kind, see section 3
  created_at timestamptz not null default now()
);

create index on trace_event (project_id, id);
create index on chunk (project_id);
```

Vector search:

```sql
create or replace function match_chunks(
  query_embedding vector(1024), match_count int, filter_project uuid
)
returns table (
  id uuid, document_id uuid, heading text, content text,
  page int, confidence real, similarity float
)
language sql stable as $$
  select c.id, c.document_id, c.heading, c.content, c.page, c.confidence,
         1 - (c.embedding <=> query_embedding) as similarity
  from chunk c
  where c.project_id = filter_project
  order by c.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 50);
$$;
```

**Seed** (`scripts/seed.mjs`, idempotent): one project, slug `not-mistral`, name "Not Mistral",
a generated `embed_key`, `site_url` `https://not-mistral.vercel.app`, `repo_full_name`
`AadiDahake/not-mistral`.

## 2. Shared types

Exported from `@patchlet/shared`. Do not redeclare them locally.

```ts
export type Affordance = {
  id: string;            // opaque, e.g. "a7"; the only handle the model gets
  role: string;          // button | link | textbox | checkbox | tab | menuitem | switch | combobox
  name: string;          // accessible name
  text?: string;         // visible text when different from name
  landmark?: string;     // nearest landmark or labelled region: "sidebar", "header", "main", "dialog"
  href?: string;         // for links
  visible: boolean;      // in viewport and hit-testable
  disabled?: boolean;
};
export type PageContext = { url: string; title: string; affordances: Affordance[] };

export type Step = {
  target: string;
  caption: string;
  advanceOn: "click" | "input" | "navigation" | "manual";
};

export type ProbeName = "docs" | "interface" | "repository";
export type ProbeResult = {
  probe: ProbeName;
  hit: boolean;
  score: number | null;
  summary: string;
  evidence: unknown;
  latencyMs: number;
};

export type VerdictOutcome = "answer" | "hedge" | "absent";
export type Verdict = {
  outcome: VerdictOutcome;
  confidence: number;
  reasoning: string;
  feature: string;
};

export type FeatureRequest = {
  title: string;
  description: string;
  area: string;
  quote: string;
  rationale: string;
};

// /api/chat SSE events, in order of emission
export type ChatEvent =
  | { type: "conversation"; conversationId: string; messageId: string }
  | { type: "understanding"; feature: string; intent: "howto" | "feature" | "other" }
  | { type: "probe"; probe: ProbeName; status: "running" }
  | { type: "probe"; probe: ProbeName; status: "done"; result: ProbeResult }
  | { type: "verdict"; verdict: Verdict }
  | {
      type: "answer";
      text: string;
      steps: Step[] | null;
      escalation: { offered: true; request: FeatureRequest } | { offered: false };
    }
  | { type: "error"; message: string };

export type EscalationStatus =
  | "queued" | "filing" | "inspecting" | "drafting" | "pr_open" | "awaiting_approval"
  | "approved" | "rejected" | "merging" | "deploying" | "shipped" | "failed";

export type TraceEvent = {
  id: number;
  projectId: string;
  conversationId: string | null;
  escalationId: string | null;
  source: "agent" | "workflow";
  kind: "probe" | "verdict" | "decision" | "model" | "tool" | "artifact" | "pause" | "status" | "error";
  status: "running" | "ok" | "failed";
  title: string;
  detail: unknown;
  createdAt: string;
};
```

Also exported:

- `validatePlan(steps, affordances)` rejects the whole plan if any `target` is not an affordance id
  or any caption exceeds 14 words. Returns `Step[] | null`.
- `routeProbes(results, thresholds)` returns `"answer" | "hedge" | "absent"`.
- `tokenize(text)` and the keyword helpers used by both the interface probe and the widget's
  affordance ranking, so page-side ranking and server-side scoring always agree.
- `MODELS`, the model ids in section 5.

## 3. HTTP API

Routes live in `apps/web/app/api`. Widget-facing routes take the public embed key as `key`, send
`Access-Control-Allow-Origin: *`, and answer `OPTIONS` preflight. Console routes have no auth
because there is a single seeded project.

| Route | Body / query | Returns |
|---|---|---|
| `POST /api/chat` | `{key, conversationId?, question, page: PageContext, continueFrom?}` | SSE of `ChatEvent`; each `data:` line is one JSON event, `event:` is its type |
| `POST /api/escalate` | `{key, conversationId, messageId}` | `{escalationId, status}` |
| `GET /api/escalations/:id` | `?key=` optional | `{id, status, issueUrl, prUrl, deploymentUrl, request, approval, createdAt}` |
| `POST /api/transcribe` | multipart `key`, `file` (audio/webm or mp3) | `{text}` |
| `POST /api/speak` | `{key, text}` | `audio/mpeg` bytes, streamed as the TTS deltas arrive |
| `GET /api/project` | - | `{project, embedSnippet, widgetUrl}` |
| `PATCH /api/project` | `{repoFullName?, siteUrl?, settings?}` | validates the repository through GitHub, returns the project |
| `GET /api/documents` | - | `{documents: Document[]}` |
| `POST /api/documents` | multipart `file` (pdf, png, jpg, md, txt, html), or JSON `{url}`, or JSON `{title, text}` | ingests synchronously, returns the document row |
| `DELETE /api/documents/:id` | - | `{ok: true}` |
| `GET /api/conversations` | `?limit=` | recent conversations with their messages |
| `GET /api/escalations` | - | `{escalations: Escalation[]}`, newest first |
| `POST /api/escalations/:id/approve` | `{approved: boolean, note?: string}` | `{ok: true, status}` |
| `GET /api/trace/stream` | `?since=&conversationId=&escalationId=` | SSE; `id:` is the `trace_event.id`, `event: trace`, `data: TraceEvent` |
| `GET /api/trace` | same filters, `?since=&limit=` | `{events: TraceEvent[]}` backfill |
| `GET /api/health` | - | `{ok, db, mistral}` |

`POST /api/escalations/:id/approve` under the `mistral` engine queries the workflow's pending inputs
and submits `__submit_input`; under `local` it writes `approval` and sets the status to `approved`
or `rejected`.

`GET /api/trace/stream` polls Postgres every 700 ms, honours `Last-Event-ID`, sends a `: ping`
comment every 15 s, and closes cleanly after 240 s so `EventSource` reconnects.

### Trace detail shapes

The console renders these specially and falls back to a key/value list for anything else.

| kind | `detail` |
|---|---|
| `probe` | `ProbeResult` |
| `verdict` | `Verdict` |
| `artifact` | discriminated by `detail.artifact`: `"issue_draft"` -> `{title, body}`; `"issue"` -> `{url, number}`; `"pr"` -> `{url, number, branch}`; `"diff"` -> `{files: [{path, patch}]}` with unified diff text per file; `"deployment"` -> `{url}` |
| `model` | `{model, purpose, input_summary?, output_summary?, files?: [{path, reason}]}` |
| `pause` | `{label, taskId?}` |
| `tool` | `{tool, transport: "mcp" \| "rest" \| "git" \| "shell", args_summary, result_summary}` |

## 4. Agent behaviour

`apps/web/lib/agent`. One chat turn:

1. Insert the conversation if it is new, insert the user message, emit `conversation`.
2. **Understand** with `MODELS.understand` and a JSON schema: `{intent, feature, keywords[]}`, where
   `feature` is the short noun phrase the user is asking about ("dark mode", "changing the
   username"). Emit `understanding`.
3. **Three probes in parallel.** Each emits `probe running`, then `probe done`, and writes a
   `trace_event` with source `agent` and kind `probe`.
   - **docs**: embed the question, call `match_chunks` for the top 6. The score is the top
     similarity, multiplied by `0.6 + 0.4 * confidence` when the chunk carries an OCR confidence.
     Hit when the score is at least `settings.docsThreshold` (default 0.70). Evidence is
     `[{documentTitle, heading, snippet, similarity, confidence}]`. With no chunks at all the probe
     misses and says the knowledge base is empty.
   - **interface**: pure local matching, no model call. Token overlap between the keywords plus the
     feature and each affordance's name, text, landmark and href, with simple stemming and a small
     synonym list (theme/dark/light/appearance, username/display name/name/profile/account). Score
     0..1 is the best match; hit when it is at least `settings.interfaceThreshold` (default 0.5).
     Evidence is the top 5 affordance ids with their names and scores.
   - **repository**: GitHub REST with `GITHUB_TOKEN`. `GET /repos/{repo}/git/trees/{branch}?recursive=1`
     cached 60 s in module scope, filtered to source files (`.ts .tsx .js .jsx .css .md .json`,
     excluding lockfiles and `node_modules`). Rank paths by keyword, read up to 6 of the best through
     `GET /repos/{repo}/contents/{path}`, count keyword occurrences. Hit when a path token matches or
     total occurrences reach 3. Evidence is `[{path, matches}]`. With no repository connected the
     probe misses and says so.
4. **Route** with `routeProbes`. A documentation or interface hit gives `answer`. A repository-only
   hit gives `hedge`. Nothing at all asks `MODELS.verdict` to confirm absence from the three
   summaries, returning `{exists, confidence, reasoning}`: `exists: false` gives `absent`, otherwise
   `hedge`. Emit `verdict` and write the trace event.
5. **Answer.**
   - `answer`: `MODELS.answer` with a JSON schema, `{answer, steps: [{target, caption, advanceOn}]}`.
     The prompt carries the documentation evidence and the full affordance list (id, role, name,
     landmark), and the rules: `target` must be one of the listed ids, at most 5 steps, captions at
     most 12 words, imperative ("Open the account menu"). Validate with `validatePlan`; when it
     rejects, keep the prose and send `steps: null`.
   - `hedge`: the same model, an honest answer that the feature could not be confirmed, no steps,
     escalation offered with a drafted request.
   - `absent`: an apology, a plain statement, and an offer, for example "Dark mode is not available
     in Not Mistral today. I can report this to the developers so they can build it. Want me to?"
     Draft the `FeatureRequest` with `MODELS.answer` and a JSON schema: an imperative title of at
     most 8 words, a description of two or three sentences, an area, `quote` set to the user's exact
     words (verified to be a substring of the user message, otherwise empty), and a rationale.

   Persist the assistant message with its steps, probes, verdict and feature request. Emit `answer`.
6. Every stage writes `trace_event` rows, which is what makes the console's Activity page show the
   chat-side reasoning live.

`POST /api/escalate` inserts the `escalation` row, writes a trace event recording that the user
accepted, then starts the engine. Under `mistral` it executes the workflow with input
`{escalation_id, project_id, repo_full_name, default_branch, title, description, area, quote,
rationale, conversation_excerpt, site_url}` and stores the `execution_id`. Under `local` it does
nothing more; the worker's local runner polls for rows with `status = 'queued'` and `engine = 'local'`.

## 5. Models

Exported as `MODELS` from `@patchlet/shared`.

| Purpose | Model id |
|---|---|
| Fast understanding and small JSON tasks | `mistral-small-latest` |
| Answers, step plans, issue drafting, code planning | `mistral-large-latest` |
| Absence verdict | `magistral-medium-latest` |
| Code generation | `codestral-2508` |
| Embeddings, 1024 dimensions | `mistral-embed` |
| Document OCR | `mistral-ocr-latest` |
| Speech to text | `voxtral-mini-latest` |
| Text to speech | `voxtral-mini-tts-2603` |

Notes that the API enforces:

- Embeddings are 1024 dimensions. Do not pass `output_dimension`.
- Structured output is `response_format: {type: "json_schema", json_schema: {name, schema, strict: true}}`.
- `temperature: 0` requires `top_p: 1`, otherwise the request is rejected.
- Text to speech with `"stream": true` returns SSE `event: speech.audio.delta` with
  `data: {"audio_data": "<base64 mp3 chunk>"}`. The default voice is `en_paul_neutral`.
