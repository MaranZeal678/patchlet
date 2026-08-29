/**
 * The Action Compiler recorder — the widget, turned inside out.
 *
 * Patchlet's widget scanned the page to *answer questions*. The recorder scans
 * the page to *watch work happen*: on every user action it emits the
 * affordance map before, the affordance acted on, and the affordance map
 * after. Those state–action–state triples are the demonstrations everything
 * downstream (discovery, compilation, equivalence proof) is built from.
 *
 * Host pages configure it with:
 *   window.ACTION_COMPILER = { endpoint: "http://.../api/observe", app: "meridian-admin" }
 */
import { scanAffordances } from "../scan/affordances";
import type { Affordance, PageContext } from "../types";

type RecordedAction = {
  kind: "click" | "change";
  target: { id: string | null; role: string; name: string };
  value?: string | boolean;
};

type StepPayload = {
  app: string;
  instance: string;
  sessionId: string;
  seq: number;
  at: string;
  url: string;
  action: RecordedAction;
  before: PageContext;
  after: PageContext;
};

const config = (window as unknown as { ACTION_COMPILER?: { endpoint?: string; app?: string } }).ACTION_COMPILER ?? {};
const ENDPOINT = config.endpoint ?? "/api/observe";
const APP = config.app ?? "unknown-app";
const INSTANCE = new URLSearchParams(location.search).get("instance") ?? "live";

const sessionId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `s-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

// The host app reads this and sends it as X-Session-Id on its own API calls,
// which is what ties a trajectory to the effects it caused.
(window as unknown as { __acSessionId: string }).__acSessionId = sessionId;

let seq = 0;
let lastScan: { page: PageContext; lookup: Map<string, Element> } | null = null;
let queue: Promise<void> = Promise.resolve();
let pendingSettles = 0;

function scan(): { page: PageContext; lookup: Map<string, Element> } {
  return scanAffordances({ limit: 80 });
}

/** Waits for the app to announce a re-render, with a timeout for pages that don't. */
function settle(): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener("app:rendered", finish);
      // One extra tick so the announced DOM is actually in place.
      setTimeout(resolve, 10);
    };
    window.addEventListener("app:rendered", finish);
    setTimeout(finish, 300);
  });
}

function affordanceIdOf(element: Element, lookup: Map<string, Element>): { id: string | null; affordance: Affordance | null; matched: Element | null } {
  let node: Element | null = element;
  while (node) {
    for (const [id, candidate] of lookup) {
      if (candidate === node) return { id, affordance: null, matched: node };
    }
    node = node.parentElement;
  }
  return { id: null, affordance: null, matched: null };
}

function describeTarget(element: Element): { role: string; name: string } {
  const tag = element.tagName.toLowerCase();
  const role =
    element.getAttribute("role") ??
    (tag === "a" ? "link" : tag === "select" ? "combobox" : tag === "input" ? (element as HTMLInputElement).type === "checkbox" ? "checkbox" : "textbox" : "button");
  const name =
    element.getAttribute("aria-label") ??
    (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
  return { role, name };
}

function post(payload: unknown): void {
  queue = queue
    .then(() =>
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).then(
        () => undefined,
        () => undefined, // observation must never break the host app
      ),
    )
    .then(() => undefined);
}

function record(kind: RecordedAction["kind"], element: Element, value?: string | boolean): void {
  const before = lastScan ?? scan();
  const found = affordanceIdOf(element, before.lookup);
  const inBefore = found.id ? before.page.affordances.find((a) => a.id === found.id) ?? null : null;
  const described = inBefore ? { role: inBefore.role, name: inBefore.name } : describeTarget(element);
  const action: RecordedAction = { kind, target: { id: found.id, role: described.role, name: described.name } };
  if (value !== undefined) action.value = value;

  const mySeq = seq++;
  pendingSettles += 1;
  void settle().then(() => {
    pendingSettles -= 1;
    const after = scan();
    lastScan = after;
    const payload: StepPayload = {
      app: APP,
      instance: INSTANCE,
      sessionId,
      seq: mySeq,
      at: new Date().toISOString(),
      url: location.hash || "#/",
      action,
      before: before.page,
      after: after.page,
    };
    post(payload);
  });
}

document.addEventListener(
  "click",
  (event) => {
    const element = event.target as Element | null;
    if (!element || !(element instanceof Element)) return;
    // Form controls report through their change event instead; recording both
    // would double-count one human action.
    const control = element.closest("input, select, textarea, label");
    if (control) return;
    const interactive = element.closest("a, button, [role=button], [role=tab], summary");
    if (!interactive) return;
    record("click", interactive);
  },
  true,
);

document.addEventListener(
  "change",
  (event) => {
    const element = event.target as Element | null;
    if (!element || !(element instanceof Element)) return;
    let value: string | boolean | undefined;
    if (element instanceof HTMLInputElement) {
      value = element.type === "checkbox" || element.type === "radio" ? element.checked : element.value;
    } else if (element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
      value = element.value;
    }
    record("change", element, value);
  },
  true,
);

function end(status: "completed" | "abandoned"): void {
  post({ app: APP, instance: INSTANCE, sessionId, end: true, status, at: new Date().toISOString() });
}

window.addEventListener("pagehide", () => end("abandoned"));

// First scan once the app has painted, so step 0 has an honest "before".
void settle().then(() => {
  lastScan = scan();
});

/**
 * Hooks for harnesses. flush/end serve the seeder; scan/act serve the blind
 * agent in the race, which sees the page only through affordance maps and
 * acts only through affordance ids — screenshot-and-click, minus pixels.
 */
let agentLookup: Map<string, Element> | null = null;

(window as unknown as { __acRecorder: unknown }).__acRecorder = {
  sessionId,
  flush(): Promise<void> {
    const wait = (): Promise<void> =>
      pendingSettles > 0 ? new Promise((r) => setTimeout(r, 40)).then(wait) : queue.then(() => undefined);
    return wait();
  },
  end,
  scan(): PageContext {
    const result = scan();
    agentLookup = result.lookup;
    return result.page;
  },
  act(targetId: string, value?: string | boolean): boolean {
    const element = agentLookup?.get(targetId);
    if (!element) return false;
    if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) {
      if (typeof value !== "boolean" || element.checked !== value) element.click();
      return true;
    }
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.value = String(value ?? "");
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    if (element instanceof HTMLSelectElement) {
      element.value = String(value ?? "");
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    (element as HTMLElement).click();
    return true;
  },
};
