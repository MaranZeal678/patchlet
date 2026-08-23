/** "Mar 4, 2:05 PM" - the compact absolute time every console list uses. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "14:02:31" - trace rows are read in sequence, so they only need the clock. */
export function formatClock(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const STATUS_TONE: Record<string, string> = {
  queued: "is-wait",
  filing: "is-run",
  inspecting: "is-run",
  drafting: "is-run",
  pr_open: "is-run",
  awaiting_approval: "is-wait",
  approved: "is-good",
  rejected: "is-bad",
  merging: "is-run",
  deploying: "is-run",
  shipped: "is-good",
  failed: "is-bad",
};

export function escalationTone(status: string): string {
  return STATUS_TONE[status] ?? "is-muted";
}

/** `awaiting_approval` reads badly in a badge; the label is what a person would say. */
const STATUS_LABEL: Record<string, string> = {
  pr_open: "draft pr open",
  awaiting_approval: "awaiting approval",
};

export function escalationLabel(status: string): string {
  return STATUS_LABEL[status] ?? status.replace(/_/g, " ");
}

/** "4m 12s" - how long a conversation ran, or "-" when there is only one message. */
export function formatDuration(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return "-";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
}
