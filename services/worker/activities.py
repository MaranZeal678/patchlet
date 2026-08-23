"""The five activities of the patchlet-missing-feature workflow.

Each activity runs its synchronous step in a thread so the worker's event loop (and the heartbeat)
keeps running, marks the escalation failed when the step raises, and re-raises for the retry policy.
"""

from __future__ import annotations

import asyncio
from datetime import timedelta
from typing import Awaitable, Callable, TypeVar

import mistralai.workflows as workflows

from models import Approval, Draft, FeatureRequestInput, IssueRef, Outcome, Plan, PrRef
from steps import pipeline

T = TypeVar("T")


async def _guarded(req: FeatureRequestInput, step: str, call: Callable[[], T]) -> T:
    try:
        return await asyncio.to_thread(call)
    except Exception as error:
        await asyncio.to_thread(pipeline.fail, req, step, error)
        raise


@workflows.activity(start_to_close_timeout=timedelta(minutes=5), retry_policy_max_attempts=2)
async def file_issue(req: FeatureRequestInput) -> IssueRef:
    return await _guarded(req, "file_issue", lambda: pipeline.file_issue(req))


@workflows.activity(start_to_close_timeout=timedelta(minutes=10), retry_policy_max_attempts=2)
async def inspect_repository(req: FeatureRequestInput, issue: IssueRef) -> Plan:
    return await _guarded(req, "inspect_repository", lambda: pipeline.inspect_repository(req, issue))


@workflows.activity(start_to_close_timeout=timedelta(minutes=40), retry_policy_max_attempts=1)
async def draft_implementation(req: FeatureRequestInput, issue: IssueRef, plan: Plan) -> Draft:
    return await _guarded(req, "draft_implementation", lambda: pipeline.draft_implementation(req, issue, plan))


@workflows.activity(start_to_close_timeout=timedelta(minutes=10), retry_policy_max_attempts=2)
async def open_draft_pr(req: FeatureRequestInput, issue: IssueRef, plan: Plan, draft: Draft) -> PrRef:
    return await _guarded(req, "open_draft_pr", lambda: pipeline.open_draft_pr(req, issue, plan, draft))


@workflows.activity(start_to_close_timeout=timedelta(minutes=15), retry_policy_max_attempts=1)
async def merge_and_deploy(req: FeatureRequestInput, issue: IssueRef, pr: PrRef, decision: Approval) -> Outcome:
    return await _guarded(req, "merge_and_deploy", lambda: pipeline.merge_and_deploy(req, issue, pr, decision))


ActivityCall = Callable[..., Awaitable[object]]
