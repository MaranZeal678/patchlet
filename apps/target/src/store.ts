/**
 * Meridian Supply — the demo commerce backend whose UI real users click through.
 *
 * Every mutation is logged with entity before/after states. Those logs are the
 * ground truth the Action Compiler proves compiled tools against: a tool ships
 * only when its state transition matches what human trajectories produced.
 *
 * Instances: "live" is what the admin UI and seeded sessions run against;
 * sandboxes are deterministic fresh copies used by compile smoke-tests,
 * equivalence proofs, and the race.
 */

export type OrderStatus =
  | "paid"
  | "fulfilled"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type OrderItem = { sku: string; name: string; qty: number; priceCents: number };

export type Customer = { id: string; name: string; email: string; city: string; since: string };

export type Order = {
  id: string;
  customerId: string;
  placedAt: string;
  status: OrderStatus;
  items: OrderItem[];
  totalCents: number;
};

export type Payment = {
  orderId: string;
  method: string;
  status: "captured" | "partially_refunded" | "refunded" | "voided";
  capturedCents: number;
  refundedCents: number;
};

export type Refund = {
  id: string;
  orderId: string;
  items: string[];
  amountCents: number;
  reason: string;
  note?: string;
  notifyCustomer: boolean;
  createdAt: string;
};

export type TicketMessage = { from: "customer" | "agent"; body: string; at: string };

export type Ticket = {
  id: string;
  customerId: string;
  orderId: string | null;
  subject: string;
  status: "open" | "pending" | "resolved";
  messages: TicketMessage[];
};

export type ShopState = {
  customers: Map<string, Customer>;
  orders: Map<string, Order>;
  payments: Map<string, Payment>;
  refunds: Map<string, Refund>;
  tickets: Map<string, Ticket>;
  refundSeq: number;
};

/** One diff a mutation made to one entity: the equivalence prover's atom. */
export type EntityDiff = { entity: string; before: unknown; after: unknown };

export type Effect = {
  at: string;
  instance: string;
  sessionId: string | null;
  method: string;
  /** Path with ids replaced, e.g. "POST /orders/{id}/refund" — the clustering signature. */
  template: string;
  path: string;
  params: Record<string, string>;
  body: unknown;
  ok: boolean;
  error?: string;
  diffs: EntityDiff[];
};

/* ------------------------------------------------------------------ */
/* Deterministic seeding                                                */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Dana", "Miles", "Priya", "Jonas", "Aiko", "Lucia", "Theo", "Nadia", "Omar", "Greta", "Felix", "Imani", "Ravi", "Sofia", "Casper", "Yuki", "Leon", "Amara", "Nils", "Zara"];
const LAST = ["Whitfield", "Okafor", "Lindqvist", "Marchetti", "Tanaka", "Beaumont", "Kowalski", "Haddad", "Iversen", "Mbeki", "Fontaine", "Novak", "Silva", "Petrov", "Andersen", "Rahman", "Costa", "Egede", "Vargas", "Kimura"];
const CITIES = ["Lyon", "Rotterdam", "Aarhus", "Porto", "Graz", "Tampere", "Ghent", "Bologna", "Malmö", "Cork"];

const CATALOG: Array<{ sku: string; name: string; priceCents: number }> = [
  { sku: "MUG-STONE", name: "Stoneware Mug", priceCents: 1800 },
  { sku: "MUG-ENAM", name: "Enamel Camp Mug", priceCents: 1400 },
  { sku: "KTL-COP", name: "Copper Pour-Over Kettle", priceCents: 6900 },
  { sku: "GRD-CER", name: "Ceramic Burr Grinder", priceCents: 8200 },
  { sku: "FLT-PAP", name: "Paper Filters (100)", priceCents: 700 },
  { sku: "BRD-OAK", name: "Oak Serving Board", priceCents: 3400 },
  { sku: "TWL-LIN", name: "Linen Tea Towel Set", priceCents: 2200 },
  { sku: "JAR-GLS", name: "Glass Storage Jar", priceCents: 1600 },
  { sku: "SCP-BRS", name: "Brass Coffee Scoop", priceCents: 1200 },
  { sku: "TRV-CRK", name: "Cork Trivet Pair", priceCents: 900 },
];

