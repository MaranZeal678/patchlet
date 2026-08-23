"""The five synchronous steps of an escalation. Activities and the local runner both call these."""

from __future__ import annotations

import re
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from models import Approval, Draft, FeatureRequestInput, IssueRef, Outcome, Plan, PrRef
from steps import codegen, db, deploy, drafting, issue as issue_text, mcp_github, repo, slack, trace
from steps.github import GitHubClient
from steps.reporter import Reporter

PAUSE_LABEL = "Merge this pull request?"


def _slug(text: str, limit: int = 40) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:limit].rstrip("-") or "change"


def _set_status(req: FeatureRequestInput, status: str, **fields: object) -> None:
    db.update_escalation(req.escalation_id, status=status, **fields)
    trace.status(req.project_id, req.escalation_id, f"Status: {status.replace('_', ' ')}", detail={"status": status})


def fail(req: FeatureRequestInput, step: str, error: Exception) -> None:
    message = f"{step}: {error}"
    db.update_escalation(req.escalation_id, status="failed", error=message[:2000])
    trace.error(req.project_id, req.escalation_id, f"{step} failed", message)


# ---- 1. file_issue ----------------------------------------------------------

def file_issue(req: FeatureRequestInput) -> IssueRef:
    _set_status(req, "filing")
    reporter = Reporter(req.project_id, req.escalation_id)
    criteria = issue_text.default_acceptance_criteria(req)
    body = issue_text.build_issue_body(req, criteria)
    trace.issue_draft(req.project_id, req.escalation_id, req.title, body)

    github = GitHubClient(req.repo_full_name)
    existing = github.find_open_issue_by_title(req.title)
    if existing:
        comment = github.comment(int(existing["number"]), issue_text.build_duplicate_comment(req))
        reporter.tool(
            f"Issue #{existing['number']} already open, added a comment",
            "add_issue_comment", "rest",
            f"POST /repos/{req.repo_full_name}/issues/{existing['number']}/comments",
            comment.get("html_url", ""),
        )
        ref = IssueRef(number=int(existing["number"]), url=existing["html_url"], title=existing["title"], body=body, deduplicated=True, transport="rest")
    else:
        result = mcp_github.file_issue_with_model(req.repo_full_name, req.title, body, [issue_text.LABEL], rest=github)
        reporter.tool(
            f"Created issue #{result['number']} through {result['transport'].upper()}",
            "create_issue", result["transport"], result["args_summary"], result["result_summary"],
        )
        ref = IssueRef(number=result["number"], url=result["url"], title=req.title, body=body, transport=result["transport"])
    trace.issue(req.project_id, req.escalation_id, ref.url, ref.number, ref.deduplicated)
    db.update_escalation(req.escalation_id, issue_url=ref.url, issue_number=ref.number)
    return ref


# ---- 2. inspect_repository ----------------------------------------------------

def inspect_repository(req: FeatureRequestInput, issue: IssueRef) -> Plan:
    _set_status(req, "inspecting")
    reporter = Reporter(req.project_id, req.escalation_id)
    workdir = Path(tempfile.mkdtemp(prefix="patchlet-inspect-"))
    try:
        sha = repo.clone(req.repo_full_name, req.default_branch, workdir)
        reporter.tool(
            f"Cloned {req.repo_full_name}@{req.default_branch}", "git clone", "git",
            f"--depth 1 --branch {req.default_branch}", f"HEAD {sha[:7]}",
        )
        plan, input_summary = codegen.plan_changes(workdir, req, issue.title, issue.body)
        reporter.model(
            f"Chose {len(plan.files)} file(s) to change",
            codegen.ARCHITECT_MODEL,
            "choose the minimal set of files and write acceptance criteria",
            input_summary=input_summary,
            output_summary=plan.summary,
            files=[{"path": f.path, "reason": f.reason} for f in plan.files],
        )
        return plan
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


# ---- 3. draft_implementation --------------------------------------------------

def draft_implementation(req: FeatureRequestInput, issue: IssueRef, plan: Plan) -> Draft:
    _set_status(req, "drafting")
    reporter = Reporter(req.project_id, req.escalation_id)
    workdir = Path(tempfile.mkdtemp(prefix="patchlet-draft-"))
    try:
        repo.clone(req.repo_full_name, req.default_branch, workdir)
        draft = drafting.draft_with_gates(workdir, req, issue.title, issue.body, plan, reporter, repo.repo_slug(req.repo_full_name))
        reporter.diff([{"path": d.path, "patch": d.patch} for d in draft.diffs])
        return draft
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


# ---- 4. open_draft_pr ---------------------------------------------------------

