import { describe, expect, it } from "vitest";
import { toNotifications } from "@/lib/console/notifications";

type Row = Parameters<typeof toNotifications>[0][number];

function escalation(over: Partial<Record<keyof Row, unknown>> = {}): Row {
  return {
    id: "e1",
    status: "pr_open",
    request: { title: "Add a dark mode toggle" },
    issue_url: "https://github.com/acme/app/issues/12",
    issue_number: 12,
    pr_url: null,
    pr_number: null,
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-08-20T10:05:00Z",
    ...over,
  } as Row;
}

describe("toNotifications", () => {
  it("turns one escalation into the issue and the pull request it opened", () => {
    const found = toNotifications([
      escalation({ pr_url: "https://github.com/acme/app/pull/13", pr_number: 13 }),
    ]);
    expect(found.map((item) => item.kind)).toEqual(["pull_request", "issue"]);
    expect(found[0]?.number).toBe(13);
    expect(found[0]?.title).toBe("Add a dark mode toggle");
    expect(found[0]?.id).toBe("e1:pull_request");
  });

  it("skips an escalation that has opened nothing yet", () => {
    expect(toNotifications([escalation({ issue_url: null, issue_number: null })])).toEqual([]);
  });

  it("puts the newest first", () => {
    const found = toNotifications([
      escalation({ id: "old", updated_at: "2026-08-01T00:00:00Z" }),
      escalation({ id: "new", updated_at: "2026-08-22T00:00:00Z" }),
    ]);
    expect(found.map((item) => item.escalationId)).toEqual(["new", "old"]);
  });

  it("falls back to when the escalation was created", () => {
    const found = toNotifications([escalation({ updated_at: null })]);
    expect(found[0]?.at).toBe("2026-08-20T10:00:00Z");
  });

  it("names a request that has no title", () => {
    expect(toNotifications([escalation({ request: null })])[0]?.title).toBe("Feature request");
    expect(toNotifications([escalation({ request: { title: "  " } })])[0]?.title).toBe(
      "Feature request",
    );
  });

  it("never hands the bell more than ten things to show", () => {
    const rows = Array.from({ length: 9 }, (_, index) =>
      escalation({
        id: `e${index}`,
        updated_at: `2026-08-${String(index + 1).padStart(2, "0")}T00:00:00Z`,
        pr_url: `https://github.com/acme/app/pull/${index}`,
        pr_number: index,
      }),
    );
    expect(toNotifications(rows)).toHaveLength(10);
  });
});
