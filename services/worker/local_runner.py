"""Fallback engine: runs the same steps without Mistral Workflows.

Polls `escalation` rows with status='queued' and engine='local' every 2 s, runs the steps in order,
and implements the pause by polling `escalation.approval` every 3 s until the console sets it.
Run with `vault-exec uv run python local_runner.py`.
"""

from __future__ import annotations

import logging
import threading
import time
from typing import Any

from models import Approval, FeatureRequestInput
from steps import db, pipeline
from heartbeat import beat_once

POLL_S = 2
APPROVAL_POLL_S = 3
log = logging.getLogger("patchlet.local")


def request_from_row(row: dict[str, Any]) -> FeatureRequestInput:
    request = row.get("request") or {}
    project = db.get_project(row["project_id"]) or {}
    return FeatureRequestInput(
        escalation_id=row["id"],
        project_id=row["project_id"],
        repo_full_name=request.get("repo_full_name") or project.get("repo_full_name") or "",
        default_branch=request.get("default_branch") or project.get("repo_default_branch") or "main",
        title=request.get("title", ""),
        description=request.get("description", ""),
        area=request.get("area", "") or "",
        quote=request.get("quote", "") or "",
        rationale=request.get("rationale", "") or "",
        conversation_excerpt=request.get("conversation_excerpt", "") or "",
        site_url=request.get("site_url") or project.get("site_url") or "",
    )


def wait_for_approval(escalation_id: str) -> Approval:
    while True:
        row = db.get_escalation(escalation_id) or {}
        approval = row.get("approval")
        if isinstance(approval, dict) and "approved" in approval:
            return Approval(approved=bool(approval["approved"]), note=str(approval.get("note") or ""))
        time.sleep(APPROVAL_POLL_S)


def run_escalation(row: dict[str, Any]) -> None:
    req = request_from_row(row)
    step = "file_issue"
    try:
        issue = pipeline.file_issue(req)
        step = "inspect_repository"
        plan = pipeline.inspect_repository(req, issue)
        step = "draft_implementation"
        draft = pipeline.draft_implementation(req, issue, plan)
        step = "open_draft_pr"
        pr = pipeline.open_draft_pr(req, issue, plan, draft)
        decision = wait_for_approval(req.escalation_id)
        step = "merge_and_deploy"
        outcome = pipeline.merge_and_deploy(req, issue, pr, decision)
        log.info("escalation %s finished: %s", req.escalation_id, outcome.status)
    except Exception as error:  # noqa: BLE001 - record the failure, keep polling
        log.exception("escalation %s failed in %s", req.escalation_id, step)
        pipeline.fail(req, step, error)


def heartbeat_loop() -> None:
    while True:
        try:
            beat_once("local")
        except Exception as error:  # noqa: BLE001
            log.warning("heartbeat failed: %s", error)
        time.sleep(60)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    threading.Thread(target=heartbeat_loop, daemon=True).start()
    log.info("local runner polling for queued escalations")
    while True:
        try:
            row = db.claim_queued_local()
        except Exception as error:  # noqa: BLE001
            log.warning("poll failed: %s", error)
            row = None
        if row:
            run_escalation(row)
        else:
            time.sleep(POLL_S)


if __name__ == "__main__":
    main()
