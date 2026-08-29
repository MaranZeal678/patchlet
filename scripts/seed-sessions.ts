/**
 * Seeds demonstration sessions by actually using the target app.
 *
 * Each session boots the Meridian admin SPA inside jsdom — recorder embedded,
 * exactly as a browser would — and a simulated employee clicks through one of
 * three real workflows with natural variation (different entry paths, orders,
 * reasons, and the occasional abandoned attempt). Nothing is synthesized: the
 * recorder observes DOM events and ships the same state–action–state triples
 * it would for a human.
 *
 * Usage: npm run seed [-- --sessions=124]
 */
import { JSDOM, VirtualConsole } from "jsdom";

const TARGET = process.env.TARGET_ORIGIN ?? "http://localhost:5210";
const CONSOLE_APP = process.env.AC_ORIGIN ?? "http://localhost:3200";

const argCount = process.argv.find((a) => a.startsWith("--sessions="));
const TOTAL = argCount ? Number(argCount.split("=")[1]) : 124;

/* Deterministic-ish RNG so reruns look similar. */
let rngState = 0xc0ffee ^ TOTAL;
function rnd(): number {
  rngState |= 0;
  rngState = (rngState + 0x6d2b79f5) | 0;
  let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = <T,>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)]!;

const REASONS = ["damaged in transit", "wrong item shipped", "arrived too late", "quality not as expected", "customer changed mind"];
const NOTES = ["photos attached in ticket", "second incident for this customer", "approved by shift lead", "", ""];
const REPLIES = [
  "So sorry about that — your refund is on its way back to your card.",
  "We've processed this for you today. Apologies for the trouble!",
  "Refund issued — you should see it within 3–5 business days.",
  "Thanks for your patience, this is resolved now.",
];

type Order = { id: string; customerId: string; status: string; items: { sku: string; name: string }[] };
type Ticket = { id: string; orderId: string | null; status: string };
type Customer = { id: string; name: string };

async function shop<T>(path: string): Promise<T> {
  const response = await fetch(`${TARGET}/api/shop/live${path}`);
  if (!response.ok) throw new Error(`${path} -> ${response.status}`);
  return (await response.json()) as T;
}

/* ------------------------------------------------------------------ */
/* jsdom browser harness                                                */
/* ------------------------------------------------------------------ */

type Browser = {
  window: JSDOM["window"];
  rendered: () => Promise<void>;
  clickText: (selector: string, text: string) => Promise<void>;
  setValue: (label: string, value: string) => Promise<void>;
  toggle: (labelIncludes: string) => Promise<void>;
  selectReason: (value: string) => Promise<void>;
  finish: (status: "completed" | "abandoned") => Promise<void>;
};

