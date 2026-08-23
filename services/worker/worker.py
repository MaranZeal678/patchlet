"""Mistral Workflows worker entry point.

Run with the secrets in the environment: `vault-exec uv run python worker.py`.
Requires MISTRAL_API_KEY and DEPLOYMENT_NAME (the SDK reads both from the environment).
"""

from __future__ import annotations

import asyncio
import logging
import os

import mistralai.workflows as workflows

import heartbeat
from workflow import MissingFeatureWorkflow


def check_env() -> None:
    missing = [name for name in ("MISTRAL_API_KEY", "DEPLOYMENT_NAME") if not os.environ.get(name)]
    if missing:
        raise SystemExit(f"missing environment: {', '.join(missing)}")
    for name in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "GITHUB_TOKEN", "VERCEL_TOKEN"):
        if not os.environ.get(name):
            logging.getLogger("patchlet.worker").warning("%s is not set; the matching step will fail", name)


async def main() -> None:
    check_env()
    logging.basicConfig(level=logging.INFO)
    pulse = asyncio.create_task(heartbeat.run("mistral"))
    try:
        task = workflows.run_worker([MissingFeatureWorkflow])
        if task is not None:
            await task
    finally:
        pulse.cancel()


if __name__ == "__main__":  # required: the workflow sandbox re-imports this module
    asyncio.run(main())
