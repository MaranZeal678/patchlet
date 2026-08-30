# Patchlet

<p align="center">
  <a href="https://reflex.runloop.ai"><img src="https://img.shields.io/badge/⟳%20RUNLOOP-Reflex%20devboxes%20compile%20the%20tools-1E7A5A?style=for-the-badge" alt="Runloop"></a>
  <a href="https://posthog.com"><img src="https://img.shields.io/badge/PostHog-session%20capture%20is%20the%20input-F54E00?style=for-the-badge&logo=posthog&logoColor=white" alt="PostHog"></a>
  <a href="https://openai.com/codex"><img src="https://img.shields.io/badge/OpenAI%20Codex-writes%20the%20semantic%20actions-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI Codex"></a>
</p>

**Patchlet watches how real people use software and compiles their behaviour into semantic actions AI agents can call.** Powered by [Runloop/Reflex](https://reflex.runloop.ai) · [PostHog](https://posthog.com) · [OpenAI Codex](https://openai.com/codex)** — see [Integration proof](#integration-proof) below.

**PostHog records what humans do. We turn those actions into tools agents can call.**

Your users demonstrate your app's real API every single day — and everyone throws
that away as telemetry. Patchlet started life as a support widget that guided users around the page.
Pointed backwards, the same instrument records them — and compiles what it sees.

A human doing a refund takes 14 clicks: find the customer, open orders, open the
order, click refund, pick items, type a reason, confirm, check the payment, update
the ticket, reply. Seen 34 times across sessions, that is not telemetry — it is 34
demonstrations of one function the software never exposed:

```
refund_order(order_id, items, reason, notify_customer)
```

An agent then does in one call what took a blind screenshot-and-click agent
~14 perception-act loops. And unlike code generators, we don't trust the output:
**a compiled tool ships only after it is proven equivalent to held-out human
demonstrations, state diff by state diff.**

Built at the **Codex Community Hackathon SF** (hosted by **PostHog**, organized
by **Tenor** and **Runloop**) and built *on* the sponsors: PostHog-style session
capture is the input (the recorder also emits every step to PostHog when a
project key is configured), compilation runs as real agent sessions in isolated
**Runloop devboxes** through **Reflex**, and outcomes are scored the **Tenor**
way — business value per unit of AI spent.

Built in one day at the Codex Community Hackathon SF on top of
[Patchlet](https://github.com/AadiDahake/patchlet) — the support widget whose
affordance scanner turned out to be the missing instrument: a structured
observation of a live page (id, role, accessible name, landmark, state) that
research like **ASIL** explicitly leaves as future work, that **OS-Genesis**
calls reverse task synthesis, and that **ToolCUA** wants for GUI→tool scaling.

## The pipeline

```
 real users click through the app
        │  recorder widget (packages/widget/src/recorder)
        ▼  emits affordance-map → action → affordance-map per action
 POST /api/observe  →  trajectory_step            (supabase/migrations, .data adapter)
        │
        ▼  POST /api/compiler/discover            (apps/web/lib/discover.ts)
 cluster by observed API effect + embeddings; one structured model call per
 cluster does reverse task synthesis → refund_order(order_id, items, reason, …)
 with every parameter bound to a field of a demonstrated API call
        │
        ▼  POST /api/compiler/compile             (apps/web/lib/compiler/compile.ts)
 two codegen lineages (api / hybrid) in parallel sandboxes; validateToolSource
 rejects any endpoint no user ever demonstrated; sandbox smoke test
        │
        ▼  POST /api/compiler/prove               (apps/web/lib/compiler/prove.ts)
 replay held-out human sessions' parameters through the tool on fresh sandboxes;
 diff the state transitions — ship only on exact match
        │
        ▼  POST /api/compiler/race                (apps/web/lib/compiler/race.ts)
 same task, two sandboxes: blind affordance-click agent vs one compiled tool
 call — actions, seconds, tokens, verified success, and a Tenor economics card
```

## Run it

```bash
npm install
npm run build:recorder                  # bundle the recorder widget
npm run dev:target                      # Meridian Supply admin  → :5210
npm run dev:web                         # console + pipeline     → :3200 (next dev -p 3200)
npm run seed                            # ~124 jsdom sessions using the real app
open http://localhost:3200/compiler
```

`apps/web/.env.local` needs one model key. `OPENAI_API_KEY` is preferred
(GPT-5 for synthesis and codegen, `text-embedding-3-large` pinned to 1024
dims); without it the same OpenAI-shaped calls fall back to
`MISTRAL_API_KEY` on Mistral's compatible endpoint. One file, one base URL:
`apps/web/lib/openai.ts`.

## Demo script (3 minutes)

1. **Watch** — open the Meridian admin (`:5210`), do a refund yourself; a new
   session appears in the console within seconds. 124 seeded sessions sit
   underneath: every dot one session.
2. **Discover** — press *Run discovery*: dots converge into coloured clusters,
   and cards appear: `refund_order_items(order_id, items, reason,
   notify_customer)` — observed 34×, ~90% human success, median 11 steps,
   interface probe verified against the pages users actually saw.
3. **Compile** — two lineages materialise with their validation checks: only
   demonstrated endpoints, no imports, literal templates, sandbox smoke test.
4. **Prove** — held-out human sessions replay through the tool; state
   transitions match field for field. The tool flips to **proven**.
5. **Race** — a blind UI agent claws through affordance maps while the
   compiled lane finishes in one tool call. Actions, seconds and tokens land
   on screen, verified against actual app state, priced on the Tenor card.

## Sponsors, honestly

- **PostHog** — the eyes. The recorder is PostHog-shaped session capture with
  one addition: structured affordance maps around every event, which is what
  makes behaviour compilable rather than merely replayable. Set `posthogKey`
  in the embed config (`window.ACTION_COMPILER`) and every recorded action and
  session end is also captured to PostHog (`action_compiler_step` /
  `action_compiler_session_end`), so the demonstrations live alongside the
  product's ordinary analytics.
- **Runloop / Reflex** — the laboratory, for real. With `RUNLOOP_API_KEY` (an
  `rfx_` Reflex key) set, every compile adds a third lineage: an actual coding
  agent launched in an isolated Runloop devbox through the Reflex API
  (`lib/compiler/reflex.ts`) — Codex when the org has OpenAI credentials
  configured in Reflex, opencode on Runloop-provided models otherwise. The
  console links to the live session; the devbox writes the code, and the same
  validator, sandbox smoke test, and equivalence proof judge it. The two local
  lineages keep the demo fast and are the fallback without a key.
- **Tenor** — the reward function. The race is scored not in clicks but in
  business value per unit of AI spent; the fitness formula is printed on the
  card.
- **OpenAI Codex** — wrote most of this codebase during the hackathon, and the
  codegen lineages are Codex-style sessions: evidence in, validated executable
  out.

## What survived from Patchlet

- `packages/widget/src/scan/affordances.ts` — the affordance scanner, verbatim.
  It was built to *guide* users; pointed backwards it *records* them.
- `packages/shared` — `Affordance`/`PageContext` types; `validatePlan`'s
  politics live on in `validateToolSource` (`packages/shared/src/compiler.ts`):
  the model never names a control — or now an endpoint — the page didn't publish.
- `apps/web` — the Next app hosts the pipeline; `lib/mistral.ts` became
  `lib/openai.ts`; the interface probe's spirit runs inside discovery.
- `services/worker` — deleted (replaced by the compile lineages), except
  `steps/github.py`.
- The original Patchlet README lives on at `docs/PATCHLET.md`.

## Credits

- [@AadiDahake](https://github.com/AadiDahake) — author of
  [Patchlet](https://github.com/AadiDahake/patchlet), whose affordance scanner,
  shared types, and plan validator this product is built from, and contributor
  to Patchlet.
- [@MaranZeal678](https://github.com/MaranZeal678) — Patchlet.


## Integration proof

| Tool | Where it lives in this repo | What it does |
| --- | --- | --- |
| **Runloop / Reflex** | [`apps/web/lib/compiler/reflex.ts`](apps/web/lib/compiler/reflex.ts) | Every compile launches a coding agent in an isolated Runloop devbox via the Reflex API (`POST /api/agents`); console lineage cards link to the live session |
| **PostHog** | [`packages/widget/src/recorder/index.ts`](packages/widget/src/recorder/index.ts) (`postHogCapture`) | The recorder captures `action_compiler_step` / `action_compiler_session_end` to PostHog's capture API whenever `posthogKey` is configured |
| **OpenAI Codex** | [`apps/web/lib/openai.ts`](apps/web/lib/openai.ts) (`codeModel()`), `pickAgentType()` in `reflex.ts` | One OpenAI-shaped model surface; codegen prefers Codex (`gpt-5.1-codex`) and the Reflex lineage launches `codex` sessions when the org has OpenAI credentials — and Codex built most of this repo at the hackathon |

## Research this stands on

- **ASIL** (Aug 2026) — structured state + semantic actions beat
  screenshot-and-click; interface discovery explicitly out of scope. That gap
  is this product.
- **OS-Genesis** (ACL 2025) — reverse task synthesis: infer the task from
  observed state–action–state triples.
- **ToolCUA** (2026) — synthesize high-level tools that replace GUI sequences.
