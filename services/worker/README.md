# Worker

The escalation worker is built separately and owns everything else in this directory. It is a
Python 3.12 project run with `uv`, hosting the durable workflow `patchlet-missing-feature` that
files the GitHub issue, inspects the repository, drafts the implementation, opens a draft pull
request, waits for a human approval, and then merges and watches the deployment. A local runner
executes the same steps without a workflow engine as a fallback. Its design, its steps and the
trace events it writes are specified in `docs/contracts.md` and `docs/architecture.md`; the run and
deploy instructions are in `docs/deploy.md`.
