import type {
  BillingCycle,
  Subscription,
  SubscriptionFilters,
  SubscriptionInput,
  SubscriptionStatus,
} from "@/lib/types";
import { getDb } from "@/lib/db";

type SubscriptionRow = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  billing_cycle: BillingCycle;
  custom_interval_days: number | null;
  next_billing_date: string;
  payment_method: string | null;
  status: SubscriptionStatus;
  website_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getSubscriptions(filters: SubscriptionFilters = {}) {
  const clauses: string[] = [];
  const args: (string | number)[] = [];

  if (filters.search) {
    clauses.push("LOWER(name) LIKE ?");
    args.push(`%${filters.search.toLowerCase()}%`);
  }

  if (filters.category && filters.category !== "all") {
    clauses.push("category = ?");
    args.push(filters.category);
  }

  if (filters.status && filters.status !== "all") {
    clauses.push("status = ?");
    args.push(filters.status);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT * FROM subscriptions ${where} ORDER BY date(next_billing_date) ASC, name ASC`,
    args,
  });

  return result.rows.map((row) => mapSubscription(row as unknown as SubscriptionRow));
}

export async function getAllSubscriptions() {
  const db = await getDb();
  const result = await db.execute(
    "SELECT * FROM subscriptions ORDER BY date(next_billing_date) ASC, name ASC",
  );

  return result.rows.map((row) => mapSubscription(row as unknown as SubscriptionRow));
}

export async function getSubscriptionById(id: string) {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT * FROM subscriptions WHERE id = ? LIMIT 1",
    args: [id],
  });

  const row = result.rows.at(0);
  return row ? mapSubscription(row as unknown as SubscriptionRow) : null;
}

export async function getCategories() {
  const db = await getDb();
  const result = await db.execute(
    "SELECT DISTINCT category FROM subscriptions ORDER BY category ASC",
  );

  return result.rows.map((row) => String(row.category));
}

export async function createSubscription(input: SubscriptionInput) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const db = await getDb();
  await db.execute({
    sql: `
      INSERT INTO subscriptions (
        id, name, description, category, price, currency, billing_cycle,
        custom_interval_days, next_billing_date, payment_method, status,
        website_url, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.name,
      input.description,
      input.category,
      input.price,
      input.currency,
      input.billingCycle,
      input.customIntervalDays,
      input.nextBillingDate,
      input.paymentMethod,
      input.status,
      input.websiteUrl,
      input.notes,
      now,
      now,
    ],
  });

  return id;
}

export async function updateSubscription(id: string, input: SubscriptionInput) {
  const db = await getDb();
  await db.execute({
    sql: `
      UPDATE subscriptions
      SET
        name = ?,
        description = ?,
        category = ?,
        price = ?,
        currency = ?,
        billing_cycle = ?,
        custom_interval_days = ?,
        next_billing_date = ?,
        payment_method = ?,
        status = ?,
        website_url = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?
    `,
    args: [
      input.name,
      input.description,
      input.category,
      input.price,
      input.currency,
      input.billingCycle,
      input.customIntervalDays,
      input.nextBillingDate,
      input.paymentMethod,
      input.status,
      input.websiteUrl,
      input.notes,
      new Date().toISOString(),
      id,
    ],
  });
}

export async function deleteSubscription(id: string) {
  const db = await getDb();
  await db.execute({
    sql: "DELETE FROM subscriptions WHERE id = ?",
    args: [id],
  });
}

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    currency: row.currency,
    billingCycle: row.billing_cycle,
    customIntervalDays:
      row.custom_interval_days === null ? null : Number(row.custom_interval_days),
    nextBillingDate: row.next_billing_date,
    paymentMethod: row.payment_method,
    status: row.status,
    websiteUrl: row.website_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
