import { getDb } from "@/lib/db";
import type {
  IncomeSource,
  IncomeSourceInput,
  IncomeSourceType,
} from "@/lib/types";

type IncomeSourceRow = {
  id: string;
  name: string;
  type: IncomeSourceType;
  amount: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getIncomeSources() {
  const db = await getDb();
  const result = await db.execute(
    "SELECT * FROM income_sources ORDER BY type ASC, amount DESC, name ASC",
  );

  return result.rows.map((row) => mapIncomeSource(row as unknown as IncomeSourceRow));
}

export async function createIncomeSource(input: IncomeSourceInput) {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.execute({
    sql: `
      INSERT INTO income_sources (
        id, name, type, amount, currency, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.name,
      input.type,
      input.amount,
      input.currency,
      input.notes,
      now,
      now,
    ],
  });

  return id;
}

export async function updateIncomeSource(id: string, input: IncomeSourceInput) {
  const db = await getDb();

  await db.execute({
    sql: `
      UPDATE income_sources
      SET name = ?, type = ?, amount = ?, currency = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `,
    args: [
      input.name,
      input.type,
      input.amount,
      input.currency,
      input.notes,
      new Date().toISOString(),
      id,
    ],
  });
}

export async function deleteIncomeSource(id: string) {
  const db = await getDb();

  await db.execute({
    sql: "DELETE FROM income_sources WHERE id = ?",
    args: [id],
  });
}

function mapIncomeSource(row: IncomeSourceRow): IncomeSource {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    amount: Number(row.amount),
    currency: row.currency,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
