/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * HTTP surface of the Meridian Supply admin. The UI drives these endpoints
 * through clicks; compiled tools will drive them directly. The X-Session-Id
 * header ties each mutation to the trajectory that caused it.
 */
import { Router } from "express";
import type { Request } from "express";
import * as shop from "./store.js";

function sessionOf(req: Request): string | null {
  const value = req.header("x-session-id");
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function shopRouter(): Router {
  const router = Router({ mergeParams: true });

  router.use((req, res, next) => {
    const instance = (req.params as Record<string, string>).instance;
    try {
      shop.getInstance(instance);
      next();
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  });

  router.get("/customers", (req, res) => {
    const instance = (req.params as Record<string, string>).instance;
    res.json({ customers: shop.listCustomers(instance, String(req.query.q ?? "")) });
  });

  router.get("/customers/:id", (req, res) => {
    const { instance, id } = req.params as Record<string, string>;
    const customer = shop.getInstance(instance).customers.get(id);
    if (!customer) return res.status(404).json({ error: `No customer ${id}` });
    res.json({ customer });
  });

  router.get("/customers/:id/orders", (req, res) => {
    const { instance, id } = req.params as Record<string, string>;
    res.json({ orders: shop.customerOrders(instance, id) });
  });

  router.get("/orders", (req, res) => {
    const instance = (req.params as Record<string, string>).instance;
    res.json({ orders: shop.listOrders(instance, String(req.query.q ?? ""), String(req.query.status ?? "")) });
  });

  router.get("/orders/:id", (req, res) => {
    const { instance, id } = req.params as Record<string, string>;
    const state = shop.getInstance(instance);
    const order = state.orders.get(id);
    if (!order) return res.status(404).json({ error: `No order ${id}` });
    const customer = state.customers.get(order.customerId) ?? null;
    const ticket = [...state.tickets.values()].find((t) => t.orderId === id) ?? null;
    res.json({ order, customer, ticket, refunds: shop.orderRefunds(instance, id) });
  });

  router.get("/orders/:id/payment", (req, res) => {
    const { instance, id } = req.params as Record<string, string>;
    const payment = shop.getInstance(instance).payments.get(id);
    if (!payment) return res.status(404).json({ error: `No payment for ${id}` });
    res.json({ payment });
  });

  router.get("/tickets", (req, res) => {
    const instance = (req.params as Record<string, string>).instance;
    res.json({ tickets: shop.listTickets(instance, String(req.query.status ?? "")) });
  });

  router.get("/tickets/:id", (req, res) => {
    const { instance, id } = req.params as Record<string, string>;
    const ticket = shop.getInstance(instance).tickets.get(id);
    if (!ticket) return res.status(404).json({ error: `No ticket ${id}` });
    const state = shop.getInstance(instance);
    res.json({ ticket, customer: state.customers.get(ticket.customerId) ?? null });
  });

  const mutation =
    (fn: (instance: string, session: string | null, id: string, body: never) => ReturnType<typeof shop.refundOrder>) =>
    (req: Request, res: import("express").Response) => {
      const { instance, id } = req.params as Record<string, string>;
      const outcome = fn(instance, sessionOf(req), id, (req.body ?? {}) as never);
      if (!outcome.ok) return res.status(422).json({ error: outcome.error });
      res.json(outcome.result);
    };

  router.post("/orders/:id/refund", mutation(shop.refundOrder));
  router.post("/orders/:id/cancel", mutation(shop.cancelOrder));
  router.post("/tickets/:id/reply", mutation(shop.replyTicket));
  router.post("/tickets/:id/status", mutation(shop.setTicketStatus));

  return router;
}
