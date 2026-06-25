import type {
  BillingCycle,
  BulkSubscriptionUpdate,
  QuickSubscriptionInput,
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
  last_billed_date: string | null;
  payment_method: string | null;
  status: SubscriptionStatus;
  priority: number | null;
  is_unused: number | boolean | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  previous_price: number | null;
  price_changed_at: string | null;
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
    sql: `SELECT * FROM subscriptions ${where} ORDER BY CASE WHEN priority = 0 THEN 1 ELSE 0 END, priority ASC, date(next_billing_date) ASC, name ASC`,
    args,
  });

  return result.rows.map((row) => mapSubscription(row as unknown as SubscriptionRow));
}

export async function getAllSubscriptions() {
  const db = await getDb();
  const result = await db.execute(
    "SELECT * FROM subscriptions ORDER BY CASE WHEN priority = 0 THEN 1 ELSE 0 END, priority ASC, date(next_billing_date) ASC, name ASC",
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
        custom_interval_days, next_billing_date, last_billed_date,
        payment_method, status, priority, is_unused, trial_start_date,
        trial_end_date, previous_price, price_changed_at, website_url, notes,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      input.lastBilledDate,
      input.paymentMethod,
      input.status,
      input.priority,
      input.isUnused ? 1 : 0,
      input.trialStartDate,
      input.trialEndDate,
      null,
      null,
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
  const existing = await getSubscriptionById(id);
  const now = new Date().toISOString();
  const priceChanged = existing ? existing.price !== input.price : false;

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
        last_billed_date = ?,
        payment_method = ?,
        status = ?,
        priority = ?,
        is_unused = ?,
        trial_start_date = ?,
        trial_end_date = ?,
        previous_price = ?,
        price_changed_at = ?,
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
      input.lastBilledDate,
      input.paymentMethod,
      input.status,
      input.priority,
      input.isUnused ? 1 : 0,
      input.trialStartDate,
      input.trialEndDate,
      priceChanged ? existing?.price ?? null : existing?.previousPrice ?? null,
      priceChanged ? now : existing?.priceChangedAt ?? null,
      input.websiteUrl,
      input.notes,
      now,
      id,
    ],
  });
}

export async function updateSubscriptionQuick(
  id: string,
  input: QuickSubscriptionInput,
) {
  const db = await getDb();
  const existing = await getSubscriptionById(id);
  const now = new Date().toISOString();
  const priceChanged = existing ? existing.price !== input.price : false;

  await db.execute({
    sql: `
      UPDATE subscriptions
      SET
        name = ?,
        category = ?,
        price = ?,
        status = ?,
        next_billing_date = ?,
        is_unused = ?,
        priority = ?,
        previous_price = ?,
        price_changed_at = ?,
        updated_at = ?
      WHERE id = ?
    `,
    args: [
      input.name,
      input.category,
      input.price,
      input.status,
      input.nextBillingDate,
      input.isUnused ? 1 : 0,
      input.priority,
      priceChanged ? existing?.price ?? null : existing?.previousPrice ?? null,
      priceChanged ? now : existing?.priceChangedAt ?? null,
      now,
      id,
    ],
  });
}

export async function bulkDeleteSubscriptions(ids: string[]) {
  if (!ids.length) {
    return;
  }

  const db = await getDb();
  const placeholders = ids.map(() => "?").join(", ");

  await db.execute({
    sql: `DELETE FROM subscriptions WHERE id IN (${placeholders})`,
    args: ids,
  });
}

export async function bulkUpdateSubscriptions(
  ids: string[],
  updates: BulkSubscriptionUpdate,
) {
  if (!ids.length) {
    return;
  }

  const setClauses: string[] = [];
  const args: (string | number)[] = [];

  if (updates.status) {
    setClauses.push("status = ?");
    args.push(updates.status);
  }

  if (updates.category) {
    setClauses.push("category = ?");
    args.push(updates.category);
  }

  if (typeof updates.isUnused === "boolean") {
    setClauses.push("is_unused = ?");
    args.push(updates.isUnused ? 1 : 0);
  }

  if (!setClauses.length) {
    return;
  }

  setClauses.push("updated_at = ?");
  args.push(new Date().toISOString());

  const placeholders = ids.map(() => "?").join(", ");
  const db = await getDb();

  await db.execute({
    sql: `UPDATE subscriptions SET ${setClauses.join(", ")} WHERE id IN (${placeholders})`,
    args: [...args, ...ids],
  });
}

export async function updateSubscriptionPriorities(
  priorities: Array<{ id: string; priority: number }>,
) {
  if (!priorities.length) {
    return;
  }

  const db = await getDb();
  const updatedAt = new Date().toISOString();

  await db.batch(
    priorities.map((item) => ({
      sql: "UPDATE subscriptions SET priority = ?, updated_at = ? WHERE id = ?",
      args: [item.priority, updatedAt, item.id],
    })),
    "write",
  );
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
    lastBilledDate: row.last_billed_date,
    paymentMethod: row.payment_method,
    status: row.status,
    priority: row.priority === null ? 0 : Number(row.priority),
    isUnused: row.is_unused === true || Number(row.is_unused ?? 0) === 1,
    trialStartDate: row.trial_start_date,
    trialEndDate: row.trial_end_date,
    previousPrice: row.previous_price === null ? null : Number(row.previous_price),
    priceChangedAt: row.price_changed_at,
    websiteUrl: row.website_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
