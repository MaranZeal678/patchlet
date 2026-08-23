"""Builds the GitHub issue text from a feature request, and the labels that go with it."""

from __future__ import annotations

import re

from models import FeatureRequestInput
from steps import llm

FOOTER = "Filed by Patchlet after the documentation, page and repository checks found no such feature."
LABEL = "patchlet"

PRIORITY_MODEL = "mistral-large-latest"
PRIORITIES = ("low", "medium", "high")
DEFAULT_PRIORITY = "medium"

PRIORITY_SCHEMA = {
    "type": "object",
    "properties": {
        "priority": {"type": "string", "enum": list(PRIORITIES)},
        "reason": {"type": "string"},
    },
    "required": ["priority", "reason"],
    "additionalProperties": False,
}

PRIORITY_SYSTEM = """You triage feature requests for a small product team.
Given one request, choose its priority.
- high: users cannot do their work without it, or it blocks a common flow.
- medium: a real gap that users hit regularly and can work around.
- low: a nice improvement nobody is blocked on.
Be conservative: high is rare. Answer with JSON only."""

# The line the duplicate path increments, so a repeatedly requested feature shows its weight.
REQUEST_COUNT_RE = re.compile(r"Requested (\d+) times?", re.IGNORECASE)


def choose_priority(req: FeatureRequestInput) -> tuple[str, str]:
    """Ask the model how urgent this is. Returns (priority, reason); never raises."""
    try:
        result = llm.complete_json(
            PRIORITY_MODEL,
            PRIORITY_SYSTEM,
            f"Title: {req.title}\nDescription: {req.description}\nArea: {req.area}\n"
            f"What the user said: {req.quote}\nWhy it matters: {req.rationale}",
            "issue_priority",
            PRIORITY_SCHEMA,
        )
        priority = str(result.get("priority", "")).strip().lower()
        if priority in PRIORITIES:
            return priority, str(result.get("reason", "")).strip()
    except Exception:
        pass
    return DEFAULT_PRIORITY, "the model did not return a priority, so this fell back to medium"


def labels_for(priority: str) -> list[str]:
    """Every Patchlet issue carries the product label and its priority."""
    safe = priority if priority in PRIORITIES else DEFAULT_PRIORITY
    return [LABEL, f"priority:{safe}"]


def bump_request_count(body: str) -> tuple[str, int]:
    """Raise the "Requested N times" line by one. Appends the line when the body has none."""
    match = REQUEST_COUNT_RE.search(body or "")
    if match:
        count = int(match.group(1)) + 1
        return REQUEST_COUNT_RE.sub(f"Requested {count} times", body, count=1), count
    count = 2
    separator = "" if not body or body.endswith("\n") else "\n"
    return f"{body}{separator}\nRequested {count} times\n", count


def default_acceptance_criteria(req: FeatureRequestInput) -> list[str]:
    return [
        f"{req.title.rstrip('.')} is available to users from the {req.area or 'relevant'} part of the product.",
        "The change follows the repository conventions in AGENTS.md.",
        "`npm run typecheck` and `npm run build` pass.",
    ]


def build_issue_body(
    req: FeatureRequestInput,
    acceptance_criteria: list[str] | None = None,
    priority: str = DEFAULT_PRIORITY,
) -> str:
    criteria = acceptance_criteria or default_acceptance_criteria(req)
    lines = ["## What the user asked", ""]
    if req.quote:
        lines.append(f"> {req.quote.strip()}")
        lines.append("")
    lines.append(req.description.strip())
    lines += ["", "## Why it matters", "", (req.rationale or "A user asked for it and could not find it.").strip()]
    lines += ["", "## Where it belongs", "", (req.area or "To be decided by the maintainers.").strip()]
    lines += ["", "## Acceptance criteria", ""]
    lines += [f"- [ ] {item}" for item in criteria]
    if req.site_url:
        lines += ["", f"Site: {req.site_url}"]
    lines += ["", f"Priority: {priority}", "", "Requested 1 time"]
    lines += ["", "---", FOOTER]
    return "\n".join(lines) + "\n"


def build_duplicate_comment(req: FeatureRequestInput, count: int | None = None) -> str:
    body = "Another user asked for this." if count is None else f"Another user asked for this. Requested {count} times."
    if req.quote:
        body += f"\n\n> {req.quote.strip()}"
    body += f"\n\n{req.description.strip()}\n\n---\n{FOOTER}"
    return body


def build_pr_body(req: FeatureRequestInput, issue_number: int, changed: list[str], criteria: list[str], summary: str) -> str:
    lines = [f"Closes #{issue_number}", "", "## What changed", ""]
    lines.append(summary.strip() or req.description.strip())
    lines += ["", "Files:", ""]
    lines += [f"- `{path}`" for path in changed]
    lines += ["", "## How to test", ""]
    lines += [f"- {item.lstrip('- ').strip()}" for item in criteria] or ["- Run the app and try the feature."]
    lines += ["", "---", "Drafted by Patchlet from a user request. A maintainer reviews and approves before merge."]
    return "\n".join(lines) + "\n"


def build_gate_comment(gates: list[tuple[str, bool, float]], activity_url: str) -> str:
    """The comment left on the draft PR: what the gates did, and where to watch the rest."""
    lines = ["Patchlet ran the repository's own gates against this branch before opening it.", "", "| Gate | Result | Duration |", "| --- | --- | --- |"]
    for name, ok, seconds in gates:
        lines.append(f"| `{name}` | {'passed' if ok else 'failed'} | {seconds:.0f}s |")
    lines += ["", f"Follow the rest of this change on the [Patchlet activity page]({activity_url})."]
    return "\n".join(lines) + "\n"
