import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { CurrencyCode } from "@/lib/products";
import type { ProviderId } from "@/lib/payments/types";

export type OrderStatus =
  | "created" // payment request issued, waiting on the buyer
  | "pending" // fallback path: buyer says they paid, awaiting manual match
  | "paid" // webhook confirmed (or a pending order was approved)
  | "failed";

export interface Order {
  id: string;
  reference: string;
  productSlug: string;
  productName: string;
  amountMinor: number;
  currency: CurrencyCode;
  provider: ProviderId;
  providerOrderId?: string;
  status: OrderStatus;
  mode: "live" | "fallback";
  customerEmail?: string;
  /** Fallback path only: what the buyer typed off their bank/app receipt. */
  claimedReference?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  events: { at: string; event: string; note?: string }[];
}

/**
 * v1 order store: in-process map, optionally mirrored to a JSON file in dev.
 *
 * TODO (before real money): swap this for Postgres/KV. Serverless instances are
 * ephemeral and independent — a webhook can land on a different instance than
 * the one that created the order, and this map won't know about it. The
 * interface below is deliberately narrow so that swap is a single file.
 */

const FILE = process.env.ORDER_STORE_FILE
  ? path.resolve(process.env.ORDER_STORE_FILE)
  : process.env.NODE_ENV === "production"
    ? null
    : path.resolve(process.cwd(), ".data", "orders.json");

type Store = { orders: Map<string, Order> };

const globalStore = globalThis as unknown as { __orderStore?: Store };

function store(): Store {
  if (!globalStore.__orderStore) {
    globalStore.__orderStore = { orders: new Map() };
    hydrate(globalStore.__orderStore);
  }
  return globalStore.__orderStore;
}

function hydrate(s: Store) {
  if (!FILE || !fs.existsSync(FILE)) return;
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as Order[];
    for (const order of raw) s.orders.set(order.id, order);
  } catch {
    // A corrupt dev cache is not worth crashing a request over.
  }
}

function persist(s: Store) {
  if (!FILE) return;
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify([...s.orders.values()], null, 2));
  } catch {
    // Best-effort only.
  }
}

export function newOrderId(): string {
  return `ord_${crypto.randomBytes(9).toString("base64url")}`;
}

/** Short, human-readable, and unique enough to type off a bank receipt. */
export function newReference(): string {
  return `AW-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export function createOrder(
  input: Omit<Order, "createdAt" | "updatedAt" | "events" | "status"> & {
    status?: OrderStatus;
  },
): Order {
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    status: input.status ?? "created",
    createdAt: now,
    updatedAt: now,
    events: [{ at: now, event: "order.created" }],
  };
  const s = store();
  s.orders.set(order.id, order);
  persist(s);
  return order;
}

export function getOrder(id: string): Order | undefined {
  return store().orders.get(id);
}

export function findOrder(match: {
  providerOrderId?: string;
  reference?: string;
}): Order | undefined {
  const orders = [...store().orders.values()];
  return (
    (match.providerOrderId &&
      orders.find((o) => o.providerOrderId === match.providerOrderId)) ||
    (match.reference && orders.find((o) => o.reference === match.reference)) ||
    undefined
  );
}

export function updateOrder(
  id: string,
  patch: Partial<Order>,
  event?: { event: string; note?: string },
): Order | undefined {
  const s = store();
  const existing = s.orders.get(id);
  if (!existing) return undefined;

  const now = new Date().toISOString();
  const next: Order = {
    ...existing,
    ...patch,
    updatedAt: now,
    events: event
      ? [...existing.events, { at: now, ...event }]
      : existing.events,
  };
  s.orders.set(id, next);
  persist(s);
  return next;
}

export function listOrders(): Order[] {
  return [...store().orders.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
