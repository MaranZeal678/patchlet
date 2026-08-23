# Demo notes

Three minutes. Two questions, one approval, one reload. The point of the demo is the second
question: anyone can answer from documentation, almost nothing can prove a feature is missing and
then build it.

## Before you start

- Two browser tabs, both already loaded: the host app (Not Mistral) and the Patchlet console on
  `/console/activity`. Switching tabs mid-demo is faster than navigating.
- The knowledge base has the host app's handbook ingested. Check `/console/knowledge` shows the
  documents as ready with a chunk count.
- The repository is connected on `/console/repository` and the overview reports the worker online.
- Run `npm run demo:reset` beforehand so the host app is back to its pre-demo state and old
  escalations are cleared.
- Window at 1440x900 or larger. Everything is sized to read on a projector, but the widget panel is
  380 px wide, so do not shrink the window.

## 1. It answers, and it shows you (about 40 seconds)

Open Patchlet on the host app and ask **"How do I change my username?"**.

Say while the checks run: *three checks go out in parallel - the documentation, the page you are
actually looking at, and the product's repository.*

The documentation check comes back with a hit. The agent answers, then spotlights the real controls
in order: the account menu at the bottom of the sidebar, then Profile, then the Username field, then
Update profile.

Point out what is happening: **the model never sees a CSS selector.** The widget scans the page for
interactive elements and hands the model opaque ids. If the model returns an id that was not on the
list, the whole step plan is thrown away and only the prose survives. That is why the spotlight
lands on the right control rather than an approximation of it.

## 2. It proves absence (about 40 seconds)

Ask **"How do I turn on dark mode?"**.

The same three checks run. This time all three come back empty: nothing in the documentation,
nothing on the page, nothing in the repository. Only then does a reasoning model get asked to
confirm the feature really does not exist.

The agent apologises, says plainly that dark mode is not available, and offers to report it.

Say: *this is the part that is hard. A support bot that hallucinates a settings page here is worse
than useless. Three independent checks have to agree before it will say a feature is missing.*

Accept the offer.

## 3. The trace (about 60 seconds)

Switch to the console's Activity tab. The trace is already streaming, and it is the same log the
agent wrote during the chat, so it starts with the checks the user just saw.

Walk down the rows as they arrive:

- the verdict, with the reasoning that led to it
- the drafted issue, then the real GitHub issue with its number, filed through the GitHub tool
- the repository inspection: the files the model chose, each with a reason
- the drafted diff, per file
- the draft pull request link
- then the workflow stops on **Approve / Reject**

Say while it runs: *this is a durable workflow, not a script. It survives a restart, and it stops
here because merging code is a human decision.*

Open the pull request in a new tab if the room wants to see the diff in GitHub. The changed files
are the theme tokens, a new toggle component, and the header slot that renders it.

## 4. Approve, and the product changes (about 40 seconds)

Click **Approve**.

The trace continues: the pull request is marked ready, merged, and then the workflow watches the
host app's deployment until it reports live.

Switch to the host app tab and reload. There is now a theme toggle in the header. Turn it on. The
app goes dark.

Close on it: *the user asked for a feature that did not exist. Three checks proved it did not exist.
The issue was filed, the code was written, a human approved the pull request, and the product they
were looking at changed. That is the whole loop.*

## If something goes wrong

- **A check hangs.** The widget shows an elapsed counter rather than a spinner. Keep talking; the
  probes have their own timeouts and the turn completes.
- **The workflow engine is unavailable.** Set `ESCALATION_ENGINE=local` and run the worker's local
  runner. The steps, the statuses and the trace are identical, so the demo does not change.
- **The deployment is slow.** The trace stays on `deploying`. Move to questions and come back to the
  reload at the end.
- **You need to run it twice.** `npm run demo:reset` restores the host app and clears the previous
  escalation, so the second run is as clean as the first.
