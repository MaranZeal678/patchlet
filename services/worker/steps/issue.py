"""Builds the GitHub issue text from a feature request."""

from __future__ import annotations

from models import FeatureRequestInput

FOOTER = "Filed by Patchlet after the documentation, page and repository checks found no such feature."
LABEL = "patchlet"


def default_acceptance_criteria(req: FeatureRequestInput) -> list[str]:
    return [
        f"{req.title.rstrip('.')} is available to users from the {req.area or 'relevant'} part of the product.",
        "The change follows the repository conventions in AGENTS.md.",
        "`npm run typecheck` and `npm run build` pass.",
    ]


def build_issue_body(req: FeatureRequestInput, acceptance_criteria: list[str] | None = None) -> str:
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
    lines += ["", "---", FOOTER]
    return "\n".join(lines) + "\n"


def build_duplicate_comment(req: FeatureRequestInput) -> str:
    body = "Another user asked for this."
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
