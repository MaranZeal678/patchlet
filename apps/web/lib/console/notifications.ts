/**
 * What the worker has opened on GitHub, for the bell in the console bar.
 *
 * An escalation can produce two things a person would want to click: the issue it filed and the
 * pull request it drafted. Both come off the same row, so they are flattened here into one list
 * ordered the way a person reads a feed.
 */
import { serviceClient } from "@/lib/supabase";

export type NotificationKind = "issue" | "pull_request";

export type Notification = {
  /** Stable across reloads, so "seen" can be remembered without a server round trip. */
  id: string;
  escalationId: string;
  kind: NotificationKind;
  number: number | null;
  url: string;
  title: string;
  status: string;
  at: string;
};

export const NOTIFICATION_LIMIT = 10;

type EscalationRow = {
  id: unknown;
  status: unknown;
  request: unknown;
  issue_url: unknown;
  issue_number: unknown;
  pr_url: unknown;
  pr_number: unknown;
  created_at: unknown;
  updated_at: unknown;
};

function requestTitle(request: unknown): string {
  const title = (request as { title?: unknown } | null)?.title;
  return typeof title === "string" && title.trim() !== "" ? title.trim() : "Feature request";
}

/** The pull request is always the later of the two, so it reads first inside one escalation. */
const KIND_ORDER: Record<NotificationKind, number> = { pull_request: 0, issue: 1 };

/** Flattens escalation rows into the newest things the worker opened. */
export function toNotifications(rows: EscalationRow[]): Notification[] {
  const found: Notification[] = [];

  for (const row of rows) {
    const escalationId = String(row.id);
    const title = requestTitle(row.request);
    const status = String(row.status ?? "");
    const at = String(row.updated_at ?? row.created_at ?? "");

    if (typeof row.issue_url === "string" && row.issue_url !== "") {
      found.push({
        id: `${escalationId}:issue`,
        escalationId,
        kind: "issue",
        number: row.issue_number === null || row.issue_number === undefined ? null : Number(row.issue_number),
        url: row.issue_url,
        title,
        status,
        at,
      });
    }
    if (typeof row.pr_url === "string" && row.pr_url !== "") {
      found.push({
        id: `${escalationId}:pull_request`,
        escalationId,
        kind: "pull_request",
        number: row.pr_number === null || row.pr_number === undefined ? null : Number(row.pr_number),
        url: row.pr_url,
        title,
        status,
        at,
      });
    }
  }

  return found
    .sort((a, b) => (a.at === b.at ? KIND_ORDER[a.kind] - KIND_ORDER[b.kind] : b.at.localeCompare(a.at)))
    .slice(0, NOTIFICATION_LIMIT);
}

export async function loadNotifications(projectId: string): Promise<Notification[]> {
  const { data, error } = await serviceClient()
    .from("escalation")
    .select("id, status, request, issue_url, issue_number, pr_url, pr_number, created_at, updated_at")
    .eq("project_id", projectId)
    .or("issue_url.not.is.null,pr_url.not.is.null")
    .order("updated_at", { ascending: false })
    .limit(NOTIFICATION_LIMIT);
  if (error) throw new Error(error.message);

  return toNotifications((data ?? []) as EscalationRow[]);
}