const TICKET_SUBJECTS = [
  "Item arrived damaged",
  "Wrong item in the box",
  "Where is my order?",
  "Request to cancel order",
  "Refund status question",
  "Broken on arrival",
];

export function seedState(seed = 20260829): ShopState {
  const rnd = mulberry32(seed);
  const pick = <T>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)]!;
  const state: ShopState = {
    customers: new Map(),
    orders: new Map(),
    payments: new Map(),
    refunds: new Map(),
    tickets: new Map(),
    refundSeq: 900,
  };

  for (let i = 0; i < 40; i++) {
    // Offset the second cycle so no two customers share a full name.
    const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 7 + Math.floor(i / 20) * 3) % LAST.length]}`;
    const id = `C-${1001 + i}`;
    state.customers.set(id, {
      id,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      city: pick(CITIES),
      since: `202${4 + Math.floor(rnd() * 2)}-0${1 + Math.floor(rnd() * 9)}-1${Math.floor(rnd() * 9)}`,
    });
  }

  const customerIds = [...state.customers.keys()];
  let ticketNo = 501;
  for (let i = 0; i < 180; i++) {
    const orderId = `MS-${1001 + i}`;
    const customerId = customerIds[Math.floor(rnd() * customerIds.length)]!;
    const itemCount = 1 + Math.floor(rnd() * 3);
    const items: OrderItem[] = [];
    const used = new Set<string>();
    for (let k = 0; k < itemCount; k++) {
      const product = pick(CATALOG);
      if (used.has(product.sku)) continue;
      used.add(product.sku);
      items.push({ ...product, qty: 1 + Math.floor(rnd() * 2) });
    }
    const totalCents = items.reduce((sum, it) => sum + it.qty * it.priceCents, 0);
    const status: OrderStatus = rnd() < 0.55 ? "delivered" : rnd() < 0.6 ? "fulfilled" : "paid";
    state.orders.set(orderId, {
      id: orderId,
      customerId,
      placedAt: `2026-08-${String(1 + Math.floor(rnd() * 27)).padStart(2, "0")}`,
      status,
      items,
      totalCents,
    });
    state.payments.set(orderId, {
      orderId,
      method: `Visa •••• ${4000 + Math.floor(rnd() * 999)}`,
      status: "captured",
      capturedCents: totalCents,
      refundedCents: 0,
    });
    // Roughly a third of delivered orders have an open support ticket about them.
    if (status === "delivered" && rnd() < 0.38) {
      const id = `T-${ticketNo++}`;
      state.tickets.set(id, {
        id,
        customerId,
        orderId,
        subject: pick(TICKET_SUBJECTS),
        status: "open",
        messages: [
          {
            from: "customer",
            body: `Hi — about order ${orderId}: ${pick(TICKET_SUBJECTS).toLowerCase()}. Can you help?`,
            at: "2026-08-27T09:12:00Z",
          },
        ],
      });
    }
  }
  return state;
}

/* ------------------------------------------------------------------ */
/* Instance registry + mutation engine                                  */
/* ------------------------------------------------------------------ */

const instances = new Map<string, ShopState>();
const effectLog: Effect[] = [];
let sandboxSeq = 1;

export function getInstance(name: string): ShopState {
  let state = instances.get(name);
  if (!state) {
    if (name !== "live") throw new Error(`Unknown shop instance "${name}"`);
    state = seedState();
    instances.set(name, state);
  }
  return state;
}

export function resetLive(): void {
  instances.set("live", seedState());
  effectLog.length = 0;
}

/** A fresh deterministic copy — same seed, so every sandbox looks identical. */
export function createSandbox(): string {
  const name = `sbx-${sandboxSeq++}`;
  instances.set(name, seedState());
  return name;
}

export function dropSandbox(name: string): void {
  if (name.startsWith("sbx-")) instances.delete(name);
}

export function effects(filter?: { sessionId?: string; instance?: string }): Effect[] {
  return effectLog.filter(
    (e) =>
      (!filter?.sessionId || e.sessionId === filter.sessionId) &&
      (!filter?.instance || e.instance === filter.instance),
  );
}

export function loadEffects(saved: Effect[]): void {
  effectLog.push(...saved);
}

const clone = <T>(value: T): T => (value === undefined ? value : JSON.parse(JSON.stringify(value)));

type MutationResult = { ok: boolean; error?: string; result?: unknown; diffs: EntityDiff[] };

function logEffect(
  instance: string,
  sessionId: string | null,
  method: string,
  template: string,
  path: string,
  params: Record<string, string>,
  body: unknown,
  outcome: MutationResult,
): void {
  effectLog.push({
    at: new Date().toISOString(),
    instance,
    sessionId,
    method,
    template,
    path,
    params,
    body: clone(body),
    ok: outcome.ok,
    error: outcome.error,
    diffs: outcome.diffs,
  });
}

/* ------------------------------------------------------------------ */
/* Mutations — the app's real API, the thing users demonstrate daily    */
/* ------------------------------------------------------------------ */

export function refundOrder(
  instanceName: string,
  sessionId: string | null,
  orderId: string,
  body: { items?: string[]; reason?: string; note?: string; notify_customer?: boolean },
): MutationResult {
  const state = getInstance(instanceName);
  const run = (): MutationResult => {
    const order = state.orders.get(orderId);
    if (!order) return { ok: false, error: `No order ${orderId}`, diffs: [] };
    if (order.status === "cancelled" || order.status === "refunded") {
      return { ok: false, error: `Order ${orderId} is already ${order.status}`, diffs: [] };
    }
    const items = body.items ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      return { ok: false, error: "items must name at least one SKU on the order", diffs: [] };
    }
    const valid = new Set(order.items.map((it) => it.sku));
    for (const sku of items) {
      if (!valid.has(sku)) return { ok: false, error: `SKU ${sku} is not on order ${orderId}`, diffs: [] };
    }
    const reason = (body.reason ?? "").trim();
    if (!reason) return { ok: false, error: "reason is required", diffs: [] };

    const payment = state.payments.get(orderId)!;
    const orderBefore = clone(order);
    const paymentBefore = clone(payment);

    const amountCents = order.items
      .filter((it) => items.includes(it.sku))
      .reduce((sum, it) => sum + it.qty * it.priceCents, 0);
    const refund: Refund = {
      id: `R-${state.refundSeq++}`,
      orderId,
      items: [...items].sort(),
      amountCents,
      reason,
      note: body.note?.trim() || undefined,
      notifyCustomer: Boolean(body.notify_customer),
      createdAt: new Date().toISOString(),
    };
    state.refunds.set(refund.id, refund);

    payment.refundedCents += amountCents;
    payment.status = payment.refundedCents >= payment.capturedCents ? "refunded" : "partially_refunded";
    order.status = items.length === order.items.length ? "refunded" : "partially_refunded";

    return {
      ok: true,
      result: { refund },
      diffs: [
        { entity: `order:${orderId}`, before: orderBefore, after: clone(order) },
        { entity: `payment:${orderId}`, before: paymentBefore, after: clone(payment) },
        { entity: `refund:${orderId}`, before: null, after: clone(refund) },
      ],
    };
  };
  const outcome = run();
  logEffect(instanceName, sessionId, "POST", "POST /orders/{order_id}/refund", `/orders/${orderId}/refund`, { order_id: orderId }, body, outcome);
  return outcome;
}

export function cancelOrder(
  instanceName: string,
  sessionId: string | null,
  orderId: string,
  body: { reason?: string },
): MutationResult {
  const state = getInstance(instanceName);
  const run = (): MutationResult => {
    const order = state.orders.get(orderId);
    if (!order) return { ok: false, error: `No order ${orderId}`, diffs: [] };
    if (order.status !== "paid" && order.status !== "fulfilled") {
      return { ok: false, error: `Only paid or fulfilled orders can be cancelled (this one is ${order.status})`, diffs: [] };
    }
    const reason = (body.reason ?? "").trim();
    if (!reason) return { ok: false, error: "reason is required", diffs: [] };

    const payment = state.payments.get(orderId)!;
    const orderBefore = clone(order);
    const paymentBefore = clone(payment);
    order.status = "cancelled";
    payment.status = "voided";
    payment.refundedCents = payment.capturedCents;
    return {
      ok: true,
      result: { order: clone(order) },
      diffs: [
        { entity: `order:${orderId}`, before: orderBefore, after: clone(order) },
        { entity: `payment:${orderId}`, before: paymentBefore, after: clone(payment) },
      ],
    };
  };
  const outcome = run();
  logEffect(instanceName, sessionId, "POST", "POST /orders/{order_id}/cancel", `/orders/${orderId}/cancel`, { order_id: orderId }, body, outcome);
  return outcome;
}

export function replyTicket(
  instanceName: string,
  sessionId: string | null,
  ticketId: string,
  body: { body?: string },
): MutationResult {
  const state = getInstance(instanceName);
  const run = (): MutationResult => {
    const ticket = state.tickets.get(ticketId);
    if (!ticket) return { ok: false, error: `No ticket ${ticketId}`, diffs: [] };
    const text = (body.body ?? "").trim();
    if (!text) return { ok: false, error: "body is required", diffs: [] };
    const before = clone(ticket);
    ticket.messages.push({ from: "agent", body: text, at: new Date().toISOString() });
    if (ticket.status === "open") ticket.status = "pending";
    return { ok: true, result: { ticket: clone(ticket) }, diffs: [{ entity: `ticket:${ticketId}`, before, after: clone(ticket) }] };
  };
  const outcome = run();
  logEffect(instanceName, sessionId, "POST", "POST /tickets/{ticket_id}/reply", `/tickets/${ticketId}/reply`, { ticket_id: ticketId }, body, outcome);
  return outcome;
}

export function setTicketStatus(
  instanceName: string,
  sessionId: string | null,
  ticketId: string,
  body: { status?: string },
): MutationResult {
  const state = getInstance(instanceName);
  const run = (): MutationResult => {
    const ticket = state.tickets.get(ticketId);
    if (!ticket) return { ok: false, error: `No ticket ${ticketId}`, diffs: [] };
    const status = body.status as Ticket["status"];
    if (!["open", "pending", "resolved"].includes(status)) {
      return { ok: false, error: `status must be open|pending|resolved`, diffs: [] };
    }
    const before = clone(ticket);
    ticket.status = status;
    return { ok: true, result: { ticket: clone(ticket) }, diffs: [{ entity: `ticket:${ticketId}`, before, after: clone(ticket) }] };
  };
  const outcome = run();
  logEffect(instanceName, sessionId, "POST", "POST /tickets/{ticket_id}/status", `/tickets/${ticketId}/status`, { ticket_id: ticketId }, body, outcome);
  return outcome;
}

/* ------------------------------------------------------------------ */
/* Reads                                                                */
/* ------------------------------------------------------------------ */

export function listCustomers(instanceName: string, q = ""): Customer[] {
  const state = getInstance(instanceName);
  const needle = q.trim().toLowerCase();
  return [...state.customers.values()]
    .filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.email.includes(needle) || c.id.toLowerCase().includes(needle))
    .slice(0, 30);
}

export function customerOrders(instanceName: string, customerId: string): Order[] {
  const state = getInstance(instanceName);
  return [...state.orders.values()]
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
}

export function listOrders(instanceName: string, q = "", status = ""): Order[] {
  const state = getInstance(instanceName);
  const needle = q.trim().toLowerCase();
  return [...state.orders.values()]
    .filter((o) => (!needle || o.id.toLowerCase().includes(needle)) && (!status || o.status === status))
    .sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1))
    .slice(0, 40);
}

export function listTickets(instanceName: string, status = ""): Ticket[] {
  const state = getInstance(instanceName);
  return [...state.tickets.values()].filter((t) => !status || t.status === status).slice(0, 60);
}

export function orderRefunds(instanceName: string, orderId: string): Refund[] {
  const state = getInstance(instanceName);
  return [...state.refunds.values()].filter((r) => r.orderId === orderId);
}
