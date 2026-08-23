#!/usr/bin/env node
// Resets the demo: closes the worker's issues and PRs in the target repository, deletes its
// branches, moves `main` back to the `demo-baseline` tag, and clears escalations, conversations
// and trace events in Supabase. Run through vault-exec so the tokens are in the environment.
//
//   node scripts/reset-demo.mjs [--dry-run] [--skip-main] [--repo owner/name]
//
// `--skip-main` leaves the `main` branch and the tag alone (use it while the target repository is
// still being set up, so the tag is not created at a placeholder commit).
//
// The `demo-baseline` tag marks the commit `main` is reset to. If the tag does not exist, the
// first run creates it at the current head of `main` (the same thing as `git tag demo-baseline`
// followed by `git push origin demo-baseline`) and does not move `main`. To pick a new baseline,
// delete the tag on GitHub and run the script again from the commit you want.

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipMain = args.includes("--skip-main");
const repoArg = args.indexOf("--repo");
const REPO = repoArg >= 0 ? args[repoArg + 1] : "AadiDahake/not-mistral";
const LABEL = "patchlet";
const BRANCH_PREFIX = "patchlet/";
const BASELINE_TAG = "demo-baseline";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const log = (line) => console.log(`${dryRun ? "[dry-run] " : ""}${line}`);

async function gh(method, path, body) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${method} ${path} -> ${response.status}: ${(await response.text()).slice(0, 300)}`);
  if (response.status === 204) return null;
  return response.json();
}

async function closeIssues() {
  const issues = (await gh("GET", `/repos/${REPO}/issues?state=open&labels=${LABEL}&per_page=100`)) ?? [];
  const plain = issues.filter((issue) => !issue.pull_request);
  for (const issue of plain) {
    log(`close issue #${issue.number}: ${issue.title}`);
    if (!dryRun) await gh("PATCH", `/repos/${REPO}/issues/${issue.number}`, { state: "closed", state_reason: "not_planned" });
  }
  return plain.length;
}

async function closePullRequests() {
  const pulls = (await gh("GET", `/repos/${REPO}/pulls?state=open&per_page=100`)) ?? [];
  const ours = pulls.filter((pr) => pr.head.ref.startsWith(BRANCH_PREFIX));
  for (const pr of ours) {
    log(`close pull request #${pr.number}: ${pr.title} (${pr.head.ref})`);
    if (!dryRun) await gh("PATCH", `/repos/${REPO}/pulls/${pr.number}`, { state: "closed" });
  }
  return ours.length;
}

async function deleteBranches() {
  const refs = (await gh("GET", `/repos/${REPO}/git/matching-refs/heads/${BRANCH_PREFIX}`)) ?? [];
  for (const ref of refs) {
    const name = ref.ref.replace("refs/heads/", "");
    log(`delete branch ${name}`);
    if (!dryRun) await gh("DELETE", `/repos/${REPO}/git/refs/heads/${name}`);
  }
  return refs.length;
}

async function tagCommitSha(ref) {
  // A lightweight tag points at the commit; an annotated tag points at a tag object.
  if (ref.object.type === "commit") return ref.object.sha;
  const tag = await gh("GET", `/repos/${REPO}/git/tags/${ref.object.sha}`);
  return tag.object.sha;
}

async function resetMain() {
  const main = await gh("GET", `/repos/${REPO}/git/ref/heads/main`);
  if (!main) throw new Error("branch main not found");
  const tag = await gh("GET", `/repos/${REPO}/git/ref/tags/${BASELINE_TAG}`);
  if (!tag) {
    log(`tag ${BASELINE_TAG} missing: create it at main (${main.object.sha.slice(0, 7)}); main is not moved`);
    if (!dryRun) await gh("POST", `/repos/${REPO}/git/refs`, { ref: `refs/tags/${BASELINE_TAG}`, sha: main.object.sha });
    return "tag created";
  }
  const baseline = await tagCommitSha(tag);
  if (baseline === main.object.sha) {
    log(`main already at ${BASELINE_TAG} (${baseline.slice(0, 7)})`);
    return "unchanged";
  }
  log(`force main from ${main.object.sha.slice(0, 7)} back to ${BASELINE_TAG} (${baseline.slice(0, 7)})`);
  if (!dryRun) await gh("PATCH", `/repos/${REPO}/git/refs/heads/main`, { sha: baseline, force: true });
  return "reset";
}

async function clearTable(table, filter) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: dryRun ? "GET" : "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "count=exact",
      ...(dryRun ? { Range: "0-0" } : {}),
    },
  });
  if (!response.ok && response.status !== 206) throw new Error(`${table} -> ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const range = response.headers.get("content-range") ?? "";
  const count = Number(range.split("/")[1] ?? 0);
  log(`${dryRun ? "would delete" : "deleted"} ${count} row(s) from ${table}`);
  return count;
}

async function main() {
  const summary = {};
  if (GITHUB_TOKEN) {
    summary.issuesClosed = await closeIssues();
    summary.pullRequestsClosed = await closePullRequests();
    summary.branchesDeleted = await deleteBranches();
    summary.main = skipMain ? "skipped" : await resetMain();
  } else {
    log("GITHUB_TOKEN not set: skipping GitHub reset");
  }
  if (SUPABASE_URL && SUPABASE_KEY) {
    summary.traceEvents = await clearTable("trace_event", "id=gt.0");
    summary.escalations = await clearTable("escalation", "id=not.is.null");
    summary.conversations = await clearTable("conversation", "id=not.is.null");
  } else {
    log("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set: skipping database reset");
  }
  console.log(JSON.stringify({ dryRun, repo: REPO, ...summary }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