async function openBrowser(): Promise<Browser> {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", () => undefined);

  const dom = await JSDOM.fromURL(`${TARGET}/?instance=live`, {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      // jsdom has no fetch; bridge to Node's, resolving relative URLs and
      // pointing the recorder at the console app.
      const base = TARGET;
      (window as unknown as { AC_ENDPOINT: string }).AC_ENDPOINT = CONSOLE_APP;
      (window as unknown as { fetch: typeof fetch }).fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? new URL(input, base).toString() : input;
        const options = { ...(init ?? {}) };
        delete (options as { keepalive?: boolean }).keepalive;
        return fetch(url as string, options);
      }) as typeof fetch;
    },
  });

  const window = dom.window;

  const rendered = (): Promise<void> =>
    new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.removeEventListener("app:rendered", finish);
        setTimeout(resolve, 25); // let the recorder take its "after" scan first
      };
      window.addEventListener("app:rendered", finish);
      setTimeout(finish, 450);
    });

  // Wait for the SPA's first paint.
  for (let i = 0; i < 100; i++) {
    if (window.document.querySelector('#root [class="layout"], #root .layout')) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  await new Promise((r) => setTimeout(r, 350)); // recorder's initial scan

  function allElements(selector: string): Element[] {
    return [...window.document.querySelectorAll(selector)];
  }

  async function clickText(selector: string, text: string): Promise<void> {
    const element = allElements(selector).find((el) => (el.textContent ?? "").trim() === text)
      ?? allElements(selector).find((el) => (el.textContent ?? "").includes(text));
    if (!element) throw new Error(`No ${selector} with text "${text}" on ${window.location.hash}`);
    const settled = rendered();
    (element as HTMLElement).click();
    await settled;
  }

  async function setValue(label: string, value: string): Promise<void> {
    const input = allElements("input, textarea").find((el) => el.getAttribute("aria-label") === label) as
      | HTMLInputElement
      | undefined;
    if (!input) throw new Error(`No input labelled "${label}"`);
    const settled = rendered();
    input.value = value;
    input.dispatchEvent(new window.Event("change", { bubbles: true }));
    await settled;
  }

  async function toggle(labelIncludes: string): Promise<void> {
    const box = allElements('input[type="checkbox"]').find((el) =>
      (el.getAttribute("aria-label") ?? "").includes(labelIncludes),
    ) as HTMLInputElement | undefined;
    if (!box) throw new Error(`No checkbox labelled ~"${labelIncludes}"`);
    const settled = rendered();
    box.click();
    await settled;
  }

  async function selectReason(value: string): Promise<void> {
    const select = allElements("select").find((el) => el.getAttribute("aria-label") === "Refund reason") as
      | HTMLSelectElement
      | undefined;
    if (!select) throw new Error("No refund reason select");
    const settled = rendered();
    select.value = value;
    select.dispatchEvent(new window.Event("change", { bubbles: true }));
    await settled;
  }

  async function finish(status: "completed" | "abandoned"): Promise<void> {
    const recorder = (window as unknown as { __acRecorder?: { flush: () => Promise<void>; end: (s: string) => void } }).__acRecorder;
    if (recorder) {
      await recorder.flush();
      recorder.end(status);
      await recorder.flush();
    }
    window.close();
  }

  return { window, rendered, clickText, setValue, toggle, selectReason, finish };
}

/* ------------------------------------------------------------------ */
/* The three demonstrated workflows                                     */
/* ------------------------------------------------------------------ */

async function refundSession(order: Order, customer: Customer | null, abandon: boolean): Promise<void> {
  const browser = await openBrowser();
  try {
    const viaCustomers = customer !== null && rnd() < 0.45;
    if (viaCustomers && customer) {
      await browser.clickText("a.nav-link", "Customers");
      await browser.setValue("Search customers", customer.name);
      await browser.clickText("table a", customer.name);
      await browser.clickText("a.tab", "Orders");
      await browser.clickText("table a", order.id);
    } else {
      await browser.clickText("a.nav-link", "Orders");
      await browser.setValue("Search orders", order.id);
      await browser.clickText("table a", order.id);
    }

    await browser.clickText("button", "Refund items…");
    if (abandon && rnd() < 0.5) return void (await browser.finish("abandoned"));

    const count = order.items.length > 1 && rnd() < 0.4 ? 2 : 1;
    const chosen = order.items.slice(0, count);
    for (const item of chosen) await browser.toggle(`(${item.sku})`);
    await browser.selectReason(pick(REASONS));
    const note = pick(NOTES);
    if (note) await browser.setValue("Internal note", note);
    if (rnd() < 0.72) await browser.toggle("Notify customer by email");
    if (abandon) return void (await browser.finish("abandoned"));

    await browser.clickText("button", "Confirm refund");
    if (rnd() < 0.6) await browser.clickText("a.tab", "Payment"); // double-check the money moved

    // Close the loop on the linked support ticket when there is one.
    const ticketLink = [...browser.window.document.querySelectorAll("p.linked a")].find((el) =>
      (el.textContent ?? "").includes("(T-"),
    );
    if (ticketLink && rnd() < 0.85) {
      const settled = browser.rendered();
      (ticketLink as HTMLElement).click();
      await settled;
      await browser.setValue("Reply to customer", pick(REPLIES));
      await browser.clickText("button", "Send reply");
    }
    await browser.finish("completed");
  } catch (error) {
    console.error(`  refund session failed: ${(error as Error).message}`);
    await browser.finish("abandoned");
  }
}

