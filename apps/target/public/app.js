/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * Meridian Supply admin — a deliberately ordinary internal tool.
 *
 * Classic script, no framework, no layout-dependent logic: the same file runs
 * in a real browser and inside jsdom, which is how sessions are seeded and how
 * the blind agent races. Every state change re-renders and then announces
 * itself with an `app:rendered` event so the recorder can scan the page after
 * each action.
 */
(function () {
  "use strict";

  var qs = new URLSearchParams(location.search);
  var INSTANCE = qs.get("instance") || "live";
  var API = "/api/shop/" + INSTANCE;

  var state = {
    route: { view: "dashboard" },
    orderQuery: "",
    customerQuery: "",
    // Refund dialog state, kept across re-renders while it is open.
    refund: null, // { orderId, items: {SKU: bool}, reason, note, notify }
    cancel: null, // { orderId, reason }
    flash: null,
  };

  function headers() {
    var h = { "Content-Type": "application/json" };
    if (window.__acSessionId) h["X-Session-Id"] = window.__acSessionId;
    return h;
  }

  function api(path, options) {
    return fetch(API + path, Object.assign({ headers: headers() }, options || {})).then(function (res) {
      return res.json().then(function (body) {
        if (!res.ok) throw new Error(body.error || res.status);
        return body;
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Routing                                                              */
  /* ------------------------------------------------------------------ */

  function parseRoute() {
    var hash = location.hash.replace(/^#\/?/, "");
    var parts = hash.split("/").filter(Boolean);
    if (parts.length === 0) return { view: "dashboard" };
    if (parts[0] === "orders" && parts[1]) return { view: "order", id: parts[1], tab: parts[2] || "summary" };
    if (parts[0] === "orders") return { view: "orders" };
    if (parts[0] === "customers" && parts[1]) return { view: "customer", id: parts[1], tab: parts[2] || "profile" };
    if (parts[0] === "customers") return { view: "customers" };
    if (parts[0] === "tickets" && parts[1]) return { view: "ticket", id: parts[1] };
    if (parts[0] === "tickets") return { view: "tickets" };
    return { view: "dashboard" };
  }

  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  window.addEventListener("hashchange", function () {
    state.refund = null;
    state.cancel = null;
    render();
  });

  /* ------------------------------------------------------------------ */
  /* Rendering helpers                                                    */
  /* ------------------------------------------------------------------ */

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value === null || value === undefined || value === false) return;
        if (key === "text") node.textContent = value;
        else if (key === "onclick") node.addEventListener("click", value);
        else if (key === "onchange") node.addEventListener("change", value);
        else if (value === true) node.setAttribute(key, "");
        else node.setAttribute(key, value);
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  function money(cents) {
    return "$" + (cents / 100).toFixed(2);
  }

  function badge(status) {
    return el("span", { class: "badge badge-" + status, text: status.replace(/_/g, " ") });
  }

  function rendered() {
    var root = document.getElementById("root");
    root.setAttribute("aria-busy", "false");
    window.dispatchEvent(new CustomEvent("app:rendered"));
  }

  /* ------------------------------------------------------------------ */
  /* Views                                                                */
  /* ------------------------------------------------------------------ */

  function shell(active, main) {
    var nav = el("nav", { "aria-label": "Main navigation" }, [
      el("div", { class: "brand", text: "Meridian Supply" }),
      el("div", { class: "brand-sub", text: INSTANCE === "live" ? "Admin" : "Sandbox " + INSTANCE }),
      navLink("Dashboard", "#/", active === "dashboard"),
      navLink("Orders", "#/orders", active === "orders"),
      navLink("Customers", "#/customers", active === "customers"),
      navLink("Support tickets", "#/tickets", active === "tickets"),
    ]);
    return el("div", { class: "layout" }, [nav, el("main", null, main)]);
  }

  function navLink(label, hash, current) {
    return el("a", { href: hash, class: "nav-link" + (current ? " current" : ""), "aria-current": current ? "page" : null, text: label });
  }

  function flashBar() {
    if (!state.flash) return null;
    var message = state.flash;
    return el("div", { class: "flash", role: "status", text: message });
  }

  function viewDashboard() {
    return api("/orders").then(function (data) {
      var open = data.orders.filter(function (o) { return o.status === "paid" || o.status === "fulfilled"; }).length;
      return shell("dashboard", [
        el("h1", { text: "Dashboard" }),
        flashBar(),
        el("div", { class: "cards" }, [
          statCard(String(data.orders.length), "recent orders"),
          statCard(String(open), "awaiting fulfilment"),
          statCard("$" + Math.round(data.orders.reduce(function (s, o) { return s + o.totalCents; }, 0) / 100), "recent revenue"),
        ]),
        el("p", { class: "muted", text: "Use Orders, Customers or Support tickets to work a case." }),
      ]);
    });
  }

  function statCard(value, label) {
    return el("div", { class: "card stat" }, [el("div", { class: "stat-value", text: value }), el("div", { class: "stat-label", text: label })]);
  }

  function viewOrders() {
    var query = state.orderQuery;
    return api("/orders" + (query ? "?q=" + encodeURIComponent(query) : "")).then(function (data) {
      return shell("orders", [
        el("h1", { text: "Orders" }),
        flashBar(),
        el("div", { class: "toolbar" }, [
          el("input", {
            type: "search", id: "order-search", "aria-label": "Search orders", placeholder: "Search orders by number…", value: query,
            onchange: function (e) { state.orderQuery = e.target.value; render(); },
          }),
        ]),
        el("table", { class: "list" }, [
          el("thead", null, [el("tr", null, [th("Order"), th("Customer"), th("Placed"), th("Total"), th("Status")])]),
          el("tbody", null, data.orders.map(function (o) {
            return el("tr", null, [
              el("td", null, [el("a", { href: "#/orders/" + o.id, text: o.id })]),
              el("td", { text: o.customerId }),
              el("td", { text: o.placedAt }),
              el("td", { text: money(o.totalCents) }),
              el("td", null, [badge(o.status)]),
            ]);
          })),
        ]),
      ]);
    });
  }

  function th(label) { return el("th", { text: label }); }

  function viewCustomers() {
    var query = state.customerQuery;
    return api("/customers" + (query ? "?q=" + encodeURIComponent(query) : "")).then(function (data) {
      return shell("customers", [
        el("h1", { text: "Customers" }),
        flashBar(),
        el("div", { class: "toolbar" }, [
          el("input", {
            type: "search", id: "customer-search", "aria-label": "Search customers", placeholder: "Search customers by name…", value: query,
            onchange: function (e) { state.customerQuery = e.target.value; render(); },
          }),
        ]),
        el("table", { class: "list" }, [
          el("thead", null, [el("tr", null, [th("Customer"), th("Email"), th("City"), th("Since")])]),
          el("tbody", null, data.customers.map(function (c) {
            return el("tr", null, [
              el("td", null, [el("a", { href: "#/customers/" + c.id, text: c.name })]),
              el("td", { text: c.email }),
              el("td", { text: c.city }),
              el("td", { text: c.since }),
            ]);
          })),
        ]),
      ]);
    });
  }

  function viewCustomer(id, tab) {
    return Promise.all([api("/customers/" + id), api("/customers/" + id + "/orders")]).then(function (results) {
      var customer = results[0].customer;
      var orders = results[1].orders;
      var body;
      if (tab === "orders") {
        body = el("table", { class: "list" }, [
          el("thead", null, [el("tr", null, [th("Order"), th("Placed"), th("Total"), th("Status")])]),
          el("tbody", null, orders.map(function (o) {
            return el("tr", null, [
              el("td", null, [el("a", { href: "#/orders/" + o.id, text: o.id })]),
              el("td", { text: o.placedAt }),
              el("td", { text: money(o.totalCents) }),
              el("td", null, [badge(o.status)]),
            ]);
          })),
        ]);
      } else {
        body = el("dl", { class: "props" }, [
          dt("Email"), dd(customer.email),
          dt("City"), dd(customer.city),
          dt("Customer since"), dd(customer.since),
        ]);
      }
      return shell("customers", [
        el("h1", { text: customer.name }),
        flashBar(),
        el("div", { class: "tabs", role: "tablist" }, [
          tabLink("Profile", "#/customers/" + id + "/profile", tab === "profile"),
          tabLink("Orders", "#/customers/" + id + "/orders", tab === "orders"),
        ]),
        body,
      ]);
    });
  }

  function dt(text) { return el("dt", { text: text }); }
  function dd(text) { return el("dd", { text: text }); }

  function tabLink(label, hash, selected) {
    return el("a", { href: hash, role: "tab", "aria-selected": selected ? "true" : "false", class: "tab" + (selected ? " selected" : ""), text: label });
  }

  function viewOrder(id, tab) {
    return api("/orders/" + id).then(function (data) {
      var order = data.order;
      var main = [
        el("h1", { text: "Order " + order.id }),
        flashBar(),
        el("p", { class: "muted", text: (data.customer ? data.customer.name + " · " : "") + order.placedAt + " · " + money(order.totalCents) }),
        el("div", { class: "order-status" }, [badge(order.status)]),
        el("div", { class: "tabs", role: "tablist" }, [
          tabLink("Summary", "#/orders/" + id + "/summary", tab === "summary"),
          tabLink("Payment", "#/orders/" + id + "/payment", tab === "payment"),
        ]),
      ];

      if (tab === "payment") {
        return api("/orders/" + id + "/payment").then(function (paymentData) {
          var payment = paymentData.payment;
          main.push(el("dl", { class: "props" }, [
            dt("Method"), dd(payment.method),
            dt("Payment status"), dd(payment.status.replace(/_/g, " ")),
            dt("Captured"), dd(money(payment.capturedCents)),
            dt("Refunded"), dd(money(payment.refundedCents)),
          ]));
          return shell("orders", main.concat(orderLinks(data)));
        });
      }

      main.push(el("table", { class: "list" }, [
        el("thead", null, [el("tr", null, [th("Item"), th("SKU"), th("Qty"), th("Price")])]),
        el("tbody", null, order.items.map(function (item) {
          return el("tr", null, [el("td", { text: item.name }), el("td", { text: item.sku }), el("td", { text: String(item.qty) }), el("td", { text: money(item.priceCents) })]);
        })),
      ]));

      if (data.refunds.length) {
        main.push(el("h2", { text: "Refunds" }));
        data.refunds.forEach(function (refund) {
          main.push(el("p", { class: "muted", text: refund.id + " · " + money(refund.amountCents) + " · " + refund.reason + (refund.notifyCustomer ? " · customer notified" : "") }));
        });
      }

      var canRefund = order.status !== "cancelled" && order.status !== "refunded";
      var canCancel = order.status === "paid" || order.status === "fulfilled";
      main.push(el("div", { class: "actions" }, [
        canRefund ? el("button", { type: "button", onclick: function () { openRefund(order); }, text: "Refund items…" }) : null,
        canCancel ? el("button", { type: "button", class: "secondary", onclick: function () { openCancel(order); }, text: "Cancel order…" }) : null,
      ]));

      if (state.refund && state.refund.orderId === order.id) main.push(refundDialog(order));
      if (state.cancel && state.cancel.orderId === order.id) main.push(cancelDialog(order));

      return shell("orders", main.concat(orderLinks(data)));
    });
  }

  function orderLinks(data) {
    var links = [];
    if (data.ticket) {
      links.push(el("p", { class: "linked" }, [
        el("span", { text: "Support: " }),
        el("a", { href: "#/tickets/" + data.ticket.id, text: data.ticket.subject + " (" + data.ticket.id + ")" }),
      ]));
    }
    return links;
  }

  function openRefund(order) {
    var items = {};
    order.items.forEach(function (item) { items[item.sku] = false; });
    state.refund = { orderId: order.id, items: items, reason: "", note: "", notify: false };
    render();
  }

  function openCancel(order) {
    state.cancel = { orderId: order.id, reason: "" };
    render();
  }

  var REASONS = ["damaged in transit", "wrong item shipped", "arrived too late", "quality not as expected", "customer changed mind"];

  function refundDialog(order) {
    var form = state.refund;
    return el("section", { class: "dialog", role: "dialog", "aria-label": "Refund order " + order.id }, [
      el("h2", { text: "Refund order " + order.id }),
      el("fieldset", null, [el("legend", { text: "Items to refund" })].concat(order.items.map(function (item) {
        return el("label", { class: "check" }, [
          el("input", {
            type: "checkbox", checked: form.items[item.sku],
            "aria-label": "Refund " + item.name + " (" + item.sku + ")",
            onchange: function (e) { form.items[item.sku] = e.target.checked; render(); },
          }),
          el("span", { text: item.name + " — " + money(item.priceCents * item.qty) }),
        ]);
      }))),
      el("label", { class: "field" }, [
        el("span", { text: "Refund reason" }),
        el("select", {
          "aria-label": "Refund reason",
          onchange: function (e) { form.reason = e.target.value; render(); },
        }, [el("option", { value: "", text: "Choose a reason…" })].concat(REASONS.map(function (reason) {
          var option = el("option", { value: reason, text: reason });
          if (form.reason === reason) option.setAttribute("selected", "");
          return option;
        }))),
      ]),
      el("label", { class: "field" }, [
        el("span", { text: "Internal note" }),
        el("input", {
          type: "text", "aria-label": "Internal note", placeholder: "Optional note for the team", value: form.note,
          onchange: function (e) { form.note = e.target.value; },
        }),
      ]),
      el("label", { class: "check" }, [
        el("input", {
          type: "checkbox", checked: form.notify, "aria-label": "Notify customer by email",
          onchange: function (e) { form.notify = e.target.checked; render(); },
        }),
        el("span", { text: "Notify customer by email" }),
      ]),
      el("div", { class: "actions" }, [
        el("button", { type: "button", onclick: submitRefund, text: "Confirm refund" }),
        el("button", { type: "button", class: "secondary", onclick: function () { state.refund = null; render(); }, text: "Close dialog" }),
      ]),
    ]);
  }

  function submitRefund() {
    var form = state.refund;
    var items = Object.keys(form.items).filter(function (sku) { return form.items[sku]; });
    api("/orders/" + form.orderId + "/refund", {
      method: "POST",
      body: JSON.stringify({ items: items, reason: form.reason, note: form.note || undefined, notify_customer: form.notify }),
    }).then(function () {
      state.refund = null;
      state.flash = "Refund issued for " + form.orderId + ".";
      render();
    }).catch(function (error) {
      state.flash = "Refund failed: " + error.message;
      render();
    });
  }

  function cancelDialog(order) {
    var form = state.cancel;
    return el("section", { class: "dialog", role: "dialog", "aria-label": "Cancel order " + order.id }, [
      el("h2", { text: "Cancel order " + order.id }),
      el("label", { class: "field" }, [
        el("span", { text: "Cancellation reason" }),
        el("input", {
          type: "text", "aria-label": "Cancellation reason", placeholder: "Why is this order being cancelled?", value: form.reason,
          onchange: function (e) { form.reason = e.target.value; },
        }),
      ]),
      el("div", { class: "actions" }, [
        el("button", { type: "button", onclick: submitCancel, text: "Confirm cancellation" }),
        el("button", { type: "button", class: "secondary", onclick: function () { state.cancel = null; render(); }, text: "Close dialog" }),
      ]),
    ]);
  }

  function submitCancel() {
    var form = state.cancel;
    api("/orders/" + form.orderId + "/cancel", { method: "POST", body: JSON.stringify({ reason: form.reason }) })
      .then(function () {
        state.cancel = null;
        state.flash = "Order " + form.orderId + " cancelled.";
        render();
      })
      .catch(function (error) {
        state.flash = "Cancellation failed: " + error.message;
        render();
      });
  }

  function viewTickets() {
    return api("/tickets").then(function (data) {
      return shell("tickets", [
        el("h1", { text: "Support tickets" }),
        flashBar(),
        el("table", { class: "list" }, [
          el("thead", null, [el("tr", null, [th("Ticket"), th("Subject"), th("Order"), th("Status")])]),
          el("tbody", null, data.tickets.map(function (t) {
            return el("tr", null, [
              el("td", null, [el("a", { href: "#/tickets/" + t.id, text: t.id })]),
              el("td", { text: t.subject }),
              el("td", { text: t.orderId || "—" }),
              el("td", null, [badge(t.status)]),
            ]);
          })),
        ]),
      ]);
    });
  }

  function viewTicket(id) {
    return api("/tickets/" + id).then(function (data) {
      var ticket = data.ticket;
      var main = [
        el("h1", { text: ticket.subject }),
        flashBar(),
        el("p", { class: "muted", text: ticket.id + " · " + (data.customer ? data.customer.name : "") + (ticket.orderId ? " · " : "") }),
        ticket.orderId ? el("p", { class: "linked" }, [el("span", { text: "About " }), el("a", { href: "#/orders/" + ticket.orderId, text: "order " + ticket.orderId })]) : null,
        el("div", { class: "order-status" }, [badge(ticket.status)]),
        el("div", { class: "thread" }, ticket.messages.map(function (message) {
          return el("div", { class: "msg msg-" + message.from }, [
            el("div", { class: "msg-from", text: message.from === "agent" ? "Support" : "Customer" }),
            el("div", { text: message.body }),
          ]);
        })),
        el("label", { class: "field" }, [
          el("span", { text: "Reply to customer" }),
          el("input", { type: "text", id: "reply-box", "aria-label": "Reply to customer", placeholder: "Write a reply…", value: "" }),
        ]),
        el("div", { class: "actions" }, [
          el("button", { type: "button", onclick: function () { sendReply(id); }, text: "Send reply" }),
          ticket.status !== "resolved"
            ? el("button", { type: "button", class: "secondary", onclick: function () { resolveTicket(id); }, text: "Mark resolved" })
            : null,
        ]),
      ];
      return shell("tickets", main);
    });
  }

  function sendReply(id) {
    var box = document.getElementById("reply-box");
    var body = box ? box.value : "";
    api("/tickets/" + id + "/reply", { method: "POST", body: JSON.stringify({ body: body }) })
      .then(function () { state.flash = "Reply sent."; render(); })
      .catch(function (error) { state.flash = "Reply failed: " + error.message; render(); });
  }

  function resolveTicket(id) {
    api("/tickets/" + id + "/status", { method: "POST", body: JSON.stringify({ status: "resolved" }) })
      .then(function () { state.flash = "Ticket resolved."; render(); })
      .catch(function (error) { state.flash = "Update failed: " + error.message; render(); });
  }

  /* ------------------------------------------------------------------ */
  /* Render loop                                                          */
  /* ------------------------------------------------------------------ */

  var renderToken = 0;

  function render() {
    state.route = parseRoute();
    var token = ++renderToken;
    var route = state.route;
    var promise;
    if (route.view === "orders") promise = viewOrders();
    else if (route.view === "order") promise = viewOrder(route.id, route.tab);
    else if (route.view === "customers") promise = viewCustomers();
    else if (route.view === "customer") promise = viewCustomer(route.id, route.tab);
    else if (route.view === "tickets") promise = viewTickets();
    else if (route.view === "ticket") promise = viewTicket(route.id);
    else promise = viewDashboard();

    promise.then(function (tree) {
      if (token !== renderToken) return; // a newer render superseded this one
      var root = document.getElementById("root");
      root.replaceChildren(tree);
      state.flash = null;
      rendered();
    }).catch(function (error) {
      if (token !== renderToken) return;
      var root = document.getElementById("root");
      root.replaceChildren(el("div", { class: "layout" }, [el("main", null, [el("h1", { text: "Something went wrong" }), el("p", { text: String(error.message || error) })])]));
      rendered();
    });
  }

  window.__app = { render: render, instance: INSTANCE };
  render();
})();
