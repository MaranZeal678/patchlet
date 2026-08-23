"""The patchlet-missing-feature workflow: issue, plan, draft, PR, human approval, merge and deploy."""

from __future__ import annotations

import mistralai.workflows as workflows

with workflows.workflow.unsafe.imports_passed_through():
    from activities import (
        draft_implementation,
        file_issue,
        inspect_repository,
        merge_and_deploy,
        open_draft_pr,
        update_group,
    )
    from models import Approval, FeatureRequestInput, Outcome

WORKFLOW_NAME = "patchlet-missing-feature"
PAUSE_LABEL = "Merge this pull request?"


@workflows.workflow.define(
    name=WORKFLOW_NAME,
    workflow_description="Files a GitHub issue for a missing feature, drafts the implementation, opens a draft PR, waits for approval, merges and waits for the deployment. A request that is only observed files the issue and stops; a request already on GitHub only has its count and quotes updated.",
)
class MissingFeatureWorkflow(workflows.InteractiveWorkflow):
    @workflows.workflow.entrypoint
    async def run(self, req: FeatureRequestInput) -> Outcome:
        # A request already on GitHub gains a count and a quote, never a second issue or PR.
        if req.update_only:
            return await update_group(req)

        issue = await file_issue(req)
        # A gap nobody has reported yet is worth telling the developers about, and nothing more:
        # code is only drafted once enough people have run into it.
        if req.file_only:
            return Outcome(status="filed", issue_url=issue.url)

        plan = await inspect_repository(req, issue)
        draft = await draft_implementation(req, issue, plan)
        pr = await open_draft_pr(req, issue, plan, draft)
        decision = await self.wait_for_input(Approval, label=PAUSE_LABEL)
        return await merge_and_deploy(req, issue, pr, decision)