def open_draft_pr(req: FeatureRequestInput, issue: IssueRef, plan: Plan, draft: Draft) -> PrRef:
    _set_status(req, "pr_open")
    reporter = Reporter(req.project_id, req.escalation_id)
    github = GitHubClient(req.repo_full_name)
    branch = f"patchlet/{issue.number}-{_slug(req.title)}"
    parent = draft.base_sha or github.get_branch_sha(req.default_branch)
    title = req.title[0].lower() + req.title[1:] if req.title else "change"
    message = f"feat: {title}\n\nCloses #{issue.number}"
    head_sha = github.push_files(branch, parent, draft.files, message)
    reporter.tool(
        f"Pushed {len(draft.files)} file(s) to {branch}", "push_files", "rest",
        f"blob/tree/commit/ref on top of {parent[:7]}", f"commit {head_sha[:7]}",
    )

    body = issue_text.build_pr_body(req, issue.number, list(draft.files), plan.acceptance_criteria, draft.summary)
    pr_title = f"feat: {title}"
    existing = github.find_open_pr_for_branch(branch)
    if existing:
        pr = existing
        transport = "rest"
        result_summary = f"reused open PR #{pr['number']}"
    else:
        pr, transport, result_summary = mcp_github.open_draft_pr_with_fallback(
            req.repo_full_name, pr_title, body, branch, req.default_branch, rest=github
        )
    reporter.tool(
        f"Opened draft PR #{pr['number']} through {transport.upper()}", "create_pull_request", transport,
        f"head={branch} base={req.default_branch} draft=true", result_summary,
    )
    ref = PrRef(number=int(pr["number"]), url=pr["html_url"], branch=branch, head_sha=head_sha, node_id=pr.get("node_id", ""))
    trace.pr(req.project_id, req.escalation_id, ref.url, ref.number, branch)
    db.update_escalation(req.escalation_id, pr_url=ref.url, pr_number=ref.number, branch=branch)
    slack.notify(f"Patchlet filed {issue.url} and drafted {ref.url} for \"{req.title}\". Approve it in the console.")
    _set_status(req, "awaiting_approval")
    trace.pause(req.project_id, req.escalation_id, PAUSE_LABEL)
    return ref


# ---- 5. merge_and_deploy ------------------------------------------------------

def merge_and_deploy(req: FeatureRequestInput, issue: IssueRef, pr: PrRef, decision: Approval) -> Outcome:
    reporter = Reporter(req.project_id, req.escalation_id)
    github = GitHubClient(req.repo_full_name)
    approval = {"approved": decision.approved, "note": decision.note, "decidedAt": datetime.now(timezone.utc).isoformat()}
    if not decision.approved:
        note = decision.note.strip() or "Closed without merging."
        github.close_pr(pr.number, f"Rejected from the Patchlet console: {note}")
        reporter.tool(f"Closed PR #{pr.number}", "close_pull_request", "rest", f"PATCH /pulls/{pr.number} state=closed", note)
        db.update_escalation(req.escalation_id, status="rejected", approval=approval)
        trace.status(req.project_id, req.escalation_id, "Status: rejected", detail={"status": "rejected"})
        return Outcome(status="rejected", issue_url=issue.url, pr_url=pr.url, note=note)

    db.update_escalation(req.escalation_id, status="approved", approval=approval)
    trace.status(req.project_id, req.escalation_id, "Approved in the console", detail={"status": "approved", "note": decision.note})
    _set_status(req, "merging")
    node_id = pr.node_id or github.get_pr(pr.number)["node_id"]
    github.mark_ready_for_review(node_id)
    reporter.tool(f"Marked PR #{pr.number} ready for review", "markPullRequestReadyForReview", "rest", f"pullRequestId={node_id}", "isDraft=false")
    github.wait_until_mergeable(pr.number)
    merge_sha = github.merge_squash(pr.number, f"feat: {req.title[0].lower() + req.title[1:]} (#{pr.number})", f"Closes #{issue.number}")
    reporter.tool(f"Merged PR #{pr.number} (squash)", "merge_pull_request", "rest", f"PUT /pulls/{pr.number}/merge squash", f"merge commit {merge_sha[:7]}")

    _set_status(req, "deploying")
    reporter.status(f"Waiting for the Vercel deployment of {merge_sha[:7]}", "running", {"sha": merge_sha})
    url = deploy.wait_for_deployment(
        merge_sha,
        report=lambda title, state: reporter.status(title, "running", {"sha": merge_sha, "readyState": state}),
    )
    trace.deployment(req.project_id, req.escalation_id, url)
    db.update_escalation(req.escalation_id, status="shipped", deployment_url=url)
    trace.status(req.project_id, req.escalation_id, "Status: shipped", detail={"status": "shipped", "url": url})
    return Outcome(status="shipped", issue_url=issue.url, pr_url=pr.url, deployment_url=url, merge_sha=merge_sha)
