"""Pydantic models shared by the workflow, the activities and the local runner."""

from __future__ import annotations

from pydantic import BaseModel, Field


class FeatureRequestInput(BaseModel):
    """Workflow input, exactly the fields the dashboard sends when it starts an escalation."""

    escalation_id: str
    project_id: str
    repo_full_name: str
    default_branch: str = "main"
    title: str
    description: str
    area: str = ""
    quote: str = ""
    rationale: str = ""
    conversation_excerpt: str = ""
    site_url: str = ""


class IssueRef(BaseModel):
    number: int
    url: str
    title: str
    body: str = ""
    deduplicated: bool = False
    transport: str = "mcp"


class PlannedFile(BaseModel):
    path: str
    reason: str
    is_new: bool = False


class Plan(BaseModel):
    files: list[PlannedFile]
    acceptance_criteria: list[str] = Field(default_factory=list)
    summary: str = ""
    base_sha: str = ""


class FileDiff(BaseModel):
    path: str
    patch: str


class Draft(BaseModel):
    files: dict[str, str]
    diffs: list[FileDiff] = Field(default_factory=list)
    summary: str = ""
    base_sha: str = ""
    candidates_tried: int = 1
    repairs: int = 0


class PrRef(BaseModel):
    number: int
    url: str
    branch: str
    head_sha: str = ""
    node_id: str = ""


class Approval(BaseModel):
    approved: bool
    note: str = ""


class Outcome(BaseModel):
    status: str
    issue_url: str = ""
    pr_url: str = ""
    deployment_url: str = ""
    merge_sha: str = ""
    note: str = ""