async function cancelSession(order: Order, abandon: boolean): Promise<void> {
  const browser = await openBrowser();
  try {
    await browser.clickText("a.nav-link", "Orders");
    await browser.setValue("Search orders", order.id);
    await browser.clickText("table a", order.id);
    await browser.clickText("button", "Cancel order…");
    if (abandon) return void (await browser.finish("abandoned"));
    await browser.setValue("Cancellation reason", pick(["customer requested", "payment flagged", "duplicate order"]));
    await browser.clickText("button", "Confirm cancellation");
    await browser.finish("completed");
  } catch (error) {
    console.error(`  cancel session failed: ${(error as Error).message}`);
    await browser.finish("abandoned");
  }
}

async function ticketSession(ticket: Ticket, abandon: boolean): Promise<void> {
  const browser = await openBrowser();
  try {
    await browser.clickText("a.nav-link", "Support tickets");
    await browser.clickText("table a", ticket.id);
    if (abandon) return void (await browser.finish("abandoned"));
    await browser.setValue("Reply to customer", pick(REPLIES));
    await browser.clickText("button", "Send reply");
    if (rnd() < 0.65) await browser.clickText("button", "Mark resolved");
    await browser.finish("completed");
  } catch (error) {
    console.error(`  ticket session failed: ${(error as Error).message}`);
    await browser.finish("abandoned");
  }
}

/* ------------------------------------------------------------------ */
/* Orchestration                                                        */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  const health = await fetch(`${TARGET}/health`).then((r) => r.ok).catch(() => false);
  if (!health) throw new Error(`Target app is not running at ${TARGET} — npm run dev:target first`);
  const consoleUp = await fetch(`${CONSOLE_APP}/api/health`).then(() => true).catch(() => false);
  if (!consoleUp) throw new Error(`Console app is not running at ${CONSOLE_APP} — npm run dev:web first`);

  const mix = { refund: Math.round(TOTAL * 0.46), cancel: Math.round(TOTAL * 0.23), ticket: 0 };
  mix.ticket = TOTAL - mix.refund - mix.cancel;

  console.log(`Seeding ${TOTAL} sessions (${mix.refund} refunds, ${mix.cancel} cancellations, ${mix.ticket} ticket replies)`);
  const started = Date.now();
  let done = 0;

  const tick = (kind: string) => {
    done += 1;
    process.stdout.write(`\r  ${done}/${TOTAL} sessions (${kind})        `);
  };

  for (let i = 0; i < mix.refund; i++) {
    const { orders } = await shop<{ orders: Order[] }>("/orders?status=delivered");
    const eligible = orders.filter((o) => o.status === "delivered");
    if (eligible.length === 0) break;
    const order = pick(eligible);
    const { customer } = await shop<{ customer: Customer | null }>(`/customers/${order.customerId}`).catch(() => ({ customer: null }));
    await refundSession(order, customer, rnd() < 0.09);
    tick("refund");
  }

  for (let i = 0; i < mix.cancel; i++) {
    const { orders } = await shop<{ orders: Order[] }>("/orders");
    const eligible = orders.filter((o) => o.status === "paid" || o.status === "fulfilled");
    if (eligible.length === 0) break;
    await cancelSession(pick(eligible), rnd() < 0.07);
    tick("cancel");
  }

  for (let i = 0; i < mix.ticket; i++) {
    const { tickets } = await shop<{ tickets: Ticket[] }>("/tickets?status=open");
    if (tickets.length === 0) break;
    await ticketSession(pick(tickets), rnd() < 0.05);
    tick("ticket");
  }

  console.log(`\nSeeded in ${((Date.now() - started) / 1000).toFixed(0)}s`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
