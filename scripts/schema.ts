import { readFileSync } from "fs";
import { join } from "path";
import { getDb } from "../lib/db";

const subscriptionColumns = [
  ["last_billed_date", "TEXT"],
  ["priority", "INTEGER NOT NULL DEFAULT 0"],
  ["is_unused", "INTEGER NOT NULL DEFAULT 0"],
  ["trial_start_date", "TEXT"],
  ["trial_end_date", "TEXT"],
  ["previous_price", "REAL"],
  ["price_changed_at", "TEXT"],
] as const;

export async function applySchema() {
  const db = await getDb();
  const schemaPath = join(process.cwd(), "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf8");
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  if (statements.length) {
    await db.batch(
      statements.map((sql) => ({ sql, args: [] })),
      "write",
    );
  }

  await ensureSubscriptionColumns();

  return statements.length;
}

async function ensureSubscriptionColumns() {
  const db = await getDb();
  const result = await db.execute("PRAGMA table_info(subscriptions)");
  const existingColumns = new Set(result.rows.map((row) => String(row.name)));

  for (const [column, definition] of subscriptionColumns) {
    if (!existingColumns.has(column)) {
      await db.execute(`ALTER TABLE subscriptions ADD COLUMN ${column} ${definition}`);
    }
  }
}
