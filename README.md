# Patchlet

Patchlet is a support agent companies embed in the corner of their web app. Two things make it
different from a support chatbot.

1. **It shows the user on their own screen.** The widget reads the host page's DOM, the agent
   resolves the answer to real controls, and the widget spotlights them step by step.
2. **When a feature does not exist, it gets built.** The agent proves absence across three checks
   (documentation, this page, the repository), apologises, and offers to report it. Accepting starts
   a durable workflow that files a GitHub issue, drafts the implementation, opens a draft pull
   request, pauses for a human, and after approval merges so the live site changes.

The demo host app is **Not Mistral**, a clone of an AI studio console, deployed separately and
embedding the widget with a single script tag.

## Architecture

```
                 host page (Not Mistral)
                 +--------------------------------------+
                 |  <script src=".../widget.js"          |
                 |          data-key="pk_...">           |
                 |                                       |
                 |   +-------------------------------+   |
                 |   |  Patchlet widget (shadow DOM) |   |
                 |   |  chat, three checks,          |   |
                 |   |  spotlight overlay, voice     |   |
                 |   +---------------+---------------+   |
                 +-------------------|-------------------+
                                     | HTTPS, embed key, CORS
                                     v
        +--------------------------------------------------------+
        |  apps/web  (Next.js, Vercel project `patchlet-v2`)      |
        |                                                        |
        |  /api/chat  SSE   understand -> 3 probes -> verdict     |
        |                   -> answer + step plan                 |
        |  /api/escalate    starts the escalation engine          |
        |  /api/trace       + /api/trace/stream (console live)    |
        |  /api/documents   ingest, OCR, embed                    |
        |  /console         overview, knowledge, repository,      |
        |                   activity                              |
        +------+--------------------+--------------------+--------+
               |                    |                    |
               v                    v                    v
     +---------------+   +--------------------+   +----------------+
     | Supabase      |   | Mistral API        |   | GitHub API     |
     | Postgres      |   | chat, embeddings,  |   | trees, blobs,  |
     | + pgvector    |   | OCR, STT, TTS,     |   | issues, PRs    |
     | trace_event   |   | Workflows          |   |                |
     +-------^-------+   +---------^----------+   +-------^--------+
             |                     |                      |
             |            +--------+----------------------+
             |            |
        +----+------------+----------------------------------+
        |  services/worker (Python, uv, Mistral Workflows)    |
        |  file issue -> inspect repo -> draft code ->        |
        |  open draft PR -> wait for approval -> merge ->     |
        |  watch the deploy                                   |
        +-----------------------------------------------------+
```

## Repository layout

```
README.md                 this file
AGENTS.md                 conventions for anyone contributing here
package.json              npm workspaces: packages/*, apps/*
tsconfig.base.json        shared strict TypeScript options
docs/                     architecture.md, contracts.md, demo.md, deploy.md
packages/shared/          @patchlet/shared - types and pure helpers, zero runtime deps
packages/widget/          @patchlet/widget - Vite library build -> dist/patchlet.js
apps/web/                 @patchlet/web - Next.js landing, console, and API routes
services/worker/          Python worker: Mistral Workflows + a local fallback runner
supabase/migrations/      SQL migrations, applied by scripts/db-migrate.mjs
scripts/                  db-migrate.mjs, seed.mjs, reset-demo.mjs
```

## Contracts

`docs/contracts.md` is the source of truth for the data model, the shared types, the HTTP API and
the agent's behaviour. Change it in the same commit as the code, never after.

## Setup

Requires Node 20 or newer and a Supabase Postgres database with the `vector` extension.

```bash
npm install
cp .env.example .env.local        # fill in your own values
npm run db:migrate                # applies supabase/migrations/*.sql in order
npm run db:seed                   # creates the seeded project and prints its embed key
```

Every variable is documented in `.env.example`. Nothing in this repository reads a secret from a
file that is committed; supply them through your own environment or secret manager.

## Running locally

```bash
npm run dev          # Next.js dashboard on http://localhost:3000
npm run build        # builds the widget, copies it to apps/web/public/widget.js, then builds web
npm run typecheck    # tsc across every workspace
npm test             # vitest across every workspace
```

Health check: `curl http://localhost:3000/api/health` returns `{"ok":true,"db":true,"mistral":true}`
when the database and the Mistral API are both reachable.

The Python worker runs separately, see `services/worker/README.md`.

## Deploy

`docs/deploy.md` covers the two Vercel projects, the environment variables each one needs, and
where the worker runs.

## Demo script

Three minutes, presenter notes in `docs/demo.md`.

1. On the host app, open Patchlet and ask "How do I change my username?". The agent answers from
   the documentation and spotlights the account menu, then Profile, then the Username field, then
   Update profile.
2. Ask "How do I turn on dark mode?". The widget shows three checks running: documentation, this
   page, repository. All come back empty. The agent apologises, says the feature is not available,
   and offers to report it. Accept.
3. Switch to the Patchlet console, Activity page. The live trace streams the verdict, the drafted
   issue, the real issue link, the repository inspection, the chosen files with reasons, the drafted
   diff, and the draft pull request link, then pauses on Approve.
4. Click Approve. The pull request merges, the host app redeploys, the trace shows the deployment.
   Reload the host app: a theme toggle now exists in the header. Turn it on. Dark mode works.
